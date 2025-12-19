import { NextRequest, NextResponse } from "next/server"
export const dynamic = "force-dynamic"
import { supabaseAdmin } from "@/lib/supabase"

// GET all admin users
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_users")
      .select("id, username, created_at, updated_at")
      .order("created_at", { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return NextResponse.json({ error: "Failed to fetch admin users" }, { status: 500 })
  }
}

// POST - Create new admin user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.username || !body.password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }

    // Check if username already exists
    const { data: existing } = await supabaseAdmin
      .from("admin_users")
      .select("id")
      .eq("username", body.username)
      .single()

    if (existing) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }

    // Tambahkan admin baru ke database
    const { data, error } = await supabaseAdmin
      .from("admin_users")
      .insert({
        username: body.username,
        password_hash: body.password, // Di aplikasi production, ENKRIPSI password ini sekarang!
      })
      .select("id, username, created_at")
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 })
  }
}
