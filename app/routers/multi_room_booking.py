"""
Multi-room booking router for bookings with multiple room types.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.exceptions import PMSException
from app.models.user import User
from app.models.booking import Booking
from app.models.booking_item import BookingItem
from app.schemas.booking import CustomerInfo
from app.schemas.multi_room_booking import (
    MultiRoomBookingCreate,
    MultiRoomBookingRead,
    BookingItemRead
)
from app.services.multi_room_booking_service import create_multi_room_booking

router = APIRouter(prefix="/multi-room-bookings", tags=["Multi-Room Bookings"])


@router.post("", response_model=MultiRoomBookingRead, status_code=201)
async def create_multi_room_booking_endpoint(
    booking_data: MultiRoomBookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a multi-room booking (single booking with multiple room types).
    
    This is an ATOMIC TRANSACTION that:
    1. Validates ALL room types exist
    2. Checks availability for ALL room types
    3. Reserves inventory for ALL room types (locks rows)
    4. Creates parent booking
    5. Creates child booking_items for each room type
    
    If ANY step fails, the ENTIRE operation is rolled back.
    
    **Request Body:**
    ```json
    {
      "check_in": "2025-02-01",
      "check_out": "2025-02-03",
      "rooms": [
        {"room_type_id": 1, "quantity": 2},
        {"room_type_id": 2, "quantity": 1}
      ],
      "customer": {...}
    }
    ```
    
    **Response includes:**
    - booking_id
    - List of booking_items with room types and quantities
    - Total amount (sum of all room types)
    
    **Error codes:**
    - 400: Invalid date range
    - 404: Room type not found
    - 409: Any room type unavailable (overbooking prevented)
    """
    try:
        # Convert room requests to list of dicts
        room_requests = [
            {"room_type_id": room.room_type_id, "quantity": room.quantity}
            for room in booking_data.rooms
        ]
        
        booking = await create_multi_room_booking(
            db,
            check_in=booking_data.check_in,
            check_out=booking_data.check_out,
            room_requests=room_requests,
            customer_data=booking_data.customer.model_dump(),
            amount_paid=booking_data.amount_paid,
            notes=booking_data.notes
        )
        
        # Reload with relationships
        booking = await db.get(
            Booking,
            booking.id,
            options=[
                selectinload(Booking.booking_items).selectinload(BookingItem.room_type),
                selectinload(Booking.customer)
            ]
        )
        
        # Convert to response schema
        booking_items_read = []
        for item in booking.booking_items:
            booking_items_read.append(BookingItemRead(
                id=item.id,
                room_type_id=item.room_type_id,
                room_type_name=item.room_type.name,
                quantity=item.quantity,
                price_per_night=item.price_per_night
            ))
        
        return MultiRoomBookingRead(
            id=booking.id,
            customer_id=booking.customer_id,
            customer_name=booking.customer.name,
            customer_email=booking.customer.email,
            check_in=booking.check_in,
            check_out=booking.check_out,
            booking_items=booking_items_read,
            total_amount=booking.total_amount,
            amount_paid=booking.amount_paid,
            balance_due=booking.balance_due,
            status=booking.status,
            notes=booking.notes,
            created_at=str(booking.created_at)
        )
    
    except PMSException as e:
        raise e.to_http_exception()
