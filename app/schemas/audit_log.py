"""
Pydantic schemas for audit log reading.
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any


class AuditLogRead(BaseModel):
    """Schema for reading audit log entries."""
    id: int
    user_id: Optional[int]
    action: str
    entity_type: str
    entity_id: int
    old_value: Optional[Dict[str, Any]]
    new_value: Optional[Dict[str, Any]]
    created_at: datetime
    
    class Config:
        from_attributes = True
