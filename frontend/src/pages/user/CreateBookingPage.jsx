import React, { useState, useMemo,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Loader2, CheckCircle, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { SelectField, NumberField } from '../../components/forms/FormFields';
import PriceBreakdown from '../../components/common/PriceBreakdown';
import { bookingService } from '../../services/bookingService';
import { ZONES, DELIVERY_TYPES, getErrMsg } from '../../utils/constants';
import { calculatePrice } from '../../utils/priceCalculator';

const INIT = {
  deliveryType:   'STANDARD',
  pickupAddress:  '', dropAddress:    '',
  pickupZone:     '', dropZone:       '',
  pickupLatitude: '', pickupLongitude: '',
  receiverName:   '', receiverMobile: '',
  weightKg:       '', lengthCm:       '',
  breadthCm:      '', heightCm:       '',
};

// ── Reverse geocode lat/lng → address string ──────────────────────
async function reverseGeocode(lat, lng) {
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();
    return data.display_name ?? `${lat.toFixed(10)}, ${lng.toFixed(10)}`;
  } catch {
    return `${lat.toFixed(10)}, ${lng.toFixed(10)}`;
  }
}

export default function CreateBookingPage() {
  const navigate               = useNavigate();
  const [form, setForm]        = useState(INIT);
  const [loading, setLoading]  = useState(false);
  const [locating, setLocating] = useState(false);

  const [distance, setDistance] = useState(null);

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // ── Get live location for pickup ─────────────────────────────
  const handlePickupLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const address = await reverseGeocode(lat, lng);
          setForm(f => ({
            ...f,
            pickupAddress:   address,
            pickupLatitude:  lat.toString(),
            pickupLongitude: lng.toString(),
          }));
          toast.success('Pickup location detected!');
        } catch {
          toast.error('Could not get address');
        } finally {
          setLocating(false);
        }
      },
      () => {
        toast.error('Could not access location. Check browser permissions.');
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const [price, setPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  useEffect(() => {
    const fetchPrice = async () => {
      if (!priceReady) return;

      setPriceLoading(true);
      try {
        const payload = {
          deliveryType: form.deliveryType,
          weightKg: parseFloat(form.weightKg),
          lengthCm: parseFloat(form.lengthCm),
          breadthCm: parseFloat(form.breadthCm),
          heightCm: parseFloat(form.heightCm),
          pickupAddress: form.pickupAddress,
          dropAddress: form.dropAddress,
          pickupLatitude: form.pickupLatitude
            ? parseFloat(form.pickupLatitude)
            : undefined,
          pickupLongitude: form.pickupLongitude
            ? parseFloat(form.pickupLongitude)
            : undefined,
        };

        const { data } = await bookingService.estimatePrice(payload);

        setPrice(data.price);
        setDistance(data.distanceKm);
      } catch (err) {
        console.error(err);
      } finally {
        setPriceLoading(false);
      }
    };

    fetchPrice();
  }, [
    form.deliveryType,
    form.weightKg,
    form.lengthCm,
    form.breadthCm,
    form.heightCm,
    form.pickupAddress,
    form.dropAddress,
    form.pickupLatitude,
    form.pickupLongitude,
  ]);
const priceReady = !!(
  form.weightKg &&
  form.lengthCm &&
  form.breadthCm &&
  form.heightCm &&
  form.pickupAddress &&
  form.dropAddress
);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        weightKg:        parseFloat(form.weightKg),
        lengthCm:        parseFloat(form.lengthCm),
        breadthCm:       parseFloat(form.breadthCm),
        heightCm:        parseFloat(form.heightCm),
        pickupLatitude:  form.pickupLatitude  ? parseFloat(form.pickupLatitude)  : undefined,
        pickupLongitude: form.pickupLongitude ? parseFloat(form.pickupLongitude) : undefined,
      };
      await bookingService.create(payload);
      toast.success('Booking created successfully!');
      navigate('/user/bookings');
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Create Booking</h1>
        <p>Fill in the details to schedule a new delivery</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Left: Form ─────────────────────────────── */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-5 min-w-0">

          {/* Delivery Type */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Package size={15} className="text-brand-400" /> Delivery Type
            </h3>
            <div className="flex gap-3">
              {DELIVERY_TYPES.map((dt) => (
                <button
                  key={dt} type="button"
                  onClick={() => setForm(f => ({ ...f, deliveryType: dt }))}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all text-left
                    ${form.deliveryType === dt
                      ? 'bg-brand-600/20 border-brand-500 text-brand-300'
                      : 'border-surface-border text-slate-400 hover:border-slate-500'}`}
                >
                  {dt === 'EXPRESS' ? '⚡ EXPRESS' : '📦 STANDARD'}
                  <p className="text-[11px] font-normal mt-0.5 opacity-70">
                    {dt === 'EXPRESS' ? 'Faster delivery · ₹99 base + ₹20/kg' : 'Economy rate · ₹49 base + ₹12/kg'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Addresses */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-4">📍 Pickup & Drop</h3>
            <div className="space-y-4">

              {/* Pickup address with live location button */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    Pickup Address <span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className="input pr-10"
                      name="pickupAddress"
                      value={form.pickupAddress}
                      onChange={onChange}
                      placeholder="Connaught Place, Delhi"
                      required
                    />
                    <button
                      type="button"
                      onClick={handlePickupLocation}
                      disabled={locating}
                      title="Use my current location"
                      className={`absolute right-2 top-1/2 -translate-y-1/2
                                  w-6 h-6 rounded-md flex items-center justify-center
                                  transition-all duration-200
                                  ${locating
                                    ? 'text-brand-400 animate-pulse-soft'
                                    : 'text-slate-500 hover:text-brand-400 hover:bg-brand-500/10'}`}
                    >
                      {locating
                        ? <Loader2 size={13} className="animate-spin" />
                        : <Navigation size={13} />}
                    </button>
                  </div>
                  {/* Show lat/lng if captured */}
                  {form.pickupLatitude && form.pickupLongitude && (
                    <p className="text-[10px] text-brand-400 mt-1 font-mono flex items-center gap-1">
                      📍 {parseFloat(form.pickupLatitude).toFixed(5)}, {parseFloat(form.pickupLongitude).toFixed(5)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">
                    Drop Address <span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <input
                    className="input"
                    name="dropAddress"
                    value={form.dropAddress}
                    onChange={onChange}
                    placeholder="MG Road, Bengaluru"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Pickup Zone" name="pickupZone" value={form.pickupZone}
                  onChange={onChange} options={ZONES} required />
                <SelectField label="Drop Zone" name="dropZone" value={form.dropZone}
                  onChange={onChange} options={ZONES} required />
              </div>
            </div>
          </div>

          {/* Receiver */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-4">👤 Receiver Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Receiver Name <span className="text-red-400 ml-0.5">*</span></label>
                <input className="input" name="receiverName" value={form.receiverName}
                  onChange={onChange} placeholder="John Doe" required />
              </div>
              <div>
                <label className="label">Receiver Mobile <span className="text-red-400 ml-0.5">*</span></label>
                <input className="input" name="receiverMobile" value={form.receiverMobile}
                  onChange={onChange} placeholder="9876543210" required />
              </div>
            </div>
          </div>

          {/* Package Dimensions */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-1">📐 Package Details</h3>
            <p className="text-xs text-slate-500 mb-4">
              Chargeable weight = max(actual, volumetric). Volumetric = L × B × H ÷ 5000.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <NumberField label="Weight (kg)"  name="weightKg"  value={form.weightKg}
                onChange={onChange} placeholder="12.5" min="0" required />
              <NumberField label="Length (cm)"  name="lengthCm"  value={form.lengthCm}
                onChange={onChange} placeholder="40"   min="0" required />
              <NumberField label="Breadth (cm)" name="breadthCm" value={form.breadthCm}
                onChange={onChange} placeholder="25"   min="0" required />
              <NumberField label="Height (cm)"  name="heightCm"  value={form.heightCm}
                onChange={onChange} placeholder="20"   min="0" required />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {loading ? 'Creating...' : 'Confirm Booking'}
            </button>
            <button type="button" onClick={() => navigate('/user/bookings')} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>

        {/* ── Right: Price Panel ──────────────────────── */}
        <div className="w-full lg:w-72 lg:sticky lg:top-6 space-y-3 flex-shrink-0">
          <PriceBreakdown
            price={price}
            distance={distance}
            isReady={priceReady}
            loading={priceLoading}
          />

          <div className="card text-xs text-slate-500 space-y-1.5">
            <p className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider mb-2">
              Pricing Guide
            </p>
            <p>📦 Standard: ₹49 base + ₹12/kg</p>
            <p>⚡ Express: ₹99 base + ₹20/kg</p>
            <p>📦 Standard: ₹49 base + ₹12/kg + ₹5/km</p>
            <p>⚡ Express: ₹99 base + ₹20/kg + ₹8/km</p>
            <p>📐 Volumetric: L×B×H ÷ 5000</p>
            <p>🧾 GST 18% included  </p>
            <p>📐 Volumetric: L×B×H ÷ 5000</p>
            <p>🧾 GST 18% included in total</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}