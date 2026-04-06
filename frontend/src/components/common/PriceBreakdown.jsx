import React from 'react';
import { Receipt, Info, Loader2, Cloud, AlertTriangle } from 'lucide-react';

export default function PriceBreakdown({ price, distance, isReady, loading, weatherInfo, vehicle }) {



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

      {/* Weather Information */}
      {weatherInfo && (
        <div className="mb-3 p-2 bg-slate-100 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Cloud size={16} className="text-slate-600" />
            <span className="text-sm font-semibold text-slate-700">
              Weather Conditions
            </span>
          </div>
          <div className="space-y-1 text-xs text-slate-600">
            <p className="flex items-center gap-2">
              <span className="font-medium">Condition:</span>
              <span className="capitalize">{weatherInfo.condition}</span>
              {weatherInfo.surcharge > 0 && (
                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                  +₹{weatherInfo.surcharge.toFixed(2)}
                </span>
              )}
            </p>
            <p>
              <span className="font-medium">Description:</span>
              {weatherInfo.description}
            </p>
            {weatherInfo.surcharge > 0 && (
              <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                <p className="flex items-center gap-2 text-orange-700 text-xs font-medium">
                  <AlertTriangle size={12} />
                  Weather surcharge applied due to current conditions
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Total</span>
        <span className="text-xl font-bold text-brand-300">
          ₹{price.toFixed(2)}
        </span>
      </div>

      {vehicle && (
        <div className="text-xs text-amber-400 mb-2">
          🚚 Vehicle: {vehicle.replace('_', ' ')}
        </div>
      )}

      <p className="text-[10px] text-slate-600 mt-3">
        Includes distance, weight, GST{weatherInfo?.surcharge > 0 ? ', and weather adjustments' : ''}.
      </p>
    </div>
  );
}