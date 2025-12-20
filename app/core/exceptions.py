"""
Custom exceptions for the Hotel PMS application.
These provide clear, specific error handling for booking and inventory operations.
"""

from fastapi import HTTPException, status


class PMSException(Exception):
    """Base exception for all PMS-related errors."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)


class InvalidDateRangeError(PMSException):
    """Raised when check-in/check-out dates are invalid."""
    def __init__(self, message: str = "Invalid date range provided"):
        super().__init__(message)
    
    def to_http_exception(self) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=self.message
        )


class InventoryUnavailableError(PMSException):
    """Raised when requested inventory is not available."""
    def __init__(self, message: str = "Requested inventory is not available", date: str = None):
        self.date = date
        super().__init__(message)
    
    def to_http_exception(self) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=self.message
        )


class InventoryNotFoundError(PMSException):
    """Raised when inventory records don't exist for requested dates."""
    def __init__(self, message: str = "Inventory not found for requested dates"):
        super().__init__(message)
    
    def to_http_exception(self) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=self.message
        )


class RoomTypeNotFoundError(PMSException):
    """Raised when the specified room type doesn't exist."""
    def __init__(self, room_type_id: int):
        super().__init__(f"Room type with ID {room_type_id} not found")
        self.room_type_id = room_type_id
    
    def to_http_exception(self) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=self.message
        )


class BookingNotFoundError(PMSException):
    """Raised when the specified booking doesn't exist."""
    def __init__(self, booking_id: int):
        super().__init__(f"Booking with ID {booking_id} not found")
        self.booking_id = booking_id
    
    def to_http_exception(self) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=self.message
        )


class BookingAlreadyCancelledError(PMSException):
    """Raised when trying to cancel an already cancelled booking."""
    def __init__(self, booking_id: int):
        super().__init__(f"Booking {booking_id} is already cancelled")
        self.booking_id = booking_id
    
    def to_http_exception(self) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=self.message
        )


class BookingNotModifiableError(PMSException):
    """Raised when trying to modify a booking that cannot be modified."""
    def __init__(self, booking_id: int, reason: str = "Booking cannot be modified"):
        super().__init__(f"Booking {booking_id} cannot be modified: {reason}")
        self.booking_id = booking_id
    
    def to_http_exception(self) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=self.message
        )


class InventoryRestoreError(PMSException):
    """Raised when inventory restoration fails."""
    def __init__(self, message: str = "Failed to restore inventory"):
        super().__init__(message)
    
    def to_http_exception(self) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=self.message
        )

