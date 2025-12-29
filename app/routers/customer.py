"""
Customer management router.
"""

from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.customer import Customer
from app.models.booking import Booking
from app.schemas.customer import CustomerRead, CustomerListRead, CustomerCreate, CustomerUpdate, CustomerBookingSummary

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_data: CustomerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new customer. (Protected - requires authentication)
    """
    # Check if customer with email already exists
    existing = await db.execute(
        select(Customer).where(Customer.email == customer_data.email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Customer with email {customer_data.email} already exists"
        )
    
    customer = Customer(
        name=customer_data.name,
        email=customer_data.email,
        phone=customer_data.phone,
        address=customer_data.address,
        id_proof_type=customer_data.id_proof_type,
        id_proof_number=customer_data.id_proof_number,
    )
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    
    return CustomerRead(
        id=customer.id,
        name=customer.name,
        email=customer.email,
        phone=customer.phone,
        address=customer.address,
        id_proof_type=customer.id_proof_type,
        id_proof_number=customer.id_proof_number,
        created_at=customer.created_at,
        updated_at=customer.updated_at,
        total_balance_due=Decimal("0.00"),
        bookings=[]
    )


@router.get("", response_model=List[CustomerListRead])
async def list_customers(
    search: Optional[str] = Query(None, description="Search by name or email"),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all customers. (Protected - requires authentication)
    
    Returns customer list with booking count and balance summary.
    """
    query = select(Customer).options(selectinload(Customer.bookings))
    
    if search:
        search_term = f"%{search}%"
        query = query.where(
            (Customer.name.ilike(search_term)) | 
            (Customer.email.ilike(search_term))
        )
    
    query = query.order_by(Customer.created_at.desc()).offset(offset).limit(limit)
    
    result = await db.execute(query)
    customers = result.scalars().all()
    
    return [
        CustomerListRead(
            id=c.id,
            name=c.name,
            email=c.email,
            phone=c.phone,
            address=c.address,
            id_proof_type=c.id_proof_type,
            id_proof_number=c.id_proof_number,
            created_at=c.created_at,
            total_balance_due=Decimal(str(c.total_balance_due)),
            booking_count=len(c.bookings)
        )
        for c in customers
    ]


@router.get("/{customer_id}", response_model=CustomerRead)
async def get_customer(
    customer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific customer with booking history. (Protected - requires authentication)
    """
    result = await db.execute(
        select(Customer)
        .options(
            selectinload(Customer.bookings).selectinload(Booking.room_type)
        )
        .where(Customer.id == customer_id)
    )
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found"
        )
    
    # Build booking summaries
    booking_summaries = [
        CustomerBookingSummary(
            id=b.id,
            room_type_name=b.room_type.name,
            check_in=b.check_in,
            check_out=b.check_out,
            total_amount=b.total_amount,
            amount_paid=b.amount_paid,
            status=b.status
        )
        for b in customer.bookings
    ]
    
    return CustomerRead(
        id=customer.id,
        name=customer.name,
        email=customer.email,
        phone=customer.phone,
        address=customer.address,
        id_proof_type=customer.id_proof_type,
        id_proof_number=customer.id_proof_number,
        created_at=customer.created_at,
        updated_at=customer.updated_at,
        total_balance_due=Decimal(str(customer.total_balance_due)),
        bookings=booking_summaries
    )


@router.put("/{customer_id}", response_model=CustomerRead)
async def update_customer(
    customer_id: int,
    customer_data: CustomerUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a customer. (Protected - requires authentication)
    """
    result = await db.execute(
        select(Customer)
        .options(
            selectinload(Customer.bookings).selectinload(Booking.room_type)
        )
        .where(Customer.id == customer_id)
    )
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found"
        )
    
    # Check if email is being changed to an existing one
    if customer_data.email and customer_data.email != customer.email:
        existing = await db.execute(
            select(Customer).where(Customer.email == customer_data.email)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Customer with email {customer_data.email} already exists"
            )
    
    # Update fields if provided
    update_data = customer_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)
    
    await db.commit()
    await db.refresh(customer)
    
    # Build booking summaries
    booking_summaries = [
        CustomerBookingSummary(
            id=b.id,
            room_type_name=b.room_type.name,
            check_in=b.check_in,
            check_out=b.check_out,
            total_amount=b.total_amount,
            amount_paid=b.amount_paid,
            status=b.status
        )
        for b in customer.bookings
    ]
    
    return CustomerRead(
        id=customer.id,
        name=customer.name,
        email=customer.email,
        phone=customer.phone,
        address=customer.address,
        id_proof_type=customer.id_proof_type,
        id_proof_number=customer.id_proof_number,
        created_at=customer.created_at,
        updated_at=customer.updated_at,
        total_balance_due=Decimal(str(customer.total_balance_due)),
        bookings=booking_summaries
    )
