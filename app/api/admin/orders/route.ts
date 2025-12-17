import { NextRequest, NextResponse } from "next/server"
export const dynamic = "force-dynamic"

import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Mengambil data dari tabel 'bookings'
    // .select() mengambil kolom yang diinginkan dan juga melakukan 'join' ke tabel booking_items & products
    // Ini memungkinkan kita melihat detail barang apa saja yang dipesan dalam satu order
    const { data: bookings, error } = await supabaseAdmin
      .from("bookings")
      .select(`
        *,
        booking_items (
            quantity,
            price_per_trip,
            products (
                name,
                image
            )
        )
      `)
      .order('created_at', { ascending: false }) // Urutkan dari yang terbaru (descending)

    if (error) throw error

    return NextResponse.json(bookings)

  } catch (error) {
    console.error("Error fetching admin orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
