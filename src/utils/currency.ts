export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatPrice = (price: number): string => {
  return `${price.toFixed(2)}€`;
};

export const calculateSubtotal = (items: Array<{ price: number; quantity: number }>): number => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

export const calculateDiscount = (items: Array<{ price: number; oldPrice?: number; quantity: number }>): number => {
  return items.reduce((sum, item) => {
    if (item.oldPrice) {
      return sum + ((item.oldPrice - item.price) * item.quantity);
    }
    return sum;
  }, 0);
};

