import React, { useState } from 'react';
import { Zap, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { SelectField } from '../../components/forms/FormFields';
import { adminService } from '../../services/adminService';
import { ZONES, getErrMsg } from '../../utils/constants';

export default function BatchingPage() {
  const [form,    setForm]    = useState({ originZone: '', destinationZone: '' });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const { data } = await adminService.prepareBatches(form.originZone, form.destinationZone);
      setResult(data);
      toast.success('Batching executed successfully!');
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Logistics Batching</h1>
        <p>Trigger route optimization for a zone pair</p>
      </div>

      <div className="max-w-xl space-y-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Prepare Batches</h3>
          </div>
          <p className="text-xs text-slate-500 mb-5">
            This triggers the logistics optimization engine to batch all orders
            between the selected zones and assign them to available drivers.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <SelectField label="Origin Zone" name="originZone" value={form.originZone}
              onChange={onChange} options={ZONES} required />
            <SelectField label="Destination Zone" name="destinationZone" value={form.destinationZone}
              onChange={onChange} options={ZONES} required />

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {loading ? 'Processing...' : 'Prepare Batches'}
            </button>
          </form>
        </div>

        {/* Result */}
        {result !== null && (
          <div className="card border-green-500/30 bg-green-500/5 animate-slide-up">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={16} className="text-green-400" />
              <p className="text-sm font-semibold text-green-300">Batching Complete</p>
            </div>
            <pre className="text-xs text-slate-400 overflow-x-auto whitespace-pre-wrap">
              {typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}
            </pre>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
