import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

// GET single product by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get reviews for this product
    const { data: reviews } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .eq("product_id", params.id)
      .order("created_at", { ascending: false })

    const avgRating =
      reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

    return NextResponse.json({
      ...product,
      reviews: reviews || [],
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews?.length || 0,
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

// PUT - Update product
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from("products")
      .update({
        slug: body.slug,
        name: body.name,
        category: body.category,
        price_per_day: body.pricePerDay,
        price_per_trip: body.pricePerTrip,
        stock: body.stock,
        image: body.image,
        description: body.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

// DELETE product
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
