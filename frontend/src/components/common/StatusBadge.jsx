import React from 'react';
import { STATUS_LABELS, STATUS_COLORS, AVAILABILITY_COLORS } from '../../utils/constants';

export default function StatusBadge({ status, type = 'order' }) {
  const label  = STATUS_LABELS[status] ?? status ?? '—';
  const colors = type === 'availability'
    ? AVAILABILITY_COLORS[status] ?? 'text-slate-400 bg-slate-400/10 border-slate-400/30'
    : STATUS_COLORS[status]       ?? 'text-slate-400 bg-slate-400/10 border-slate-400/30';

  return (
    <span className={`badge border ${colors}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}
