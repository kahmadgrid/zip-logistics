import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, Plus, ArrowRight } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import InfoCard from '../../components/common/InfoCard';
import StatusBadge from '../../components/common/StatusBadge';
import { bookingService } from '../../services/bookingService';
import { fmtDate } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../../components/NotificationBell';

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    bookingService.myBookings()
      .then(({ data }) => setBookings(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total    = bookings.length;
  const active   = bookings.filter(b => !['DELIVERED', 'CANCELLED'].includes(b.status)).length;
  const delivered = bookings.filter(b => b.status === 'DELIVERED').length;
  const recent = bookings.filter(b => !['DELIVERED', 'CANCELLED'].includes(b.status)).slice(0, 5);

  return (
    <DashboardLayout>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1>Welcome back 👋</h1>
          <p>{user?.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <Link to="/user/create-booking" className="btn-primary">
            <Plus size={16} /> New Booking
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <InfoCard label="Total Bookings"   value={total}    icon={Package}      accent="blue"  />
        <InfoCard label="Active Deliveries" value={active}  icon={Truck}        accent="sky"   />
        <InfoCard label="Delivered"         value={delivered} icon={CheckCircle} accent="green" />
      </div>

      {/* Recent bookings */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Recent Bookings</h2>
          <Link to="/user/bookings" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-500 text-sm py-4">Loading...</p>
        ) : !recent.length ? (
          <div className="text-center py-10">
            <Package size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No bookings yet.</p>
            <Link to="/user/create-booking" className="btn-primary mt-4 inline-flex">
              <Plus size={14} /> Create your first booking
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-lg
                                         bg-surface hover:bg-surface-border/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {b.pickupAddress} → {b.dropAddress}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock size={10} /> {fmtDate(b.createdAt)} · #{b.id}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-3">
                  <StatusBadge status={b.status} />
                  <Link to={`/user/tracking/${b.id}`}
                    className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-0.5">
                    Track <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
