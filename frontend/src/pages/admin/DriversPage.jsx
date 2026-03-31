import React, { useEffect, useState } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/table/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { adminService } from '../../services/adminService';

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = () => {
    setLoading(true);
    adminService.getDrivers()
      .then(({ data }) => setDrivers(data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDrivers(); }, []);

  const columns = [
    { key: 'id',           label: 'ID',
      render: (v) => <span className="font-mono text-xs text-slate-500">#{v}</span> },
    { key: 'user',         label: 'Email',
      render: (v) => <span className="text-xs text-slate-400">{v?.email ?? '—'}</span> },
    { key: 'vehicleType',  label: 'Vehicle',
      render: (v) => <span className="text-sm text-white">{v ?? '—'}</span> },
    { key: 'vehicleNumber',label: 'Reg No.',
      render: (v) => <span className="font-mono text-xs text-slate-300">{v ?? '—'}</span> },
    { key: 'currentZone',  label: 'Zone',
      render: (v) => <span className="text-xs text-slate-400">{v ?? '—'}</span> },
    {
      key: 'availability',
      label: 'Status',
      render: (v, row) => {
        const status = row.user?.active === false ? 'OFFLINE' : v;

        return (
          <StatusBadge
            status={status}
            type="availability"
            className={
              row.user?.active === false
                ? 'text-red-400 bg-red-400/10 border-red-400/30'
                : ''
            }
          />
        );
      }
    },
    { key: 'currentLatitude', label: 'Location',
      render: (v, row) =>
        v ? (
          <span className="font-mono text-xs text-slate-500">
            {v?.toFixed(3)}, {row.currentLongitude?.toFixed(3)}
          </span>
        ) : <span className="text-slate-600">—</span>
    },
  ];

  return (
    <DashboardLayout>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1>Driver Management</h1>
          <p>{drivers.length} registered drivers</p>
        </div>
        <button onClick={fetchDrivers} disabled={loading} className="btn-secondary">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
          Refresh
        </button>
      </div>

      <DataTable columns={columns} data={drivers} loading={loading} emptyMsg="No drivers found." />
    </DashboardLayout>
  );
}
