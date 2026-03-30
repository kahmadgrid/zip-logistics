import { useState } from 'react';
import toast from 'react-hot-toast';

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

// ── usePickupLocation ─────────────────────────────────────────────
// Returns { locating, getLocation }
// Call getLocation() → resolves with { address, latitude, longitude }
// or shows a toast and rejects on error.
export function usePickupLocation() {
  const [locating, setLocating] = useState(false);

  const getLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        toast.error('Geolocation not supported');
        return reject(new Error('Geolocation not supported'));
      }

      setLocating(true);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          try {
            const address = await reverseGeocode(lat, lng);
            toast.success('Pickup location detected!');
            resolve({ address, latitude: lat.toString(), longitude: lng.toString() });
          } catch {
            toast.error('Could not get address');
            reject(new Error('Reverse geocode failed'));
          } finally {
            setLocating(false);
          }
        },
        () => {
          toast.error('Could not access location. Check browser permissions.');
          setLocating(false);
          reject(new Error('Geolocation denied'));
        },
        { enableHighAccuracy: true }
      );
    });

  return { locating, getLocation };
}