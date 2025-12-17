import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Fungsi helper untuk menggabungkan class CSS (Tailwind)
// clsx: untuk logika kondisional (misal: isError ? 'red' : 'green')
// twMerge: untuk mengatasi konflik class Tailwind (misal: 'px-2' ditimpa 'px-4')
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
