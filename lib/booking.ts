import type { DateRange } from "react-day-picker"

export type BookingItem = {
  productId: string
  quantity: number
  pricePerDay: number
}

export type Booking = {
  id: string
  customer: {
    name: string
    phone: string
    email?: string
    address?: string
    identityNumber?: string
    note?: string
  }
  rentalPeriod: {
    from: string
    to: string
  }
  items: BookingItem[]
  total: number
  discountCode?: string
  discountPercentage?: number
  discountAmount?: number
  subtotal?: number
  paymentMethod?: string
  createdAt: string
}

function generateId() {
  const d = new Date()
  const month = (d.getMonth() + 1).toString().padStart(2, "0")
  const year = d.getFullYear().toString().slice(-2)

  // Get existing bookings to determine sequence number
  const raw = localStorage.getItem("gasoutdoor_bookings")
  let sequence = 1

  if (raw) {
    try {
      const bookings = JSON.parse(raw) as Booking[]
      // Filter bookings from same month/year and get highest sequence
      const prefix = `GAS-${month}-${year}-`
      const sameMonthBookings = bookings.filter((b) => b.id.startsWith(prefix))
      if (sameMonthBookings.length > 0) {
        const sequences = sameMonthBookings.map((b) => {
          const parts = b.id.split("-")
          return Number.parseInt(parts[3] || "0", 10)
        })
        sequence = Math.max(...sequences) + 1
      }
    } catch {
      sequence = 1
    }
  }

  const seqStr = sequence.toString().padStart(3, "0")
  return `GAS-${month}-${year}-${seqStr}`
}

export function createBooking(input: {
  customer: Booking["customer"]
  rentalPeriod: DateRange
  items: BookingItem[]
  discountCode?: string
  discountPercentage?: number
  discountAmount?: number
  paymentMethod?: string
}): string {
  const id = generateId()
  const from = input.rentalPeriod?.from ? input.rentalPeriod.from.toISOString() : ""
  const to = input.rentalPeriod?.to ? input.rentalPeriod.to.toISOString() : ""
  const days =
    input.rentalPeriod?.from && input.rentalPeriod?.to
      ? Math.max(1, Math.floor((+input.rentalPeriod.to - +input.rentalPeriod.from) / (24 * 60 * 60 * 1000)))
      : 1
  const subtotal = input.items.reduce((acc, it) => acc + it.pricePerDay * it.quantity * days, 0)
  const discountAmount = input.discountAmount ?? 0
  const total = subtotal - discountAmount

  const booking: Booking = {
    id,
    customer: input.customer,
    rentalPeriod: { from, to },
    items: input.items,
    total,
    subtotal,
    discountCode: input.discountCode,
    discountPercentage: input.discountPercentage,
    discountAmount,
    paymentMethod: input.paymentMethod,
    createdAt: new Date().toISOString(),
  }

  const raw = localStorage.getItem("gasoutdoor_bookings")
  const list: Booking[] = raw
    ? (() => {
        try {
          return JSON.parse(raw) as Booking[]
        } catch {
          return []
        }
      })()
    : []
  list.unshift(booking)
  localStorage.setItem("gasoutdoor_bookings", JSON.stringify(list))

  return id
}

export function updateBookingPaymentMethod(bookingId: string, paymentMethod: string): void {
  const raw = localStorage.getItem("gasoutdoor_bookings")
  if (!raw) return

  try {
    const bookings = JSON.parse(raw) as Booking[]
    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, paymentMethod } : b))
    localStorage.setItem("gasoutdoor_bookings", JSON.stringify(updated))
  } catch {
    // Silently fail
  }
}

export function getBookingById(bookingId: string): Booking | null {
  const raw = localStorage.getItem("gasoutdoor_bookings")
  if (!raw) return null

  try {
    const bookings = JSON.parse(raw) as Booking[]
    return bookings.find((b) => b.id === bookingId) || null
  } catch {
    return null
  }
}
