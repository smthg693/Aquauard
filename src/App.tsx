import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { AppShell } from './components/layout/AppShell';
import { RoleGuard } from './routes/RoleGuard';

// Public pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/public/ResetPasswordPage';

// Citizen pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { CitizenReportPage } from './pages/citizen/CitizenReportPage';
import { CitizenComplaintsPage } from './pages/citizen/CitizenComplaintsPage';
import { CitizenComplaintDetailPage } from './pages/citizen/CitizenComplaintDetailPage';
import { CitizenProfilePage } from './pages/citizen/CitizenProfilePage';

// Authority pages
import { AuthorityDashboard } from './pages/authority/AuthorityDashboard';
import { AuthorityComplaintsPage } from './pages/authority/AuthorityComplaintsPage';
import { AuthorityComplaintDetailPage } from './pages/authority/AuthorityComplaintDetailPage';
import { AuthorityMapPage } from './pages/authority/AuthorityMapPage';
import { AuthorityOfficersPage } from './pages/authority/AuthorityOfficersPage';
import { AuthorityAnalyticsPage } from './pages/authority/AuthorityAnalyticsPage';

// Field Officer pages
import { FieldOfficerDashboard } from './pages/fieldOfficer/FieldOfficerDashboard';
import { FieldOfficerComplaintsPage } from './pages/fieldOfficer/FieldOfficerComplaintsPage';
import { FieldOfficerDetailPage } from './pages/fieldOfficer/FieldOfficerDetailPage';
import { FieldOfficerProfilePage } from './pages/fieldOfficer/FieldOfficerProfilePage';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAuthoritiesPage } from './pages/admin/AdminAuthoritiesPage';
import { AdminOfficersPage } from './pages/admin/AdminOfficersPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected Citizen Routes */}
            <Route
              path="/citizen/*"
              element={
                <RoleGuard allowedRoles={['Citizen']}>
                  <AppShell>
                    <Routes>
                      <Route path="dashboard" element={<CitizenDashboard />} />
                      <Route path="report" element={<CitizenReportPage />} />
                      <Route path="complaints" element={<CitizenComplaintsPage />} />
                      <Route path="complaints/:id" element={<CitizenComplaintDetailPage />} />
                      <Route path="profile" element={<CitizenProfilePage />} />
                      <Route path="*" element={<Navigate to="/citizen/dashboard" replace />} />
                    </Routes>
                  </AppShell>
                </RoleGuard>
              }
            />

            {/* Protected Authority Routes */}
            <Route
              path="/authority/*"
              element={
                <RoleGuard allowedRoles={['Authority']}>
                  <AppShell>
                    <Routes>
                      <Route path="dashboard" element={<AuthorityDashboard />} />
                      <Route path="complaints" element={<AuthorityComplaintsPage />} />
                      <Route path="complaints/:id" element={<AuthorityComplaintDetailPage />} />
                      <Route path="map" element={<AuthorityMapPage />} />
                      <Route path="officers" element={<AuthorityOfficersPage />} />
                      <Route path="analytics" element={<AuthorityAnalyticsPage />} />
                      <Route path="*" element={<Navigate to="/authority/dashboard" replace />} />
                    </Routes>
                  </AppShell>
                </RoleGuard>
              }
            />

            {/* Protected Field Officer Routes */}
            <Route
              path="/field-officer/*"
              element={
                <RoleGuard allowedRoles={['Field Officer']}>
                  <AppShell>
                    <Routes>
                      <Route path="dashboard" element={<FieldOfficerDashboard />} />
                      <Route path="complaints" element={<FieldOfficerComplaintsPage />} />
                      <Route path="complaints/:id" element={<FieldOfficerDetailPage />} />
                      <Route path="profile" element={<FieldOfficerProfilePage />} />
                      <Route path="*" element={<Navigate to="/field-officer/dashboard" replace />} />
                    </Routes>
                  </AppShell>
                </RoleGuard>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <RoleGuard allowedRoles={['Admin']}>
                  <AppShell>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="users" element={<AdminUsersPage />} />
                      <Route path="authorities" element={<AdminAuthoritiesPage />} />
                      <Route path="officers" element={<AdminOfficersPage />} />
                      <Route path="categories" element={<AdminCategoriesPage />} />
                      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                    </Routes>
                  </AppShell>
                </RoleGuard>
              }
            />

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
