"""
BookingItem model - represents individual room types within a booking.
This enables multi-room bookings (one booking with multiple room types).
"""

from sqlalchemy import Column, Integer, ForeignKey, Numeric
from sqlalchemy.orm import relationship

from app.core.database import Base


class BookingItem(Base):
    """
    Child table for multi-room bookings.
    Each booking can have multiple items (different room types).
    """
    __tablename__ = "booking_items"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    room_type_id = Column(Integer, ForeignKey("room_types.id"), nullable=False)
    quantity = Column(Integer, nullable=False)  # Number of rooms of this type
    price_per_night = Column(Numeric(10, 2), nullable=False)  # Price snapshot
    
    # Relationships
    booking = relationship("Booking", back_populates="booking_items")
    room_type = relationship("RoomType")
    
    def __repr__(self):
        return f"<BookingItem(id={self.id}, booking={self.booking_id}, room_type={self.room_type_id}, qty={self.quantity})>"
