import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.username || !body.password) {
      return NextResponse.json({ 
        success: false, 
        message: "Username dan password harus diisi" 
      }, { status: 400 })
    }

    // Cek username dan password di database
    const { data: user, error } = await supabaseAdmin
      .from("admin_users")
      .select("id, username")
      .eq("username", body.username)
      .eq("password_hash", body.password) // Di aplikasi rill, password harusnya di-hash (dienkripsi) dulu!
      .single()

    if (error || !user) {
      return NextResponse.json({ 
        success: false, 
        message: "Username atau password salah" 
      }, { status: 401 })
    }

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, username: user.username } 
    })
  } catch (error) {
    console.error("Error logging in:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Gagal login" 
    }, { status: 500 })
  }
}
