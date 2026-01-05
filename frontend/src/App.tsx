import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentProfile } from './pages/StudentProfile';
import { StudentJobs } from './pages/StudentJobs';
import { StudentCompanies } from './pages/StudentCompanies';
import { JobRoleDetails } from './pages/JobRoleDetails';
import { Layout } from './components/Layout';
import './index.css';

import { CoordinatorDashboard } from './pages/CoordinatorDashboard';
import { StatisticsPage } from './pages/StatisticsPage';

const PrivateRoute: React.FC<{ children: React.ReactNode; role?: string }> = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (role && user.role !== role) return <Navigate to="/" />;

  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={user.role === 'student' ? '/student' : '/coordinator'} />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to={user.role === 'student' ? '/student' : '/coordinator'} />} />

      <Route
        path="/student"
        element={
          <PrivateRoute role="student">
            <StudentDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/jobs"
        element={
          <PrivateRoute role="student">
            <StudentJobs />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/jobs/:id"
        element={
          <PrivateRoute role="student">
            <JobRoleDetails />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/profile"
        element={
          <PrivateRoute role="student">
            <StudentProfile />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/companies"
        element={
          <PrivateRoute role="student">
            <StudentCompanies />
          </PrivateRoute>
        }
      />

      <Route
        path="/coordinator"
        element={
          <PrivateRoute role="coordinator">
            <CoordinatorDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/coordinator/companies"
        element={
          <PrivateRoute role="coordinator">
            <CoordinatorDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/coordinator/jobs"
        element={
          <PrivateRoute role="coordinator">
            <CoordinatorDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/coordinator/students"
        element={
          <PrivateRoute role="coordinator">
            <CoordinatorDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/coordinator/add-visit"
        element={
          <PrivateRoute role="coordinator">
            <CoordinatorDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/statistics"
        element={
          <PrivateRoute>
            <StatisticsPage />
          </PrivateRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
