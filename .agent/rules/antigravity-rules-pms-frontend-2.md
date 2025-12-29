---
trigger: always_on
---

UI/UX REQUIREMENTS
Design Principles
Professional hospitality software aesthetic

Clean, minimal interface - avoid clutter

Consistent spacing and alignment

Clear hierarchy with proper typography

Accessible: WCAG 2.1 AA compliance

Color Scheme (Indigo Theme)
css
/* Primary Colors */
--primary: Indigo (from theme)
--secondary: Zinc (base color)
--accent: Subtle menu accent

/* Status Colors */
--success: Green (confirmed bookings)
--warning: Yellow/Orange (pending)
--error: Red (cancelled/errors)
--info: Blue (information)
Typography (Figtree Font)
css
/* Headings */
h1: 2.25rem (36px), font-bold
h2: 1.875rem (30px), font-semibold
h3: 1.5rem (24px), font-semibold
h4: 1.25rem (20px), font-medium

/* Body */
body: 1rem (16px), font-normal
small: 0.875rem (14px)
Component Patterns
Cards: Use for bookings, customers, room types

Data Tables: For lists with sorting, filtering, pagination

Dialogs: For forms and confirmations

Toast Notifications: For success/error feedback

Loading Skeletons: During data fetching

Empty States: When no data available

Responsive Breakpoints
Mobile: < 640px (1 column layouts)

Tablet: 640px - 1024px (2 column layouts)

Desktop: > 1024px (multi-column layouts)

Sidebar: Collapsible on mobile, fixed on desktop

API INTEGRATION PATTERNS
Request Configuration
typescript
// lib/api/client.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
API Function Pattern
typescript
// lib/api/bookings.ts
import { apiClient } from './client';
import type { Booking, BookingCreate } from '@/types/booking';

export const bookingApi = {
  getAll: async () => {
    const { data } = await apiClient.get<Booking[]>('/bookings');
    return data;
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get<Booking>(`/bookings/${id}`);
    return data;
  },

  create: async (booking: BookingCreate) => {
    const { data } = await apiClient.post<Booking>('/bookings', booking);
    return data;
  },

  modify: async (id: number, updates: Partial<BookingCreate>) => {
    const { data } = await apiClient.put<Booking>(`/bookings/${id}/modify`, updates);
    return data;
  },

  cancel: async (id: number, reason?: string) => {
    const { data } = await apiClient.post<Booking>(`/bookings/${id}/cancel`, { reason });
    return data;
  },
};
ENVIRONMENT VARIABLES
Required Variables (.env.local)
text
# API Configuration
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

# App Configuration
NEXT_PUBLIC_APP_NAME=PMS-CYNERZA
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_PAYMENTS=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=false
Example File (.env.example)
text
# Copy this file to .env.local and fill in the values
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_NAME=PMS-CYNERZA
NEXT_PUBLIC_APP_URL=
TESTING REQUIREMENTS
Unit Tests
Test utility functions in /lib/utils.ts

Test validation schemas in /lib/validations

Test API functions with mocked responses

Coverage target: 70% minimum

Integration Tests
Test form submissions

Test API integration with MSW (Mock Service Worker)

Test authentication flow

E2E Tests (Optional)
Use Playwright or Cypress

Test critical user journeys:

Login → Create booking → View dashboard

View calendar → Create booking from calendar

Modify booking → Cancel booking

ACCESSIBILITY REQUIREMENTS
Keyboard Navigation: All interactive elements accessible via keyboard

Screen Reader Support: Proper ARIA labels and roles

Focus Management: Visible focus indicators

Color Contrast: Minimum 4.5:1 for text

Form Labels: All inputs have associated labels

Error Announcements: Screen reader announcements for errors

DEPLOYMENT CHECKLIST
Before Deployment
 All environment variables configured

 API base URL points to production backend

 Remove console.logs and debug code

 Test all critical flows

 Verify responsive design on all breakpoints

 Run build successfully (npm run build)

 Check for TypeScript errors

 Verify accessibility with Lighthouse

 Test with real backend API

Deployment Platforms (Recommended)
Vercel (recommended for Next.js)

Netlify

AWS Amplify

Custom VPS with Docker

PROHIBITED PRACTICES
❌ DO NOT:
Use any type without justification

Commit API credentials or secrets

Use inline styles (except for dynamic values)

Create custom CSS files (use Tailwind)

Use default exports for components

Ignore TypeScript errors

Skip error handling for API calls

Hardcode API URLs (use environment variables)

Use class components

Ignore accessibility standards

Skip loading states

Use synchronous localStorage operations in React Server Components

Fetch data in components (use hooks)

Create deeply nested component trees (max 4 levels)

Use global state for server data (use React Query)

✅ ALWAYS DO:
Use TypeScript for all files

Validate user inputs

Handle loading and error states

Use semantic HTML

Add proper ARIA labels

Implement responsive design

Use shadcn/ui components

Follow folder structure strictly

Create reusable components

Document complex logic with comments

Use meaningful variable names

Implement proper error boundaries

Test critical flows manually

Review code before committing

Use Git with meaningful commit messages

GIT WORKFLOW
Branch Naming
feature/booking-form

fix/calendar-date-bug

refactor/api-client

ui/dashboard-redesign

Commit Message Format
text
type(scope): brief description

Detailed explanation if necessary

- Key change 1
- Key change 2
Types: feat, fix, refactor, style, docs, test, chore

Example Commits
text
feat(bookings): add multi-room booking form
fix(calendar): resolve timezone issue in availability grid
refactor(api): centralize error handling in API client
ui(dashboard): implement revenue chart with recharts
DOCUMENTATION REQUIREMENTS
Code Comments
Add JSDoc comments for complex functions

Explain "why" not "what" in comments

Document API integrations with endpoint details

Mark TODO and FIXME items clearly

README Files
Project README: Setup instructions, tech stack, architecture

Component README: Document complex component usage

API Integration README: Document all API endpoints used

PERFORMANCE BENCHMARKS
Target Metrics
First Contentful Paint (FCP): < 1.5s

Largest Contentful Paint (LCP): < 2.5s

Time to Interactive (TTI): < 3.5s

Cumulative Layout Shift (CLS): < 0.1

Bundle Size: < 500KB (gzipped)

Optimization Strategies
Code splitting by route

Image optimization with Next.js Image

Lazy load non-critical components

Minimize third-party scripts

Use server-side rendering for initial load

Implement proper caching strategies

FINAL CHECKLIST BEFORE CODING
 Square UI template cloned and configured

 shadcn/ui initialized with correct config (Nova, Zinc, Indigo)

 Folder structure created as specified

 TypeScript configured with strict mode

 Tailwind CSS configured with theme colors

 Environment variables set up

 API client configured with interceptors

 React Query provider set up

 Authentication flow planned

 First component: Login page

 Second component: Dashboard layout

 Backend API running and accessible

WINDSURF AI ASSISTANT INSTRUCTIONS
When working on this project:

Always refer to these rules before starting any task

Ask for clarification if requirements conflict

Suggest improvements if you see better approaches

Point out potential issues proactively

Follow the priority order for features

Use the exact folder structure specified

Match the backend API exactly

Test your code mentally before suggesting

Consider edge cases in your implementations

Prioritize user experience and accessibility

Remember: This is a production system for real hotel management. Code quality, reliability, and user experience are paramount.