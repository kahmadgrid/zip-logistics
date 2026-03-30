import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { fmtDate } from '../../utils/constants';

export default function TrackingTimeline({ events = [] }) {
  if (!events.length) {
    return <p className="text-slate-500 text-sm py-4">No tracking events yet.</p>;
  }

  return (
    <ol className="relative space-y-0">
      {events.map((ev, i) => {
        const isLast = i === events.length - 1;
        return (
          <li key={ev.id ?? i} className="flex gap-4">
            {/* line + dot */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${isLast ? 'bg-brand-600 text-white' : 'bg-surface-card border border-surface-border text-slate-500'}`}>
                {isLast ? <CheckCircle2 size={16} /> : <Circle size={12} />}
              </div>
              {!isLast && <div className="w-px flex-1 bg-surface-border mt-1 mb-1 min-h-[24px]" />}
            </div>

            {/* content */}
            <div className={`pb-5 ${isLast ? '' : ''}`}>
              <StatusBadge status={ev.status} />
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Clock size={10} />
                {fmtDate(ev.timestamp ?? ev.createdAt)}
              </p>
              {(ev.latitude && ev.longitude) && (
                <p className="text-xs text-slate-600 mt-0.5 font-mono">
                  {ev.latitude.toFixed(4)}, {ev.longitude.toFixed(4)}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
