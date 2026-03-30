
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { getErrMsg } from '../../utils/constants';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ emailOrMobile: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // 🔥 Redirect if already logged in
  useEffect(() => {
    if (user) {
      const dashMap = {
        ROLE_ADMIN:  '/admin/dashboard',
        ROLE_DRIVER: '/driver/dashboard',
        ROLE_USER:   '/user/dashboard',
      };

      navigate(dashMap[user.role] ?? '/user/dashboard');
    }
  }, [user, navigate]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.login(form);

      login(data.token, { email: form.emailOrMobile, role: data.role, ...data });

      toast.success('Welcome back!');

      const dashMap = {
        ROLE_ADMIN:  '/admin/dashboard',
        ROLE_DRIVER: '/driver/dashboard',
        ROLE_USER:   '/user/dashboard',
      };

      navigate(dashMap[data.role] ?? '/user/dashboard');

    } catch (err) {
      console.log("LOGIN ERROR:", err);
      console.log("ERROR DATA:", err.response?.data);

      const msg = getErrMsg(err);
      toast.error(msg || "Login failed");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[600px] bg-brand-700/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center mb-3 shadow-lg shadow-brand-600/30">
            <MapPin size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white font-display">SmartLogix</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email or Mobile</label>
              <input
                className="input"
                name="emailOrMobile"
                value={form.emailOrMobile}
                onChange={onChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  onClick={() => setShowPwd(!showPwd)}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

