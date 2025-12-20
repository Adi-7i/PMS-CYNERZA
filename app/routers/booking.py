"""
Booking management router.
All business logic is delegated to booking_service.
"""

from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.exceptions import (
    InvalidDateRangeError,
    InventoryUnavailableError,
    InventoryNotFoundError,
    RoomTypeNotFoundError,
    BookingNotFoundError,
    BookingAlreadyCancelledError,
    BookingNotModifiableError,
    PMSException
)
from app.models.user import User
from app.models.booking import Booking, BookingStatus
from app.schemas.booking import BookingCreate, BookingRead, BookingUpdate, BookingModify, BookingCancellation
from app.services.booking_service import (
    create_booking,
    cancel_booking,
    modify_booking,
    get_booking_by_id,
    booking_to_read_schema
)

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.get("", response_model=List[BookingRead])
async def list_bookings(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    from_date: Optional[date] = Query(None, description="Filter by check-in from date"),
    to_date: Optional[date] = Query(None, description="Filter by check-in to date"),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all bookings. (Protected - requires authentication)
    
    Supports filtering by status and date range.
    """
    query = select(Booking).options(
        selectinload(Booking.customer),
        selectinload(Booking.room_type)
    )
    
    if status_filter:
        query = query.where(Booking.status == status_filter)
    
    if from_date:
        query = query.where(Booking.check_in >= from_date)
    
    if to_date:
        query = query.where(Booking.check_in <= to_date)
    
    query = query.order_by(Booking.created_at.desc()).offset(offset).limit(limit)
    
    result = await db.execute(query)
    bookings = result.scalars().all()
    
    return [booking_to_read_schema(b) for b in bookings]


@router.get("/{booking_id}", response_model=BookingRead)
async def get_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific booking by ID. (Protected - requires authentication)
    """
    booking = await get_booking_by_id(db, booking_id)
    
    if not booking:
        raise BookingNotFoundError(booking_id).to_http_exception()
    
    return booking_to_read_schema(booking)


@router.post("", response_model=BookingRead, status_code=201)
async def create_new_booking(
    booking_data: BookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new booking. (Protected - requires authentication)
    
    This is an ATOMIC TRANSACTION that:
    1. Validates the date range
    2. Checks room availability for all dates
    3. Locks inventory rows to prevent race conditions
    4. Reserves inventory (deducts rooms)
    5. Creates or updates customer record
    6. Creates the booking record
    
    If ANY step fails, the ENTIRE operation is rolled back.
    
    **Response includes:**
    - booking_id
    - status
    - total_amount
    - balance_due
    
    **Error codes:**
    - 400: Invalid date range
    - 404: Room type not found
    - 409: Inventory unavailable (overbooking prevented)
    """
    try:
        booking = await create_booking(db, booking_data)
        
        # Reload with relationships for response
        booking = await get_booking_by_id(db, booking.id)
        
        return booking_to_read_schema(booking)
    
    except PMSException as e:
        # Convert custom exceptions to HTTP exceptions
        raise e.to_http_exception()


@router.put("/{booking_id}", response_model=BookingRead)
async def update_booking(
    booking_id: int,
    booking_data: BookingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a booking. (Protected - requires authentication)
    
    Only allows updating payment amount, status, and notes.
    Date changes are not supported (cancel and rebook instead).
    """
    booking = await get_booking_by_id(db, booking_id)
    
    if not booking:
        raise BookingNotFoundError(booking_id).to_http_exception()
    
    # Update fields if provided
    update_data = booking_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(booking, field, value)
    
    await db.commit()
    await db.refresh(booking)
    
    # Reload with relationships
    booking = await get_booking_by_id(db, booking.id)
    
    return booking_to_read_schema(booking)


@router.post("/{booking_id}/cancel", response_model=BookingRead)
async def cancel_booking_endpoint(
    booking_id: int,
    cancellation: BookingCancellation = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cancel a booking. (Protected - requires authentication)
    
    This ATOMICALLY:
    1. Restores the inventory that was deducted during booking
    2. Updates booking status to cancelled
    
    If restoration fails, the cancellation is rolled back.
    """
    try:
        reason = cancellation.reason if cancellation else None
        booking = await cancel_booking(db, booking_id, reason)
        
        # Reload with relationships
        booking = await get_booking_by_id(db, booking.id)
        
        return booking_to_read_schema(booking)
    
    except PMSException as e:
        raise e.to_http_exception()


@router.put("/{booking_id}/modify", response_model=BookingRead)
async def modify_booking_endpoint(
    booking_id: int,
    modify_data: BookingModify,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Modify a booking (change dates, room type, or num_rooms). (Protected - requires authentication)
    
    This is an ATOMIC TRANSACTION WITH ROLLBACK that:
    1 Validates the booking can be modified (not cancelled, not in past)
    2. RESTORES old inventory (rollback original reservation)
    3. Checks availability for new dates/room type
    4. RESERVES new inventory (make new reservation)
    5. Updates the booking record
    
    If ANY step fails (especially #3), the ENTIRE transaction rolls back,
    meaning the original reservation is restored.
    
    **Allowed modifications:**
    - `check_in`: New check-in date
    - `check_out`: New check-out date
    - `room_type_id`: Change to different room type
    - `num_rooms`: Change number of rooms
    
    **Response includes:**
    - Updated booking with new dates/room type
    - Recalculated total_amount
    - Modification notes in the booking notes
    
    **Error codes:**
    - 400: Booking cannot be modified (cancelled or past)
    - 404: Booking or new room type not found
    - 409: New inventory unavailable (original reservation preserved)
    """
    try:
        booking = await modify_booking(
            db,
            booking_id,
            new_check_in=modify_data.check_in,
            new_check_out=modify_data.check_out,
            new_room_type_id=modify_data.room_type_id,
            new_num_rooms=modify_data.num_rooms
        )
        
        # Reload with relationships
        booking = await get_booking_by_id(db, booking.id)
        
        return booking_to_read_schema(booking)
    
    except PMSException as e:
        raise e.to_http_exception()
