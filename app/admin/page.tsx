"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/lib/auth-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Package, ShoppingCart, DollarSign, Users, Eye, TrendingUp } from "lucide-react"
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import { id as localeID } from "date-fns/locale"

// Definisi tipe data yang sesuai dengan respon API
// Tipe ini memastikan kita tahu bentuk data 'AdminOrder' yang diterima
type AdminOrder = {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  total: number
  booking_status: string
  created_at: string
  start_date: string
  end_date: string
  booking_items: any[]
}

export default function AdminDashboard() {
  const router = useRouter()
  const { isLoggedIn } = useAuthStore()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/admin/login")
      return
    }

    async function fetchData() {
       try {
           setLoading(true)
           const resOrders = await fetch('/api/admin/orders', { 
             cache: "no-store",
             headers: { 'Cache-Control': 'no-cache' } 
           })
           if (resOrders.ok) {
               const data = await resOrders.json()
               setOrders(data)
           }

           const resStats = await fetch('/api/admin/dashboard', { 
             cache: "no-store",
             headers: { 'Cache-Control': 'no-cache' } 
           })
           if (resStats.ok) {
               const stats = await resStats.json()
               setTotalProducts(stats.totalProducts)
           }

       } catch (err) {
           console.error(err)
       } finally {
           setLoading(false)
       }
    }

    fetchData()

    // Polling data setiap 30 detik untuk real-time update
    const interval = setInterval(() => {
        fetchData()
    }, 30000)

    return () => clearInterval(interval)
  }, [isLoggedIn, router])

  if (loading) {
      return <div className="p-8 text-center">Loading dashboard data...</div>
  }

  // Calculate stats from Orders
  // Active = confirmed or active
  const activeOrders = orders.filter(o => ['confirmed', 'active'].includes(o.booking_status)).length
  const totalRevenue = orders
    .filter(o => o.booking_status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0)

  // Hitung data bulanan untuk grafik 6 bulan terakhir
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i)
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)

    const monthBookings = orders.filter((b) => {
      const bookingDate = new Date(b.created_at)
      return isWithinInterval(bookingDate, { start: monthStart, end: monthEnd })
    })

    return {
      month: format(date, "MMM", { locale: localeID }),
      rentals: monthBookings.length,
      revenue: monthBookings.reduce((sum, b) => sum + (b.total || 0), 0),
    }
  })

  // Hitung pendapatan bulan ini saja
  const thisMonthStart = startOfMonth(new Date())
  const thisMonthEnd = endOfMonth(new Date())
  const revenueThisMonth = orders
    .filter((b) => {
      const bookingDate = new Date(b.created_at)
      return isWithinInterval(bookingDate, { start: thisMonthStart, end: thisMonthEnd }) && b.booking_status !== 'cancelled'
    })
    .reduce((sum, b) => sum + (b.total || 0), 0)

  // Unique customers
  const uniqueCustomers = new Set(orders.map((b) => b.customer_phone)).size

  // Recent rentals (already sorted by API desc)
  const recentRentals = orders.slice(0, 5)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>
      case "completed":
        return <Badge variant="secondary">Selesai</Badge>
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-800">Dikonfirmasi</Badge>
        case "pending":
            return <Badge variant="outline">Menunggu</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Dibatalkan</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-muted-foreground">Ringkasan aktivitas penyewaan alat outdoor (Database)</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">Total Alat</CardTitle>
            <Package className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-800">{totalProducts}</div>
            <p className="text-xs text-teal-600">Total SKU produk</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Transaksi Aktif</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{activeOrders}</div>
            <p className="text-xs text-orange-600">Sedang berlangsung / Dikonfirmasi</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Pendapatan Bulan Ini</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-emerald-800">
              Rp{(revenueThisMonth / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Realtime DB
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
                        <p className="font-medium">{rental.customer_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {rental.booking_items ? rental.booking_items.length : 0} item
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(rental.start_date), "d MMM", { locale: localeID })} -{" "}
                        {format(new Date(rental.end_date), "d MMM yyyy", { locale: localeID })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-4">
                    <div className="text-right">
                      <p className="font-medium">Rp {(rental.total || 0).toLocaleString("id-ID")}</p>
                      <p className="text-xs text-muted-foreground">{rental.order_number}</p>
                    </div>
                    {getStatusBadge(rental.booking_status)}
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
