"""
Inventory service for managing date-wise room availability.
Handles inventory generation, availability checks, and atomic reservation.

TRANSACTION SAFETY:
- Uses SELECT FOR UPDATE for row-level locking (PostgreSQL)
- All inventory modifications must be within a transaction
- SQLite fallback is serialized via single-connection
"""

from datetime import date, timedelta
from typing import List, Optional, Tuple
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.models.inventory import Inventory
from app.models.room_type import RoomType
from app.schemas.inventory import InventoryAvailability, DateRangeAvailability
from app.utils.date_utils import get_date_list, get_future_dates
from app.core.config import get_settings
from app.core.exceptions import (
    InventoryUnavailableError,
    InventoryNotFoundError,
    InvalidDateRangeError
)

settings = get_settings()


# =============================================================================
# INVENTORY GENERATION
# =============================================================================

async def generate_inventory(
    db: AsyncSession,
    room_type_id: int,
    days: int = 90
) -> int:
    """
    Generate inventory records for a room type for the next N days.
    Skips dates that already have inventory records.
    
    Args:
        db: Database session
        room_type_id: ID of the room type
        days: Number of days to generate (default: 90)
    
    Returns:
        Number of inventory records created
    """
    # Get room type details
    result = await db.execute(
        select(RoomType).where(RoomType.id == room_type_id)
    )
    room_type = result.scalar_one_or_none()
    
    if not room_type:
        return 0
    
    dates = get_future_dates(days)
    created_count = 0
    
    for inv_date in dates:
        # Check if inventory already exists for this date
        existing = await db.execute(
            select(Inventory).where(
                and_(
                    Inventory.room_type_id == room_type_id,
                    Inventory.date == inv_date
                )
            )
        )
        
        if existing.scalar_one_or_none() is None:
            inventory = Inventory(
                room_type_id=room_type_id,
                date=inv_date,
                available_rooms=room_type.total_rooms,
                price=room_type.base_price
            )
            db.add(inventory)
            created_count += 1
    
    await db.flush()  # Flush within current transaction
    return created_count


async def generate_inventory_for_room_type(
    db: AsyncSession,
    room_type: RoomType,
    days_ahead: int = None
) -> int:
    """
    Generate inventory records for a room type model instance.
    Wrapper for generate_inventory that accepts RoomType object.
    
    Args:
        db: Database session
        room_type: RoomType model instance
        days_ahead: Number of days to generate (defaults to config value)
    
    Returns:
        Number of inventory records created
    """
    if days_ahead is None:
        days_ahead = settings.INVENTORY_DAYS_AHEAD
    
    count = await generate_inventory(db, room_type.id, days_ahead)
    await db.commit()
    return count


# =============================================================================
# AVAILABILITY CHECKING
# =============================================================================

async def check_availability(
    db: AsyncSession,
    room_type_id: int,
    start_date: date,
    end_date: date,
    num_rooms: int = 1
) -> Tuple[bool, int, Decimal]:
    """
    Check if rooms are available for all dates in the range.
    Does NOT lock rows - use for read-only availability queries.
    
    Args:
        db: Database session
        room_type_id: ID of the room type
        start_date: Check-in date (inclusive)
        end_date: Check-out date (exclusive)
        num_rooms: Number of rooms needed
    
    Returns:
        Tuple of (is_available, min_available_rooms, total_price)
    
    Raises:
        InvalidDateRangeError: If date range is invalid
        InventoryNotFoundError: If inventory doesn't exist for dates
    """
    # Validate date range
    if end_date <= start_date:
        raise InvalidDateRangeError("Check-out date must be after check-in date")
    
    if start_date < date.today():
        raise InvalidDateRangeError("Check-in date cannot be in the past")
    
    required_dates = get_date_list(start_date, end_date)
    
    # Query inventory for date range
    result = await db.execute(
        select(Inventory)
        .where(
            and_(
                Inventory.room_type_id == room_type_id,
                Inventory.date >= start_date,
                Inventory.date < end_date
            )
        )
        .order_by(Inventory.date)
    )
    inventory_records = list(result.scalars().all())
    
    # Check if we have inventory for all required dates
    inventory_dates = {inv.date for inv in inventory_records}
    missing_dates = [d for d in required_dates if d not in inventory_dates]
    
    if missing_dates:
        raise InventoryNotFoundError(
            f"No inventory found for dates: {missing_dates[0]} to {missing_dates[-1]}"
        )
    
    # Calculate availability
    min_available = min(inv.available_rooms for inv in inventory_records)
    total_price = sum(inv.price for inv in inventory_records) * num_rooms
    is_available = min_available >= num_rooms
    
    return is_available, min_available, total_price


# =============================================================================
# INVENTORY RESERVATION (TRANSACTIONAL)
# =============================================================================

