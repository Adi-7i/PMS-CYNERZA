# Models module initialization
# Import all models here to ensure they're registere# Models module initialization

from app.models.user import User
from app.models.room_type import RoomType
from app.models.inventory import Inventory
from app.models.customer import Customer
from app.models.booking import Booking, BookingStatus
from app.models.booking_item import BookingItem

__all__ = [
    "User",
    "RoomType",
    "Inventory",
    "Booking",
    "BookingStatus",
    "BookingItem",
    "Customer"
]
