"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/lib/auth-store"
import type { Booking } from "@/lib/booking"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Package, ShoppingCart, DollarSign, Users, Eye, TrendingUp } from "lucide-react"
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import { id as localeID } from "date-fns/locale"
import { useProductStore, getProductsWithStore } from "@/lib/product-store"

export default function AdminDashboard() {
  const router = useRouter()
  const { isLoggedIn } = useAuthStore()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const { products: storedProducts } = useProductStore()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.push("/admin/login")
    }
  }, [isHydrated, isLoggedIn, router])

  useEffect(() => {
    const raw = localStorage.getItem("gasoutdoor_bookings")
    if (raw) {
      try {
        setBookings(JSON.parse(raw))
      } catch {
        setBookings([])
      }
    }
  }, [])

  if (!isHydrated || !isLoggedIn) {
    return null
  }

  const products = getProductsWithStore(storedProducts)

  // Calculate stats
  const totalAlat = products.length
  const alatTersedia = products.filter((p) => p.stock > 0).length
  const transaksiAktif = bookings.filter((b) => b.status === "aktif" || b.status === "menunggu").length
  const totalPendapatan = bookings.reduce((sum, b) => sum + (b.total || 0), 0)

  // Calculate monthly data for last 6 months
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i)
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)

    const monthBookings = bookings.filter((b) => {
      const bookingDate = new Date(b.createdAt)
      return isWithinInterval(bookingDate, { start: monthStart, end: monthEnd })
    })

    return {
      month: format(date, "MMM", { locale: localeID }),
      rentals: monthBookings.length,
      revenue: monthBookings.reduce((sum, b) => sum + (b.total || 0), 0),
    }
  })

  // Calculate this month's revenue
  const thisMonthStart = startOfMonth(new Date())
  const thisMonthEnd = endOfMonth(new Date())
  const pendapatanBulanIni = bookings
    .filter((b) => {
      const bookingDate = new Date(b.createdAt)
      return isWithinInterval(bookingDate, { start: thisMonthStart, end: thisMonthEnd })
    })
    .reduce((sum, b) => sum + (b.total || 0), 0)

  // Get unique customers count
  const uniqueCustomers = new Set(bookings.map((b) => b.customer.phone)).size

  // Get recent rentals (last 5)
  const recentRentals = bookings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aktif":
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>
      case "selesai":
        return <Badge variant="secondary">Selesai</Badge>
      case "menunggu":
        return <Badge variant="outline">Menunggu</Badge>
      case "dibatalkan":
        return <Badge className="bg-red-100 text-red-800">Dibatalkan</Badge>
      default:
        return <Badge>{status || "Menunggu"}</Badge>
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-muted-foreground">Ringkasan aktivitas penyewaan alat outdoor</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">Total Alat</CardTitle>
            <Package className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-800">{totalAlat}</div>
            <p className="text-xs text-teal-600">{alatTersedia} tersedia</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Transaksi Aktif</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{transaksiAktif}</div>
            <p className="text-xs text-orange-600">Sedang berlangsung</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Pendapatan Bulan Ini</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-emerald-800">
              Rp{(pendapatanBulanIni / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +12% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Pelanggan</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{uniqueCustomers}</div>
            <p className="text-xs text-blue-600">Pelanggan unik</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pendapatan 6 Bulan Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip
                  formatter={(value) => [`Rp ${Number(value).toLocaleString("id-ID")}`, "Pendapatan"]}
                  labelStyle={{ color: "#333" }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} dot={{ fill: "#0d9488" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rentals Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Jumlah Penyewaan per Bulan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rentals" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Rentals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Penyewaan Terbaru</CardTitle>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Lihat Semua
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentRentals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Belum ada penyewaan</p>
          ) : (
            <div className="space-y-4">
              {recentRentals.map((rental) => (
                <div
                  key={rental.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-3"
                >
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                      <div>
                        <p className="font-medium">{rental.customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {rental.items.length} item{rental.items.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(rental.rentalPeriod.from), "d MMM", { locale: localeID })} -{" "}
                        {format(new Date(rental.rentalPeriod.to), "d MMM yyyy", { locale: localeID })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-4">
                    <div className="text-right">
                      <p className="font-medium">Rp {(rental.total || 0).toLocaleString("id-ID")}</p>
                      <p className="text-xs text-muted-foreground">#{rental.id.slice(-6)}</p>
                    </div>
                    {getStatusBadge(rental.status || "menunggu")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
