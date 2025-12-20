"""
Booking model for reservations.
"""

from sqlalchemy import Column, Integer, ForeignKey, Date, Numeric, String, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class BookingStatus(str, enum.Enum):
    """Booking status enumeration."""
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    CHECKED_IN = "checked_in"
    CHECKED_OUT = "checked_out"


class Booking(Base):
    """Booking/reservation model."""
    
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    room_type_id = Column(Integer, ForeignKey("room_types.id"), nullable=False, index=True)
    check_in = Column(Date, nullable=False, index=True)
    check_out = Column(Date, nullable=False, index=True)
    num_rooms = Column(Integer, default=1, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    amount_paid = Column(Numeric(10, 2), default=0)
    status = Column(String(20), default=BookingStatus.CONFIRMED.value, nullable=False)
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    customer = relationship("Customer", back_populates="bookings")
    room_type = relationship("RoomType")  # Kept for backward compatibility with existing bookings
    booking_items = relationship("BookingItem", back_populates="booking", cascade="all, delete-orphan")
    
    @property
    def balance_due(self) -> float:
        """Calculate remaining balance for this booking."""
        return float(self.total_amount) - float(self.amount_paid or 0)
    
    def __repr__(self):
        return f"<Booking(id={self.id}, customer_id={self.customer_id}, check_in={self.check_in})>"
