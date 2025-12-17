import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// Validate discount code (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const code = body.code?.toUpperCase().trim()

    if (!code) {
      return NextResponse.json({ 
        valid: false, 
        percentage: 0, 
        message: "Masukkan kode diskon" 
      })
    }

    const { data: discount, error } = await supabaseAdmin
      .from("discount_codes")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .single()

    if (error || !discount) {
      return NextResponse.json({ 
        valid: false, 
        percentage: 0, 
        message: "Kode diskon tidak valid atau sudah tidak aktif" 
      })
    }

    // Check max uses
    if (discount.max_uses && discount.used_count >= discount.max_uses) {
      return NextResponse.json({ 
        valid: false, 
        percentage: 0, 
        message: "Kode diskon sudah mencapai batas penggunaan" 
      })
    }

    // Check validity period
    const now = new Date()
    if (discount.valid_from && new Date(discount.valid_from) > now) {
      return NextResponse.json({ 
        valid: false, 
        percentage: 0, 
        message: "Kode diskon belum aktif" 
      })
    }

    if (discount.valid_to && new Date(discount.valid_to) < now) {
      return NextResponse.json({ 
        valid: false, 
        percentage: 0, 
        message: "Kode diskon sudah expired" 
      })
    }

    return NextResponse.json({ 
      valid: true, 
      percentage: discount.percentage, 
      message: `Diskon ${discount.percentage}% berhasil diterapkan` 
    })

  } catch (error) {
    console.error("Error validating discount code:", error)
    return NextResponse.json({ 
      valid: false, 
      percentage: 0, 
      message: "Gagal memvalidasi kode diskon" 
    })
  }
}
