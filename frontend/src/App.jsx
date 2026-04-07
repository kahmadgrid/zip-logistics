import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import { requestNotificationPermission, listenToNotifications } from './services/notificationService';

// Landing
import LandingPage from './pages/LandingPage';

// Auth
import LoginPage    from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PublicRoute  from './pages/auth/PublicRoute';

// User
import UserDashboard     from './pages/user/UserDashboard';
import CreateBookingPage from './pages/user/CreateBookingPage';
import MyBookingsPage    from './pages/user/MyBookingsPage';
import TrackingPage      from './pages/user/TrackingPage';
import UserProfilePage   from './pages/user/UserProfilePage';

// Driver
import DriverDashboard   from './pages/driver/DriverDashboard';
import DriverProfilePage from './pages/driver/DriverProfilePage';
import DriverTasksPage   from './pages/driver/DriverTasksPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import WarehousePage  from './pages/admin/WarehousePage';
import UsersPage      from './pages/admin/UsersPage';
import ZoneManagementPage from './pages/admin/ZoneManagementPage';
import DriversPage    from './pages/admin/DriversPage';
import BatchingPage   from './pages/admin/BatchingPage';
import LogsPage       from './pages/admin/LogsPage';

export default function App() {

  useEffect(() => {
    // Push: one path — env VAPID + backend register inside notificationService
    requestNotificationPermission().then((token) => {
      if (token) console.log("FCM token registered");
    });
    listenToNotifications();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid #334155',
              borderRadius: '10px',
              fontSize: '13px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#1e293b' }
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#1e293b' }
            },
          }}
        />

        <Routes>

          {/* Public */}
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* User routes */}
          <Route
            path="/user/dashboard"
            element={<ProtectedRoute role="ROLE_USER"><UserDashboard /></ProtectedRoute>}
          />
          <Route
            path="/user/create-booking"
            element={<ProtectedRoute role="ROLE_USER"><CreateBookingPage /></ProtectedRoute>}
          />
          <Route
            path="/user/bookings"
            element={<ProtectedRoute role="ROLE_USER"><MyBookingsPage /></ProtectedRoute>}
          />
          <Route
            path="/user/tracking/:orderId"
            element={<ProtectedRoute role="ROLE_USER"><TrackingPage /></ProtectedRoute>}
          />
          <Route
            path="/user/profile"
            element={<ProtectedRoute role="ROLE_USER"><UserProfilePage /></ProtectedRoute>}
          />

          {/* Driver routes */}
          <Route
            path="/driver/dashboard"
            element={<ProtectedRoute role="ROLE_DRIVER"><DriverDashboard /></ProtectedRoute>}
          />
          <Route
            path="/driver/profile"
            element={<ProtectedRoute role="ROLE_DRIVER"><DriverProfilePage /></ProtectedRoute>}
          />
          <Route
            path="/driver/tasks"
            element={<ProtectedRoute role="ROLE_DRIVER"><DriverTasksPage /></ProtectedRoute>}
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute role="ROLE_ADMIN"><AdminDashboard /></ProtectedRoute>}
          />
          <Route
            path="/admin/warehouses"
            element={<ProtectedRoute role="ROLE_ADMIN"><WarehousePage /></ProtectedRoute>}
          />
          <Route
            path="/admin/users"
            element={<ProtectedRoute role="ROLE_ADMIN"><UsersPage /></ProtectedRoute>}
          />
          <Route
            path="/admin/zones"
            element={<ProtectedRoute role="ROLE_ADMIN"><ZoneManagementPage /></ProtectedRoute>}
          />
          <Route
            path="/admin/drivers"
            element={<ProtectedRoute role="ROLE_ADMIN"><DriversPage /></ProtectedRoute>}
          />
          <Route
            path="/admin/batching"
            element={<ProtectedRoute role="ROLE_ADMIN"><BatchingPage /></ProtectedRoute>}
          />
          <Route
            path="/admin/logs"
            element={<ProtectedRoute role="ROLE_ADMIN"><LogsPage /></ProtectedRoute>}
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

      </AuthProvider>
    </BrowserRouter>
  );
}