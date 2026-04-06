import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Loader2, CheckCircle, MapPin, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { SelectField, NumberField } from '../../components/forms/FormFields';
import PriceBreakdown from '../../components/common/PriceBreakdown';
import { bookingService } from '../../services/bookingService';
import { DELIVERY_TYPES, getErrMsg } from '../../utils/constants';
import { usePickupLocation } from './usePickupLocation';
import DropAddressInput from './DropAddressInput';
import PickupAddressInput from './PickupAddressInput';
import { zoneService } from '../../services/zoneService';

const INIT = {
  deliveryType:    'STANDARD',
  pickupAddress:   '', dropAddress:    '',
  pickupZone:      '', dropZone:       '',
  pickupLatitude:  '', pickupLongitude: '',
  dropLatitude:    '', dropLongitude:   '',
  receiverName:    '', receiverMobile: '',
  weightKg:        '', lengthCm:       '',
  breadthCm:       '', heightCm:       '',
};

export default function CreateBookingPage() {
  const navigate                        = useNavigate();
  const [form, setForm]                 = useState(INIT);
  const [loading, setLoading]           = useState(false);
  const [distance, setDistance]         = useState(null);
  const [price, setPrice]               = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [weatherInfo, setWeatherInfo]     = useState(null);
  const [detectedPickupZone, setDetectedPickupZone] = useState('');
  const [detectedDropZone, setDetectedDropZone] = useState('');
  const [zoneLoading, setZoneLoading] = useState(false);
  const [vehicle, setVehicle] = useState(null);

  // ── Pickup live location ──────────────────────────────────────
  const { locating, getLocation } = usePickupLocation();

  const handlePickupLocation = async () => {
    try {
      const { address, latitude, longitude } = await getLocation();
      setForm(f => ({
        ...f,
        pickupAddress:   address,
        pickupLatitude:  latitude,
        pickupLongitude: longitude,
      }));
    } catch {
      // toast already shown inside the hook
    }
  };

  // ── Generic field change ──────────────────────────────────────
  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // ── Pickup address change — handles both typed input and suggestion selection ──
  // When a suggestion is selected, PickupAddressInput attaches e.location = { latitude, longitude }
  const onPickupChange = (e) => {
    const next = { ...form, pickupAddress: e.target.value };
    if (e.location) {
      next.pickupLatitude  = e.location.latitude;
      next.pickupLongitude = e.location.longitude;
    } else {
      // User typed manually — clear stale coordinates so price uses address string only
      next.pickupLatitude  = '';
      next.pickupLongitude = '';
    }
    setForm(next);
  };

  // ── Drop address change ──
  const onDropChange = (e) => {
    const next = { ...form, dropAddress: e.target.value };
    if (e.location) {
      next.dropLatitude  = e.location.latitude;
      next.dropLongitude = e.location.longitude;
      // Auto-detect zone from coordinates when address is selected

    } else {
      // User typed manually — clear stale coordinates
      next.dropLatitude  = '';
      next.dropLongitude = '';
      // No automatic zone detection on typing - user must click detection button
    }
    setForm(next);
  };

  // ── Manual zone detection functions ───────────────────────────
  const handlePickupZoneDetection = async () => {
    if (!form.pickupAddress) {
      toast.error('Please enter pickup address first');
      return;
    }
    await detectPickupZone(form.pickupAddress, form.pickupLatitude, form.pickupLongitude);
  };

  const handleDropZoneDetection = async () => {
    if (!form.dropAddress) {
      toast.error('Please enter drop address first');
      return;
    }
    await detectDropZone(form.dropAddress, form.dropLatitude, form.dropLongitude);
  };

  // ── Zone detection functions ──
  const detectPickupZone = async (address, latitude, longitude) => {
    if (!address && (latitude == null || longitude == null)) return;

    setZoneLoading(true);
    try {
      const zone = await zoneService.detectZone(address, latitude, longitude);
      setDetectedPickupZone(zone);
      setForm(f => ({ ...f, pickupZone: zone }));

      // Show error if not serviceable
      if (zone === 'NOT_SERVICEABLE') {
        toast.error('Pickup location is not serviceable. Please check if the address falls within our service areas.');
      }
    } catch (err) {
      console.error('Pickup zone detection failed:', err);
      setDetectedPickupZone('NOT_SERVICEABLE');
      setForm(f => ({ ...f, pickupZone: 'NOT_SERVICEABLE' }));
      toast.error('Pickup location is not serviceable. Please check if the address falls within our service areas.');
    } finally {
      setZoneLoading(false);
    }
  };

  const detectDropZone = async (address, latitude, longitude) => {
    if (!address && (latitude == null || longitude == null)) return;

    setZoneLoading(true);
    try {
      const zone = await zoneService.detectZone(address, latitude, longitude);
      setDetectedDropZone(zone);
      setForm(f => ({ ...f, dropZone: zone }));

      // Show error if not serviceable
      if (zone === 'NOT_SERVICEABLE') {
        toast.error('Drop location is not serviceable. Please check if the address falls within our service areas.');
      }
    } catch (err) {
      console.error('Drop zone detection failed:', err);
      setDetectedDropZone('NOT_SERVICEABLE');
      setForm(f => ({ ...f, dropZone: 'NOT_SERVICEABLE' }));
      toast.error('Drop location is not serviceable. Please check if the address falls within our service areas.');
    } finally {
      setZoneLoading(false);
    }
  };

  // ── Price estimation ──────────────────────────────────────────
  const priceReady = !!(
    form.weightKg && form.lengthCm && form.breadthCm &&
    form.heightCm && form.pickupAddress && form.dropAddress &&
    detectedPickupZone && detectedDropZone &&
    detectedPickupZone !== 'NOT_SERVICEABLE' &&
    detectedDropZone !== 'NOT_SERVICEABLE'
  );

  useEffect(() => {
    const fetchPrice = async () => {
      if (!priceReady) return;
      setPriceLoading(true);
      try {
        const payload = {
          deliveryType:    form.deliveryType,
          weightKg:        parseFloat(form.weightKg),
          lengthCm:        parseFloat(form.lengthCm),
          breadthCm:       parseFloat(form.breadthCm),
          heightCm:        parseFloat(form.heightCm),
          pickupAddress:   form.pickupAddress,
          dropAddress:     form.dropAddress,
          pickupZone:      form.pickupZone,
          dropZone:        form.dropZone,
          receiverName:    form.receiverName,
          receiverMobile:   form.receiverMobile,
          pickupLatitude:  form.pickupLatitude  ? parseFloat(form.pickupLatitude)  : undefined,
          pickupLongitude: form.pickupLongitude ? parseFloat(form.pickupLongitude) : undefined,
          dropLatitude:    form.dropLatitude    ? parseFloat(form.dropLatitude)    : undefined,
          dropLongitude:   form.dropLongitude   ? parseFloat(form.dropLongitude)   : undefined,
        };
        const { data } = await bookingService.estimatePrice(payload);
        setPrice(data.price);
        setDistance(data.distanceKm);
        setVehicle(data.vehicle);
        // Store weather information for display
        if (data.weatherCondition) {
          setWeatherInfo({
            condition: data.weatherCondition,
            description: data.weatherDescription,
            surcharge: data.weatherSurcharge
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setPriceLoading(false);
      }
    };
    fetchPrice();
  }, [
    form.deliveryType, form.weightKg, form.lengthCm, form.breadthCm,
    form.heightCm, form.pickupAddress, form.dropAddress,
    form.pickupLatitude, form.pickupLongitude,
    form.dropLatitude, form.dropLongitude,
  ]);



  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if zones are serviceable before submission
    if (detectedPickupZone === 'NOT_SERVICEABLE' || detectedDropZone === 'NOT_SERVICEABLE') {
      toast.error('Please enter serviceable pickup and drop locations.');
      return;
    }

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
        dropLatitude:    form.dropLatitude    ? parseFloat(form.dropLatitude)    : undefined,
        dropLongitude:   form.dropLongitude   ? parseFloat(form.dropLongitude)   : undefined,
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
              <Package size={15} className="text-amber-400" /> Delivery Type
            </h3>
            <div className="flex gap-3">
              {DELIVERY_TYPES.map((dt) => (
                <button
                  key={dt} type="button"
                  onClick={() => setForm(f => ({ ...f, deliveryType: dt }))}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all text-left
                    ${form.deliveryType === dt
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                      : 'border-surface-border text-stone-400 hover:border-stone-500'}`}
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

              <div className="grid grid-cols-2 gap-4">

                {/* Pickup address — autocomplete suggestions + pinpoint button */}
                <PickupAddressInput
                  value={form.pickupAddress}
                  onChange={onPickupChange}
                  onPinpoint={handlePickupLocation}
                  locating={locating}
                  latitude={form.pickupLatitude}
                  longitude={form.pickupLongitude}
                  required
                />

                {/* Drop address — uses DropAddressInput component */}
                <DropAddressInput
                  value={form.dropAddress}
                  onChange={onDropChange}
                />

              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Pickup Zone </label>
                  <div className="flex gap-2">
                    <div className={`flex-1 input flex items-center gap-2 ${
                      detectedPickupZone === 'NOT_SERVICEABLE'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-surface-border/20 text-green-300'
                    }`}>
                      {zoneLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <MapPin size={14} />
                      )}
                      {detectedPickupZone === 'NOT_SERVICEABLE'
                        ? 'Not Serviceable'
                        : (detectedPickupZone || 'Enter pickup address...')
                      }
                    </div>
                    <button
                      type="button"
                      onClick={handlePickupZoneDetection}
                      className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg border border-blue-500/30 transition-colors flex items-center gap-1"
                      title="Detect Zone"
                    >
                      <Search size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Drop Zone </label>
                  <div className="flex gap-2">
                    <div className={`flex-1 input flex items-center gap-2 ${
                      detectedDropZone === 'NOT_SERVICEABLE'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-surface-border/20 text-green-300'
                    }`}>
                      {zoneLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <MapPin size={14} />
                      )}
                      {detectedDropZone === 'NOT_SERVICEABLE'
                        ? 'Not Serviceable'
                        : (detectedDropZone || 'Enter drop address...')
                      }
                    </div>
                    <button
                      type="button"
                      onClick={handleDropZoneDetection}
                      className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg border border-blue-500/30 transition-colors flex items-center gap-1"
                      title="Detect Zone"
                    >
                      <Search size={14} />
                    </button>
                  </div>
                </div>
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
            <p className="text-xs text-stone-500 mb-4">
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
            vehicle={vehicle}
            isReady={priceReady}
            loading={priceLoading}
            weatherInfo={weatherInfo}
          />

          <div className="card text-xs text-stone-500 space-y-1.5">
            <p className="font-semibold text-stone-400 text-[11px] uppercase tracking-wider mb-2">
              Pricing Guide
            </p>
            <p>📦 Standard: ₹49 base + ₹12/kg + ₹5/km</p>
            <p>⚡ Express: ₹99 base + ₹20/kg + ₹8/km</p>
            <p>📐 Volumetric: L×B×H ÷ 5000</p>
            <p>🧾 GST 18% included in total</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
