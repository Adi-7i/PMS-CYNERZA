# Routers module initialization

from app.routers.auth import router as auth_router
from app.routers.room_type import router as room_type_router
from app.routers.inventory import router as inventory_router
from app.routers.booking import router as booking_router
from app.routers.customer import router as customer_router
from app.routers.calendar import router as calendar_router
from app.routers.multi_room_booking import router as multi_room_booking_router
from app.routers.audit_log import router as audit_log_router
from app.routers.analytics import router as analytics_router

__all__ = [
    "auth_router",
    "room_type_router",
    "inventory_router",
    "booking_router",
    "customer_router",
    "calendar_router",
    "multi_room_booking_router",
    "audit_log_router",
    "analytics_router"
]
