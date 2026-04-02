import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, User, ArrowRight, BadgeCheck, Package } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import InfoCard from '../../components/common/InfoCard';
import StatusBadge from '../../components/common/StatusBadge';
import { driverService } from '../../services/driverService';
import { ACTIVE_STATUSES, COMPLETE_STATUSES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

export default function DriverDashboard() {
  const { user }                  = useAuth();
  const [available, setAvailable] = useState([]);
  const [assigned,  setAssigned]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [isActive, setIsActive] = useState(null);

  useEffect(() => {
    if (isActive === null) {
      return;
    }

    if (!isActive) {
        setLoading(false);
        return;
      }

    setLoading(true);
    Promise.allSettled([
      driverService.getAvailableTasks(),
      driverService.getAssignedTasks(),
    ])
      .then(([avail, assign]) => {
        setAvailable(avail.status === 'fulfilled' && Array.isArray(avail.value) ? avail.value : []);
        setAssigned(assign.status === 'fulfilled' && Array.isArray(assign.value) ? assign.value : []);
      })
      .finally(() => setLoading(false));
  }, [isActive]);

    useEffect(() => {
      fetchProfile();
      const interval = setInterval(fetchProfile, 10000); // every 10 sec

      return () => clearInterval(interval);
    }, []);

  const active    = assigned.filter(t => ACTIVE_STATUSES.includes(t.status));
  const completed = assigned.filter(t => COMPLETE_STATUSES.includes(t.status));
  const handleToggleAccount = async () => {
    try {
      console.log("Before toggle:", isActive);

      if (isActive) {
        console.log("Calling deactivate API");
        await driverService.deactivateAccount();
      } else {
        console.log("Calling activate API");
        await driverService.activateAccount();
      }

      console.log("After API call");

      await fetchProfile();

    } catch (err) {
      console.log("ERROR:", err);
    }
  };

    const fetchProfile = async () => {
      try {
        const data = await driverService.getMyProfile();
        console.log("Profile API:", data);

        setIsActive(Boolean(data?.user?.active)); // ✅ FIX

      } catch (err) {
        console.error(err);
      }
    };

  return (
    <DashboardLayout>
        {!isActive && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            Your account is deactivated. Activate to continue working.
          </div>
        )}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Driver Dashboard</h1>
          <p>{user?.email}</p>
        </div>
        <div className="flex items-center gap-3">
            <button
              onClick={handleToggleAccount}
              className={`btn-secondary ${
                isActive
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              }`}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </button>

            <Link to="/driver/profile" className="btn-secondary flex items-center gap-1">
              <User size={15} /> Update Profile
            </Link>
          </div>
      </div>

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
    </DashboardLayout>
  );
}