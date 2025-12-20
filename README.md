# 🏨 PMS-CYNERZA
### Hotel Property Management System (Backend MVP)

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-black?style=for-the-badge&logo=sqlalchemy&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

PMS-CYNERZA is a robust, high-performance backend system designed for modern Hotel Property Management. Built with **FastAPI** and **Async SQLAlchemy**, it offers a scalable architecture for managing rooms, inventory, bookings, and customer relationships with transactional integrity.

---

## ✨ Key Features

- **🔐 Secure Authentication**
  - JWT-based admin authentication (OAuth2)
  - Bcrypt password hashing
  - Role-based access control readiness

- **🏨 Room Management**
  - CRUD operations for room categories (Suite, Deluxe, etc.)
  - Dynamic pricing setup
  - Capacity management

- **📅 Advanced Inventory Engine**
  - **Auto-generation**: Automatically generates 90 days of inventory on room creation
  - **Real-time Availability**: Date-wise room tracking
  - **Overbooking Prevention**: Atomic database transactions with row-level locking (SELECT FOR UPDATE)
  - **Calendar API**: Dedicated endpoints for availability grid and booking events

- **📝 Booking System**
  - **Atomic Transactions**: All-or-Nothing booking flow prevents partial writes
  - **Multi-Room Bookings**: Book multiple room types in a single transaction (Parent-Child model)
  - **Modification & Cancellation**: Full lifecycle management with inventory rollback
  - **Audit Logging**: Comprehensive transactional audit trail for all system changes
  - **Race Condition Handling**: Safe inventory deduction even under high load
  - **Smart Validation**: Intelligent check-in/check-out and inventory checks
  - **Financial Tracking**: Automatic balance limits and payment tracking

- **👥 Customer CRM**
  - Automatic customer profile creation on booking
  - Booking history tracking
  - Outstanding balance monitoring

---

## 🛠️ Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Database**: SQLite (Dev) / PostgreSQL (Prod)
- **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/) (Async)
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **Authentication**: [Python-Jose](https://github.com/mpdavis/python-jose) (JWT)
- **Validation**: [Pydantic v2](https://docs.pydantic.dev/)

---

## 📂 Project Structure

```bash
PMS-CYNERZA/
├── app/
│   ├── core/           # Config, Security, Database setup, Exceptions
│   ├── models/         # SQLAlchemy Database Models (Booking, BookingItem, AuditLog, etc.)
│   ├── routers/        # API Endpoints (Auth, inventory, bookings, audit, etc.)
│   ├── schemas/        # Pydantic Response/Request Schemas
│   ├── services/       # Business Logic (Transactions, Locking, complex queries)
│   ├── utils/          # Helper functions
│   └── main.py         # App Entry Point
├── alembic/            # Database Migrations
├── requirements.txt    # Project Dependencies
├── .gitignore          # Git Ignore Rules
└── .env                # Environment Variables
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Adi-7i/PMS-CYNERZA.git
   cd PMS-CYNERZA
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment**
   Create a `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```
   *Modify `.env` with your specific settings (Database URL, Secret Key, etc.)*

5. **Run Migrations** (Optional for first run - app creates tables automatically)
   ```bash
   alembic upgrade head
   ```

### ▶️ Running the Application

```bash
uvicorn app.main:app --reload
```
The API will be available at: **http://127.0.0.1:8000**

---

## 📚 API Documentation

FastAPI provides automatic, interactive documentation. Once the server is running, explore the API at:

- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login/json` | Admin login (returns JWT) |
| GET | `/calendar/availability` | Get room availability grid for UI |
| GET | `/calendar/bookings` | Get booking events for calendar view |
| POST | `/bookings` | Create single room booking |
| POST | `/multi-room-bookings` | **Create multi-room type booking** |
| PUT | `/bookings/{id}/modify` | Modify booking dates/rooms |
| POST | `/bookings/{id}/cancel` | Cancel booking |
| GET | `/audit-logs` | **View system audit trail** |

### Default Admin Credentials
*Use these to obtain your initial JWT Token*
- **Email**: `admin@hotel.com`
- **Password**: `admin123`

---

## 🧪 Testing

To run the test suite (if configured):
```bash
pytest
```
*Tip: You can use the `requests` examples in the `walkthrough.md` artifact to manually test flows.*

---

## 🗺️ Roadmap

- [x] Atomic Booking Engine
- [x] Calendar Availability API
- [x] Overbooking Protection
- [x] Booking Modification & Cancellation
- [x] Multi-Room Bookings
- [x] Audit Trail System
- [ ] Payment Gateway Integration (Stripe/Razorpay)
- [ ] Email/SMS Notifications
- [ ] Frontend Dashboard (React/Next.js)
- [ ] Reporting & Analytics Module
- [ ] Payment Gateway Integration (Stripe/Razorpay)
- [ ] Email/SMS Notifications
- [ ] Frontend Dashboard (React/Next.js)
- [ ] Reporting & Analytics Module

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
<p align="center">
  Built with ❤️ by <a href="https://github.com/Adi-7i">Aditya</a>
</p>