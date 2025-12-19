import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

// GET all reviews (optionally filtered by productId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    // Query ke tabel 'reviews' di Supabase
    let query = supabaseAdmin
      .from("reviews")
      .select(`
        *,
        products:product_id (name, slug) // Join ke tabel products untuk ambil nama produk
      `)
      .order("created_at", { ascending: false })

    // Filter berdasarkan productId jika ada parameter di URL
    if (productId) {
      query = query.eq("product_id", productId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

// POST - Create new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validasi rating harus 1-5
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("reviews")
      .insert({
        product_id: body.productId,
        customer_name: body.customerName,
        rating: body.rating,
        comment: body.comment || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}
