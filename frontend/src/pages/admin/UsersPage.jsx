import React, { useEffect, useState } from 'react';
import { RefreshCw, Loader2, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/table/DataTable';
import { adminService } from '../../services/adminService';
import { getErrMsg } from '../../utils/constants';

export default function UsersPage() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState({});
  const [drivers, setDrivers] = useState([]);

  const fetchUsers = () => {
    setLoading(true);
    adminService.getUsers()
      .then(({ data }) => setUsers(data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      adminService.getUsers(),
      adminService.getDrivers()
    ])
      .then(([uRes, dRes]) => {
        setUsers(uRes.data ?? []);
        setDrivers(dRes.data ?? []); // 👈 NEW
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'id',       label: 'ID',
      render: (v) => <span className="font-mono text-xs text-slate-500">#{v}</span> },
    { key: 'fullName', label: 'Name',
      render: (v) => <span className="text-sm text-white">{v ?? '—'}</span> },
    { key: 'email',    label: 'Email',
      render: (v) => <span className="text-xs text-slate-400">{v}</span> },
    { key: 'mobile',   label: 'Mobile',
      render: (v) => <span className="text-xs text-slate-400">{v ?? '—'}</span> },
    { key: 'role',     label: 'Role',
      render: (v) => (
        <span className={`badge border text-[10px] font-bold
          ${v === 'ROLE_ADMIN'  ? 'text-purple-400 bg-purple-400/10 border-purple-400/30' :
            v === 'ROLE_DRIVER' ? 'text-sky-400 bg-sky-400/10 border-sky-400/30' :
            'text-slate-300 bg-slate-700/30 border-slate-600/30'}`}>
          {v?.replace('ROLE_', '')}
        </span>
      )},
    { key: 'active',   label: 'Status',
      render: (v, row) => {
        const driver = drivers.find(d => d.user?.id === row.id);

        return (
          <span className={`badge border text-[10px]
            ${
              row.role === 'ROLE_DRIVER'
                ? (driver?.availability === 'ONLINE'
                    ? 'text-green-400 bg-green-400/10 border-green-400/30'
                    : 'text-red-400 bg-red-400/10 border-red-400/30')
                : (row.active !== false
                    ? 'text-green-400 bg-green-400/10 border-green-400/30'
                    : 'text-red-400 bg-red-400/10 border-red-400/30')
            }`}
          >
            {
              row.role === 'ROLE_DRIVER'
                ? (driver?.availability === 'ONLINE' ? 'Online' : 'Offline')
                : (row.active !== false ? 'Online' : 'Offline')
            }
          </span>
        );
      }
  }
  ];

  return (
    <DashboardLayout>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1>User Management</h1>
          <p>{users.length} registered users</p>
        </div>
        <button onClick={fetchUsers} disabled={loading} className="btn-secondary">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
          Refresh
        </button>
      </div>

      <DataTable columns={columns} data={users} loading={loading} emptyMsg="No users found." />
    </DashboardLayout>
  );
}
