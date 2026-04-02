import React, { useState, useEffect, useRef } from 'react';
import { Loader2, MapPin, Navigation } from 'lucide-react';

// ── Nominatim forward search ──────────────────────────────────────
async function searchAddress(query) {
  if (!query || query.length < 3) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6&countrycodes=in`
    );
    return await res.json();
  } catch {
    return [];
  }
}

// ── PickupAddressInput ────────────────────────────────────────────
// Props:
//   value        – controlled string value (address)
//   onChange     – called with { address, latitude, longitude } when a suggestion is picked
//                  OR a plain synthetic event { target: { name, value } } when user types
//   onPinpoint   – called when the Navigation button is clicked (triggers usePickupLocation)
//   locating     – boolean from usePickupLocation; drives the spinner on the pin button
//   name         – field name (default: 'pickupAddress')
//   label        – label text (default: 'Pickup Address')
//   placeholder
//   required
//   latitude     – current lat (to show the coordinate badge)
//   longitude    – current lng
export default function PickupAddressInput({
  value,
  onChange,
  onPinpoint,
  locating     = false,
  name         = 'pickupAddress',
  label        = 'Pickup Address',
  placeholder  = 'Connaught Place, Delhi',
  required     = false,
  latitude,
  longitude,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen]               = useState(false);
  const [loadingSug, setLoadingSug]   = useState(false);
  const debounceRef                   = useRef(null);
  const wrapperRef                    = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // When the parent fills in the address via pinpoint, close any open suggestions
  useEffect(() => {
    if (locating === false && value) {
      setSuggestions([]);
      setOpen(false);
    }
  }, [locating, value]);

  const handleChange = (e) => {
    // Propagate as a plain event so the parent can update `form.pickupAddress`
    onChange(e);

    const q = e.target.value;
    clearTimeout(debounceRef.current);
    if (q.length < 3) { setSuggestions([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoadingSug(true);
      const results = await searchAddress(q);
      setSuggestions(results);
      setOpen(results.length > 0);
      setLoadingSug(false);
    }, 400); // 400 ms — respects Nominatim 1 req/sec
  };

  const handleSelect = (item) => {
    // Pass rich data up so the parent can also set lat/lng
    onChange({
      target:   { name, value: item.display_name },
      location: { latitude: item.lat, longitude: item.lon },
    });
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="label">
        {label} {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>

      <div className="relative">
        <input
          className="input pr-16"   /* wider right padding to fit both icons */
          name={name}
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          required={required}
        />

        {/* Suggestion loading spinner */}
        {loadingSug && (
          <Loader2
            size={13}
            className="absolute right-9 top-1/2 -translate-y-1/2 animate-spin text-amber-400 pointer-events-none"
          />
        )}

        {/* Pinpoint / live-location button */}
        <button
          type="button"
          onClick={onPinpoint}
          disabled={locating}
          title="Use my current location"
          className={`absolute right-2 top-1/2 -translate-y-1/2
                      w-6 h-6 rounded-md flex items-center justify-center
                      transition-all duration-200
                      ${locating
                        ? 'text-amber-400 animate-pulse-soft'
                        : 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10'}`}
        >
          {locating
            ? <Loader2 size={13} className="animate-spin" />
            : <Navigation size={13} />}
        </button>
      </div>

      {/* Coordinate badge */}
      {latitude && longitude && (
        <p className="text-[10px] text-amber-400 mt-1 font-mono flex items-center gap-1">
          📍 {parseFloat(latitude).toFixed(10)}, {parseFloat(longitude).toFixed(10)}
        </p>
      )}

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 rounded-xl border border-surface-border
                        bg-[#1a1c14] shadow-xl shadow-black/40 overflow-hidden max-h-60 overflow-y-auto">
          {suggestions.map((item) => (
            <li
              key={item.place_id}
              onMouseDown={() => handleSelect(item)}
              className="flex items-start gap-2.5 px-3 py-2.5 cursor-pointer
                         hover:bg-amber-500/10 border-b border-surface-border/40
                         last:border-b-0 transition-colors duration-100"
            >
              <MapPin size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-amber-100/80 leading-relaxed line-clamp-2">
                {item.display_name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
