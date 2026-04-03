import React, { useEffect, useState } from 'react';
import { Users, Truck, Package, Activity } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import InfoCard from '../../components/common/InfoCard';
import { adminService } from '../../services/adminService';

export default function AdminDashboard() {
  const [users,   setUsers]   = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      adminService.getUsers(),
      adminService.getDrivers(),
      adminService.getOrderLogs(),
    ]).then(([u, d, l]) => {
      if (u.status === 'fulfilled') setUsers(u.value.data  ?? []);
      if (d.status === 'fulfilled') setDrivers(d.value.data ?? []);
      if (l.status === 'fulfilled') setLogs(l.value.data    ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const onlineDrivers = drivers.filter(d => d.availability === 'ONLINE').length;
  const activeOrders  = logs.filter(l => !['DELIVERED', 'CANCELLED'].includes(l.status)).length;
  const activeDrivers = drivers.filter(d => d.user?.active !== false).length;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>System overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <InfoCard label="Total Users"    value={users.length}   icon={Users}    accent="blue"   />
        <InfoCard label="Total Drivers"  value={drivers.length} icon={Truck}    accent="sky"    />
        <InfoCard label="Online Drivers" value={onlineDrivers}  icon={Activity} accent="green"  />
        <InfoCard label="Active Orders"  value={activeOrders}   icon={Package}  accent="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="card">
          <h2 className="text-base font-semibold text-white mb-4">Recent Users</h2>
          {loading ? (
            <p className="text-slate-500 text-sm">Loading...</p>
          ) : (
            <div className="space-y-2">
              {users.slice(-6).reverse().map((u) => {
                const driver = drivers.find(d => d.user?.id === u.id);

                console.log("USER:", u);
                  console.log("MATCHED DRIVER:", driver);

                return (
                  <div key={u.id} className="flex items-center justify-between py-2 border-b border-surface-border/40 last:border-0">

                    <div>
                      <p className="text-sm text-white">{u.fullName ?? u.email}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>

                    <div className="flex items-center gap-2">

                      <span className={`badge border text-[10px]
                        ${u.role === 'ROLE_ADMIN'  ? 'text-purple-400 bg-purple-400/10 border-purple-400/30' :
                          u.role === 'ROLE_DRIVER' ? 'text-sky-400 bg-sky-400/10 border-sky-400/30' :
                          'text-slate-300 bg-slate-700/30 border-slate-600/30'}`}>
                        {u.role?.replace('ROLE_', '')}
                      </span>

                      <span className={`badge border text-[10px]
                        ${
                          u.role === 'ROLE_DRIVER'
                            ? driver?.availability === 'ONLINE'
                              ? 'text-green-400 bg-green-400/10 border-green-400/30'
                              : 'text-red-400 bg-red-400/10 border-red-400/30'
                            : u.active
                              ? 'text-green-400 bg-green-400/10 border-green-400/30'
                              : 'text-red-400 bg-red-400/10 border-red-400/30'
                        }`}
                      >
                        {
                          u.role === 'ROLE_DRIVER'
                            ? (driver?.availability === 'ONLINE' ? 'Online' : 'Offline')
                            : (u.active ? 'Online' : 'Offline')
                        }
                      </span>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Driver Overview */}
        <div className="card">
          <h2 className="text-base font-semibold text-white mb-4">Driver Overview</h2>
          {loading ? <p className="text-slate-500 text-sm">Loading...</p> : (
            <div className="space-y-2">
              {drivers.slice(-6).reverse().map((d) => (
                <div key={d.id} className="flex items-center justify-between py-2 border-b border-surface-border/40 last:border-0">
                  <div>
                    <p className="text-sm text-white">{d.user?.email ?? `Driver #${d.id}`}</p>
                    <p className="text-xs text-slate-500">{d.vehicleType} · {d.vehicleNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">

                    <span className={`badge border text-[10px]
                      ${d.availability === 'ONLINE'
                        ? 'text-green-400 bg-green-400/10 border-green-400/30'
                        : 'text-red-400 bg-red-400/10 border-red-400/30'}`}>
                      {d.availability === 'ONLINE' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
