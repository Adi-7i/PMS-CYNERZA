"""
Multi-room booking service for handling bookings with multiple room types.
Handles atomic transactions across multiple room types and quantities.
"""

from datetime import date
from decimal import Decimal
from typing import List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.booking import Booking, BookingStatus
from app.models.booking_item import BookingItem
from app.models.room_type import RoomType
from app.models.customer import Customer
from app.services.inventory_service import check_availability, reserve_inventory
from app.services.booking_service import get_or_create_customer
from app.core.exceptions import (
    InvalidDateRangeError,
    RoomTypeNotFoundError,
    InventoryUnavailableError
)


async def create_multi_room_booking(
    db: AsyncSession,
    check_in: date,
    check_out: date,
    room_requests: List[Dict],  # [{"room_type_id": 1, "quantity": 2}, ...]
    customer_data: Dict,
    amount_paid: Decimal = Decimal("0.00"),
    notes: str = None
) -> Booking:
    """
    Create a booking with multiple room types (parent-child model).
    
    ATOMIC TRANSACTION FLOW:
    1. Validate dates
    2. For EACH room type:
       - Verify room type exists
       - Check availability
    3. BEGIN TRANSACTION
       3a. Reserve inventory for ALL room types
       3b. Create/update customer
       3c. Create parent booking
       3d. Create child booking_items
    4. COMMIT or ROLLBACK
    
    Args:
        db: Database session
        check_in: Check-in date
        check_out: Check-out date
        room_requests: List of dicts with room_type_id and quantity
        customer_data: Customer information
        amount_paid: Initial payment amount
        notes: Optional booking notes
    
    Returns:
        Created Booking with booking_items loaded
    
    Raises:
        InvalidDateRangeError: If dates are invalid
        RoomTypeNotFoundError: If any room type doesn't exist
        InventoryUnavailableError: If any room type is unavailable
    """
    # ==========================================================================
    # STEP 1: Validate date range
    # ==========================================================================
    if check_out <= check_in:
        raise InvalidDateRangeError("Check-out date must be after check-in date")
    
    if check_in < date.today():
        raise InvalidDateRangeError("Check-in date cannot be in the past")
    
    if not room_requests:
        raise ValueError("At least one room type must be requested")
    
    # ==========================================================================
    # STEP 2: Validate and check availability for ALL room types
    # ==========================================================================
    room_type_prices = {}
    total_amount = Decimal("0.00")
    
    for room_req in room_requests:
        room_type_id = room_req["room_type_id"]
        quantity = room_req["quantity"]
        
        # Verify room type exists
        result = await db.execute(
            select(RoomType).where(RoomType.id == room_type_id)
        )
        room_type = result.scalar_one_or_none()
        
        if not room_type:
            raise RoomTypeNotFoundError(room_type_id)
        
        # Check availability (read-only)
        is_available, min_available, price = await check_availability(
            db,
            room_type_id,
            check_in,
            check_out,
            quantity
        )
        
        if not is_available:
            raise InventoryUnavailableError(
                f"Room type '{room_type.name}': Only {min_available} room(s) available, requested {quantity}"
            )
        
        # Store price per night for this room type
        room_type_prices[room_type_id] = room_type.base_price
        total_amount += price
    
    # ==========================================================================
    # STEP 3: ATOMIC TRANSACTION - Reserve all and create booking
    # ==========================================================================
    async with db.begin_nested():
        # 3a. Reserve inventory for ALL room types
        for room_req in room_requests:
            await reserve_inventory(
                db,
                room_req["room_type_id"],
                check_in,
                check_out,
                room_req["quantity"]
            )
        
        # 3b. Create/update customer
        customer = await get_or_create_customer(
            db,
            name=customer_data.get("name"),
            email=customer_data.get("email"),
            phone=customer_data.get("phone"),
            address=customer_data.get("address"),
            id_proof_type=customer_data.get("id_proof_type"),
            id_proof_number=customer_data.get("id_proof_number")
        )
        
        # 3c. Create parent booking (without room_type_id for multi-room)
        booking = Booking(
            customer_id=customer.id,
            room_type_id=room_requests[0]["room_type_id"],  # Keep for backward compatibility
            check_in=check_in,
            check_out=check_out,
           num_rooms=sum(r["quantity"] for r in room_requests),  # Total rooms
            total_amount=total_amount,
            amount_paid=amount_paid,
            status=BookingStatus.CONFIRMED.value,
            notes=notes
        )
        db.add(booking)
        await db.flush()  # Get booking ID
        
        # 3d. Create child booking_items
        for room_req in room_requests:
            booking_item = BookingItem(
                booking_id=booking.id,
                room_type_id=room_req["room_type_id"],
                quantity=room_req["quantity"],
                price_per_night=room_type_prices[room_req["room_type_id"]]
            )
            db.add(booking_item)
        
        await db.flush()
    
    # ==========================================================================
    # STEP 4: Commit and reload
    # ==========================================================================
    await db.commit()
    await db.refresh(booking)
    
    return booking
