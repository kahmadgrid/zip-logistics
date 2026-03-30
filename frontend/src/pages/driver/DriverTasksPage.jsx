import React, { useEffect, useState, useCallback } from 'react';
import {
  Loader2, RefreshCw, CheckCircle, Navigation,
  ChevronDown, Package, Truck, Clock, BadgeCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { driverService } from '../../services/driverService';
import { DRIVER_STATUS_FLOW, ACTIVE_STATUSES, COMPLETE_STATUSES, fmtDate, getErrMsg } from '../../utils/constants';

const TABS = [
  { id: 'available', label: 'Available', icon: Package,    desc: 'Open orders you can accept' },
  { id: 'active',    label: 'My Active', icon: Truck,      desc: 'Orders you are working on'  },
  { id: 'completed', label: 'Completed', icon: BadgeCheck, desc: 'Your delivered orders'      },
];

export default function DriverTasksPage() {
  const [tab,           setTab]       = useState('available');
  const [available,     setAvailable] = useState([]);
  const [assigned,      setAssigned]  = useState([]);
  const [loadingAvail,  setLoadingA]  = useState(true);
  const [loadingAssign, setLoadingB]  = useState(true);
  const [expanded,      setExpanded]  = useState(null);
  const [acting,        setActing]    = useState({});

  const fetchAvailable = useCallback(() => {
    setLoadingA(true);
    driverService.getAvailableTasks()
      .then((data) => setAvailable(Array.isArray(data) ? data : []))
      .catch((err) => toast.error(getErrMsg(err)))
      .finally(() => setLoadingA(false));
  }, []);

  const fetchAssigned = useCallback(() => {
    setLoadingB(true);
    driverService.getAssignedTasks()
      .then((data) => setAssigned(Array.isArray(data) ? data : []))
      .catch((err) => toast.error(getErrMsg(err)))
      .finally(() => setLoadingB(false));
  }, []);

  const refreshAll = () => { fetchAvailable(); fetchAssigned(); };

  useEffect(() => { refreshAll(); }, []);

  const activeTasks    = assigned.filter(t => ACTIVE_STATUSES.includes(t.status));
  const completedTasks = assigned.filter(t => COMPLETE_STATUSES.includes(t.status));

  const counts = {
    available: available.length,
    active:    activeTasks.length,
    completed: completedTasks.length,
  };

  const currentLoading = tab === 'available' ? loadingAvail : loadingAssign;
  const currentList    = tab === 'available' ? available
                       : tab === 'active'    ? activeTasks
                       : completedTasks;

  const setAct = (id, val) => setActing(p => ({ ...p, [id]: val }));

  const handleAccept = async (taskId) => {
    setAct(taskId, 'accept');
    try {
      await driverService.acceptOrder(taskId);
      toast.success('Order accepted! Check "My Active" tab.');
      refreshAll();
      setTab('active');
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setAct(taskId, null);
    }
  };

  const handleStatus = async (taskId, status) => {
    setAct(taskId, 'status');
    try {
      await driverService.updateStatus(taskId, status);
      toast.success(`Status updated → ${status.replace(/_/g, ' ')}`);
      fetchAssigned();
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setAct(taskId, null);
    }
  };

  const handleLocation = async (taskId, lat, lng, status) => {
    setAct(taskId, 'location');
    try {
      await driverService.updateLocation(taskId, parseFloat(lat), parseFloat(lng), status);
      toast.success('Location sent!');
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setAct(taskId, null);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1>Deliveries</h1>
          <p>Browse available orders or manage your active ones</p>
        </div>
        <button
          onClick={refreshAll}
          disabled={loadingAvail || loadingAssign}
          className="btn-secondary"
        >
          {(loadingAvail || loadingAssign)
            ? <Loader2 size={15} className="animate-spin" />
            : <RefreshCw size={15} />}
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-card border border-surface-border rounded-xl mb-5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3
                        rounded-lg text-sm font-semibold transition-all duration-150
              ${tab === id
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Icon size={14} />
            {label}
            {counts[id] > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                ${tab === id ? 'bg-white/20 text-white' : 'bg-surface text-slate-400'}`}>
                {counts[id]}
              </span>
            )}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500 mb-4">
        {TABS.find(t => t.id === tab)?.desc}
      </p>

      {currentLoading ? (
        <div className="flex items-center gap-2 text-slate-500 py-12 text-sm">
          <Loader2 size={16} className="animate-spin" /> Loading...
        </div>
      ) : !currentList.length ? (
        <EmptyState tab={tab} />
      ) : (
        <div className="space-y-3">
          {currentList.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              tabMode={tab}
              isExpanded={expanded === task.id}
              onToggle={() => setExpanded(expanded === task.id ? null : task.id)}
              acting={acting[task.id]}
              onAccept={() => handleAccept(task.id)}
              onStatus={(s) => handleStatus(task.id, s)}
              onLocation={(lat, lng, s) => handleLocation(task.id, lat, lng, s)}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

function EmptyState({ tab }) {
  const msgs = {
    available: { icon: '📭', title: 'No available orders',      sub: 'Check back soon — new orders appear here.'    },
    active:    { icon: '🚚', title: 'No active deliveries',     sub: 'Accept an order from the Available tab.'      },
    completed: { icon: '✅', title: 'No completed deliveries',  sub: 'Your delivered orders will appear here.'      },
  };
  const m = msgs[tab];
  return (
    <div className="card text-center py-14">
      <p className="text-4xl mb-3">{m.icon}</p>
      <p className="text-white font-semibold">{m.title}</p>
      <p className="text-slate-500 text-sm mt-1">{m.sub}</p>
    </div>
  );
}

function TaskCard({ task, tabMode, isExpanded, onToggle, acting, onAccept, onStatus, onLocation }) {
  const [loc, setLoc] = useState({ lat: '', lng: '' });

  const useGPS = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      (pos) => setLoc({
        lat: pos.coords.latitude.toString(),
        lng: pos.coords.longitude.toString(),
      }),
      () => toast.error('Could not get GPS location')
    );
  };

  const currentIdx = DRIVER_STATUS_FLOW.indexOf(task.status);
  const nextStatus = DRIVER_STATUS_FLOW[currentIdx + 1] ?? null;

  return (
    <div className={`card transition-all duration-200 animate-fade-in
      ${tabMode === 'available' ? 'border-brand-500/10 hover:border-brand-500/30' : ''}`}>

      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5
          ${tabMode === 'available' ? 'bg-brand-600/15 text-brand-400' :
            tabMode === 'active'    ? 'bg-sky-600/15 text-sky-400'    :
                                      'bg-green-600/15 text-green-400'}`}>
          {tabMode === 'completed' ? <BadgeCheck size={16} /> :
           tabMode === 'active'    ? <Truck size={16} />       :
                                     <Package size={16} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-[11px] text-slate-500">#{task.id}</span>
            <StatusBadge status={task.status} />
            {task.deliveryType && (
              <span className={`badge border text-[10px] font-bold
                ${task.deliveryType === 'EXPRESS'
                  ? 'text-amber-400 bg-amber-400/10 border-amber-400/30'
                  : 'text-slate-400 bg-slate-400/10 border-slate-400/30'}`}>
                {task.deliveryType === 'EXPRESS' ? '⚡' : '📦'} {task.deliveryType}
              </span>
            )}
          </div>

          <p className="text-sm font-medium text-white truncate">
            {task.pickupAddress} → {task.dropAddress}
          </p>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-slate-500">
              👤 {task.receiverName ?? '—'} · {task.receiverMobile ?? '—'}
            </span>
            {task.weightKg && (
              <span className="text-xs text-slate-600">{task.weightKg} kg</span>
            )}
            {task.createdAt && (
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <Clock size={10} /> {fmtDate(task.createdAt)}
              </span>
            )}
          </div>
        </div>

        {/* Accept button — available tab only */}
        {tabMode === 'available' && (
          <button
            onClick={onAccept}
            disabled={!!acting}
            className="btn-primary text-xs px-3 py-2 flex-shrink-0"
          >
            {acting === 'accept'
              ? <Loader2 size={13} className="animate-spin" />
              : <CheckCircle size={13} />}
            Accept
          </button>
        )}

        {/* Expand toggle — active/completed tabs */}
        {tabMode !== 'available' && (
          <button
            onClick={onToggle}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1 flex-shrink-0"
          >
            <ChevronDown
              size={18}
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Expanded panel — active tab */}
      {tabMode === 'active' && isExpanded && (
        <div className="mt-4 pt-4 border-t border-surface-border space-y-5 animate-fade-in">

          {/* Single next step */}
          {nextStatus ? (
            <div>
              <p className="label mb-2">Next Step</p>
              <button
                onClick={() => onStatus(nextStatus)}
                disabled={!!acting}
                className="btn-primary text-sm"
              >
                {acting === 'status'
                  ? <Loader2 size={14} className="animate-spin" />
                  : <CheckCircle size={14} />}
                Move to: {nextStatus.replace(/_/g, ' ')}
              </button>
            </div>
          ) : (
            <p className="text-xs text-green-400 flex items-center gap-1.5">
              <CheckCircle size={13} /> This order is complete
            </p>
          )}

          {/* Location update */}
          <div>
            <p className="label mb-2">Send Location</p>
            <div className="flex gap-2 flex-wrap items-end">
              <div className="flex-1 min-w-[100px]">
                <label className="label text-[10px]">Latitude</label>
                <input
                  className="input text-xs"
                  placeholder="28.6139"
                  value={loc.lat}
                  onChange={e => setLoc(f => ({ ...f, lat: e.target.value }))}
                />
              </div>
              <div className="flex-1 min-w-[100px]">
                <label className="label text-[10px]">Longitude</label>
                <input
                  className="input text-xs"
                  placeholder="77.2090"
                  value={loc.lng}
                  onChange={e => setLoc(f => ({ ...f, lng: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={useGPS} className="btn-secondary text-xs px-3 py-2.5">
                  <Navigation size={13} /> GPS
                </button>
                <button
                  onClick={() => onLocation(loc.lat, loc.lng,task.status)}
                  disabled={!!acting || !loc.lat || !loc.lng}
                  className="btn-primary text-xs px-3 py-2.5"
                >
                  {acting === 'location'
                    ? <Loader2 size={13} className="animate-spin" />
                    : null}
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded panel — completed tab */}
      {tabMode === 'completed' && isExpanded && (
        <div className="mt-4 pt-4 border-t border-surface-border animate-fade-in">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-500 mb-0.5">Pickup Zone</p>
              <p className="text-white">{task.pickupZone ?? '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-0.5">Drop Zone</p>
              <p className="text-white">{task.dropZone ?? '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-0.5">Weight</p>
              <p className="text-white">{task.weightKg ? `${task.weightKg} kg` : '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-0.5">Delivery Type</p>
              <p className="text-white">{task.deliveryType ?? '—'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}