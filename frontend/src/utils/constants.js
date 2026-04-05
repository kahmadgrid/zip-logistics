export const STATUS_LABELS = {
  PENDING:                   'Pending',
  CREATED:                   'Created',
  DRIVER_ASSIGNED:           'Driver Assigned',
  ASSIGNED:                  'Assigned',
  ACCEPTED:                  'Accepted',
  AT_ORIGIN_WAREHOUSE:       'At Origin Warehouse',
  IN_TRANSIT:                'In Transit',
  AT_DESTINATION_WAREHOUSE:  'At Destination Warehouse',
  DELIVERED:                 'Delivered',
  CANCELLED:                 'Cancelled',
};

export const STATUS_COLORS = {
  PENDING:                   'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  CREATED:                   'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  DRIVER_ASSIGNED:           'text-blue-400 bg-blue-400/10 border-blue-400/30',
  ASSIGNED:                  'text-blue-400 bg-blue-400/10 border-blue-400/30',
  ACCEPTED:                  'text-indigo-400 bg-indigo-400/10 border-indigo-400/30',
  AT_ORIGIN_WAREHOUSE:       'text-orange-400 bg-orange-400/10 border-orange-400/30',
  IN_TRANSIT:                'text-sky-400 bg-sky-400/10 border-sky-400/30',
  AT_DESTINATION_WAREHOUSE:  'text-teal-400 bg-teal-400/10 border-teal-400/30',
  DELIVERED:                 'text-green-400 bg-green-400/10 border-green-400/30',
  CANCELLED:                 'text-red-400 bg-red-400/10 border-red-400/30',
};

export const AVAILABILITY_COLORS = {
  ONLINE:  'text-green-400 bg-green-400/10 border-green-400/30',
  OFFLINE: 'text-slate-400 bg-slate-400/10 border-slate-400/30',
};

export const ZONES = ['BANGALORE_ZONE', 'CHENNAI_ZONE', 'MUMBAI_ZONE', 'DELHI_ZONE', 'KOLKATA_ZONE'];

export const ROLES = ['ROLE_USER', 'ROLE_DRIVER', 'ROLE_ADMIN'];

export const DELIVERY_TYPES = ['STANDARD', 'EXPRESS'];

export const DRIVER_STATUS_FLOW = [
  'DRIVER_ASSIGNED',
  'AT_ORIGIN_WAREHOUSE',
  'IN_TRANSIT',
  'AT_DESTINATION_WAREHOUSE',
  'DELIVERED',
];

export const ACTIVE_STATUSES = [
  'DRIVER_ASSIGNED',
  'ACCEPTED',
  'AT_ORIGIN_WAREHOUSE',
  'IN_TRANSIT',
  'AT_DESTINATION_WAREHOUSE',
];

export const COMPLETE_STATUSES = ['DELIVERED', 'CANCELLED'];

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