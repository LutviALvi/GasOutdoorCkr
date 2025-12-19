"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Filter, TrendingUp, TrendingDown, DollarSign, ShoppingCart, RefreshCw, Loader2 } from "lucide-react"
import { format, isWithinInterval, parseISO, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { id as localeID } from "date-fns/locale"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

// New Type Definition matching DB/API
// Tipe data untuk laporan booking yang diambil dari API
type ReportBooking = {
    id: string
    order_number: string
    created_at: string
    booking_status: string
    total: number
    customer_name: string
    customer_phone: string
}

export default function ReportsPage() {
  const router = useRouter()
  const { isLoggedIn } = useAuthStore()
  const [bookings, setBookings] = useState<ReportBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  // Filter states
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [periodFilter, setPeriodFilter] = useState("all")

  // Terapkan filter periode waktu (bulan ini, bulan lalu, dll)
  const applyPeriodFilter = () => {
    const now = new Date()
    switch (periodFilter) {
      case "thisMonth": // Filter Bulan Ini
        setDateFrom(format(startOfMonth(now), "yyyy-MM-dd"))
        setDateTo(format(endOfMonth(now), "yyyy-MM-dd"))
        break
      case "lastMonth": // Filter Bulan Lalu
        const lastMonth = subMonths(now, 1)
        setDateFrom(format(startOfMonth(lastMonth), "yyyy-MM-dd"))
        setDateTo(format(endOfMonth(lastMonth), "yyyy-MM-dd"))
        break
      case "last3Months": // Filter 3 Bulan Terakhir
        setDateFrom(format(startOfMonth(subMonths(now, 2)), "yyyy-MM-dd"))
        setDateTo(format(endOfMonth(now), "yyyy-MM-dd"))
        break
      case "last6Months": // Filter 6 Bulan Terakhir
        setDateFrom(format(startOfMonth(subMonths(now, 5)), "yyyy-MM-dd"))
        setDateTo(format(endOfMonth(now), "yyyy-MM-dd"))
        break
      case "all": // Semua Waktu (Reset)
        setDateFrom("")
        setDateTo("")
        break
      default:
        break
    }
  }

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.push("/admin/login")
      return
    }
    
    if (isHydrated) {
        fetchData(true)

        // Real-time listener for bookings (reports are based on bookings)
        const channel = supabase
          .channel('admin-reports-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'bookings' },
            () => {
              fetchData(false) // Background update
            }
          )
          .subscribe()

        return () => {
          supabase.removeChannel(channel)
        }
    }
  }, [isHydrated, isLoggedIn, router])

  // Ambil data pesanan dari API untuk laporan
  const fetchData = async (showLoading = false) => {
      if (showLoading) setLoading(true)
      try {
          const res = await fetch(`/api/admin/orders?t=${Date.now()}`, { cache: "no-store", headers: { 'Cache-Control': 'no-cache' } })
          if (res.ok) {
              const data = await res.json()
              setBookings(data)
          }
      } catch (e) {
          console.error("Failed to fetch orders for report", e)
      } finally {
          setLoading(false)
      }
  }

  useEffect(() => {
    applyPeriodFilter()
  }, [periodFilter])

  if (!isHydrated || !isLoggedIn) {
    return null
  }

  if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
      )
  }

  // Filter bookings
  // Filter data booking berdasarkan tanggal dan status
  const filteredBookings = bookings.filter((b) => {
    // Filter berdasarkan Tanggal
    if (dateFrom && dateTo) {
      const bookingDate = new Date(b.created_at)
      const from = parseISO(dateFrom)
      const to = parseISO(dateTo)
      to.setHours(23, 59, 59, 999)
      if (!isWithinInterval(bookingDate, { start: from, end: to })) {
        return false
      }
    }

    // Filter berdasarkan Status
    // Normalisasi status DB agar sesuai dengan filter UI
    const status = b.booking_status
    if (statusFilter !== "all" && status !== statusFilter) {
      // Mapping status bahasa Indonesia <-> Inggris jika diperlukan
      if (statusFilter === 'menunggu' && status === 'pending') return true
      if (statusFilter === 'aktif' && status === 'active') return true
      if (statusFilter === 'selesai' && status === 'completed') return true
      if (statusFilter === 'dibatalkan' && status === 'cancelled') return true
      
      return false
    }

    return true
  })

  // Calculate stats
  // Only count revenue for valid orders (not cancelled)
  const validOrders = filteredBookings.filter(b => b.booking_status !== 'cancelled')
  const totalRevenue = validOrders.reduce((sum, b) => sum + (b.total || 0), 0)
  
  const totalOrders = filteredBookings.length
  const completedOrders = filteredBookings.filter((b) => b.booking_status === "completed" || b.booking_status === "selesai").length
  const cancelledOrders = filteredBookings.filter((b) => b.booking_status === "cancelled" || b.booking_status === "dibatalkan").length
  const avgOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0

  // Status distribution for pie chart
  const statusData = [
    {
      name: "Menunggu",
      value: filteredBookings.filter((b) => b.booking_status === "pending" || b.booking_status === "menunggu").length,
      color: "#f59e0b",
    },
    { name: "Aktif", value: filteredBookings.filter((b) => b.booking_status === "active" || b.booking_status === "aktif").length, color: "#10b981" },
    { name: "Selesai", value: filteredBookings.filter((b) => b.booking_status === "completed" || b.booking_status === "selesai").length, color: "#6b7280" },
    { name: "Dibatalkan", value: filteredBookings.filter((b) => b.booking_status === "cancelled" || b.booking_status === "dibatalkan").length, color: "#ef4444" },
  ].filter((d) => d.value > 0)

  // Daily revenue for bar chart
  const dailyData: { date: string; revenue: number; orders: number }[] = []
  filteredBookings.filter(b => b.booking_status !== 'cancelled').forEach((b) => {
    const date = format(new Date(b.created_at), "dd/MM")
    const existing = dailyData.find((d) => d.date === date)
    if (existing) {
      existing.revenue += b.total || 0
      existing.orders += 1
    } else {
      dailyData.push({ date, revenue: b.total || 0, orders: 1 })
    }
  })
  dailyData.sort((a, b) => a.date.localeCompare(b.date)) // Simple string sort works for dd/MM if strictly within same year/month structure, but better to use timestamp if cross-year. For basic usage ok.

  // Export report
  const exportReport = () => {
    const rows = [
      ["Laporan Penyewaan GASOUTDOOR"],
      [`Periode: ${dateFrom || "Semua"} - ${dateTo || "Semua"}`],
      [`Status: ${statusFilter === "all" ? "Semua" : statusFilter}`],
      [""],
      ["Ringkasan:"],
      [`Total Pendapatan, Rp${totalRevenue.toLocaleString("id-ID")}`],
      [`Total Pesanan, ${totalOrders}`],
      [`Pesanan Selesai, ${completedOrders}`],
      [`Pesanan Dibatalkan, ${cancelledOrders}`],
      [`Rata-rata Nilai Pesanan, Rp${Math.round(avgOrderValue).toLocaleString("id-ID")}`],
      [""],
      ["Detail Pesanan:"],
      ["Order No", "Nama", "Telepon", "Tanggal", "Status", "Total"].join(","),
      ...filteredBookings.map((b) =>
        [
          b.order_number || b.id,
          `"${b.customer_name}"`,
          `"${b.customer_phone}"`,
          format(new Date(b.created_at), "dd/MM/yyyy"),
          b.booking_status,
          b.total || 0,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([rows], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `laporan-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetFilters = () => {
    setDateFrom("")
    setDateTo("")
    setStatusFilter("all")
    setPeriodFilter("all")
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Laporan</h1>
        <p className="text-muted-foreground">Analisis dan laporan penyewaan (Database)</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Laporan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Periode Cepat</Label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Waktu</SelectItem>
                  <SelectItem value="thisMonth">Bulan Ini</SelectItem>
                  <SelectItem value="lastMonth">Bulan Lalu</SelectItem>
                  <SelectItem value="last3Months">3 Bulan Terakhir</SelectItem>
                  <SelectItem value="last6Months">6 Bulan Terakhir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dari Tanggal</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Sampai Tanggal</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="menunggu">Menunggu</SelectItem>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
                  <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={resetFilters} className="flex-1 bg-transparent">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={exportReport} className="flex-1 bg-teal-600 hover:bg-teal-700">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Total Pendapatan</p>
                <p className="text-xl md:text-2xl font-bold text-emerald-800">
                  Rp{totalRevenue.toLocaleString("id-ID")}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Pesanan</p>
                <p className="text-2xl font-bold text-blue-800">{totalOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Selesai</p>
                <p className="text-2xl font-bold text-green-800">{completedOrders}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Dibatalkan</p>
                <p className="text-2xl font-bold text-red-800">{cancelledOrders}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pendapatan Harian</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value) => [`Rp ${Number(value).toLocaleString("id-ID")}`, "Pendapatan"]} />
                  <Bar dataKey="revenue" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Tidak ada data untuk periode ini
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribusi Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Tidak ada data untuk periode ini
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detail Transaksi ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Tidak ada data untuk filter yang dipilih</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Order No</th>
                    <th className="text-left py-3 px-2">Pelanggan</th>
                    <th className="text-left py-3 px-2 hidden md:table-cell">Tanggal</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-right py-3 px-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.slice(0, 20).map((b) => (
                    <tr key={b.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 font-mono text-xs">{b.order_number || b.id.slice(0, 8)}</td>
                      <td className="py-3 px-2">
                        <div>{b.customer_name}</div>
                        <div className="text-xs text-muted-foreground md:hidden">
                          {format(new Date(b.created_at), "dd/MM/yy")}
                        </div>
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell">
                        {format(new Date(b.created_at), "dd MMM yyyy", { locale: localeID })}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            b.booking_status === "active" || b.booking_status === "aktif"
                              ? "bg-green-100 text-green-800"
                              : b.booking_status === "completed" || b.booking_status === "selesai"
                                ? "bg-gray-100 text-gray-800"
                                : b.booking_status === "cancelled" || b.booking_status === "dibatalkan"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {b.booking_status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-medium">Rp{(b.total || 0).toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBookings.length > 20 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Menampilkan 20 dari {filteredBookings.length} transaksi
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
