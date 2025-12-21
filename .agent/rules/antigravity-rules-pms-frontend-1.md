---
trigger: always_on
---

Project: Hotel Property Management System Frontend
Backend: FastAPI (https://github.com/Finding-new-code/PMS-CYNERZA)
PROJECT OVERVIEW
You are building a modern, production-ready frontend for PMS-CYNERZA, a Hotel Property Management System. The backend is already complete with FastAPI, PostgreSQL/SQLite, and provides comprehensive REST API endpoints.

TECHNOLOGY STACK (MANDATORY)
Core Framework
Framework: Next.js 14+ (App Router)

Language: TypeScript (strict mode enabled)

Styling: Tailwind CSS

Component Library: shadcn/ui (Radix UI primitives)

State Management: React Query (TanStack Query) for server state

Form Handling: React Hook Form + Zod validation

HTTP Client: Axios or Fetch API

Date Handling: date-fns or Day.js

Design System Configuration
json
{
  "base": "radix",
  "style": "nova",
  "baseColor": "zinc",
  "theme": "indigo",
  "iconLibrary": "lucide",
  "font": "Figtree",
  "menuAccent": "subtle",
  "menuColor": "default",
  "radius": "medium"
}
Template Base
Primary Source: Square UI by lndev-ui (https://square.lndev.me/)

Recommended Templates:

Dashboard 2 or 3 for main admin interface

Calendar template for booking/availability

Employees template for customer/staff management

Tasks template for housekeeping/maintenance

BACKEND API REFERENCE
Base URL
Development: http://127.0.0.1:8000

Production: TBD (environment variable)

Authentication
Endpoint: POST /auth/login/json

Method: JWT Bearer Token

Default Credentials (for development only):

Email: admin@hotel.com

Password: admin123

Token Storage: httpOnly cookies (preferred) or localStorage

Authorization Header: Bearer {token}

Core API Endpoints
Authentication
typescript
POST   /auth/login/json          // Login with email/password
GET    /auth/me                   // Get current user details
Bookings
typescript
GET    /bookings                  // List all bookings (needs pagination)
GET    /bookings/{id}             // Get booking details
POST   /bookings                  // Create single-room booking
PUT    /bookings/{id}/modify      // Modify existing booking
POST   /bookings/{id}/cancel      // Cancel booking
POST   /multi-room-bookings       // Create multi-room booking
Calendar & Availability
typescript
GET    /calendar/availability     // Get room availability grid
GET    /calendar/bookings         // Get booking events for calendar
Room Types
typescript
GET    /room-types                // List all room types
GET    /room-types/{id}           // Get room type details
POST   /room-types                // Create new room type
PUT    /room-types/{id}           // Update room type
DELETE /room-types/{id}           // Delete room type
Inventory
typescript
GET    /inventory                 // Get inventory data
POST   /inventory                 // Create/update inventory
Customers
typescript
GET    /customers                 // List all customers
GET    /customers/{id}            // Get customer details
GET    /customers/{id}/bookings   // Get customer booking history
FOLDER STRUCTURE (MANDATORY)
text
pms-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx           // Main dashboard layout with sidebar
│   │   ├── page.tsx             // Dashboard home (analytics)
│   │   ├── bookings/
│   │   │   ├── page.tsx         // Bookings list
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx     // Booking details
│   │   │   │   └── edit/page.tsx
│   │   │   └── new/page.tsx     // Create booking
│   │   ├── calendar/
│   │   │   └── page.tsx         // Calendar view
│   │   ├── customers/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── rooms/
│   │   │   ├── page.tsx         // Room types management
│   │   │   └── inventory/page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/                     // API route handlers (if needed)
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                      // shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── calendar.tsx
│   │   ├── data-table.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   ├── bookings/
│   │   ├── booking-form.tsx
│   │   ├── booking-card.tsx
│   │   ├── booking-status-badge.tsx
│   │   └── multi-room-booking-form.tsx
│   ├── calendar/
│   │   ├── availability-grid.tsx
│   │   ├── booking-event.tsx
│   │   └── room-timeline.tsx
│   ├── customers/
│   │   ├── customer-form.tsx
│   │   └── customer-card.tsx
│   └── dashboard/
│       ├── stats-card.tsx
│       ├── revenue-chart.tsx
│       └── recent-bookings.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts            // Axios/Fetch configuration
│   │   ├── auth.ts              // Auth API functions
│   │   ├── bookings.ts          // Booking API functions
│   │   ├── calendar.ts
│   │   ├── customers.ts
│   │   └── rooms.ts
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-bookings.ts
│   │   ├── use-calendar.ts
│   │   └── use-toast.ts
│   ├── utils.ts                 // Utility functions
│   ├── validations/
│   │   ├── booking.ts           // Zod schemas
│   │   ├── customer.ts
│   │   └── room.ts
│   └── constants.ts
├── types/
│   ├── api.ts                   // API response types
│   ├── booking.ts
│   ├── customer.ts
│   └── room.ts
├── public/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
CODING STANDARDS (STRICT)
TypeScript Rules
Always use TypeScript - No .js or .jsx files

Strict mode enabled in tsconfig.json

Define all types explicitly - No any type unless absolutely necessary

Use interfaces for objects, types for unions/intersections

Export types from dedicated type files in /types directory

Component Standards
Use functional components only - No class components

Prefer named exports over default exports

One component per file (except for small, tightly coupled components)

Component naming: PascalCase for components, kebab-case for files

Props interface naming: {ComponentName}Props

Example:

typescript
// components/bookings/booking-card.tsx
interface BookingCardProps {
  booking: Booking;
  onEdit?: (id: number) => void;
  onCancel?: (id: number) => void;
}

export function BookingCard({ booking, onEdit, onCancel }: BookingCardProps) {
  // Component code
}
Data Fetching Rules
Use React Query (TanStack Query) for all server state

Create custom hooks for data fetching in /lib/hooks

Handle loading, error, and success states explicitly

Implement optimistic updates for mutations

Use proper query invalidation after mutations

Example:

typescript
// lib/hooks/use-bookings.ts
export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingApi.getAll(),
    staleTime: 30000, // 30 seconds
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create booking');
    },
  });
}
Form Handling Rules
Use React Hook Form for all forms

