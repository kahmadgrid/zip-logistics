import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Edit2, Trash2, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { zoneManagementService } from '../../services/zoneManagementService';

export default function ZoneManagementPage() {
  const navigate = useNavigate();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    zoneCode: '',
    zoneName: '',
    centerLatitude: '',
    centerLongitude: '',
    radiusKm: ''
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const data = await zoneManagementService.getAllZones();
      setZones(data);
    } catch (err) {
      toast.error('Failed to fetch zones');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await zoneManagementService.createZone({
        ...formData,
        centerLatitude: parseFloat(formData.centerLatitude),
        centerLongitude: parseFloat(formData.centerLongitude),
        radiusKm: parseFloat(formData.radiusKm)
      });
      toast.success('Zone created successfully!');
      setShowCreateForm(false);
      setFormData({
        zoneCode: '',
        zoneName: '',
        centerLatitude: '',
        centerLongitude: '',
        radiusKm: ''
      });
      fetchZones();
    } catch (err) {
      toast.error('Failed to create zone');
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  return (
    <DashboardLayout role="admin">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Zone Management</h1>
            <p className="text-stone-400">Create and manage service zones with coverage areas</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Create Zone
          </button>
        </div>

        {/* Create Zone Form */}
        {showCreateForm && (
          <div className="card mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Zone</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Zone Code <span className="text-red-400 ml-0.5">*</span></label>
                  <input
                    className="input"
                    name="zoneCode"
                    value={formData.zoneCode}
                    onChange={onChange}
                    placeholder="e.g., BANGALORE_ZONE"
                    required
                  />
                </div>
                <div>
                  <label className="label">Zone Name <span className="text-red-400 ml-0.5">*</span></label>
                  <input
                    className="input"
                    name="zoneName"
                    value={formData.zoneName}
                    onChange={onChange}
                    placeholder="e.g., Bangalore Service Area"
                    required
                  />
                </div>
                <div>
                  <label className="label">Center Latitude <span className="text-red-400 ml-0.5">*</span></label>
                  <input
                    className="input"
                    name="centerLatitude"
                    value={formData.centerLatitude}
                    onChange={onChange}
                    placeholder="e.g., 12.9716"
                    type="number"
                    step="any"
                    required
                  />
                </div>
                <div>
                  <label className="label">Center Longitude <span className="text-red-400 ml-0.5">*</span></label>
                  <input
                    className="input"
                    name="centerLongitude"
                    value={formData.centerLongitude}
                    onChange={onChange}
                    placeholder="e.g., 77.5946"
                    type="number"
                    step="any"
                    required
                  />
                </div>
                <div>
                  <label className="label">Radius (km) <span className="text-red-400 ml-0.5">*</span></label>
                  <input
                    className="input"
                    name="radiusKm"
                    value={formData.radiusKm}
                    onChange={onChange}
                    placeholder="e.g., 25.0"
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {loading ? 'Creating...' : 'Create Zone'}
                </button>
                <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Zones List */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Active Zones</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-stone-400" />
            </div>
          ) : zones.length === 0 ? (
            <div className="text-center py-8 text-stone-400">
              No zones created yet. Create your first zone to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {zones.map((zone) => (
                <div key={zone.id} className="flex items-center justify-between p-4 bg-surface-border/10 rounded-lg border border-surface-border/20">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin size={20} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{zone.zoneName}</h4>
                      <p className="text-sm text-stone-400">Code: {zone.zoneCode}</p>
                      <p className="text-xs text-stone-500">
                        Center: ({zone.centerLatitude}, {zone.centerLongitude}) • Radius: {zone.radiusKm}km
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      zone.active 
                        ? 'bg-green-400/20 text-green-300 border border-green-400/30'
                        : 'bg-red-400/20 text-red-300 border border-red-400/30'
                    }`}>
                      {zone.active ? 'Active' : 'Inactive'}
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
