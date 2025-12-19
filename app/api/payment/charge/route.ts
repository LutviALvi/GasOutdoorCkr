import { NextRequest, NextResponse } from "next/server"
import { createTransaction } from "@/lib/midtrans"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId } = body

    // Get booking from database
    // Menggunakan Supabase query dengan join ke booking_items dan products
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        booking_items (
          product_id,
          quantity,
          price_per_trip,
          products (
            name
          )
        )
      `)
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Prepare items for Midtrans
    // Map data dari format Supabase (snake_case) ke format Midtrans
    const items = booking.booking_items.map((item: any) => ({
      id: item.product_id,
      price: item.price_per_trip,
      quantity: item.quantity,
      name: item.products?.name || "Product",
    }))

    // Create Midtrans transaction
    const result = await createTransaction({
      orderId: booking.id,
      grossAmount: booking.subtotal, // Pastikan di DB kolomnya 'subtotal'
      customer: {
        first_name: booking.customer_name, // snake_case dari DB
        email: booking.customer_email || "",
        phone: booking.customer_phone,
      },
      items,
    })

    // Update booking with snap token
    await supabaseAdmin
      .from('bookings')
      .update({
        snap_token: result.token, // pastikan kolom 'snap_token' ada di DB
      })
      .eq('id', bookingId)

    return NextResponse.json({
      token: result.token,
      redirectUrl: result.redirectUrl,
      subtotal: result.subtotal,
      taxAmount: result.taxAmount,
      totalAmount: result.totalAmount,
    })
  } catch (error) {
    console.error("Payment creation error:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
