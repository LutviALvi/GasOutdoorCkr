import { NextRequest, NextResponse } from "next/server"
export const dynamic = "force-dynamic"
export const revalidate = 0
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  try {
    // 1. Get Booking Stats
    // Total Revenue (Completed & Active bookings potentially)
    // Active Orders
    // Total Orders
    
    // Kita bisa melakukan beberapa query ke database secara bersamaan (parallel) untuk performa lebih cepat
    // ordersRes: Mengambil data peminjaman (bookings)
    // productsRes: Mengambil data produk untuk cek stok
    const [ordersRes, productsRes] = await Promise.all([
        supabaseAdmin.from("bookings").select("id, total, booking_status, created_at"),
        supabaseAdmin.from("products").select("id, stock, name")
    ]);

    if (ordersRes.error) throw ordersRes.error;
    if (productsRes.error) throw productsRes.error;

    const bookings = ordersRes.data || [];
    const products = productsRes.data || [];

    // Hitung Metrik/Statistik
    const totalOrders = bookings.length; // Total semua pesanan yang pernah masuk
    // Pesanan Aktif: yang statusnya 'active' (sedang dipinjam) atau 'confirmed' (siap diambil)
    const activeOrders = bookings.filter(b => b.booking_status === 'active' || b.booking_status === 'confirmed').length;
    const totalRevenue = bookings
        // Kita hanya menghitung pesanan yang TIDAK dibatalkan sebagai pendapatan
        // 'filter' ini membuang status cancelled
        .filter(b => b.booking_status !== 'cancelled')
        // 'reduce' menjumlahkan total harga (b.total) dari semua pesanan yang tersisa
        .reduce((sum, b) => sum + (b.total || 0), 0);
    
    // Produk Stok Rendah: Produk yang stoknya kurang dari 3
    // Ini berguna untuk notifikasi ke admin agar segera restock
    const lowStockProducts = products.filter(p => p.stock < 3).length;

    // Recent Orders (last 5)
    // We already have all bookings, just slice. Or fetch specifically if list is huge.
    // For now, sorting in JS is fine for small scale, but better to query.
    // We'll return simple stats here, separate API for list.

    return NextResponse.json({
        totalRevenue,
        activeOrders,
        totalOrders,
        lowStockProducts,
        totalProducts: products.length
    });

  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
