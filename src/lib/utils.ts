import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string): string {
  // Garantir que é número
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Validar que é um número válido
  if (isNaN(numValue)) {
    return 'R$ 0,00';
  }

  return numValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
