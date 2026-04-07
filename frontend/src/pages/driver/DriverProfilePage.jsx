import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, ShieldCheck,
  Loader2, KeyRound, Navigation, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { InputField, SelectField, NumberField } from '../../components/forms/FormFields';
import { driverService } from '../../services/driverService';
import { getMyProfile } from '../../services/UserService';
import { zoneService } from '../../services/zoneService';
import api from '../../services/api';
import { getErrMsg } from '../../utils/constants';

/* ── constants ───────────────────────── */
const VEHICLE_TYPES = ['BIKE', 'SCOOTER', 'MINI_TRUCK', 'TRUCK'];
const AVAILABILITY = ['ONLINE', 'OFFLINE'];

const INIT = {
  vehicleType: '',
  vehicleNumber: '',
  currentZone: '',
  availability: 'ONLINE',
  currentLatitude: '',
  currentLongitude: '',
};

/* ── reusable field ─────────────────── */
function Field({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon size={16} className="text-slate-400" />
      <span className="text-slate-400 text-sm">{label}:</span>
      <span className="text-white text-sm">{value || '—'}</span>
    </div>
  );
}

/* ── main ───────────────────────────── */
export default function DriverProfilePage() {

  const [userProfile, setUserProfile] = useState(null);
  const [form, setForm] = useState(INIT);
  const [zones, setZones] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isExisting, setIsExisting] = useState(false);

  const [pwdMode, setPwdMode] = useState(false);
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  /* ── fetch both profiles ───────────── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);

        // 🔥 Fetch zones from database
        const zonesData = await zoneService.getAllZones();
        setZones(zonesData);

        // 🔥 User profile
        const user = await getMyProfile();
        setUserProfile(user);

        // 🔥 Driver profile
        const driver = await driverService.getMyProfile();

        if (driver) {
          setIsExisting(true);
          setForm({
            vehicleType: driver.vehicleType || '',
            vehicleNumber: driver.vehicleNumber || '',
            currentZone: driver.currentZone || '',
            availability: driver.availability || 'ONLINE',
            currentLatitude: driver.currentLatitude?.toString() || '',
            currentLongitude: driver.currentLongitude?.toString() || '',
          });
        }

      } catch (err) {
        console.error(err);
        toast.error('Failed to load profile');
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, []);

  /* ── form change ───────────────────── */
  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ── gps ───────────────────────────── */
  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm({
          ...form,
          currentLatitude: pos.coords.latitude.toString(),
          currentLongitude: pos.coords.longitude.toString(),
        });
      },
      () => toast.error('Location not available')
    );
  };

  /* ── save driver profile ───────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      await driverService.createOrUpdateProfile({
        ...form,
        currentLatitude: parseFloat(form.currentLatitude),
        currentLongitude: parseFloat(form.currentLongitude),
      });

      toast.success(isExisting ? 'Profile updated!' : 'Profile created!');
      setIsExisting(true);

    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  /* ── change password ───────────────── */
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      await api.patch('/api/auth/password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });

      toast.success('Password updated!');
      setPwdMode(false);
      setPwdForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  /* ── loading state ─────────────────── */
  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-brand-500" />
        </div>
      </DashboardLayout>
    );
  }

  /* ── UI ───────────────────────────── */
  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Driver Profile</h1>
        <p>Manage your account & driver details</p>
      </div>

      <div className="max-w-xl space-y-6">

        {/* 👤 Account Info */}
        <div className="card">
          <h3 className="text-white mb-3">👤 Account Info</h3>

          <Field icon={User} label="Name" value={userProfile?.fullName} />
          <Field icon={Mail} label="Email" value={userProfile?.email} />
          <Field icon={Phone} label="Mobile" value={userProfile?.mobile} />
          <Field icon={ShieldCheck} label="Role" value={userProfile?.role} />
        </div>

        {/* 🔐 Password */}
        <div className="card">
          <div className="flex justify-between">
            <h3 className="text-white">Security</h3>

            {!pwdMode && (
              <button onClick={() => setPwdMode(true)} className="btn-secondary">
                <KeyRound size={14} /> Change Password
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

              <button className="btn-primary">
                {loading ? <Loader2 className="animate-spin" /> : 'Update Password'}
              </button>
            </form>
          )}
        </div>

        {/* 🚚 Driver Profile */}
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="card">
            <h3 className="text-white mb-3">🚚 Driver Info</h3>

            <SelectField name="vehicleType" value={form.vehicleType}
              onChange={onChange} options={VEHICLE_TYPES} label="Vehicle Type" required />

            <InputField name="vehicleNumber" value={form.vehicleNumber}
              onChange={onChange} label="Vehicle Number" required />

            <SelectField name="currentZone" value={form.currentZone}
              onChange={onChange} options={zones} label="Zone" required />
          </div>

          <div className="card">
            <div className="flex justify-between mb-3">
              <h3 className="text-white">📍 Location</h3>
              <button type="button" onClick={useCurrentLocation} className="btn-secondary">
                <Navigation size={14} /> GPS
              </button>
            </div>

            <NumberField name="currentLatitude" value={form.currentLatitude}
              onChange={onChange} label="Latitude" required />

            <NumberField name="currentLongitude" value={form.currentLongitude}
              onChange={onChange} label="Longitude" required />
          </div>

          <button type="submit" className="btn-primary">
            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle />}
            {isExisting ? 'Update Profile' : 'Create Profile'}
          </button>

        </form>
      </div>
    </DashboardLayout>
  );
}