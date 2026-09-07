export function formatCurrency(amount: number, currency: 'USD' | 'INR' = 'INR'): string {
  const symbol = currency === 'USD' ? '$' : '₹';
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

export function getCurrencySymbol(currency: 'USD' | 'INR' = 'INR'): string {
  return currency === 'USD' ? '$' : '₹';
}

