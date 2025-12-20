# Services module initialization

from app.services.inventory_service import (
    generate_inventory,
    generate_inventory_for_room_type,
    get_inventory_for_date_range,
    check_availability,
    reserve_inventory,
    restore_inventory,
    get_availability_summary
)
from app.services.booking_service import (
    create_booking,
    cancel_booking,
    modify_booking,
    get_booking_by_id,
    get_or_create_customer,
    booking_to_read_schema
)

__all__ = [
    # Inventory
    "generate_inventory",
    "generate_inventory_for_room_type",
    "get_inventory_for_date_range",
    "check_availability",
    "reserve_inventory",
    "restore_inventory",
    "get_availability_summary",
    # Booking
    "create_booking",
    "cancel_booking",
    "modify_booking",
    "get_booking_by_id",
    "get_or_create_customer",
    "booking_to_read_schema"
]
