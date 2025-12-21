# 🏨 PMS-CYNERZA
### Modern Hotel Property Management System

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

PMS-CYNERZA is a comprehensive Hotel Property Management System featuring a robust **FastAPI backend** and a modern, responsive **React frontend**. It provides key tools for hotel operations including room management, vacancy tracking, booking management, and customer CRM.

---

## ✨ Key Features

### �️ Frontend (Admin Dashboard)
- **📊 Analytics Dashboard**: Real-time overview of total bookings, revenue, and occupancy rates.
- **📅 Visual Inventory**: Interactive calendar grid showing daily room availability and pricing (10-day pagination).
- **� Smart Booking Wizard**: Streamlined multi-step form for creating reservations with multi-room support.
- **🏨 Room Management**: Interface to manage room categories, pricing, and total inventory.
- **👥 Customer CRM**: Searchable customer database with contact details and booking history.
- **🔐 Secure Access**: JWT-based authentication with protected routes and auto-logout.

### ⚙️ Backend API
- **🔒 Security**: OAuth2 with Password Flow (JWT), Bcrypt hashing.
- **🏨 Inventory Engine**: 
  - Automatic 90-day inventory generation.
  - Row-level locking to prevent overbooking.
- **💳 Transactional Bookings**: 
  - Atomic multi-room bookings.
  - Audit logging for all critical actions.
- **💹 Dynamic Pricing**: Date-specific pricing support.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State/Data**: TanStack Query (React Query)
- **Forms**: React Hook Form
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI
- **Database**: SQLite (Dev) / PostgreSQL (Prod support)
- **ORM**: SQLAlchemy (Async)
- **Validation**: Pydantic v2
- **Migrations**: Alembic

---

## 📂 Project Structure

```bash
PMS-CYNERZA/
├── app/                # FastAPI Backend
│   ├── core/           # Config & Security
│   ├── models/         # Database Models
│   ├── routers/        # API Endpoints
│   ├── schemas/        # Pydantic Schemas
│   └── services/       # Business Logic
├── frontend/           # React Frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Global state (Auth)
│   │   ├── layouts/    # Page layouts
│   │   ├── pages/      # Route pages
│   │   └── services/   # API client services
├── alembic/            # Database Migrations
└── requirements.txt    # Python Dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/Adi-7i/PMS-CYNERZA.git
cd PMS-CYNERZA

# Create virtual environment
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Run migrations (creates hotel_pms.db)
alembic upgrade head

# Start Backend Server
uvicorn app.main:app --reload
```
*Backend runs on: `http://127.0.0.1:8000`*

### 2. Frontend Setup

Open a new terminal in the project root:

```bash
cd frontend

# Install Node dependencies
npm install

# Start Development Server
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

---

## 🔑 Default Credentials

Use these credentials to log in to the Dashboard:

- **Email**: `admin@hotel.com`
- **Password**: `admin123`

---

## 📚 Documentation

- **API Docs (Swagger)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **API Specs (ReDoc)**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 🗺️ Implementation Status

- [x] **Backend Skeleton** (FastAPI setup)
- [x] **Database Models** (Users, Rooms, Bookings, Inventory)
- [x] **Authentication** (Login, JWT)
- [x] **Room Management** (CRUD API + Frontend)
- [x] **Inventory System** (Generation, API, Grid View)
- [x] **Booking System** (Multi-room, Transactional, UI)
- [x] **Customer Management** (History, CRM UI)
- [x] **Dashboard Analytics** (Widgets, Charts)
- [ ] Payment Gateway Integration
- [ ] Email Notifications
- [ ] Reporting Module

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
<p align="center">
  Built with ❤️ by <a href="https://github.com/Adi-7i">Aditya</a>
</p>