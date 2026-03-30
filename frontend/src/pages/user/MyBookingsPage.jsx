import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/table/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { bookingService } from '../../services/bookingService';
import { fmtDate } from '../../utils/constants';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    bookingService.myBookings()
      .then(({ data }) => setBookings(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'id', label: 'Order ID',
      render: (v) => <span className="font-mono text-xs text-slate-400">#{v}</span> },
    { key: 'pickupAddress', label: 'Pickup',
      render: (v) => <span className="text-xs max-w-[140px] block truncate">{v}</span> },
    { key: 'dropAddress', label: 'Drop',
      render: (v) => <span className="text-xs max-w-[140px] block truncate">{v}</span> },
    { key: 'deliveryType', label: 'Type',
      render: (v) => (
        <span className={`badge border text-[10px] font-bold
          ${v === 'EXPRESS'
            ? 'text-amber-400 bg-amber-400/10 border-amber-400/30'
            : 'text-slate-300 bg-slate-700/30 border-slate-600/30'}`}>
          {v === 'EXPRESS' ? '⚡' : '📦'} {v}
        </span>
      )},
    { key: 'status', label: 'Status',
      render: (v) => <StatusBadge status={v} /> },
    { key: 'estimatedPrice', label: 'Est. Price',
      render: (v) => (
        <span className="text-xs font-mono text-green-400">
          {v ? `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'}
        </span>
      )},
    { key: 'createdAt', label: 'Date',
      render: (v) => <span className="text-xs text-slate-500">{fmtDate(v)}</span> },
    { key: 'id', label: 'Action',
      render: (v) => (
        <Link to={`/user/tracking/${v}`}
          className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium">
          <MapPin size={12} /> Track
        </Link>
      )},
  ];

  return (
    <DashboardLayout>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1>My Bookings</h1>
          <p>{bookings.length} total orders</p>
        </div>
        <Link to="/user/create-booking" className="btn-primary">
          <Plus size={16} /> New Booking
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={bookings}
        loading={loading}
        emptyMsg="You have no bookings yet."
      />
    </DashboardLayout>
  );
}