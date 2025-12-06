import { isAfter, isBefore, startOfDay } from "date-fns"

/**
 * Check if a date is Friday (5), Saturday (6), or Sunday (0)
 */
export function isValidBookingDay(date: Date): boolean {
  const day = date.getDay()
  return day === 5 || day === 6 || day === 0 // Friday, Saturday, Sunday
}

/**
 * Get all valid booking days in a date range
 */
export function getValidBookingDays(from: Date, to: Date): Date[] {
  const validDays: Date[] = []
  const current = startOfDay(from)
  const end = startOfDay(to)

  while (isBefore(current, end) || current.getTime() === end.getTime()) {
    if (isValidBookingDay(current)) {
      validDays.push(new Date(current))
    }
    current.setDate(current.getDate() + 1)
  }

  return validDays
}

/**
 * Check if a date range is valid for booking (must contain at least one valid day)
 */
export function isValidBookingRange(from: Date, to: Date): boolean {
  if (!isAfter(to, from)) return false
  const validDays = getValidBookingDays(from, to)
  return validDays.length > 0
}

/**
 * Get booking days count (only Fri/Sat/Sun)
 */
export function getBookingDaysCount(from: Date, to: Date): number {
  return getValidBookingDays(from, to).length
}

/**
 * Get error message for invalid booking
 */
export function getBookingErrorMessage(from: Date, to: Date): string | null {
  if (!isAfter(to, from)) {
    return "Tanggal akhir harus setelah tanggal awal"
  }

  const validDays = getValidBookingDays(from, to)
  if (validDays.length === 0) {
    return "Rentang tanggal harus mencakup minimal satu hari Jumat, Sabtu, atau Minggu"
  }

  return null
}
