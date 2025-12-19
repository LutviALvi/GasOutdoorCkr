"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { AlertCircle, LogOut, Calendar, Search, Loader2 } from "lucide-react"

// Define Product type matching API response
// Tipe Produk untuk keperluan summary stok
type Product = {
  id: string
  name: string
  category: string
  pricePerDay: number
  pricePerTrip: number
  stock: number // Stok yang TERSEDIA (Available) setelah dikurangi booking di tanggal dipilih
  originalStock: number // Stok TOTAL fisik yang dimiliki
  image: string
}

export default function StockSummaryPage() {
  const router = useRouter()
  const { isLoggedIn, logout } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.push("/admin/login")
      return
    }
    if (isHydrated) {
        // Default range: Today to +7 days
        const today = new Date()
        const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        setDateFrom(today.toISOString().split("T")[0])
        setDateTo(sevenDaysLater.toISOString().split("T")[0])
    }
  }, [isHydrated, isLoggedIn, router])

  // Fetch when dates change
  useEffect(() => {
      if (isHydrated && isLoggedIn && dateFrom && dateTo) {
          fetchProducts()
      }
  }, [dateFrom, dateTo, isHydrated, isLoggedIn])


  async function fetchProducts() {
    setLoading(true)
    try {
      // Kirim parameter tanggal ke API untuk mendapatkan sisa stok pada periode tersebut
      const res = await fetch(`/api/products?startDate=${dateFrom}&endDate=${dateTo}`, { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        // Transformasi data agar sesuai struktur tipe Product di atas
        const transformed = data.map((p: any) => ({
          ...p,
          pricePerDay: p.price_per_day,
          pricePerTrip: p.price_per_trip,
          // API mengembalikan 'stock' sebagai sisa stok jika ada filter tanggal
          // 'originalStock' (jika ada) adalah total stok awal
          originalStock: p.originalStock !== undefined ? p.originalStock : p.stock
        }))
        setProducts(transformed)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }

  // Hitung Stok Terpakai (Booked)
  const getUsedStock = (product: Product): number => {
      // Jika total stok > sisa stok, selisihnya berarti sedang disewa/dibooking
      return Math.max(0, product.originalStock - product.stock)
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const lowStockProducts = products.filter((p) => p.stock < 3 && p.stock > 0) // Low available stock
  const outOfStockProducts = products.filter((p) => p.stock === 0) // No available stock

  const totalStock = products.reduce((sum, p) => sum + p.originalStock, 0)
  const totalUsedStock = products.reduce((sum, p) => sum + getUsedStock(p), 0)
  const totalRemainingStock = totalStock - totalUsedStock // Should equal sum of p.stock

  if (!isHydrated || !isLoggedIn) return null

  return (
    <section className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Summary Stock Barang</h1>
          <p className="text-muted-foreground">Ketersediaan barang berdasarkan tanggal booking</p>
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
    
      {loading ? (
        <section className="flex items-center justify-center min-h-[200px]">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </section>
      ) : (
        <>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-8">
                <div className="rounded-lg border bg-gradient-to-br from-teal-50 to-teal-100 p-4">
                <div className="text-xs md:text-sm text-muted-foreground">Total Inventaris</div>
                <div className="text-2xl md:text-3xl font-bold text-teal-700">{totalStock}</div>
                </div>
                <div className="rounded-lg border bg-gradient-to-br from-emerald-50 to-emerald-100 p-4">
                <div className="text-xs md:text-sm text-muted-foreground">Sisa (Available)</div>
                <div className="text-2xl md:text-3xl font-bold text-emerald-700">{totalRemainingStock}</div>
                </div>
                <div className="rounded-lg border bg-gradient-to-br from-orange-50 to-orange-100 p-4">
                <div className="text-xs md:text-sm text-muted-foreground">Terbooking</div>
                <div className="text-2xl md:text-3xl font-bold text-orange-700">{totalUsedStock}</div>
                </div>
                <div className="rounded-lg border bg-gradient-to-br from-red-50 to-red-100 p-4">
                <div className="text-xs md:text-sm text-muted-foreground">Fully Booked / Habis</div>
                <div className="text-2xl md:text-3xl font-bold text-red-700">{outOfStockProducts.length}</div>
                </div>
            </div>

            {outOfStockProducts.length > 0 && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                    <h3 className="font-semibold text-red-900">Stock Habis (Pada tanggal dipilih)</h3>
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
                    <h3 className="font-semibold text-orange-900">Stock Menipis</h3>
                    <p className="text-sm text-orange-800 mt-1">
                        {lowStockProducts.map((p) => `${p.name} (Sisa: ${p.stock})`).join(", ")}
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
                        <th className="px-4 py-3 text-center font-semibold">Total Unit</th>
                        <th className="px-4 py-3 text-center font-semibold">Terbooking</th>
                        <th className="px-4 py-3 text-center font-semibold">Sisa</th>
                        <th className="px-4 py-3 text-right font-semibold">Harga/Trip</th>
                        <th className="px-4 py-3 text-center font-semibold">Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredProducts.map((product, idx) => {
                        const usedStock = getUsedStock(product)
                        const remainingStock = product.stock // This is already calculated available stock
                        return (
                        <tr key={product.id} className={idx % 2 === 0 ? "bg-white" : "bg-muted/30"}>
                            <td className="px-4 py-3 font-medium">{product.name}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{product.category}</td>
                            <td className="px-4 py-3 text-center font-semibold">{product.originalStock}</td>
                            <td className="px-4 py-3 text-center font-semibold text-orange-600">{usedStock}</td>
                            <td className="px-4 py-3 text-center font-semibold text-emerald-600">{remainingStock}</td>
                            <td className="px-4 py-3 text-right">
                            Rp{(product.pricePerTrip || 0).toLocaleString("id-ID")}
                            </td>
                            <td className="px-4 py-3 text-center">
                            {remainingStock === 0 ? (
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
        </>
      )}
    </section>
  )
}
