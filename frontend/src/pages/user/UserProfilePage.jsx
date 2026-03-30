import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, ShieldCheck, Calendar,
  Loader2, KeyRound,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { getMyProfile } from '../../services/UserService';

/* ── helpers ─────────────────────────────────────── */
function Field({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-surface-border/50 last:border-0">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-brand-600/15 text-brand-400">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-sm text-white mt-0.5 break-all">{value ?? '—'}</p>
      </div>
    </div>
  );
}

const ROLE_META = {
  ROLE_USER:   { label: 'Customer', color: 'bg-brand-600/20 text-brand-300' },
  ROLE_DRIVER: { label: 'Driver', color: 'bg-sky-600/20 text-sky-300' },
  ROLE_ADMIN:  { label: 'Administrator', color: 'bg-purple-600/20 text-purple-300' },
};

export default function UserProfilePage() {
  const { setUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [pwdMode, setPwdMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  /* ── Fetch profile ─────────────────────────────── */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const data = await getMyProfile();

        console.log("PROFILE DATA:", data); // 🔍 debug

        if (!data) throw new Error("No data");

        setProfile(data);
        setUser(data);

      } catch (err) {
        console.error("PROFILE ERROR:", err); // 🔥 debug
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const roleMeta = ROLE_META[profile?.role] ?? ROLE_META.ROLE_USER;

  /* ── Change password ───────────────────────────── */
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      return toast.error('New passwords do not match');
    }

    if (pwdForm.newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }

    try {
      setSaving(true);

      await api.patch('/api/auth/password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });

      toast.success('Password changed successfully!');

      setPwdMode(false);
      setPwdForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

    } catch (err) {
      console.error(err);

      toast.error(
        err?.response?.data ||
        err?.response?.data?.message ||
        "Failed to change password"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading UI ───────────────────────────────── */
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-brand-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>View your account details</p>
      </div>

      <div className="max-w-2xl space-y-5">

        {/* Avatar */}
        <div className="card flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {(profile?.fullName ?? profile?.email ?? 'U')[0].toUpperCase()}
            </span>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              {profile?.fullName ?? profile?.email}
            </h2>

            <p className="text-sm text-slate-400">{profile?.email}</p>
          </div>
        </div>

        {/* Account Details */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-2">Account Details</h3>

          <Field icon={User} label="Full Name" value={profile?.fullName} />
          <Field icon={Mail} label="Email" value={profile?.email} />
          <Field icon={Phone} label="Mobile" value={profile?.mobile} />


          {profile?.createdAt && (
            <Field
              icon={Calendar}
              label="Member Since"
              value={new Date(profile.createdAt).toLocaleDateString('en-IN')}
            />
          )}
        </div>

        {/* Security */}
        <div className="card">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white">Security</h3>

            {!pwdMode && (
              <button onClick={() => setPwdMode(true)} className="btn-secondary text-xs">
                <KeyRound size={12} /> Change Password
              </button>
            )}
          </div>

          {pwdMode && (
            <form onSubmit={handleChangePassword} className="space-y-3 mt-3">
              <input
                type="password"
                placeholder="Current Password"
                className="input"
                value={pwdForm.currentPassword}
                onChange={(e) =>
                  setPwdForm({ ...pwdForm, currentPassword: e.target.value })
                }
              />

              <input
                type="password"
                placeholder="New Password"
                className="input"
                value={pwdForm.newPassword}
                onChange={(e) =>
                  setPwdForm({ ...pwdForm, newPassword: e.target.value })
                }
              />

              <input
                type="password"
                placeholder="Confirm Password"
                className="input"
                value={pwdForm.confirmPassword}
                onChange={(e) =>
                  setPwdForm({ ...pwdForm, confirmPassword: e.target.value })
                }
              />

              <button type="submit" disabled={saving} className="btn-primary text-sm">
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <KeyRound size={14} />
                )}
                {saving ? 'Saving...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}