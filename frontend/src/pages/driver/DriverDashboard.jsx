import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Truck, User, ArrowRight, BadgeCheck, Package } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import InfoCard from '../../components/common/InfoCard';
import StatusBadge from '../../components/common/StatusBadge';
import { driverService } from '../../services/driverService';
import { ACTIVE_STATUSES, COMPLETE_STATUSES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../../components/NotificationBell'; // ✅ added

export default function DriverDashboard() {
  const { user }                  = useAuth();
  const [available, setAvailable] = useState([]);
  const [assigned,  setAssigned]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [isOnline, setIsOnline] = useState(null);

  const [newOrder, setNewOrder] = useState(null);
  const lastSeenIdRef = useRef(0);
    const isFetchingRef = useRef(false);

    useEffect(() => {
      if (!user?.email || isOnline === null) return;

      const key = `driver_marker_${user.email}`;

      // Sync Ref with localStorage only once on mount
      if (lastSeenIdRef.current === 0) {
        lastSeenIdRef.current = Number(localStorage.getItem(key)) || 0;
      }

      const pollData = async () => {
        // Prevent overlapping requests
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        try {
          const [availRes, assignRes] = await Promise.all([
            isOnline ? driverService.getAvailableTasks() : Promise.resolve([]),
            driverService.getAssignedTasks()
          ]);

    Promise.allSettled([
      isOnline ? driverService.getAvailableTasks() : isOnline ? driverService.getAvailableTasks() : { status: 'fulfilled', value: [] },
      driverService.getAssignedTasks(),
    ])
      .then(([avail, assign]) => {
        setAvailable(
          avail.status === 'fulfilled' && Array.isArray(avail.value)
            ? avail.value
            : []
        );
        setAssigned(
          assign.status === 'fulfilled' && Array.isArray(assign.value)
            ? assign.value
            : []
        );
      })
      .finally(() => setLoading(false));
  }, [isOnline]);

  useEffect(() => {
    fetchProfile();
    const interval = setInterval(fetchProfile, 10000);
    return () => clearInterval(interval);
  }, []);

  const active    = assigned.filter(t => ACTIVE_STATUSES.includes(t.status));
  const completed = assigned.filter(t => COMPLETE_STATUSES.includes(t.status));

  const handleToggleAvailability = async () => {
    try {
      if (isOnline) {
        await driverService.goOffline();
        setIsOnline(false);
      } else {
        await driverService.goOnline();
        setIsOnline(true);
      }
    } catch (err) {
      console.log("ERROR:", err);
    }
  };

  const fetchProfile = async () => {
    try {
      const data = await driverService.getMyProfile();
      if (!data) {
        setIsOnline(false);
        return;
      }
      setIsOnline(data.availability === 'ONLINE');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      {isOnline == false && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
          You are offline. You can still use the app, but you won't receive new orders.
        </div>
      )}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Driver Dashboard</h1>
          <p>{user?.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell /> {/* ✅ added */}
          <button
            onClick={handleToggleAvailability}
            disabled={isOnline === null}
            className={`btn-secondary ${
              isOnline
                ? 'bg-red-500/20 text-red-400'
                : 'bg-green-500/20 text-green-400'
            }`}
          >
            {isOnline === null
              ? 'Loading...'
              : isOnline
                ? 'Go Offline'
                : 'Go Online'}
          </button>

          <Link to="/driver/profile" className="btn-secondary flex items-center gap-1">
            <User size={15} /> Update Profile
          </Link>
        </div>
      </div>

      {/* rest of your JSX unchanged below... */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <InfoCard label="Available Orders"  value={available.length} icon={Package}   accent="blue"  sub="Open for pickup" />
        <InfoCard label="Active Deliveries" value={active.length}    icon={Truck}     accent="sky"   sub="In progress" />
        <InfoCard label="Delivered"         value={completed.filter(t => t.status === 'DELIVERED').length} icon={BadgeCheck} accent="green" sub="Completed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Available Orders</h2>
            <Link to="/driver/tasks" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              Accept orders <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <p className="text-slate-500 text-sm">Loading...</p>
          ) : !available.length ? (
            <p className="text-slate-500 text-sm py-6 text-center">No available orders right now.</p>
          ) : (
            <div className="space-y-2">
              {available.slice(0, 4).map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-border/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white font-medium truncate">
                      {t.pickupAddress} → {t.dropAddress}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      #{t.id} · {t.weightKg ? `${t.weightKg}kg` : ''}
                      {t.estimatedPrice ? ` · ₹${Number(t.estimatedPrice).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : ''}
                    </p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
              {available.length > 4 && (
                <p className="text-xs text-slate-500 text-center pt-1">+{available.length - 4} more</p>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">My Active Deliveries</h2>
            <Link to="/driver/tasks" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              Manage <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <p className="text-slate-500 text-sm">Loading...</p>
          ) : !active.length ? (
            <div className="text-center py-6">
              <Truck size={28} className="text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No active deliveries.</p>
              <p className="text-slate-600 text-xs mt-1">Accept an order to start delivering.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {active.slice(-4).map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-border/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white font-medium truncate">
                      {t.pickupAddress} → {t.dropAddress}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">#{t.id}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {newOrder && (
        /* bg-slate-950/40: Dark slate at 40% opacity (less heavy than black/80)
           backdrop-blur-[2px]: A very specific, tiny blur instead of the standard 'sm'
        */
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-4 transition-all duration-500">

          <div className="bg-slate-900 border border-brand-500/30 p-6 rounded-2xl max-w-sm w-full shadow-2xl ring-1 ring-white/10">

            <div className="flex items-center gap-3 mb-4">
              <div className="bg-brand-500/10 p-2 rounded-full">
                <Package className="text-brand-400" size={24} />
              </div>
              <h2 className="text-xl font-bold text-white">New Booking</h2>
            </div>

            <div className="bg-slate-800/40 p-4 rounded-xl mb-6 border border-white/5">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Route</p>
              <p className="text-sm text-slate-200 leading-relaxed">
                {newOrder.pickupAddress} <span className="text-brand-500">→</span> {newOrder.dropAddress}
              </p>
              <p className="text-[10px] text-slate-600 mt-3 font-mono">ID: #{newOrder.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setNewOrder(null)}
                className="py-2.5 rounded-xl bg-slate-800/50 text-slate-400 font-medium hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                Ignore
              </button>
              <button
                onClick={async () => {
                  try {
                    await driverService.acceptOrder(newOrder.id);
                    setNewOrder(null);
                  } catch (e) {
                    alert("Order already taken!");
                    setNewOrder(null);
                  }
                }}
                className="py-2.5 rounded-xl bg-brand-500 text-white font-bold hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-transform active:scale-95"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}