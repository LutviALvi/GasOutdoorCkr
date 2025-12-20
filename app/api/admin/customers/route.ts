import { NextRequest, NextResponse } from "next/server"
export const dynamic = "force-dynamic"
export const revalidate = 0
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  try {
    const { data: bookings, error } = await supabaseAdmin
      .from("bookings")
      .select(`
        *,
        booking_items (
          *,
          products (
            name
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Kumpulkan data pelanggan dari tabel 'bookings'
    // Karena kita tidak punya tabel khusus 'customers', kita ambil data unik dari riwayat pesanan
    // Pelanggan diidentifikasi unik berdasarkan nomor HP
    const customerMap = new Map()

    bookings.forEach(booking => {
        const phone = booking.customer_phone
        if (!phone) return

        if (!customerMap.has(phone)) {
            customerMap.set(phone, {
                phone,
                name: booking.customer_name,
                email: booking.customer_email,
                totalBookings: 0,
                totalSpent: 0,
                lastBooking: booking.created_at,
                bookings: []
            })
        }

        // Buat atau ambil data pelanggan dari Map
        const customer = customerMap.get(phone)
        customer.totalBookings += 1 // Tambah jumlah pesanan
        
        // Hanya hitung total uang jika pesanan TIDAK dibatalkan
        if (booking.booking_status !== 'cancelled' && booking.booking_status !== 'dibatalkan') {
             customer.totalSpent += (booking.total || 0)
        }
        
        // Perbarui nama pelanggan jika ada yang baru (siapa tahu dia ganti nama di order terakhir)
        if (booking.customer_name) customer.name = booking.customer_name
        
        // Catat tanggal peminjaman terakhir
        if (new Date(booking.created_at) > new Date(customer.lastBooking)) {
            customer.lastBooking = booking.created_at
        }

        customer.bookings.push(booking)
    })

    // Ubah Map menjadi Array agar bisa dikirim sebagai JSON
    // Urutkan berdasarkan total belanjaan terbanyak (Sultan di paling atas)
    const customers = Array.from(customerMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent)

    return NextResponse.json(customers)

  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}
