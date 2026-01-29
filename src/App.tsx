import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './layouts/ProtectedRoute';
import ViewSwitcher from './components/ViewSwitcher';
import Login from './pages/Login';
import AdminView from './pages/AdminView'; // Still used for super_admin
import AuditView from './pages/AuditView';

import RecruiterView from './pages/RecruiterView';
import SalesView from './pages/SalesView';
import AccountDetailView from './pages/AccountDetailView';

// Placeholders for new views - we will Create these in Phase 3

import { useAuth } from './context/AuthContext';

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  // Redirect based on active view mode or role
  const target = user.viewMode || user.role;

  if (target === 'sales') return <Navigate to="/sales" replace />;
  if (target === 'recruiter') return <Navigate to="/recruiter" replace />;
  if (target === 'auditor') return <Navigate to="/audit" replace />;
  if (target === 'super_admin') return <Navigate to="/admin" replace />;

  return <Navigate to="/audit" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Super Admin Route */}
          <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
            <Route path="/admin" element={<AdminView />} />
          </Route>

          {/* Sales Workspace */}
          <Route element={<ProtectedRoute allowedRoles={['sales']} />}>
            <Route path="/sales" element={<SalesView />} />
          </Route>

          {/* Recruiter Workspace */}
          <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
            <Route path="/recruiter" element={<RecruiterView />} />
          </Route>

          {/* Operations Workspace */}
          <Route element={<ProtectedRoute allowedRoles={['auditor', 'facility_manager']} />}>
            <Route path="/audit" element={<AuditView />} />
          </Route>

          {/* Shared Account Detail View - Accessible by most roles */}
          <Route element={<ProtectedRoute allowedRoles={['sales', 'recruiter', 'facility_manager', 'super_admin']} />}>
            <Route path="/account/:id" element={<AccountDetailView />} />
          </Route>

          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ViewSwitcher />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
