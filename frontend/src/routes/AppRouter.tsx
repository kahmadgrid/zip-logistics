import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { LandingPage } from "../features/landing/pages/LandingPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppShell } from "../components/layout/AppShell";
import { UserDashboardPage } from "../features/bookings/pages/UserDashboardPage";
import { CreateBookingPage } from "../features/bookings/pages/CreateBookingPage";
import { MyBookingsPage } from "../features/bookings/pages/MyBookingsPage";
import { TrackingPage } from "../features/tracking/pages/TrackingPage";
import { DriverDashboardPage } from "../features/driver/pages/DriverDashboardPage";
import { AdminDashboardPage } from "../features/admin/pages/AdminDashboardPage";
import { WarehousesPage } from "../features/admin/pages/WarehousesPage";
import { UsersPage } from "../features/admin/pages/UsersPage";
import { DriversPage } from "../features/admin/pages/DriversPage";
import { BatchingPage } from "../features/admin/pages/BatchingPage";
import { LogsPage } from "../features/admin/pages/LogsPage";

function HomeRedirect() {
  const { isAuthenticated, role } = useAuthStore();
  if (!isAuthenticated) return <LandingPage />;
  if (role === "ROLE_ADMIN") return <Navigate to="/admin" replace />;
  if (role === "ROLE_DRIVER") return <Navigate to="/driver" replace />;
  return <Navigate to="/user" replace />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute allow={["ROLE_USER", "ROLE_DRIVER", "ROLE_ADMIN"]}>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route
          path="/user"
          element={
            <ProtectedRoute allow={["ROLE_USER", "ROLE_ADMIN"]}>
              <UserDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/bookings/new"
          element={
            <ProtectedRoute allow={["ROLE_USER", "ROLE_ADMIN"]}>
              <CreateBookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/bookings"
          element={
            <ProtectedRoute allow={["ROLE_USER", "ROLE_ADMIN"]}>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/tracking/:orderId"
          element={
            <ProtectedRoute allow={["ROLE_USER", "ROLE_ADMIN", "ROLE_DRIVER"]}>
              <TrackingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver"
          element={
            <ProtectedRoute allow={["ROLE_DRIVER", "ROLE_ADMIN"]}>
              <DriverDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/tasks"
          element={
            <ProtectedRoute allow={["ROLE_DRIVER", "ROLE_ADMIN"]}>
              <DriverDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allow={["ROLE_ADMIN"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/warehouses"
          element={
            <ProtectedRoute allow={["ROLE_ADMIN"]}>
              <WarehousesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allow={["ROLE_ADMIN"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/drivers"
          element={
            <ProtectedRoute allow={["ROLE_ADMIN"]}>
              <DriversPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/batching"
          element={
            <ProtectedRoute allow={["ROLE_ADMIN"]}>
              <BatchingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/logs"
          element={
            <ProtectedRoute allow={["ROLE_ADMIN"]}>
              <LogsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

