"""add performance indexes

Revision ID: 003_performance
Revises: 
Create Date: 2025-12-22

Critical Performance Indexes for PMS:
1. Inventory: Composite index on (room_type_id, date)
2. Bookings: Indexes on check_in, check_out, status, created_at
3. Booking Items: Index on booking_id, room_type_id
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003_performance'
down_revision = None  # Update this to your latest revision
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Add composite and single-column indexes for performance optimization.
    PostgreSQL and SQLite compatible.
    """
    
    # =========================================================================
    # INVENTORY TABLE INDEXES
    # =========================================================================
    # Composite index for inventory lookups (PRIMARY USE CASE)
    # Query: WHERE room_type_id = X AND date BETWEEN Y AND Z
    op.create_index(
        'idx_inventory_room_date',
        'inventory',
        ['room_type_id', 'date'],
        unique=False
    )
    
    # Individual indexes (for range queries and sorts)
    op.create_index(
        'idx_inventory_date',
        'inventory',
        ['date'],
        unique=False
    )
    
    # =========================================================================
    # BOOKINGS TABLE INDEXES
    # =========================================================================
    # Check-in date (frequent filter in analytics and calendar)
    op.create_index(
        'idx_bookings_check_in',
        'bookings',
        ['check_in'],
        unique=False
    )
    
    # Check-out date (for occupancy calculations)
    op.create_index(
        'idx_bookings_check_out',
        'bookings',
        ['check_out'],
        unique=False
    )
    
    # Status (for filtering active/cancelled bookings)
    op.create_index(
        'idx_bookings_status',
        'bookings',
        ['status'],
        unique=False
    )
    
    # Created at (for audit and recent bookings queries)
    op.create_index(
        'idx_bookings_created_at',
        'bookings',
        ['created_at'],
        unique=False
    )
    
    # Composite for common analytics query
    op.create_index(
        'idx_bookings_checkin_status',
        'bookings',
        ['check_in', 'status'],
        unique=False
    )
    
    # =========================================================================
    # BOOKING_ITEMS TABLE INDEXES
    # =========================================================================
    # Booking ID (for loading booking items with booking)
    op.create_index(
        'idx_booking_items_booking_id',
        'booking_items',
        ['booking_id'],
        unique=False
    )
    
    # Room type ID (for room type performance analytics)
    op.create_index(
        'idx_booking_items_room_type',
        'booking_items',
        ['room_type_id'],
        unique=False
    )
    
    # =========================================================================
    # AUDIT_LOGS TABLE INDEXES
    # =========================================================================
    # Created at (for time-based audit queries)
    op.create_index(
        'idx_audit_logs_created_at',
        'audit_logs',
        ['created_at'],
        unique=False
    )
    
    # Entity type + ID (for tracking specific entity changes)
    op.create_index(
        'idx_audit_logs_entity',
        'audit_logs',
        ['entity_type', 'entity_id'],
        unique=False
    )
    
    # User ID (for user activity tracking)
    op.create_index(
        'idx_audit_logs_user_id',
        'audit_logs',
        ['user_id'],
        unique=False
    )
    
    # =========================================================================
    # CUSTOMERS TABLE INDEXES
    # =========================================================================
    # Email (for customer lookup)
    op.create_index(
        'idx_customers_email',
        'customers',
        ['email'],
        unique=False
    )
    
    # Created at (for recent customers)
    op.create_index(
        'idx_customers_created_at',
        'customers',
        ['created_at'],
        unique=False
    )


def downgrade() -> None:
    """Remove all performance indexes."""
    
    # Inventory indexes
    op.drop_index('idx_inventory_room_date', table_name='inventory')
    op.drop_index('idx_inventory_date', table_name='inventory')
    
    # Bookings indexes
    op.drop_index('idx_bookings_check_in', table_name='bookings')
    op.drop_index('idx_bookings_check_out', table_name='bookings')
    op.drop_index('idx_bookings_status', table_name='bookings')
    op.drop_index('idx_bookings_created_at', table_name='bookings')
    op.drop_index('idx_bookings_checkin_status', table_name='bookings')
    
    # Booking items indexes
    op.drop_index('idx_booking_items_booking_id', table_name='booking_items')
    op.drop_index('idx_booking_items_room_type', table_name='booking_items')
    
    # Audit logs indexes
    op.drop_index('idx_audit_logs_created_at', table_name='audit_logs')
    op.drop_index('idx_audit_logs_entity', table_name='audit_logs')
    op.drop_index('idx_audit_logs_user_id', table_name='audit_logs')
    
    # Customers indexes
    op.drop_index('idx_customers_email', table_name='customers')
    op.drop_index('idx_customers_created_at', table_name='customers')
