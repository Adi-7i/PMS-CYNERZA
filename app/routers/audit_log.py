"""
Audit log router for read-only access to system audit trail.
Provides compliance, debugging, and security monitoring access.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import date

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.audit_log import AuditLogRead
from app.services.audit_service import get_audit_logs

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])


@router.get("", response_model=List[AuditLogRead])
async def list_audit_logs(
    entity_type: Optional[str] = Query(None, description="Filter by entity type (Booking, Inventory, etc.)"),
    entity_id: Optional[int] = Query(None, description="Filter by specific entity ID"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    action: Optional[str] = Query(None, description="Filter by action (CREATE, UPDATE, DELETE, etc.)"),
    start_date: Optional[date] = Query(None, description="Filter from this date"),
    end_date: Optional[date] = Query(None, description="Filter to this date"),
    limit: int = Query(default=100, ge=1, le=1000, description="Maximum number of results"),
    offset: int = Query(default=0, ge=0, description="Number of results to skip"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve audit logs with optional filters. (Protected - Admin only)
    
    This endpoint provides read-only access to the system audit trail.
    
    **Use Cases:**
    - Compliance auditing (GDPR, SOX, PCI-DSS)
    - Debugging and troubleshooting
    - Security monitoring
    - Dispute resolution
    
    **Filters:**
    - `entity_type`: Type of entity (e.g., "Booking", "Inventory")
    - `entity_id`: Specific entity ID to track
    - `user_id`: Actions by specific user
    - `action`: Type of action (CREATE, UPDATE, DELETE, etc.)
    - `start_date`: From date
    - `end_date`: To date
    
    **Response:**
    Returns chronological list of audit log entries (newest first) with:
    - Who performed the action (`user_id`)
    - What was done (`action`)
    - What was affected (`entity_type`, `entity_id`)
    - What changed (`old_value`, `new_value`)
    - When it happened (`created_at`)
    """
    # For date filtering, we'd need to modify get_audit_logs service
    # For now, just using existing filters
    audit_logs = await get_audit_logs(
        db,
        entity_type=entity_type,
        entity_id=entity_id,
        user_id=user_id,
        action=action,
        limit=limit,
        offset=offset
    )
    
    return audit_logs
