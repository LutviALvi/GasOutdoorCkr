import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { sendInvoiceEmail } from "@/lib/email"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      order_id,
      transaction_status,
      fraud_status,
      payment_type,
      gross_amount,
    } = body

    console.log("Midtrans Webhook:", { order_id, transaction_status, payment_type })

    // Find booking
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
      .eq('id', order_id)
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    let paymentStatus = "pending"
    let bookingStatus = booking.booking_status // snake_case

    // Handle status transaksi dari Midtrans
    // capture/settlement = Pembayaran BERHASIL
    if (transaction_status === "capture" || transaction_status === "settlement") {
      if (fraud_status === "accept" || !fraud_status) {
        paymentStatus = "paid" // Status bayar: Lunas
        bookingStatus = "active" // Status sewa: Aktif (Siap diambil/dikirim)

        // Kirim email invoice ke pelanggan secara otomatis
        if (booking.customer_email) {
          await sendInvoiceEmail({
            bookingId: booking.id,
            customerName: booking.customer_name,
            customerEmail: booking.customer_email,
            items: booking.booking_items.map((item: any) => ({
              name: item.products?.name || "Product",
              quantity: item.quantity,
              price: item.price_per_trip * item.quantity,
            })),
            subtotal: booking.subtotal,
            taxAmount: Math.round(booking.subtotal * 0.11), // Asumsi pajak 11% jika ada logikanya
            total: booking.total,
            rentalPeriod: {
              from: format(new Date(booking.start_date), "d MMMM yyyy", { locale: localeID }),
              to: format(new Date(booking.end_date), "d MMMM yyyy", { locale: localeID }),
            },
            paymentMethod: payment_type || "E-Wallet/QRIS",
          })
        }
      }
    } else if (transaction_status === "pending") {
      paymentStatus = "pending"
    } else if (
      transaction_status === "deny" || // Ditolak
      transaction_status === "cancel" || // Dibatalkan User
      transaction_status === "expire" // Kadaluarsa (telat bayar)
    ) {
      paymentStatus = "failed"
    }

    // Update booking
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        payment_status: paymentStatus,
        booking_status: bookingStatus,
        payment_method: payment_type || booking.payment_method,
      })
      .eq('id', order_id)
    
    if (updateError) {
        console.error("Error updating booking status:", updateError)
        return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
