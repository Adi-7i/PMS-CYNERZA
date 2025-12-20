"""
Booking service for managing reservations.
Handles the complete booking flow with ATOMIC TRANSACTIONAL INTEGRITY.

TRANSACTION FLOW:
1. Validate dates
2. Verify room type exists
3. Check availability (read-only)
4. BEGIN TRANSACTION
   4a. Lock inventory rows (SELECT FOR UPDATE)
   4b. Reserve inventory (deduct rooms)
   4c. Create/update customer
   4d. Create booking record
5. COMMIT (success) or ROLLBACK (any failure)
"""

from datetime import date
from decimal import Decimal
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.booking import Booking, BookingStatus
from app.models.customer import Customer
from app.models.room_type import RoomType
from app.schemas.booking import BookingCreate, BookingRead
from app.services.inventory_service import (
    check_availability,
    reserve_inventory,
    restore_inventory
)
from app.core.exceptions import (
    InvalidDateRangeError,
    InventoryUnavailableError,
    InventoryNotFoundError,
    RoomTypeNotFoundError,
    BookingNotFoundError,
    BookingAlreadyCancelledError
)


# =============================================================================
# CUSTOMER MANAGEMENT
# =============================================================================

async def get_or_create_customer(
    db: AsyncSession,
    name: str,
    email: str,
    phone: Optional[str] = None,
    address: Optional[str] = None,
    id_proof_type: Optional[str] = None,
    id_proof_number: Optional[str] = None
) -> Customer:
    """
    Get existing customer by email or create a new one.
    Must be called within a transaction.
    
    Args:
        db: Database session
        name: Customer name
        email: Customer email (unique identifier)
        phone: Optional phone number
        address: Optional address
        id_proof_type: Optional ID proof type
        id_proof_number: Optional ID proof number
    
    Returns:
        Customer model instance
    """
    # Try to find existing customer
    result = await db.execute(
        select(Customer).where(Customer.email == email)
    )
    customer = result.scalar_one_or_none()
    
    if customer:
        # Update customer info if provided
        customer.name = name
        if phone:
            customer.phone = phone
        if address:
            customer.address = address
        if id_proof_type:
            customer.id_proof_type = id_proof_type
        if id_proof_number:
            customer.id_proof_number = id_proof_number
        return customer
    
    # Create new customer
    customer = Customer(
        name=name,
        email=email,
        phone=phone,
        address=address,
        id_proof_type=id_proof_type,
        id_proof_number=id_proof_number
    )
    db.add(customer)
    await db.flush()  # Get the ID without committing
    
    return customer


# =============================================================================
# BOOKING CREATION (ATOMIC TRANSACTION)
# =============================================================================

async def create_booking(
    db: AsyncSession,
    booking_data: BookingCreate
) -> Booking:
    """
    Create a new booking with ATOMIC TRANSACTION.
    
    This is the main booking entry point. It handles:
    - Date validation
    - Room type verification
    - Availability check
    - Inventory reservation (with row locking)
    - Customer creation/update
    - Booking record creation
    
    ALL OPERATIONS ARE ATOMIC - if any step fails, everything rolls back.
    
    Args:
        db: Database session
        booking_data: Booking creation schema
    
    Returns:
        Created Booking model instance
    
    Raises:
        InvalidDateRangeError: If dates are invalid
        RoomTypeNotFoundError: If room type doesn't exist
        InventoryNotFoundError: If inventory doesn't exist
        InventoryUnavailableError: If not enough rooms
    """
    # ==========================================================================
    # STEP 1: Validate date range
    # ==========================================================================
    if booking_data.check_out <= booking_data.check_in:
        raise InvalidDateRangeError("Check-out date must be after check-in date")
    
    if booking_data.check_in < date.today():
        raise InvalidDateRangeError("Check-in date cannot be in the past")
    
    # ==========================================================================
    # STEP 2: Verify room type exists
    # ==========================================================================
    result = await db.execute(
        select(RoomType).where(RoomType.id == booking_data.room_type_id)
    )
    room_type = result.scalar_one_or_none()
    
    if not room_type:
        raise RoomTypeNotFoundError(booking_data.room_type_id)
    
    # ==========================================================================
    # STEP 3: Pre-check availability (read-only, no locks)
    # ==========================================================================
    is_available, min_rooms, estimated_price = await check_availability(
        db,
        booking_data.room_type_id,
        booking_data.check_in,
        booking_data.check_out,
        booking_data.num_rooms
    )
    
    if not is_available:
        raise InventoryUnavailableError(
            f"Only {min_rooms} room(s) available, requested {booking_data.num_rooms}"
        )
    
    # ==========================================================================
    # STEP 4: ATOMIC TRANSACTION - Reserve inventory and create booking
    # ==========================================================================
    # Use session.begin() for explicit transaction control
    # If ANY operation fails, ALL changes are rolled back automatically
    async with db.begin_nested():  # Savepoint for nested transaction safety
        # 4a. Reserve inventory (locks rows with SELECT FOR UPDATE)
        # This is the CRITICAL section that prevents overbooking
        total_amount = await reserve_inventory(
            db,
            booking_data.room_type_id,
            booking_data.check_in,
            booking_data.check_out,
            booking_data.num_rooms
        )
        
        # 4b. Get or create customer
        customer = await get_or_create_customer(
            db,
            name=booking_data.customer.name,
            email=booking_data.customer.email,
            phone=booking_data.customer.phone,
            address=booking_data.customer.address,
            id_proof_type=booking_data.customer.id_proof_type,
            id_proof_number=booking_data.customer.id_proof_number
        )
        
        # 4c. Create booking record
        booking = Booking(
            customer_id=customer.id,
            room_type_id=booking_data.room_type_id,
            check_in=booking_data.check_in,
            check_out=booking_data.check_out,
            num_rooms=booking_data.num_rooms,
            total_amount=total_amount,
            amount_paid=booking_data.amount_paid,
            status=BookingStatus.CONFIRMED.value,
            notes=booking_data.notes
        )
        db.add(booking)
        await db.flush()
    
    # ==========================================================================
    # STEP 5: Commit transaction
    # ==========================================================================
    await db.commit()
    await db.refresh(booking)
    
    return booking


