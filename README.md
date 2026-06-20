# CleanOps — Cleaning Operations Management System

A modern Angular web application for managing cleaning staff, room assignments, attendance, task verification, and performance reporting.

Built from the **Cleaning Operations Management System** specification using **Angular 22**, **Tailwind CSS**, and enterprise-style project structure with **lazy-loaded feature modules**.

## Features

### User Roles
- **Administrator** — Manage supervisors, cleaners, rooms, and view system-wide analytics
- **Supervisor** — Dashboard, cleaner/room management, assignments, attendance, task verification, reports
- **Cleaner** — Mobile-friendly portal for check-in/out, assigned rooms, cleaning workflow with photos

### Core Modules
- Authentication with role-based access control (RBAC)
- Cleaner management (CRUD, deactivate)
- Room management with QR codes and status tracking
- Room assignments and reassignment
- Attendance (check-in/out with GPS)
- Cleaning task workflow (QR scan → before/after photos → completion → verification)
- Supervisor dashboard with charts and KPIs
- Reports with PDF/Excel export (mock)
- Notifications

## Project Structure

```
src/app/
├── core/                    # Singleton services, guards, models
│   ├── constants/
│   ├── guards/
│   ├── interceptors/
│   ├── models/
│   └── services/
├── shared/                  # Reusable UI components & pipes
│   ├── components/
│   └── pipes/
├── layout/                  # App shell (sidebar, header, main layout)
├── features/                # Lazy-loaded feature areas
│   ├── auth/
│   ├── admin/
│   ├── supervisor/
│   └── cleaner/
├── app.routes.ts            # Root routing with lazy loading
└── app.config.ts
```

## Demo Accounts

| Role       | Email                    | Password      |
|------------|--------------------------|---------------|
| Admin      | admin@cleanops.com       | admin123      |
| Supervisor | supervisor@cleanops.com  | supervisor123 |
| Cleaner    | cleaner@cleanops.com     | cleaner123    |

## Getting Started

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200)

## Build

```bash
npm run build
```

## Tech Stack

- **Angular 22** (standalone components, lazy routes)
- **Tailwind CSS v4**
- **RxJS** for reactive data flow
- Django REST Framework backend (separate repo/folder)

## Backend Integration

The Django REST API lives in a **separate project**:

**[cleaning-operations-system-backend](../cleaning-operations-system-backend)** — sibling folder at `c:\Users\hp\Projects\cleaning-operations-system-backend`

Run the backend on `http://127.0.0.1:8000`, then replace mock services in `core/services/` with HTTP calls. JWT auth interceptor is already configured in `auth.interceptor.ts`.

Environment config: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8000/api',
};
```
