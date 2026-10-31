import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import MainApp from './MainApp';
import CookieConsent from './components/common/CookieConsent';
import LegalModal from './components/common/LegalModal';
import './App.css';

// Admin Sayfalarını Code-Splitting ile Tembel (Lazy) Yükleme
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const ServicesPage = lazy(() => import('./pages/admin/ServicesPage'));
const TeamPage = lazy(() => import('./pages/admin/TeamPage'));
const ContactPage = lazy(() => import('./pages/admin/ContactPage'));
const ContactMessagesPage = lazy(() => import('./pages/admin/ContactMessagesPage'));
const ProjectsPage = lazy(() => import('./pages/admin/ProjectsPage'));
const EmailSettingsPage = lazy(() => import('./pages/admin/EmailSettingsPage'));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'));
const ChangePasswordPage = lazy(() => import('./pages/admin/ChangePasswordPage'));

// Detay Sayfalarını Lazy Yükleme
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));

// Hafif Yükleme Yer Tutucusu
const PageFallback = () => (
  <div className="min-h-screen bg-[#050811] flex items-center justify-center text-[#c5a880] text-xs font-mono tracking-[0.25em]">
    YÜKLENİYOR...
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Suspense fallback={<PageFallback />}>
          <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/page-content"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute>
                <ServicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/team"
            element={
              <ProtectedRoute>
                <TeamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/contact"
            element={
              <ProtectedRoute>
                <ContactPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/contact-messages"
            element={
              <ProtectedRoute>
                <ContactMessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/email-settings"
            element={
              <ProtectedRoute>
                <EmailSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/change-password"
            element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />

          {/* Redirect /admin to /admin/dashboard */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Public Detail Pages */}
          <Route path="/hizmet/:id" element={<ServiceDetailPage />} />
          <Route path="/proje/:id" element={<ProjectDetailPage />} />

          {/* Main App Route */}
          <Route path="/*" element={<MainApp />} />
        </Routes>
        </Suspense>
        <CookieConsent />
        <LegalModal />
      </Router>
    </AuthProvider>
  );
}

export default App;