# =============================================================================
# BOOKING CANCELLATION (ATOMIC TRANSACTION)
# =============================================================================

async def cancel_booking(
    db: AsyncSession,
    booking_id: int,
    reason: Optional[str] = None
) -> Booking:
    """
    Cancel a booking and restore inventory atomically.
    
    Args:
        db: Database session
        booking_id: ID of the booking to cancel
        reason: Optional cancellation reason
    
    Returns:
        Updated Booking model instance
    
    Raises:
        BookingNotFoundError: If booking doesn't exist
        BookingAlreadyCancelledError: If already cancelled
    """
    # Find booking
    result = await db.execute(
        select(Booking).where(Booking.id == booking_id)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise BookingNotFoundError(booking_id)
    
    if booking.status == BookingStatus.CANCELLED.value:
        raise BookingAlreadyCancelledError(booking_id)
    
    # Atomic cancellation with inventory restoration
    async with db.begin_nested():
        # Restore inventory (releases the reserved rooms)
        await restore_inventory(
            db,
            booking.room_type_id,
            booking.check_in,
            booking.check_out,
            booking.num_rooms
        )
        
        # Update booking status
        booking.status = BookingStatus.CANCELLED.value
        if reason:
            existing_notes = booking.notes or ""
            booking.notes = f"{existing_notes}\nCancellation reason: {reason}".strip()
        
        await db.flush()
    
    await db.commit()
    await db.refresh(booking)
    
    return booking


# =============================================================================
# BOOKING QUERIES
# =============================================================================

async def get_booking_by_id(
    db: AsyncSession,
    booking_id: int
) -> Optional[Booking]:
    """
    Get a booking by its ID with related data.
    
    Args:
        db: Database session
        booking_id: Booking ID
    
    Returns:
        Booking model instance or None
    """
    result = await db.execute(
        select(Booking)
        .options(
            selectinload(Booking.customer),
            selectinload(Booking.room_type)
        )
        .where(Booking.id == booking_id)
    )
    return result.scalar_one_or_none()


# =============================================================================
# SCHEMA CONVERSION
# =============================================================================

def booking_to_read_schema(booking: Booking) -> BookingRead:
    """
    Convert a Booking model to BookingRead schema.
    
    Args:
        booking: Booking model instance (must have customer and room_type loaded)
    
    Returns:
        BookingRead schema
    """
    return BookingRead(
        id=booking.id,
        customer_id=booking.customer_id,
        customer_name=booking.customer.name,
        customer_email=booking.customer.email,
        room_type_id=booking.room_type_id,
        room_type_name=booking.room_type.name,
        check_in=booking.check_in,
        check_out=booking.check_out,
        num_rooms=booking.num_rooms,
        total_amount=booking.total_amount,
        amount_paid=booking.amount_paid,
        balance_due=booking.balance_due,
        status=booking.status,
        notes=booking.notes,
        created_at=booking.created_at
    )
