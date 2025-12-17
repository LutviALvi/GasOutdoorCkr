import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// GET single booking
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select(`
        *,
        booking_items (
          *,
          products:product_id (*)
        )
      `)
      .eq("id", params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
  }
}

// PUT - Update booking status
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    // Filter out undefined values to avoid overwriting with null if only one is updated
    const updates: any = {
        updated_at: new Date().toISOString(),
    }
    if (body.paymentStatus) updates.payment_status = body.paymentStatus
    if (body.bookingStatus) updates.booking_status = body.bookingStatus
    if (body.snapToken) updates.snap_token = body.snapToken

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}

// DELETE - Delete booking
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabaseAdmin
      .from("bookings")
      .delete()
      .eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ message: "Booking deleted" })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 })
  }
}
