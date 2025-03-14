import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// utils/currency.ts
export const formatCurrencyFromCents = (amountInCents: number) => {
  const amount = amountInCents / 100;
  
  return new Intl.NumberFormat('en-KE', {  // Use 'en-KE' for Kenyan formatting
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};