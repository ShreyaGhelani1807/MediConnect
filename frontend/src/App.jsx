import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing         from './pages/Landing';
import Login           from './pages/Login';
import Register        from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import SymptomAnalysis from './pages/SymptomAnalysis';

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'doctor' ? '/doctor/dashboard' : '/dashboard'} replace />;
  return children;
}

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F7FF' }}>
      <div style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #E8F4FD', borderTopColor: '#0DC4A1', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>Loading…</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'doctor' ? '/doctor/dashboard' : '/dashboard'} replace />;
  return children;
}

function Placeholder({ title, showSignout }) {
  const { logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F7FF', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
        <p style={{ fontSize: 22, fontWeight: 900, color: '#0B2545', margin: '0 0 8px' }}>{title}</p>
        <p style={{ color: '#64748B', fontSize: 14 }}>Coming up next!</p>
        {showSignout && (
          <button 
            onClick={logout}
            style={{ marginTop: 16, padding: '10px 24px', background: '#0DC4A1', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
          >
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Landing />} />
      <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      {/* Patient routes */}
      <Route path="/dashboard" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
      <Route path="/symptoms"  element={<ProtectedRoute role="patient"><SymptomAnalysis /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute role="patient"><Placeholder title="My Appointments" /></ProtectedRoute>} />
      <Route path="/profile"   element={<ProtectedRoute role="patient"><Placeholder title="My Profile" /></ProtectedRoute>} />

      {/* Doctor routes — Day 9 */}
      <Route path="/doctor/dashboard"    element={<ProtectedRoute role="doctor"><Placeholder title="Doctor Dashboard" showSignout /></ProtectedRoute>} />
      <Route path="/doctor/appointments" element={<ProtectedRoute role="doctor"><Placeholder title="Appointments" /></ProtectedRoute>} />
      <Route path="/doctor/profile"      element={<ProtectedRoute role="doctor"><Placeholder title="Doctor Profile" /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: 13, borderRadius: 12, background: '#fff', color: '#0B2545', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' },
            success: { iconTheme: { primary: '#0DC4A1', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#E8604C', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}