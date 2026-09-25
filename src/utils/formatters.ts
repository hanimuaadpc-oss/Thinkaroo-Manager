/**
 * Formatting helpers for Thinkaroo ERP
 */

export const formatCurrency = (amount: number, symbol = '₹'): string => {
  return `${symbol}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatMovementType = (type: string): { label: string; color: string } => {
  switch (type) {
    case 'OWN_PURCHASE':
      return { label: 'Own Purchase', color: 'blue' };
    case 'COMMISSION_PURCHASE':
      return { label: 'Commission In', color: 'purple' };
    case 'SALE':
      return { label: 'Sale', color: 'green' };
    case 'RETURN':
      return { label: 'Return', color: 'orange' };
    case 'WASTAGE':
      return { label: 'Wastage', color: 'red' };
    case 'MANUAL_ADJUSTMENT':
      return { label: 'Adjustment', color: 'gray' };
    default:
      return { label: type, color: 'gray' };
  }
};
