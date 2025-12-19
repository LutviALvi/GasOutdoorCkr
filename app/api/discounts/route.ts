import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

// GET all discount codes
export async function GET() {
  try {
    // Ambil semua daftar kode diskon dari database
    const { data, error } = await supabaseAdmin
      .from("discount_codes")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching discount codes:", error)
    return NextResponse.json({ error: "Failed to fetch discount codes" }, { status: 500 })
  }
}

// POST - Create new discount code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Buat kode diskon baru
    const { data, error } = await supabaseAdmin
      .from("discount_codes")
      .insert({
        code: body.code.toUpperCase(), // Pastikan kode selalu huruf besar
        percentage: body.percentage, // Besar diskon dalam persen
        max_uses: body.maxUses || null, // Batas maksimal pemakaian (opsional)
        used_count: 0,
        description: body.description,
        valid_from: body.validFrom || null,
        valid_to: body.validTo || null,
        is_active: body.isActive ?? true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating discount code:", error)
    return NextResponse.json({ error: "Failed to create discount code" }, { status: 500 })
  }
}
