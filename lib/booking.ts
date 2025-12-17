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

// CHANGED: Now Async and calls API
export async function createBooking(input: {
  customer: Booking["customer"]
  rentalPeriod: DateRange
  items: BookingItem[]
  discountCode?: string
  discountPercentage?: number
  discountAmount?: number
  paymentMethod?: string
}): Promise<string> { // Returns Promise<string>
  
  const payload = {
    customer: input.customer,
    rentalPeriod: {
        from: input.rentalPeriod.from?.toISOString(),
        to: input.rentalPeriod.to?.toISOString(),
    },
    items: input.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        pricePerTrip: item.pricePerDay // Map internal pricePerDay to API's pricePerTrip
    })),
    discountCode: input.discountCode,
    discountPercentage: input.discountPercentage,
    discountAmount: input.discountAmount, 
    paymentMethod: input.paymentMethod,
    subtotal: input.items.reduce((acc, it) => acc + (it.pricePerDay * it.quantity * 4), 0), // Estimate subtotal if needed, but backend should calc
    total: 0, // Backend or calc below
    days: 4 // Enforce 4 days
  }
  
  // Recalculate strict totals before sending to be safe, or let API handle it. 
  // For now we send what we have.
  const days = input.rentalPeriod?.from && input.rentalPeriod?.to
      ? Math.max(1, Math.floor((+input.rentalPeriod.to - +input.rentalPeriod.from) / (24 * 60 * 60 * 1000)))
      : 4
      
  payload.days = days
  const subtotal = input.items.reduce((acc, it) => acc + it.pricePerDay * it.quantity, 0)
  payload.subtotal = subtotal
  payload.total = subtotal - (input.discountAmount ?? 0)

  const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
  })

  if (!res.ok) {
      throw new Error("Failed to create booking")
  }

  const data = await res.json()
  return data.orderNumber
}

// These functions are likely obsolete with DB, but keeping empty to prevent breakages if imported elsewhere
export function updateBookingPaymentMethod(bookingId: string, paymentMethod: string): void {
  // No-op
}

export function getBookingById(bookingId: string): Booking | null {
  // This would need to be async too if we want to fetch from DB. 
  // For now, returning null to indicate "not found in local cache"
  return null
}
