"""
Pydantic schemas for analytics API responses.
All schemas are frontend-ready JSON structures.
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from decimal import Decimal


class OverviewAnalytics(BaseModel):
    """
    High-level KPIs for dashboard overview.
    """
    total_bookings: int
    confirmed_bookings: int
    cancelled_bookings: int
    total_revenue: Decimal
    average_daily_rate: Decimal  # ADR
    occupancy_rate: float  # Percentage


class DailyRevenue(BaseModel):
    """Revenue for a single day."""
    date: date
    revenue: Decimal
    booking_count: int


class RevenueAnalytics(BaseModel):
    """
    Date-wise revenue breakdown.
    """
    daily_revenue: List[DailyRevenue]
    total_revenue: Decimal
    average_daily_revenue: Decimal


class RoomTypePerformance(BaseModel):
    """Performance metrics for a single room type."""
    room_type_name: str
    room_type_id: int
    total_rooms_booked: int
    total_revenue: Decimal
    booking_share_percentage: float


class RoomTypeAnalytics(BaseModel):
    """
    Room type performance comparison.
    """
    room_types: List[RoomTypePerformance]
    total_revenue: Decimal


class DailyBookingTrend(BaseModel):
    """Booking trend for a single day."""
    date: date
    bookings: int
    cancellations: int


class BookingTrendAnalytics(BaseModel):
    """
    Booking trends over time.
    """
    daily_trends: List[DailyBookingTrend]
    peak_booking_day: Optional[date]
    peak_booking_count: int
    total_bookings: int
    total_cancellations: int
