/**
 * Smart Logistics — Client-side Price Estimator
 *
 * No backend pricing API exists yet, so we compute an estimate locally.
 * Replace this entire file once a real /api/pricing endpoint is available.
 *
 * Formula:
 *  base_price          = delivery_type base
 *  weight_charge       = weightKg * rate_per_kg
 *  volumetric_charge   = (L*B*H / 5000) * rate_per_kg   (airline volumetric formula)
 *  chargeable_weight   = max(actual_weight, volumetric_weight)
 *  zone_multiplier     = based on same/adjacent/cross zone
 *  subtotal            = base + chargeable_weight * rate
 *  gst                 = subtotal * 18%
 *  total               = subtotal + gst
 */

const BASE_PRICES = {
  STANDARD: 49,   // ₹49 base
  EXPRESS:  99,   // ₹99 base
};

const RATE_PER_KG = {
  STANDARD: 12,  // ₹12 / kg
  EXPRESS:  20,  // ₹20 / kg
};

// Zone distance tiers
const ZONE_MULTIPLIERS = {
  same:      1.0,   // same zone
  adjacent:  1.4,   // neighbouring zones
  cross:     1.9,   // opposite sides
};

const ZONE_ORDER = [
  'NORTH_ZONE',
  'EAST_ZONE',
  'CENTRAL_ZONE',
  'WEST_ZONE',
  'SOUTH_ZONE',
];

function getZoneTier(pickupZone, dropZone) {
  if (!pickupZone || !dropZone) return 'same';
  if (pickupZone === dropZone) return 'same';
  const pi = ZONE_ORDER.indexOf(pickupZone);
  const di = ZONE_ORDER.indexOf(dropZone);
  const diff = Math.abs(pi - di);
  if (diff <= 1) return 'adjacent';
  return 'cross';
}

/**
 * @param {object} params
 * @param {string} params.deliveryType  'STANDARD' | 'EXPRESS'
 * @param {number} params.weightKg
 * @param {number} params.lengthCm
 * @param {number} params.breadthCm
 * @param {number} params.heightCm
 * @param {string} params.pickupZone
 * @param {string} params.dropZone
 * @returns {object} price breakdown
 */
export function calculatePrice({
  deliveryType = 'STANDARD',
  weightKg     = 0,
  lengthCm     = 0,
  breadthCm    = 0,
  heightCm     = 0,
  pickupZone   = '',
  dropZone     = '',
}) {
  const base          = BASE_PRICES[deliveryType] ?? BASE_PRICES.STANDARD;
  const ratePerKg     = RATE_PER_KG[deliveryType] ?? RATE_PER_KG.STANDARD;

  const volumetricKg  = (lengthCm * breadthCm * heightCm) / 5000;
  const chargeableKg  = Math.max(parseFloat(weightKg) || 0, volumetricKg);

  const tier          = getZoneTier(pickupZone, dropZone);
  const zoneMultiplier = ZONE_MULTIPLIERS[tier];

  const weightCharge  = chargeableKg * ratePerKg * zoneMultiplier;
  const subtotal      = base + weightCharge;
  const gst           = subtotal * 0.18;
  const total         = subtotal + gst;

  return {
    deliveryType,
    base:            round(base),
    volumetricKg:    round(volumetricKg),
    chargeableKg:    round(chargeableKg),
    weightCharge:    round(weightCharge),
    zoneTier:        tier,
    zoneMultiplier,
    subtotal:        round(subtotal),
    gst:             round(gst),
    total:           round(total),
  };
}

function round(n) {
  return Math.round(n * 100) / 100;
}

export function fmt(n) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
