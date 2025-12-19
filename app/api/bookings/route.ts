import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { format } from "date-fns"

// POST - Create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 1. Buat Nomor Order Unik (Generated)
    const date = new Date()
    const month = format(date, "MM")
    const year = format(date, "yy")
    // Angka acak 3 digit agar order number tidak kembar
    const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const orderNumber = `GAS-${month}${year}-${randomPart}`

    // 2. Insert into bookings
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert({
        order_number: orderNumber,
        customer_name: body.customer.name,
        customer_phone: body.customer.phone,
        customer_email: body.customer.email,
        customer_address: body.customer.address,
        customer_identity: body.customer.identityNumber,
        start_date: body.rentalPeriod.from,
        end_date: body.rentalPeriod.to,
        total_days: body.days, // Should be 4
        subtotal: body.subtotal,
        discount_code: body.discountCode,
        discount_amount: body.discountAmount || 0,
        total: body.total,
        notes: body.customer.note,
        booking_status: 'pending' // Default status
      })
      .select()
      .single()

    if (bookingError) throw bookingError

    // 3. Insert booking items
    const itemsToInsert = body.items.map((item: any) => ({
      booking_id: booking.id,
      product_id: item.productId,
      quantity: item.quantity,
      price_per_trip: item.pricePerTrip
    }))

    const { error: itemsError } = await supabaseAdmin
      .from("booking_items")
      .insert(itemsToInsert)

    if (itemsError) throw itemsError

    // Perbarui halaman admin agar data baru langsung muncul (Revalidate Cache)
    revalidatePath('/admin/orders')
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/reports')
    revalidatePath('/admin/customers')
    revalidatePath('/admin/stock-summary')

    // 4. Update Discount Code Usage
    if (body.discountCode) {
      const { data: discount } = await supabaseAdmin
        .from('discount_codes')
        .select('id, used_count')
        .eq('code', body.discountCode)
        .single()
      
      if (discount) {
        await supabaseAdmin
          .from('discount_codes')
          .update({ used_count: (discount.used_count || 0) + 1 })
          .eq('id', discount.id)
      }
    }

    // 4. Return success
    return NextResponse.json({ 
        bookingId: booking.id, 
        orderNumber: booking.order_number 
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