async def reserve_inventory(
    db: AsyncSession,
    room_type_id: int,
    start_date: date,
    end_date: date,
    num_rooms: int = 1
) -> Decimal:
    """
    Reserve (deduct) inventory for a booking within a transaction.
    
    CRITICAL: This function MUST be called within an active transaction.
    It uses SELECT FOR UPDATE to lock inventory rows and prevent race conditions.
    
    Args:
        db: Database session (must be in a transaction via session.begin())
        room_type_id: ID of the room type
        start_date: Check-in date (inclusive)
        end_date: Check-out date (exclusive)
        num_rooms: Number of rooms to reserve
    
    Returns:
        Total price for the reservation
    
    Raises:
        InventoryNotFoundError: If inventory doesn't exist for a date
        InventoryUnavailableError: If not enough rooms available
    """
    required_dates = get_date_list(start_date, end_date)
    total_price = Decimal("0.00")
    
    for booking_date in required_dates:
        # SELECT FOR UPDATE: Locks the row to prevent concurrent modifications
        # This is the key to preventing overbooking race conditions
        result = await db.execute(
            select(Inventory)
            .where(
                and_(
                    Inventory.room_type_id == room_type_id,
                    Inventory.date == booking_date
                )
            )
            .with_for_update()  # Row-level lock (PostgreSQL)
        )
        inventory = result.scalar_one_or_none()
        
        # Validate inventory exists
        if inventory is None:
            raise InventoryNotFoundError(
                f"No inventory available for date {booking_date}"
            )
        
        # Validate availability (CRITICAL: Must check AFTER locking)
        if inventory.available_rooms < num_rooms:
            raise InventoryUnavailableError(
                f"Only {inventory.available_rooms} room(s) available on {booking_date}, "
                f"requested {num_rooms}",
                date=str(booking_date)
            )
        
        # Deduct inventory (no negative values allowed)
        inventory.available_rooms -= num_rooms
        assert inventory.available_rooms >= 0, "Inventory cannot be negative"
        
        # Accumulate price
        total_price += inventory.price * num_rooms
    
    # Changes are flushed but NOT committed - caller manages transaction
    await db.flush()
    return total_price


async def restore_inventory(
    db: AsyncSession,
    room_type_id: int,
    start_date: date,
    end_date: date,
    num_rooms: int = 1
) -> None:
    """
    Restore inventory when a booking is cancelled.
    Should be called within a transaction.
    
    Args:
        db: Database session
        room_type_id: ID of the room type
        start_date: Check-in date (inclusive)
        end_date: Check-out date (exclusive)
        num_rooms: Number of rooms to restore
    """
    required_dates = get_date_list(start_date, end_date)
    
    for booking_date in required_dates:
        # Lock row for update
        result = await db.execute(
            select(Inventory)
            .where(
                and_(
                    Inventory.room_type_id == room_type_id,
                    Inventory.date == booking_date
                )
            )
            .with_for_update()
        )
        inventory = result.scalar_one_or_none()
        
        if inventory:
            inventory.available_rooms += num_rooms
    
    await db.flush()


# =============================================================================
# QUERY HELPERS
# =============================================================================

async def get_inventory_for_date_range(
    db: AsyncSession,
    room_type_id: int,
    start_date: date,
    end_date: date
) -> List[Inventory]:
    """
    Get inventory records for a room type within a date range (read-only).
    
    Args:
        db: Database session
        room_type_id: ID of the room type
        start_date: Start date (inclusive)
        end_date: End date (exclusive)
    
    Returns:
        List of Inventory records
    """
    result = await db.execute(
        select(Inventory)
        .where(
            and_(
                Inventory.room_type_id == room_type_id,
                Inventory.date >= start_date,
                Inventory.date < end_date
            )
        )
        .order_by(Inventory.date)
    )
    return list(result.scalars().all())


async def get_availability_summary(
    db: AsyncSession,
    start_date: date,
    end_date: date,
    room_type_id: Optional[int] = None
) -> List[DateRangeAvailability]:
    """
    Get availability summary for all room types (or a specific one).
    
    Args:
        db: Database session
        start_date: Start date
        end_date: End date
        room_type_id: Optional room type filter
    
    Returns:
        List of availability summaries
    """
    # Get room types
    query = select(RoomType)
    if room_type_id:
        query = query.where(RoomType.id == room_type_id)
    
    result = await db.execute(query)
    room_types = result.scalars().all()
    
    summaries = []
    
    for rt in room_types:
        inventory_records = await get_inventory_for_date_range(
            db, rt.id, start_date, end_date
        )
        
        if not inventory_records:
            continue
        
        daily_breakdown = [
            InventoryAvailability(
                room_type_id=rt.id,
                room_type_name=rt.name,
                date=inv.date,
                available_rooms=inv.available_rooms,
                price=inv.price
            )
            for inv in inventory_records
        ]
        
        min_available = min(inv.available_rooms for inv in inventory_records)
        total_price = sum(inv.price for inv in inventory_records)
        
        summaries.append(DateRangeAvailability(
            room_type_id=rt.id,
            room_type_name=rt.name,
            start_date=start_date,
            end_date=end_date,
            min_available=min_available,
            total_price=total_price,
            daily_breakdown=daily_breakdown
        ))
    
    return summaries
