import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import MainLayout from './components/layout/MainLayout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientRegisterPage from './pages/PatientRegisterPage';
import CaretakerRegisterPage from './pages/CaretakerRegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import FacesPage from './pages/FacesPage';
import MemoriesPage from './pages/MemoriesPage';
import RemindersPage from './pages/RemindersPage';
import GpsPage from './pages/GpsPage';
import AlertsPage from './pages/AlertsPage';
import SettingsPage from './pages/SettingsPage';
import AddFacePage from './pages/AddFacePage';
import AddMemoryPage from './pages/AddMemoryPage';
import AddReminderPage from './pages/AddReminderPage';
import { UserRole } from './types';

const PrivateRoute: React.FC<{ children: React.ReactElement, requiredRole?: UserRole }> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/dashboard" />;

  return children;
};

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <HashRouter>
      <Routes>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/patient" element={<PatientRegisterPage />} />
        <Route path="/register/caretaker" element={<CaretakerRegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />

        <Route path="/dashboard" element={<PrivateRoute><MainLayout><DashboardPage /></MainLayout></PrivateRoute>} />
        <Route path="/faces" element={<PrivateRoute><MainLayout><FacesPage /></MainLayout></PrivateRoute>} />
        <Route path="/faces/add" element={<PrivateRoute requiredRole={UserRole.CARETAKER}><MainLayout><AddFacePage /></MainLayout></PrivateRoute>} />
        <Route path="/memories" element={<PrivateRoute><MainLayout><MemoriesPage /></MainLayout></PrivateRoute>} />
        <Route path="/memories/add" element={<PrivateRoute requiredRole={UserRole.CARETAKER}><MainLayout><AddMemoryPage /></MainLayout></PrivateRoute>} />
        <Route path="/reminders" element={<PrivateRoute><MainLayout><RemindersPage /></MainLayout></PrivateRoute>} />
        <Route path="/reminders/add" element={<PrivateRoute requiredRole={UserRole.CARETAKER}><MainLayout><AddReminderPage /></MainLayout></PrivateRoute>} />
        <Route path="/gps" element={<PrivateRoute requiredRole={UserRole.CARETAKER}><MainLayout><GpsPage /></MainLayout></PrivateRoute>} />
        <Route path="/alerts" element={<PrivateRoute requiredRole={UserRole.CARETAKER}><MainLayout><AlertsPage /></MainLayout></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute requiredRole={UserRole.CARETAKER}><MainLayout><SettingsPage /></MainLayout></PrivateRoute>} />

      </Routes>
    </HashRouter>
  );
}

export default App;