
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import NotFound from "../pages/NotFound";
import Login from "../pages/auth/Login";
import BootstrapAdmin from "../pages/auth/BootstrapAdmin";
import Dashboard from "../pages/dashboard/page";
import CrimeAnalysis from "../pages/analysis/page";
import CriminalProfiling from "../pages/profiling/page";
import ResourceAllocation from "../pages/resources/page";
import AdminPage from "../pages/admin/page";
import AgentsPage from "../pages/agents/page";
import Documentation from "../pages/documentation/page";
import NotificationsPage from '../pages/notifications/page';
import ProfilePage from '../pages/profile/page';
import SettingsPage from '../pages/settings/page';
import SecurityPage from '../pages/security/page';
import CsvHistoryPage from '../pages/csv-history/page';
import UsersPage from '../pages/users/page';
import PredictionPage from '../pages/prediction/page';
import SenegalRadarPage from '../pages/senegal-radar/page';
import SignalementsPage from '../pages/signalements/page';
import DiagnosticTest from '../components/DiagnosticTest';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/auth/login',
    element: <Login />,
  },
  {
    path: '/bootstrap-admin',
    element: <BootstrapAdmin />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/signalements',
    element: (
      <ProtectedRoute>
        <SignalementsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/analysis',
    element: (
      <ProtectedRoute>
        <CrimeAnalysis />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profiling',
    element: (
      <ProtectedRoute>
        <CriminalProfiling />
      </ProtectedRoute>
    ),
  },
  {
    path: '/resources',
    element: (
      <ProtectedRoute>
        <ResourceAllocation />
      </ProtectedRoute>
    ),
  },
  {
    path: '/predictions',
    element: (
      <ProtectedRoute>
        <PredictionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/senegal-radar',
    element: (
      <ProtectedRoute>
        <SenegalRadarPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/diagnostic',
    element: <DiagnosticTest />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/agents',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AgentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/users',
    element: (
      <ProtectedRoute requiredRole="admin">
        <UsersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/documentation',
    element: (
      <ProtectedRoute>
        <Documentation />
      </ProtectedRoute>
    ),
  },
  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <NotificationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <SettingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/security',
    element: (
      <ProtectedRoute>
        <SecurityPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/csv-history',
    element: (
      <ProtectedRoute>
        <CsvHistoryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
