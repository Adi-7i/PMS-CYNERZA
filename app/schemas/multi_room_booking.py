"""
Pydantic schemas for multi-room booking functionality.
"""

from pydantic import BaseModel, Field, EmailStr
from datetime import date
from typing import List, Optional
from decimal import Decimal


class CustomerInfo(BaseModel):
    """Customer information for booking."""
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    id_proof_type: Optional[str] = None
    id_proof_number: Optional[str] = None


class RoomItemRequest(BaseModel):
    """Single room type request in a multi-room booking."""
    room_type_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0, description="Number of rooms of this type")


class BookingItemRead(BaseModel):
    """Schema for reading booking item data."""
    id: int
    room_type_id: int
    room_type_name: str
    quantity: int
    price_per_night: Decimal
    
    class Config:
        from_attributes = True


class MultiRoomBookingCreate(BaseModel):
    """Schema for creating a multi-room booking."""
    check_in: date
    check_out: date
    rooms: List[RoomItemRequest] = Field(..., min_length=1)
    amount_paid: Decimal = Field(default=Decimal("0.00"), ge=0)
    notes: Optional[str] = Field(None, max_length=500)
    customer: CustomerInfo


class MultiRoomBookingRead(BaseModel):
    """Schema for reading multi-room booking data."""
    id: int
    customer_id: int
    customer_name: str
    customer_email: str
    check_in: date
    check_out: date
    booking_items: List[BookingItemRead]
    total_amount: Decimal
    amount_paid: Decimal
    balance_due: Decimal
    status: str
    notes: str = None
    created_at: str
    
    class Config:
        from_attributes = True
