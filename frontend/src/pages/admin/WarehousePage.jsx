import React, { useState, useEffect } from 'react';
import { Warehouse, CheckCircle, Loader2, RefreshCw, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { InputField, SelectField, NumberField } from '../../components/forms/FormFields';
import { adminService } from '../../services/adminService';
import { zoneService } from '../../services/zoneService';
import { getErrMsg } from '../../utils/constants';

const INIT = {
  code: '', name: '', city: '', zone: '',
  latitude: '', longitude: '', capacity: '',
};

export default function WarehousePage() {
  const [form,       setForm]       = useState(INIT);
  const [zones,      setZones]      = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [fetching,   setFetching]   = useState(true);

  const fetchWarehouses = () => {
    setFetching(true);
    adminService.getWarehouses()
      .then(({ data }) => setWarehouses(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setFetching(false));
  };

  const fetchZones = () => {
    zoneService.getAllZones()
      .then((data) => setZones(data))
      .catch(() => toast.error('Failed to fetch zones'));
  };

  useEffect(() => { 
    fetchWarehouses(); 
    fetchZones();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        latitude:  parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        capacity:  parseInt(form.capacity, 10),
      };
      await adminService.createWarehouse(payload);
      toast.success('Warehouse created!');
      setForm(INIT);
      fetchWarehouses();
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Warehouse Management</h1>
        <p>Create and manage warehouse locations</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Create Form ─────────────────────────── */}
        <form onSubmit={handleSubmit} className="w-full lg:w-96 flex-shrink-0 space-y-5">
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Warehouse size={15} className="text-brand-400" /> New Warehouse
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Code" name="code" value={form.code}
                  onChange={onChange} placeholder="WH-N-001" required />
                <InputField label="Name" name="name" value={form.name}
                  onChange={onChange} placeholder="North Warehouse" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="City" name="city" value={form.city}
                  onChange={onChange} placeholder="Delhi" required />
                <SelectField label="Zone" name="zone" value={form.zone}
                  onChange={onChange} options={zones} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <NumberField label="Latitude"  name="latitude"  value={form.latitude}
                  onChange={onChange} placeholder="28.6139" step="any" required />
                <NumberField label="Longitude" name="longitude" value={form.longitude}
                  onChange={onChange} placeholder="77.2090" step="any" required />
              </div>
              <NumberField label="Capacity" name="capacity" value={form.capacity}
                onChange={onChange} placeholder="100" step="1" min="1" required />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            {loading ? 'Creating...' : 'Create Warehouse'}
          </button>
        </form>

        {/* ── Existing Warehouses ──────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">
              Existing Warehouses
              <span className="ml-2 text-xs text-slate-500 font-normal">
                {warehouses.length} total
              </span>
            </h2>
            <button onClick={fetchWarehouses} disabled={fetching} className="btn-secondary text-xs px-3 py-1.5">
              {fetching ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              Refresh
            </button>
          </div>

          {fetching ? (
            <div className="text-slate-500 text-sm py-8 text-center">Loading...</div>
          ) : !warehouses.length ? (
            <div className="card text-center py-10">
              <Warehouse size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No warehouses created yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {warehouses.map((w) => (
                <div key={w.id} className="card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-600/15 text-brand-400
                                      flex items-center justify-center flex-shrink-0">
                        <Warehouse size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-white">{w.name}</p>
                          <span className="font-mono text-[10px] text-slate-500 bg-surface px-1.5 py-0.5 rounded">
                            {w.code}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {w.city} · {w.zone?.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin size={10} /> {w.latitude}, {w.longitude}
                        </p>
                      </div>
                    </div>

                    {/* Capacity bar */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-400 mb-1">
                        {w.currentLoad ?? 0} / {w.capacity}
                      </p>
                      <div className="w-24 h-1.5 bg-surface rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all
                            ${((w.currentLoad ?? 0) / w.capacity) > 0.8 ? 'bg-red-500'
                            : ((w.currentLoad ?? 0) / w.capacity) > 0.5 ? 'bg-amber-500'
                            : 'bg-green-500'}`}
                          style={{ width: `${Math.min(((w.currentLoad ?? 0) / w.capacity) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-600 mt-0.5">capacity</p>
                    </div>
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