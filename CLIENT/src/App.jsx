import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ServicesPage from './pages/admin/ServicesPage';
import TeamPage from './pages/admin/TeamPage';
import ContactPage from './pages/admin/ContactPage';
import MainApp from './MainApp';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
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
          
          {/* Redirect /admin to /admin/page-content */}
          <Route path="/admin" element={<Navigate to="/admin/page-content" replace />} />
          
          {/* Main App Route */}
          <Route path="/*" element={<MainApp />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
