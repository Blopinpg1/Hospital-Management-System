import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import { PageLoader } from '@/components/shared';

// Lazy-loaded pages
const LoginPage           = lazy(() => import('@/pages/auth/LoginPage'));
const DashboardPage       = lazy(() => import('@/pages/dashboard/DashboardPage'));
const PatientsPage        = lazy(() => import('@/pages/patients/PatientsPage'));
const PatientDetailPage   = lazy(() => import('@/pages/patients/PatientDetailPage'));
const AppointmentsPage    = lazy(() => import('@/pages/appointments/AppointmentsPage'));
const AdmissionsPage      = lazy(() => import('@/pages/admissions/AdmissionsPage'));
const ClinicalPage        = lazy(() => import('@/pages/clinical/ClinicalPage'));
const BillingPage         = lazy(() => import('@/pages/billing/BillingPage'));
const InventoryPage       = lazy(() => import('@/pages/inventory/InventoryPage'));
const DoctorsPage         = lazy(() => import('@/pages/doctors/DoctorsPage'));
const DepartmentsPage     = lazy(() => import('@/pages/departments/DepartmentsPage'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex items-center justify-center h-screen"><PageLoader /></div>}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard"         element={<DashboardPage />} />
              <Route path="/patients"          element={<PatientsPage />} />
              <Route path="/patients/:id"      element={<PatientDetailPage />} />
              <Route path="/appointments"      element={<AppointmentsPage />} />
              <Route path="/admissions"        element={<AdmissionsPage />} />
              <Route path="/clinical"          element={<ClinicalPage />} />
              <Route path="/billing"           element={<BillingPage />} />
              <Route path="/inventory"         element={<InventoryPage />} />
              <Route path="/doctors"           element={<DoctorsPage />} />
              <Route path="/departments"       element={<DepartmentsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
