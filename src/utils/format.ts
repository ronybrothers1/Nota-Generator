export const formatRp = (n: number) => {
  const rounded = Math.round(n * 100) / 100;
  const [intPart, decPart] = rounded.toFixed(2).split('.');
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return decPart === '00' ? `Rp ${formatted}` : `Rp ${formatted},${decPart}`;
};

export const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
