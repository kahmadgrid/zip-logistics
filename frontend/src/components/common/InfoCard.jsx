import React from 'react';

export default function InfoCard({ label, value, icon: Icon, accent = 'blue', sub }) {
  const accents = {
    blue:   'from-blue-600/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    green:  'from-green-600/20 to-green-600/5 border-green-500/30 text-green-400',
    orange: 'from-orange-600/20 to-orange-600/5 border-orange-500/30 text-orange-400',
    purple: 'from-purple-600/20 to-purple-600/5 border-purple-500/30 text-purple-400',
    sky:    'from-sky-600/20 to-sky-600/5 border-sky-500/30 text-sky-400',
  };
  const cls = accents[accent] ?? accents.blue;

  return (
    <div className={`card bg-gradient-to-br ${cls} animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value ?? '—'}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg bg-current/10`}>
            <Icon size={20} className="opacity-80" />
          </div>
        )}
      </div>
    </div>
  );
}
