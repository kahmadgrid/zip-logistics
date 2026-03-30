import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { getErrMsg } from '../../utils/constants';

const ROLES = [
  { value: 'ROLE_USER',   label: 'Customer' },
  { value: 'ROLE_DRIVER', label: 'Driver'   },
  { value: 'ROLE_ADMIN',  label: 'Admin'    },
];

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({
    fullName: '', email: '', mobile: '', password: '', role: 'ROLE_USER',
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.register(form);
      login(data.token, { email: form.email, role: form.role, ...data });
      toast.success('Account created!');
      const dashMap = {
        ROLE_ADMIN:  '/admin/dashboard',
        ROLE_DRIVER: '/driver/dashboard',
        ROLE_USER:   '/user/dashboard',
      };
      navigate(dashMap[form.role] ?? '/user/dashboard');
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[600px] bg-brand-700/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center mb-3 shadow-lg shadow-brand-600/30">
            <MapPin size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white font-display">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Join SmartLogix today</p>
        </div>

        <div className="card">
          {/* Role selector tabs */}
          <div className="flex gap-1 p-1 bg-surface rounded-lg mb-5">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm({ ...form, role: r.value })}
                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition-all
                  ${form.role === r.value
                    ? 'bg-brand-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'}`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" name="fullName" value={form.fullName}
                onChange={onChange} placeholder="John Doe" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" name="email" value={form.email}
                onChange={onChange} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="label">Mobile</label>
              <input className="input" name="mobile" value={form.mobile}
                onChange={onChange} placeholder="9876543210" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" name="password" value={form.password}
                onChange={onChange} placeholder="Min 8 chars" required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
