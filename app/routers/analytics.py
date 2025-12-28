"""
Analytics router - JWT-protected endpoints for business intelligence.
All calculations performed by analytics_service.py.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, timedelta

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.analytics import (
    OverviewAnalytics,
    RevenueAnalytics,
    RoomTypeAnalytics,
    BookingTrendAnalytics
)
from app.services.analytics_service import (
    get_overview_analytics,
    get_revenue_analytics,
    get_room_type_analytics,
    get_booking_trend_analytics
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview", response_model=OverviewAnalytics)
async def get_overview(
    start: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end: date = Query(..., description="End date (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get high-level KPIs and metrics.
    
    **Metrics:**
    - Total bookings (all statuses)
    - Confirmed vs Cancelled breakdown
    - Total revenue (confirmed only)
    - Average Daily Rate (ADR)
    - Occupancy Rate (%)
    
    **Example:**
    ```
    GET /analytics/overview?start=2025-01-01&end=2025-12-31
    ```
    
    **Response:**
    ```json
    {
      "total_bookings": 150,
      "confirmed_bookings": 132,
      "cancelled_bookings": 18,
      "total_revenue": 425000.00,
      "average_daily_rate": 2500.00,
      "occupancy_rate": 68.5
    }
    ```
    """
    data = await get_overview_analytics(db, start, end)
    return data


@router.get("/revenue", response_model=RevenueAnalytics)
async def get_revenue(
    start: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end: date = Query(..., description="End date (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get date-wise revenue breakdown.
    
    **Returns:**
    - Daily revenue array
    - Total revenue
    - Average daily revenue
    
    **Example:**
    ```
    GET /analytics/revenue?start=2025-01-01&end=2025-01-31
    ```
    
    **Response:**
    ```json
    {
      "daily_revenue": [
        {"date": "2025-01-01", "revenue": 12000, "booking_count": 5},
        {"date": "2025-01-02", "revenue": 8500, "booking_count": 3}
      ],
      "total_revenue": 280000.00,
      "average_daily_revenue": 9032.26
    }
    ```
    """
    data = await get_revenue_analytics(db, start, end)
    return data


@router.get("/room-types", response_model=RoomTypeAnalytics)
async def get_room_type_performance(
    start: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end: date = Query(..., description="End date (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get performance metrics by room type.
    
    **Returns:**
    - Room type breakdown
    - Revenue per room type
    - Market share percentages
    
    **Example:**
    ```
    GET /analytics/room-types?start=2025-01-01&end=2025-12-31
    ```
    
    **Response:**
    ```json
    {
      "room_types": [
        {
          "room_type_name": "Deluxe",
          "room_type_id": 1,
          "total_rooms_booked": 120,
          "total_revenue": 180000.00,
          "booking_share_percentage": 65.5
        }
      ],
      "total_revenue": 275000.00
    }
    ```
    """
    data = await get_room_type_analytics(db, start, end)
    return data


@router.get("/bookings", response_model=BookingTrendAnalytics)
async def get_booking_trends(
    start: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end: date = Query(..., description="End date (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get booking trend analytics.
    
    **Returns:**
    - Daily booking counts
    - Daily cancellations
    - Peak booking day
    - Total metrics
    
    **Example:**
    ```
    GET /analytics/bookings?start=2025-01-01&end=2025-12-31
    ```
    
    **Response:**
    ```json
    {
      "daily_trends": [
        {"date": "2025-01-01", "bookings": 12, "cancellations": 2},
        {"date": "2025-01-02", "bookings": 8, "cancellations": 1}
      ],
      "peak_booking_day": "2025-07-15",
      "peak_booking_count": 25,
      "total_bookings": 450,
      "total_cancellations": 38
    }
    ```
    """
    data = await get_booking_trend_analytics(db, start, end)
    return data
