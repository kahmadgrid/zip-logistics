export const STATUS_LABELS = {
  CREATED:           'Created',
    DRIVER_ASSIGNED:   'Driver Assigned',
    PICKED_UP:         'Picked Up',
    IN_TRANSIT:        'In Transit',
    OUT_FOR_DELIVERY:  'Out for Delivery',
    DELIVERED:         'Delivered',
    FAILED:            'Failed',
};

export const STATUS_COLORS = {
  CREATED:           'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    DRIVER_ASSIGNED:   'text-blue-400 bg-blue-400/10 border-blue-400/30',
    PICKED_UP:         'text-indigo-400 bg-indigo-400/10 border-indigo-400/30',
    IN_TRANSIT:        'text-sky-400 bg-sky-400/10 border-sky-400/30',
    OUT_FOR_DELIVERY:  'text-purple-400 bg-purple-400/10 border-purple-400/30',
    DELIVERED:         'text-green-400 bg-green-400/10 border-green-400/30',
    FAILED:            'text-red-400 bg-red-400/10 border-red-400/30',
  };

export const AVAILABILITY_COLORS = {
  ONLINE:  'text-green-400 bg-green-400/10 border-green-400/30',
  OFFLINE: 'text-slate-400 bg-slate-400/10 border-slate-400/30',
};

export const ZONES = ['NORTH_ZONE', 'SOUTH_ZONE', 'EAST_ZONE', 'WEST_ZONE', 'CENTRAL_ZONE'];

export const ROLES = ['ROLE_USER', 'ROLE_DRIVER', 'ROLE_ADMIN'];

export const DELIVERY_TYPES = ['STANDARD', 'EXPRESS'];

export const DRIVER_STATUS_FLOW = [
  'DRIVER_ASSIGNED',
    'PICKED_UP',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
];

export const ACTIVE_STATUSES = [
  'DRIVER_ASSIGNED',
  'PICKED_UP',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
];

export const COMPLETE_STATUSES = ['DELIVERED', 'FAILED'];

export const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const getErrMsg = (err) =>
  err?.response?.data?.message ||
  err?.response?.data?.error   ||
  err?.message                 ||
  'Something went wrong';