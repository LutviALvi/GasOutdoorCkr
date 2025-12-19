import { NextRequest, NextResponse } from "next/server"
export const dynamic = "force-dynamic"
import { supabaseAdmin } from "@/lib/supabase"

// GET /api/bookings/search?q=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
        return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 })
    }

    // Search by Order Number OR Phone Number
    const { data: bookings, error } = await supabaseAdmin
      .from("bookings")
      .select(`
        *,
        booking_items (
            *,
            products (
                name,
                image
            )
        )
      `)
      .or(`order_number.eq.${query},customer_phone.eq.${query}`)
      .limit(5)

    if (error) throw error

    return NextResponse.json(bookings)

  } catch (error) {
    console.error("Error searching bookings:", error)
    return NextResponse.json({ error: "Failed to search bookings" }, { status: 500 })
  }
}
