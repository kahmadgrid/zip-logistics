import React from 'react';

export function InputField({ label, name, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      <input
        className="input"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

export function SelectField({ label, name, value, onChange, options, required }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      <select
        className="input"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
      >
        <option value="">Select {label}</option>
        {options.map((opt) => {
          const val   = typeof opt === 'object' ? opt.value : opt;
          const label = typeof opt === 'object' ? opt.label : opt;
          return <option key={val} value={val}>{label}</option>;
        })}
      </select>
    </div>
  );
}

export function NumberField({ label, name, value, onChange, placeholder, min, step = '0.01', required }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      <input
        className="input"
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        step={step}
        required={required}
      />
    </div>
  );
}
