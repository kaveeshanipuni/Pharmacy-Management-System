export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';
    case 'Pending':
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20';
    case 'Cancelled':
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/20';
  }
};
