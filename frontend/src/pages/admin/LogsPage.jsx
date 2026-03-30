import React, { useEffect, useState } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/table/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { adminService } from '../../services/adminService';
import { fmtDate } from '../../utils/constants';

export default function LogsPage() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    adminService.getOrderLogs()
      .then(({ data }) => setLogs(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, []);

  const columns = [
    { key: 'id',             label: 'Log ID',
      render: (v) => <span className="font-mono text-xs text-slate-500">#{v}</span> },
    { key: 'orderId',        label: 'Order ID',
      render: (v) => <span className="font-mono text-xs text-brand-400">#{v}</span> },
    { key: 'status',         label: 'Status',
      render: (v) => <StatusBadge status={v} /> },
    { key: 'description',    label: 'Description',
      render: (v) => <span className="text-xs text-slate-400 max-w-[200px] block truncate">{v ?? '—'}</span> },
    { key: 'createdAt',      label: 'Timestamp',
      render: (v) => <span className="text-xs text-slate-500">{fmtDate(v)}</span> },
  ];

  return (
    <DashboardLayout>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1>Order Logs</h1>
          <p>Full order lifecycle audit trail</p>
        </div>
        <button onClick={fetchLogs} disabled={loading} className="btn-secondary">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
          Refresh
        </button>
      </div>

      <DataTable columns={columns} data={logs} loading={loading} emptyMsg="No logs found." />
    </DashboardLayout>
  );
}
