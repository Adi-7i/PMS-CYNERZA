"""
AuditLog model for tracking all changes in the system.
Provides compliance, debugging, and security monitoring capabilities.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func

from app.core.database import Base


class AuditLog(Base):
    """
    Centralized audit log for tracking all system changes.
    
    IMPORTANT: Audit logs are written inside the same transaction as the
    business operation. If the transaction rolls back, the audit log does not persist.
    This ensures data consistency between audit trail and actual data state.
    """
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String(50), nullable=False, index=True)  # CREATE, UPDATE, DELETE, etc.
    entity_type = Column(String(50), nullable=False, index=True)  # Booking, Inventory, RoomType
    entity_id = Column(Integer, nullable=False, index=True)  # ID of the affected entity
    old_value = Column(JSON, nullable=True)  # Previous state (JSON serialized)
    new_value = Column(JSON, nullable=True)  # New state (JSON serialized)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, action={self.action}, entity={self.entity_type}:{self.entity_id})>"
