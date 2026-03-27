import { Link, Outlet } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../ui/Button";
import { DriverProfileModal } from "../../features/driver/components/DriverProfileModal";

export function AppShell() {
  const { role, email, logout } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const nav = role === "ROLE_ADMIN"
    ? [
        ["Dashboard", "/admin"],
        ["Warehouses", "/admin/warehouses"],
        ["Users", "/admin/users"],
        ["Drivers", "/admin/drivers"],
        ["Batching", "/admin/batching"],
        ["Logs", "/admin/logs"]
      ]
    : role === "ROLE_DRIVER"
      ? [
          ["Dashboard", "/driver"],
          ["Tasks", "/driver/tasks"]
        ]
      : [
          ["Dashboard", "/user"],
          ["Create Booking", "/user/bookings/new"],
          ["My Bookings", "/user/bookings"]
        ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-brand-100 bg-white/90 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3">
          <Link to="/" className="text-xl font-black text-brand-700">
            Zip-Logistics
          </Link>
          <div className="hidden gap-2 md:flex">
            {nav.map(([label, path]) => (
              <Link key={path} to={path} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-brand-50">
                {label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-xs text-slate-500 sm:block">
              <div>{email}</div>
              <div>{role}</div>
            </div>
            {role === "ROLE_DRIVER" && (
              <>
                <Button variant="secondary" onClick={() => setProfileOpen(true)}>
                  Profile
                </Button>
                <DriverProfileModal
                  open={profileOpen}
                  onClose={() => setProfileOpen(false)}
                />
              </>
            )}
            <Button variant="secondary" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container-app py-6">
        <Outlet />
      </main>
    </div>
  );
}

