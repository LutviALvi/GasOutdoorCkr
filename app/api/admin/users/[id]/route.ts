import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// PUT - Update admin user
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (body.username) updateData.username = body.username
    if (body.password) updateData.password_hash = body.password // In production, hash this!

    const { data, error } = await supabaseAdmin
      .from("admin_users")
      .update(updateData)
      .eq("id", params.id)
      .select("id, username, created_at, updated_at")
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating admin user:", error)
    return NextResponse.json({ error: "Failed to update admin user" }, { status: 500 })
  }
}

// DELETE admin user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Prevent deleting the last admin
    const { count } = await supabaseAdmin
      .from("admin_users")
      .select("*", { count: "exact", head: true })

    if (count && count <= 1) {
      return NextResponse.json({ error: "Cannot delete the last admin user" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("admin_users")
      .delete()
      .eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting admin user:", error)
    return NextResponse.json({ error: "Failed to delete admin user" }, { status: 500 })
  }
}
