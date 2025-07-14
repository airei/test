// Helper untuk format currency Indonesia
export function formatCurrency(amount: number | string, currency: string = 'Rp'): string {
  // Pastikan amount adalah number
  let num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : amount;
  if (isNaN(num)) num = 0;

  // Format angka dengan titik sebagai pemisah ribuan
  const formatted = num
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Gabungkan dengan simbol mata uang dan ",-" di akhir
  return `${currency} ${formatted},-`;
}

// Helper tanpa simbol mata uang
export function formatCurrencyWithoutSymbol(amount: number | string): string {
  let num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : amount;
  if (isNaN(num)) num = 0;
  const formatted = num
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted},-`;
} 