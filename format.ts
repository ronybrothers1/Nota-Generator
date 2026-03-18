/**
 * Format a number as Indonesian Rupiah.
 * Examples: 150000 → "Rp 150.000"  |  150000.50 → "Rp 150.000,50"
 */
export const formatRp = (n: number): string => {
  if (!isFinite(n)) return 'Rp 0';
  const rounded = Math.round(n * 100) / 100;
  // Use Intl for reliable formatting
  const parts = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rounded);
  return `Rp ${parts}`;
};

/**
 * Format an ISO date string (YYYY-MM-DD) to a long Indonesian date.
 * Example: "2025-03-18" → "18 Maret 2025"
 */
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  // Use local date constructor to avoid UTC timezone shift
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
