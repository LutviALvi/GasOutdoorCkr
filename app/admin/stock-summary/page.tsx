"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { PRODUCTS } from "@/lib/products"
import type { Product } from "@/lib/products"
import type { Booking } from "@/lib/booking"
import { Button } from "@/components/ui/button"
import { AlertCircle, LogOut, Calendar, Search } from "lucide-react"

export default function StockSummaryPage() {
  const router = useRouter()
  const { logout } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")

  useEffect(() => {
    const stored = localStorage.getItem("gasoutdoor_products")
    if (stored) {
      try {
        setProducts(JSON.parse(stored))
      } catch {
        setProducts(PRODUCTS)
      }
    } else {
      setProducts(PRODUCTS)
    }

    const bookingsRaw = localStorage.getItem("gasoutdoor_bookings")
    if (bookingsRaw) {
      try {
        setBookings(JSON.parse(bookingsRaw))
      } catch {
        setBookings([])
      }
    }

    const today = new Date()
    const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    setDateFrom(today.toISOString().split("T")[0])
    setDateTo(sevenDaysLater.toISOString().split("T")[0])
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }

  const getUsedStock = (productId: string): number => {
    if (!dateFrom || !dateTo) return 0

    const fromDate = new Date(dateFrom)
    const toDate = new Date(dateTo)

    return bookings.reduce((total, booking) => {
      const bookingFrom = new Date(booking.rentalPeriod.from)
      const bookingTo = new Date(booking.rentalPeriod.to)

      if (bookingFrom <= toDate && bookingTo >= fromDate) {
        const item = booking.items.find((it) => it.productId === productId)
        return total + (item?.quantity || 0)
      }
      return total
    }, 0)
  }

  const lowStockProducts = products.filter((p) => p.stock < 5)
  const outOfStockProducts = products.filter((p) => p.stock === 0)
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const totalUsedStock = products.reduce((sum, p) => sum + getUsedStock(p.id), 0)
  const totalRemainingStock = totalStock - totalUsedStock

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <section className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Summary Stock Barang</h1>
          <p className="text-muted-foreground">Ringkasan stok semua produk</p>
        </div>
        <Button onClick={handleLogout} variant="destructive" className="gap-2 text-white">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="mb-8 rounded-lg border bg-white p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Cari Produk</label>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Nama atau kategori produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Tanggal Mulai</label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Tanggal Akhir</label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-8">
        <div className="rounded-lg border bg-gradient-to-br from-teal-50 to-teal-100 p-4">
          <div className="text-xs md:text-sm text-muted-foreground">Total Stock</div>
          <div className="text-2xl md:text-3xl font-bold text-teal-700">{totalStock}</div>
        </div>
        <div className="rounded-lg border bg-gradient-to-br from-emerald-50 to-emerald-100 p-4">
          <div className="text-xs md:text-sm text-muted-foreground">Stock Sisa</div>
          <div className="text-2xl md:text-3xl font-bold text-emerald-700">{totalRemainingStock}</div>
        </div>
        <div className="rounded-lg border bg-gradient-to-br from-orange-50 to-orange-100 p-4">
          <div className="text-xs md:text-sm text-muted-foreground">Stock Terpakai</div>
          <div className="text-2xl md:text-3xl font-bold text-orange-700">{totalUsedStock}</div>
        </div>
        <div className="rounded-lg border bg-gradient-to-br from-red-50 to-red-100 p-4">
          <div className="text-xs md:text-sm text-muted-foreground">Habis</div>
          <div className="text-2xl md:text-3xl font-bold text-red-700">{outOfStockProducts.length}</div>
        </div>
      </div>

      {outOfStockProducts.length > 0 && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Produk Habis</h3>
              <p className="text-sm text-red-800 mt-1">{outOfStockProducts.map((p) => p.name).join(", ")}</p>
            </div>
          </div>
        </div>
      )}

      {lowStockProducts.length > 0 && (
        <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900">Stock Rendah</h3>
              <p className="text-sm text-orange-800 mt-1">
                {lowStockProducts.map((p) => `${p.name} (${p.stock})`).join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Nama Produk</th>
                <th className="px-4 py-3 text-left font-semibold">Kategori</th>
                <th className="px-4 py-3 text-center font-semibold">Total Stock</th>
                <th className="px-4 py-3 text-center font-semibold">Terpakai</th>
                <th className="px-4 py-3 text-center font-semibold">Sisa</th>
                <th className="px-4 py-3 text-right font-semibold">Harga/Trip</th>
                <th className="px-4 py-3 text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, idx) => {
                const usedStock = getUsedStock(product.id)
                const remainingStock = product.stock - usedStock
                return (
                  <tr key={product.id} className={idx % 2 === 0 ? "bg-white" : "bg-muted/30"}>
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{product.category}</td>
                    <td className="px-4 py-3 text-center font-semibold">{product.stock}</td>
                    <td className="px-4 py-3 text-center font-semibold text-orange-600">{usedStock}</td>
                    <td className="px-4 py-3 text-center font-semibold text-emerald-600">{remainingStock}</td>
                    <td className="px-4 py-3 text-right">Rp{product.pricePerTrip.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 text-center">
                      {product.stock === 0 ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                          Habis
                        </span>
                      ) : remainingStock < 2 ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                          Rendah
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                          Tersedia
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
