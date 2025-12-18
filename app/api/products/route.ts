import { NextRequest, NextResponse } from "next/server"
export const dynamic = "force-dynamic"
import { supabaseAdmin } from "@/lib/supabase"

// GET all products with optional availability check
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // 1. Get base products
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    // 2. Ambil rating/review produk
    const { data: reviews } = await supabaseAdmin
      .from("reviews")
      .select("product_id, rating")

    // 3. Hitung ketersediaan stok (Availability) jika tanggal dipilih
    let bookedQuantities: Record<string, number> = {}
    
    if (startDate && endDate) {
        // Cari booking lain yang tanggalnya bertabrakan (overlap)
        const { data: bookings } = await supabaseAdmin
            .from('bookings')
            .select('id')
            // Status yang 'memakan' stok: pending (belum bayar tapi sudah book), confirmed, active
            // Kita keluarkan 'cancelled' dan 'completed' (asumsi completed = barang sudah kembali)
            .in('booking_status', ['pending', 'confirmed', 'active']) 
            .lte('start_date', endDate)
            .gte('end_date', startDate)

        if (bookings && bookings.length > 0) {
            const bookingIds = bookings.map(b => b.id)
            
            const { data: items } = await supabaseAdmin
                .from('booking_items')
                .select('product_id, quantity')
                .in('booking_id', bookingIds)
            
            if (items) {
                items.forEach(item => {
                    bookedQuantities[item.product_id] = (bookedQuantities[item.product_id] || 0) + item.quantity
                })
            }
        }
    }

    // 4. Transform and Merge
    const productsWithData = products?.map((product) => {
      // Ratings
      const productReviews = reviews?.filter((r) => r.product_id === product.id) || []
      const avgRating =
        productReviews.length > 0
          ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
          : 0
      
      // Stock
      const booked = bookedQuantities[product.id] || 0
      const availableStock = Math.max(0, product.stock - booked)

      return {
        ...product,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: productReviews.length,
        stock: startDate && endDate ? availableStock : product.stock, // Gunakan stok tersedia jika tanggal dipilih
        originalStock: product.stock // Simpan stok asli untuk referensi
      }
    })

    return NextResponse.json(productsWithData)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

// POST - Create new product (Unchanged)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({
        slug: body.slug,
        name: body.name,
        category: body.category,
        price_per_day: body.pricePerDay,
        price_per_trip: body.pricePerTrip,
        stock: body.stock,
        image: body.image,
        description: body.description,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
