import React from 'react';
import { Receipt, Info, Loader2 } from 'lucide-react';

export default function PriceBreakdown({ price, distance, isReady, loading }) {



  if (loading) {
    return (
      <div className="card flex items-center gap-2 text-slate-500 text-sm">
        <Loader2 size={14} className="animate-spin" />
        Calculating price...
      </div>
    );
  }

  if (!isReady || !price) {
    return (
      <div className="card border-dashed border-surface-border bg-surface/50">
        <div className="flex items-center gap-2 text-slate-600 text-xs">
          Fill all details to see estimate
        </div>
      </div>
    );
  }

  return (
    <div className="card border-brand-500/20 bg-brand-900/10 animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <Receipt size={15} className="text-brand-400" />
        <h3 className="text-sm font-semibold text-white">
          Price Estimate
        </h3>
      </div>

      {distance && (
        <div className="text-xs text-brand-400 mb-2">
          🚚 Distance: {distance.toFixed(2)} km
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Total</span>
        <span className="text-xl font-bold text-brand-300">
          ₹{price.toFixed(2)}
        </span>
      </div>

      <p className="text-[10px] text-slate-600 mt-3">
        Includes distance, weight, and GST.
      </p>
    </div>
  );
}