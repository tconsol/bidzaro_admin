import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ToastDisplay from './components/ToastDisplay';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AccountRecovery from './pages/AccountRecovery';
import Users from './pages/Users';
import SupportAgents from './pages/SupportAgents';
import Orders from './pages/Orders';
import Bids from './pages/Bids';
import Payments from './pages/Payments';
import Admins from './pages/Admins';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Vendors from './pages/Vendors';
import MenuItems from './pages/MenuItems';
import PlatformConfig from './pages/PlatformConfig';
import AuditLogs from './pages/AuditLogs';
import Announcements from './pages/Announcements';
import useAutoLogout from './hooks/useAutoLogout';

function AutoLogout() {
  useAutoLogout();
  return null;
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AutoLogout />
          <ToastDisplay />
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/account-recovery" element={<AccountRecovery />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="support-agents" element={<SupportAgents />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="orders" element={<Orders />} />
            <Route path="bids" element={<Bids />} />
            <Route path="menu-items" element={<MenuItems />} />
            <Route path="payments" element={<Payments />} />
            <Route path="admins" element={<Admins />} />
            <Route path="platform-config" element={<PlatformConfig />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
