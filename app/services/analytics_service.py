"""
Analytics service - all analytics calculations happen here.
Uses SQL aggregations for performance.
"""

from datetime import date, timedelta
from decimal import Decimal
from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, case

from app.models.booking import Booking, BookingStatus
from app.models.booking_item import BookingItem
from app.models.inventory import Inventory
from app.models.room_type import RoomType


async def get_overview_analytics(
    db: AsyncSession,
    start_date: date,
    end_date: date
) -> dict:
    """
    Calculate high-level KPIs: bookings, revenue, occupancy, ADR.
    
    Args:
        db: Database session
        start_date: Start of date range
        end_date: End of date range
    
    Returns:
        Dictionary with overview metrics
    """
    # Total bookings and breakdown by status
    result = await db.execute(
        select(
            func.count(Booking.id).label('total'),
            func.sum(case((Booking.status == BookingStatus.CONFIRMED.value, 1), else_=0)).label('confirmed'),
            func.sum(case((Booking.status == BookingStatus.CANCELLED.value, 1), else_=0)).label('cancelled'),
            func.sum(case((Booking.status == BookingStatus.CONFIRMED.value, Booking.total_amount), else_=0)).label('revenue')
        ).where(
            and_(
                Booking.check_in >= start_date,
                Booking.check_in <= end_date
            )
        )
    )
    stats = result.one()
    
    total_bookings = stats.total or 0
    confirmed = stats.confirmed or 0
    cancelled = stats.cancelled or 0
    total_revenue = Decimal(stats.revenue or 0)
    
    # Calculate room nights sold (only confirmed bookings)
    # Query all confirmed bookings to calculate nights in Python
    result = await db.execute(
        select(
            Booking.num_rooms,
            Booking.check_in,
            Booking.check_out
        ).where(
            and_(
                Booking.check_in >= start_date,
                Booking.check_in <= end_date,
                Booking.status == BookingStatus.CONFIRMED.value
            )
        )
    )
    
    room_nights_sold = 0
    for row in result:
        nights = (row.check_out - row.check_in).days
        room_nights_sold += row.num_rooms * nights
    
    # Calculate total available room nights from inventory
    result = await db.execute(
        select(
            func.count(Inventory.id).label('inventory_records'),
            func.sum(Inventory.available_rooms).label('total_capacity')
        ).where(
            and_(
                Inventory.date >= start_date,
                Inventory.date <= end_date
            )
        )
    )
    inv_stats = result.one()
    total_room_nights = inv_stats.total_capacity or 1  # Avoid division by zero
    
    # Calculate metrics
    adr = total_revenue / Decimal(room_nights_sold) if room_nights_sold > 0 else Decimal(0)
    occupancy_rate = (room_nights_sold / total_room_nights * 100) if total_room_nights > 0 else 0
    
    return {
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed,
        "cancelled_bookings": cancelled,
        "total_revenue": total_revenue,
        "average_daily_rate": round(adr, 2),
        "occupancy_rate": round(occupancy_rate, 2)
    }


async def get_revenue_analytics(
    db: AsyncSession,
    start_date: date,
    end_date: date
) -> dict:
    """
    Calculate daily revenue breakdown.
    
    Args:
        db: Database session
        start_date: Start of date range
        end_date: End of date range
    
    Returns:
        Dictionary with daily revenue data
    """
    # Daily revenue grouped by check-in date
    result = await db.execute(
        select(
            Booking.check_in,
            func.sum(Booking.total_amount).label('revenue'),
            func.count(Booking.id).label('booking_count')
        ).where(
            and_(
                Booking.check_in >= start_date,
                Booking.check_in <= end_date,
                Booking.status == BookingStatus.CONFIRMED.value
            )
        ).group_by(Booking.check_in)
        .order_by(Booking.check_in)
    )
    
    daily_data = []
    total_revenue = Decimal(0)
    
    for row in result:
        revenue = Decimal(row.revenue or 0)
        total_revenue += revenue
        daily_data.append({
            "date": row.check_in,
            "revenue": revenue,
            "booking_count": row.booking_count
        })
    
    avg_daily = total_revenue / len(daily_data) if daily_data else Decimal(0)
    
    return {
        "daily_revenue": daily_data,
        "total_revenue": total_revenue,
        "average_daily_revenue": round(avg_daily, 2)
    }


async def get_room_type_analytics(
    db: AsyncSession,
    start_date: date,
    end_date: date
) -> dict:
    """
    Calculate performance metrics by room type.
    
    Args:
        db: Database session
        start_date: Start of date range
        end_date: End of date range
    
    Returns:
        Dictionary with room type performance data
    """
    # Aggregate by room type
    result = await db.execute(
        select(
            RoomType.id,
            RoomType.name,
            func.sum(Booking.num_rooms).label('rooms_booked'),
            func.sum(Booking.total_amount).label('revenue')
        ).join(
            Booking, Booking.room_type_id == RoomType.id
        ).where(
            and_(
                Booking.check_in >= start_date,
                Booking.check_in <= end_date,
                Booking.status == BookingStatus.CONFIRMED.value
            )
        ).group_by(RoomType.id, RoomType.name)
    )
    
    room_types_data = []
    total_revenue = Decimal(0)
    
    for row in result:
        revenue = Decimal(row.revenue or 0)
        total_revenue += revenue
        room_types_data.append({
            "room_type_id": row.id,
            "room_type_name": row.name,
            "total_rooms_booked": row.rooms_booked or 0,
            "total_revenue": revenue,
            "booking_share_percentage": 0  # Will calculate after
        })
    
    # Calculate percentages
    for room_type in room_types_data:
        if total_revenue > 0:
            room_type["booking_share_percentage"] = round(
                float(room_type["total_revenue"] / total_revenue * 100), 2
            )
    
    return {
        "room_types": room_types_data,
        "total_revenue": total_revenue
    }


async def get_booking_trend_analytics(
    db: AsyncSession,
    start_date: date,
    end_date: date
) -> dict:
    """
    Calculate booking trends: bookings and cancellations per day.
    
    Args:
        db: Database session
        start_date: Start of date range
        end_date: End of date range
    
    Returns:
        Dictionary with booking trend data
    """
    # Daily bookings and cancellations
    result = await db.execute(
        select(
            Booking.check_in,
            func.count(Booking.id).label('total_bookings'),
            func.sum(case((Booking.status == BookingStatus.CANCELLED.value, 1), else_=0)).label('cancellations')
        ).where(
            and_(
                Booking.check_in >= start_date,
                Booking.check_in <= end_date
            )
        ).group_by(Booking.check_in)
        .order_by(Booking.check_in)
    )
    
    daily_trends = []
    peak_day = None
    peak_count = 0
    total_bookings = 0
    total_cancellations = 0
    
    for row in result:
        bookings = row.total_bookings or 0
        cancellations = row.cancellations or 0
        
        total_bookings += bookings
        total_cancellations += cancellations
        
        if bookings > peak_count:
            peak_count = bookings
            peak_day = row.check_in
        
        daily_trends.append({
            "date": row.check_in,
            "bookings": bookings,
            "cancellations": cancellations
        })
    
    return {
        "daily_trends": daily_trends,
        "peak_booking_day": peak_day,
        "peak_booking_count": peak_count,
        "total_bookings": total_bookings,
        "total_cancellations": total_cancellations
    }
