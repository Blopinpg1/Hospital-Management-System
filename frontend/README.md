# Himalaya Hospital —  Frontend

A React frontend for the Himalaya Hospital Management System.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript (strict) |
| Routing | React Router v7 |
| Data fetching | TanStack Query v5 |
| State | Zustand |
| Forms | React Hook Form + Zod |
| HTTP | Axios (with JWT interceptor) |
| Styling | Tailwind CSS v3 + custom design system |
| Charts | Recharts |
| Build | Vite 6 |

## Design System

Follows the **Clinical Sanctuary** design strategy:
- **Primary teal** (`#006B58` → `#00A68A`) — surgical precision palette
- **No borders** — boundaries defined by background color shifts between surface tiers
- **DM Sans** (body) + **Sora** (display headings)
- **Glassmorphism** for floating elements (modals, popovers)
- **Gradient CTAs** — linear-gradient from primary to primary-container at 135°

## Project Structure

```
src/
├── api/index.ts              All API service calls (matches backend routes exactly)
├── hooks/index.ts            React Query hooks for every endpoint
├── store/auth.store.ts       Zustand auth state (JWT persisted in localStorage)
├── types/index.ts            TypeScript types mirroring backend db.types.ts
├── lib/
│   ├── axios.ts              Axios instance with auth interceptors
│   └── utils.ts             Formatters (NPR currency, dates, status chips)
├── components/
│   ├── shared/index.tsx      Design system components (Button, Input, Table, Modal…)
│   └── layout/
│       ├── AppLayout.tsx     Sidebar navigation shell
│       └── ProtectedRoute.tsx JWT guard
└── pages/
    ├── auth/LoginPage.tsx
    ├── dashboard/DashboardPage.tsx
    ├── patients/PatientsPage.tsx
    ├── patients/PatientDetailPage.tsx
    ├── appointments/AppointmentsPage.tsx
    ├── admissions/AdmissionsPage.tsx
    ├── clinical/ClinicalPage.tsx
    ├── billing/BillingPage.tsx
    ├── inventory/InventoryPage.tsx
    ├── doctors/DoctorsPage.tsx
    └── departments/DepartmentsPage.tsx
```

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure the API URL
The Vite dev server proxies `/api` → `http://localhost:3000` by default.

To change the backend URL, edit `vite.config.ts`:
```ts
proxy: {
  '/api': {
    target: 'http://your-backend-host:3000',
    changeOrigin: true,
  },
},
```

### 3. Run development server
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
```

## Authentication

The app uses JWT stored in `localStorage` under key `hh_token`. On every request,
Axios attaches `Authorization: Bearer <token>`. A 401 response auto-redirects to `/login`.

Default seed credentials (from backend README):
- **Email:** `admin@himalaya.np`
- **Password:** `Hospital@123`

## API Modules Covered

| Module | Backend Route | Frontend Page |
|---|---|---|
| Auth | `/api/auth` | Login, JWT refresh |
| Patients | `/api/patients` | List, register, detail, edit |
| Appointments | `/api/appointments` | Today, calendar, book, status update |
| Admissions | `/api/admissions` | Active, all, bed map, waiting list, admit/discharge |
| Clinical | `/api/clinical` | Medical records, prescriptions, lab results |
| Billing | `/api/billing` | Bills, payments, outstanding, revenue charts |
| Inventory | `/api/inventory` | Medicines, low stock, stock report |
| Doctors | `/api/doctors` | List, schedule |
| Departments | `/api/departments` | List |