Use Zod schemas for validation

Match backend validation rules exactly

Display validation errors clearly to users

Disable submit button during submission

Example:

typescript
// lib/validations/booking.ts
import { z } from 'zod';

export const bookingSchema = z.object({
  customer: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().optional(),
  }),
  room_type_id: z.number().positive(),
  check_in: z.date().min(new Date(), 'Check-in cannot be in the past'),
  check_out: z.date(),
  num_rooms: z.number().min(1).max(50),
  amount_paid: z.number().min(0),
  notes: z.string().optional(),
}).refine((data) => data.check_out > data.check_in, {
  message: 'Check-out must be after check-in',
  path: ['check_out'],
});

export type BookingFormData = z.infer<typeof bookingSchema>;
Error Handling
Use try-catch blocks for async operations

Display user-friendly error messages via toast notifications

Log errors to console in development

Handle specific HTTP status codes:

400: Validation errors

401: Redirect to login

403: Show permission denied

404: Show not found page

500: Show generic error message

Implement error boundaries for React errors

Styling Rules
Use Tailwind utility classes - No custom CSS unless necessary

Follow shadcn/ui patterns for component styling

Use CSS variables for theme colors

Responsive design: Mobile-first approach

Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)

Dark mode support: Use Tailwind dark mode classes

Performance Rules
Lazy load routes using Next.js dynamic imports

Optimize images with Next.js Image component

Implement pagination for large lists (bookings, customers)

Use React.memo for expensive components

Debounce search inputs (300ms minimum)

Implement infinite scroll or pagination for data tables

CRITICAL BUG FIXES FROM BACKEND
Security Issues (MUST ADDRESS)
Never commit credentials - Use environment variables only

Implement proper token refresh mechanism

Add CSRF protection for sensitive operations

Validate all inputs on frontend before sending to API

Sanitize user inputs to prevent XSS

Data Validation
Enforce date validation:

Check-in cannot be in the past

Check-out must be after check-in

Maximum booking range: 365 days (recommended)

Prevent negative values for:

Number of rooms

Amount paid

Room capacity

Validate email format before submission

Limit text field lengths:

Name: 100 characters

Email: 255 characters

Notes: 1000 characters

Address: 500 characters

User Experience Enhancements
Show loading states for all async operations

Implement confirmation dialogs for destructive actions (cancel booking, delete)

Display success messages after successful operations

Auto-save form drafts for booking forms (use localStorage)

Highlight validation errors inline on form fields

REQUIRED FEATURES (PRIORITY ORDER)
Phase 1: Core Functionality (MUST HAVE)
✅ Authentication & Authorization

Login page with JWT handling

Protected routes

Auto-redirect on token expiry

Logout functionality

✅ Dashboard

Key metrics: Total bookings, Revenue, Occupancy rate

Recent bookings list

Revenue chart (last 30 days)

Quick actions: New booking, View calendar

✅ Booking Management

List all bookings with filters (status, date range)

Create single-room booking

Create multi-room booking

View booking details

Modify booking (dates, rooms)

Cancel booking with confirmation

Print booking confirmation

✅ Calendar View

Monthly calendar with availability

Room availability grid

Click to create booking from calendar

Drag-and-drop for modifying bookings (nice to have)

Color-coded by room type or status

✅ Customer Management

List all customers

View customer details

View customer booking history

Edit customer information

Track outstanding balances

Phase 2: Advanced Features (SHOULD HAVE)
✅ Room Type Management

List room types

Create/edit room types

Set pricing and capacity

View inventory per room type

✅ Inventory Management

View inventory calendar

Bulk update inventory

Set availability blocks

✅ Reporting

Revenue reports

Occupancy reports

Customer reports

Export to CSV/PDF

Phase 3: Nice to Have
⚪ Payment Integration (future)

⚪ Email notifications (future)

⚪ Housekeeping task management

⚪ Multi-property support
