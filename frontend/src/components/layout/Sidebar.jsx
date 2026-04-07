import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, MapPin, Truck, User,
  Warehouse, Users, ClipboardList, LogOut, Zap, Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const userLinks = [
  { to: '/user/dashboard',      icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/user/create-booking', icon: Package,         label: 'New Booking' },
  { to: '/user/bookings',       icon: ClipboardList,   label: 'My Bookings' },
  { to: '/user/profile',        icon: User,            label: 'My Profile'  },
];

const driverLinks = [
  { to: '/driver/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/driver/profile',   icon: User,            label: 'My Profile' },
  { to: '/driver/tasks',     icon: Truck,           label: 'My Tasks'  },
];

const adminLinks = [
  { to: '/admin/dashboard',   icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/admin/warehouses',  icon: Warehouse,       label: 'Warehouses'  },
  { to: '/admin/zones',       icon: MapPin,          label: 'Zones'       },
  { to: '/admin/users',       icon: Users,           label: 'Users'       },
  { to: '/admin/drivers',     icon: Truck,           label: 'Drivers'     },
  { to: '/admin/batching',    icon: Zap,             label: 'Batching'    },
  { to: '/admin/logs',        icon: ClipboardList,   label: 'Order Logs'  },
];

export default function Sidebar() {
  const { user, logout, isAdmin, isDriver } = useAuth();
  const navigate = useNavigate();

  const links = isAdmin ? adminLinks : isDriver ? driverLinks : userLinks;

  const roleLabel = isAdmin ? 'Admin' : isDriver ? 'Driver' : 'Customer';
  const roleBg    = isAdmin ? 'bg-purple-500/20 text-purple-300' :
                    isDriver ? 'bg-sky-500/20 text-sky-300' :
                    'bg-brand-500/20 text-brand-300';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="w-60 flex-shrink-0 bg-surface-card border-r border-surface-border
                      flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <MapPin size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight font-display">SmartLogix</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Logistics</p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 pt-4 pb-2">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${roleBg}`}>
          {roleLabel}
        </span>
        <p className="text-xs text-slate-400 mt-1.5 truncate">{user?.email}</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
               ${isActive
                 ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                 : 'text-slate-400 hover:text-slate-200 hover:bg-surface'
               }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-surface-border space-y-0.5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                     text-slate-400 hover:text-red-400 hover:bg-red-500/10 w-full transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
