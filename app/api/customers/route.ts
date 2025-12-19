import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

// GET customer history (aggregated data)
export async function GET() {
  try {
    // Get all bookings with items
    const { data: bookings, error } = await supabaseAdmin
      .from("bookings")
      .select(`
        *,
        booking_items (
          *,
          products:product_id (name)
        )
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Aggregate by customer phone
    const customerMap = new Map<
      string,
      {
        phone: string
        name: string
        email: string | null
        totalBookings: number
        totalSpent: number
        lastBooking: string
        bookings: typeof bookings
      }
    >()

    for (const booking of bookings || []) {
      const existing = customerMap.get(booking.customer_phone)
      if (existing) {
        existing.totalBookings += 1
        existing.totalSpent += booking.total
        existing.bookings.push(booking)
        if (new Date(booking.created_at) > new Date(existing.lastBooking)) {
          existing.lastBooking = booking.created_at
          existing.name = booking.customer_name
        }
      } else {
        customerMap.set(booking.customer_phone, {
          phone: booking.customer_phone,
          name: booking.customer_name,
          email: booking.customer_email,
          totalBookings: 1,
          totalSpent: booking.total,
          lastBooking: booking.created_at,
          bookings: [booking],
        })
      }
    }

    const customers = Array.from(customerMap.values())
      .sort((a, b) => new Date(b.lastBooking).getTime() - new Date(a.lastBooking).getTime())

    return NextResponse.json(customers)
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}
