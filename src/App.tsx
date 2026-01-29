import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './layouts/ProtectedRoute';
import ViewSwitcher from './components/ViewSwitcher';
import Login from './pages/Login';
import AdminView from './pages/AdminView'; // Still used for super_admin
import AuditView from './pages/AuditView';

// Placeholders for new views - we will Create these in Phase 3
const SalesView = AdminView; // Temporary alias
const RecruiterView = AdminView; // Temporary alias

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
            <Route path="/sales" element={<AdminView />} /> {/* Temporary: using AdminView */}
          </Route>

          {/* Recruiter Workspace */}
          <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
            <Route path="/recruiter" element={<AdminView />} /> {/* Temporary: using AdminView */}
          </Route>

          {/* Operations Workspace */}
          <Route element={<ProtectedRoute allowedRoles={['auditor']} />}>
            <Route path="/audit" element={<AuditView />} />
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
