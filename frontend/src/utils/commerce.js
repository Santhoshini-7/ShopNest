export const CURRENCY = '₹';
export const FREE_DELIVERY_THRESHOLD = 1000;
export const DELIVERY_CHARGE = 50;
export const RETURN_WINDOW_DAYS = 30;

export const money = (value) =>
  `${CURRENCY}${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (value, withTime = false) => {
  if (!value) return '—';
  const options = withTime
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' };
  return new Date(value).toLocaleString('en-IN', options);
};

export const statusLabel = (status) => ({
  PLACED: 'Placed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURN_REQUESTED: 'Return requested',
  RETURNED: 'Returned',
}[status] || status);

export const statusClass = (status) => ({
  PLACED: 'bg-amber-100 text-amber-800',
  SHIPPED: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  RETURN_REQUESTED: 'bg-orange-100 text-orange-800',
  RETURNED: 'bg-purple-100 text-purple-800',
}[status] || 'bg-gray-100 text-gray-700');
