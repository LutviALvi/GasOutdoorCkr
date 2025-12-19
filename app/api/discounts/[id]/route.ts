import { NextRequest, NextResponse } from "next/server"
export const dynamic = "force-dynamic"
import { supabaseAdmin } from "@/lib/supabase"

// GET single discount code
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabaseAdmin
      .from("discount_codes")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Discount code not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching discount code:", error)
    return NextResponse.json({ error: "Failed to fetch discount code" }, { status: 500 })
  }
}

// PUT - Update discount code
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from("discount_codes")
      .update({
        code: body.code?.toUpperCase(),
        percentage: body.percentage,
        max_uses: body.maxUses,
        description: body.description,
        valid_from: body.validFrom,
        valid_to: body.validTo,
        is_active: body.isActive,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating discount code:", error)
    return NextResponse.json({ error: "Failed to update discount code" }, { status: 500 })
  }
}

// DELETE discount code
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabaseAdmin
      .from("discount_codes")
      .delete()
      .eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting discount code:", error)
    return NextResponse.json({ error: "Failed to delete discount code" }, { status: 500 })
  }
}
