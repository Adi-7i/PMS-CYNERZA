"""
Audit logging service for tracking all system changes.

CRITICAL: All audit log writes happen inside the same database transaction
as the business operation. This ensures:
1. If business operation fails → audit log doesn't persist
2. Audit trail always matches actual data state
3. No orphaned audit logs for failed operations
"""

from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
import json

from app.models.audit_log import AuditLog


# Audit Action Constants
class AuditAction:
    """Standard audit action types."""
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    CANCEL = "CANCEL"
    MODIFY = "MODIFY"
    RESTORE = "RESTORE"
    DEDUCT = "DEDUCT"
    LOGIN = "LOGIN"


# Entity Type Constants
class EntityType:
    """Standard entity types for audit logging."""
    BOOKING = "Booking"
    BOOKING_ITEM = "BookingItem"
    INVENTORY = "Inventory"
    ROOM_TYPE = "RoomType"
    CUSTOMER = "Customer"
    USER = "User"


async def log_action(
    db: AsyncSession,
    user_id: Optional[int],
    action: str,
    entity_type: str,
    entity_id: int,
    old_value: Optional[Dict[str, Any]] = None,
    new_value: Optional[Dict[str, Any]] = None
) -> AuditLog:
    """
    Create an audit log entry within the current transaction.
    
    TRANSACTIONAL BEHAVIOR:
    - This function MUST be called within an active database transaction
    - The audit log will be committed only if the parent transaction succeeds
    - If the parent transaction rolls back, the audit log is discarded
    
    Args:
        db: Active database session (must be in a transaction)
        user_id: ID of the user performing the action (None for system actions)
        action: Type of action (CREATE, UPDATE, DELETE, etc.)
        entity_type: Type of entity being modified (Booking, Inventory, etc.)
        entity_id: ID of the specific entity
        old_value: Previous state of the entity (for UPDATE/DELETE)
        new_value: New state of the entity (for CREATE/UPDATE)
    
    Returns:
        Created AuditLog instance
    
    Example:
        ```python
        async with db.begin_nested():
            # Modify booking
            booking.check_out = new_date
            
            # Log the change (same transaction)
            await log_action(
                db,
                user_id=current_user.id,
                action=AuditAction.UPDATE,
                entity_type=EntityType.BOOKING,
                entity_id=booking.id,
                old_value={"check_out": str(old_date)},
                new_value={"check_out": str(new_date)}
            )
            
            await db.flush()
        # If commit succeeds → both changes persist
        # If rollback → both changes are discarded
        ```
    """
    # Sanitize and serialize values
    sanitized_old = _sanitize_value(old_value) if old_value else None
    sanitized_new = _sanitize_value(new_value) if new_value else None
    
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        old_value=sanitized_old,
        new_value=sanitized_new
    )
    
    db.add(audit_log)
    await db.flush()  # Get ID but don't commit
    
    return audit_log


def _sanitize_value(value: Any) -> Any:
    """
    Sanitize values for JSON serialization.
    Removes sensitive data and ensures JSON compatibility.
    
    Args:
        value: Value to sanitize (dict, list, or primitive)
    
    Returns:
        JSON-serializable version of the value
    """
    if value is None:
        return None
    
    # If it's already a dict, process it
    if isinstance(value, dict):
        sanitized = {}
        for key, val in value.items():
            # Skip sensitive fields
            if key.lower() in ['password', 'hashed_password', 'token', 'secret']:
                sanitized[key] = "***REDACTED***"
            # Convert non-JSON types to strings
            elif hasattr(val, '__dict__'):  # SQLAlchemy model
                sanitized[key] = str(val)
            elif isinstance(val, (list, tuple)):
                sanitized[key] = [_sanitize_value(item) for item in val]
            elif isinstance(val, dict):
                sanitized[key] = _sanitize_value(val)
            else:
                sanitized[key] = val
        return sanitized
    
    # If it's a list, process each item
    if isinstance(value, (list, tuple)):
        return [_sanitize_value(item) for item in value]
    
    # If it's a primitive, return as-is
    return value


async def get_audit_logs(
    db: AsyncSession,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
):
    """
    Retrieve audit logs with optional filters.
    
    Args:
        db: Database session
        entity_type: Filter by entity type
        entity_id: Filter by specific entity ID
        user_id: Filter by user who performed the action
        action: Filter by action type
        limit: Maximum number of results
        offset: Number of results to skip
    
    Returns:
        List of AuditLog instances
    """
    from sqlalchemy import select
    
    query = select(AuditLog).order_by(AuditLog.created_at.desc())
    
    if entity_type:
        query = query.where(AuditLog.entity_type == entity_type)
    
    if entity_id:
        query = query.where(AuditLog.entity_id == entity_id)
    
    if user_id:
        query = query.where(AuditLog.user_id == user_id)
    
    if action:
        query = query.where(AuditLog.action == action)
    
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()
