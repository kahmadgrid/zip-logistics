import React, { useState, useEffect, useRef } from 'react';
import { Loader2, MapPin } from 'lucide-react';

// ── Nominatim address search ──────────────────────────────────────
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

// ── DropAddressInput ──────────────────────────────────────────────
// Props:
//   value      – controlled string value
//   onChange   – receives a synthetic { target: { name, value } } event
//   name       – field name (default: 'dropAddress')
//   label      – label text (default: 'Drop Address')
//   placeholder
//   required
export default function DropAddressInput({
  value,
  onChange,
  name        = 'dropAddress',
  label       = 'Drop Address',
  placeholder = 'MG Road, Bengaluru',
  required    = false,
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

  const handleChange = (e) => {
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
    }, 400); // 400ms debounce — respects Nominatim's 1 req/sec rate limit
  };

  const handleSelect = (item) => {
    onChange({ target: { name, value: item.display_name } });
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
          className="input pr-8"
          name={name}
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          required={required}
        />
        {loadingSug && (
          <Loader2
            size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-amber-400"
          />
        )}
      </div>

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
