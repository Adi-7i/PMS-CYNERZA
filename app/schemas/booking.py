"""
Pydantic schemas for booking management.
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import date, datetime
from typing import Optional
from decimal import Decimal


class CustomerInfo(BaseModel):
    """Customer information included in booking request."""
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=500)
    id_proof_type: Optional[str] = Field(None, max_length=50)
    id_proof_number: Optional[str] = Field(None, max_length=100)


class BookingCreate(BaseModel):
    """Schema for creating a new booking."""
    room_type_id: int = Field(..., gt=0)
    check_in: date
    check_out: date
    num_rooms: int = Field(default=1, gt=0)
    total_amount: Optional[Decimal] = Field(default=None, ge=0, description="Optional manual price override. If not provided, auto-calculated from room rates.")
    amount_paid: Decimal = Field(default=Decimal("0.00"), ge=0)
    notes: Optional[str] = Field(None, max_length=500)
    customer: CustomerInfo
    
    @field_validator('check_out')
    @classmethod
    def check_out_after_check_in(cls, v, info):
        """Validate that check-out is after check-in."""
        if 'check_in' in info.data and v <= info.data['check_in']:
            raise ValueError('Check-out date must be after check-in date')
        return v


class BookingRead(BaseModel):
    """Schema for reading booking data."""
    id: int
    customer_id: int
    customer_name: str
    customer_email: str
    room_type_id: int
    room_type_name: str
    check_in: date
    check_out: date
    num_rooms: int
    total_amount: Decimal
    amount_paid: Decimal
    balance_due: Decimal
    status: str
    notes: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class BookingUpdate(BaseModel):
    """Schema for updating a booking."""
    amount_paid: Optional[Decimal] = Field(None, ge=0)
    status: Optional[str] = None
    notes: Optional[str] = Field(None, max_length=500)


class BookingModify(BaseModel):
    """Schema for modifying booking dates or room type."""
    check_in: Optional[date] = None
    check_out: Optional[date] = None
    room_type_id: Optional[int] = Field(None, gt=0)
    num_rooms: Optional[int] = Field(None, gt=0)


class BookingCancellation(BaseModel):
    """Schema for booking cancellation."""
    reason: Optional[str] = Field(None, max_length=500)

