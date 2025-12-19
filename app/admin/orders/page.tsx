"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Loader2, Package, Search, Trash2, Eye, Phone, Calendar, DollarSign, Download, User } from "lucide-react"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface BookingItem {
  id: string
  product_id: string
  quantity: number
  price_per_trip: number
  products?: {
      name: string
      image: string
  }
}

// Interface untuk struktur data Booking
interface BookingData {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  customer_address?: string
  customer_identity?: string
  start_date: string
  end_date: string
  total_days: number
  subtotal: number
  discount_code?: string
  discount_amount: number
  total: number
  booking_status: string // confirmed, active, completed, cancelled, pending
  booking_items: BookingItem[]
  created_at: string
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const { isLoggedIn } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null)
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [isHydrated, setIsHydrated] = useState(false)

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.push("/admin/login")
      return
    }
    if (isHydrated) {
      fetchData()
    }
  }, [isHydrated, isLoggedIn, router])

  // Ambil data pesanan dari API
  async function fetchData() {
    try {
      const res = await fetch(`/api/admin/orders?t=${Date.now()}`, { cache: "no-store", headers: { 'Cache-Control': 'no-cache' } })
      if (res.ok) {
        const bookingsData = await res.json()
        setBookings(bookingsData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
      case "dikonfirmasi":
        return <Badge className="bg-blue-600 text-white">Dikonfirmasi</Badge>
      case "active":
      case "aktif":
        return <Badge className="bg-green-600 text-white">Aktif (Disewa)</Badge>
      case "completed":
      case "selesai":
        return <Badge className="bg-gray-600 text-white">Selesai</Badge>
      case "pending":
      case "menunggu":
        return <Badge className="bg-amber-500 text-white">Menunggu</Badge>
      case "cancelled":
      case "dibatalkan":
        return <Badge className="bg-red-500 text-white">Dibatalkan</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Filter data booking client-side berdasarkan search term, status, dan tanggal
  const filteredBookings = bookings.filter((booking) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      booking.customer_name.toLowerCase().includes(term) ||
      booking.customer_phone.includes(term) ||
      (booking.order_number && booking.order_number.toLowerCase().includes(term)) ||
      booking.id.toLowerCase().includes(term)
    
    // Normalize status for filtering
    const normalizedStatus = booking.booking_status === 'aktif' ? 'active' : 
                             booking.booking_status === 'dikonfirmasi' ? 'confirmed' :
                             booking.booking_status === 'menunggu' ? 'pending' : 
                             booking.booking_status === 'selesai' ? 'completed' : 
                             booking.booking_status

    const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter

    let matchesDate = true
    if (dateFrom) {
      const filterFrom = new Date(dateFrom)
      const bookingFrom = new Date(booking.start_date)
      matchesDate = matchesDate && bookingFrom >= filterFrom
    }
    if (dateTo) {
      const filterTo = new Date(dateTo)
      const bookingTo = new Date(booking.end_date)
      matchesDate = matchesDate && bookingTo <= filterTo
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  // Pagination Logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setCurrentPage(newPage)
      }
  }

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, dateFrom, dateTo])


  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    const previous = [...bookings]
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, booking_status: newStatus } : b))

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingStatus: newStatus }),
      })

      if (res.ok) {
        // Success
      } else {
          setBookings(previous)
          alert("Gagal mengupdate status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      setBookings(previous)
    }
  }

  const confirmDelete = (id: string) => {
    setBookingToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!bookingToDelete) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/bookings/${bookingToDelete}`, { method: "DELETE" })
      if (res.ok) {
        setDeleteDialogOpen(false)
        setBookingToDelete(null)
        // Refresh data properly
        await fetchData()
      } else {
        alert("Gagal menghapus booking")
      }
    } catch (error) {
      console.error("Error deleting booking:", error)
    } finally {
        setDeleting(false)
    }
  }

  // Export data tabel ke file CSV (Excel)
  const exportCsv = () => {
    const rows = [
      ["Order No", "Status", "Nama", "Telepon", "Tanggal Mulai", "Tanggal Selesai", "Total (Rp)"].join(","),
      ...filteredBookings.map((b) =>
        [
          b.order_number || b.id.slice(0,8),
          b.booking_status,
          `"${b.customer_name}"`,
          `"${b.customer_phone}"`,
          b.start_date,
          b.end_date,
          b.total,
        ].join(","),
      ),
    ].join("\n")
    const blob = new Blob([rows], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `orders-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearDateFilter = () => {
    setDateFrom("")
    setDateTo("")
  }

  if (!isHydrated || !isLoggedIn) return null

  if (loading) {
    return (
      <section className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </section>
    )
  }

  const totalOrders = bookings.length
  const activeOrders = bookings.filter((b) => ['active', 'aktif', 'confirmed', 'dikonfirmasi'].includes(b.booking_status)).length
  const pendingOrders = bookings.filter((b) => ['pending', 'menunggu'].includes(b.booking_status)).length
  const totalRevenue = bookings
    .filter((b) => !['cancelled', 'dibatalkan'].includes(b.booking_status))
    .reduce((acc, b) => acc + (b.total || 0), 0)

  return (
    <section className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Manajemen Pesanan</h1>
        <p className="text-muted-foreground text-sm md:text-base">Data dari database Supabase</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Package className="h-6 w-6 md:h-8 md:w-8 opacity-80" />
              <div>
                <p className="text-xs md:text-sm opacity-80">Total Pesanan</p>
                <p className="text-xl md:text-2xl font-bold">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Calendar className="h-6 w-6 md:h-8 md:w-8 opacity-80" />
              <div>
                <p className="text-xs md:text-sm opacity-80">Aktif/Konfirm</p>
                <p className="text-xl md:text-2xl font-bold">{activeOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <User className="h-6 w-6 md:h-8 md:w-8 opacity-80" />
              <div>
                <p className="text-xs md:text-sm opacity-80">Menunggu</p>
                <p className="text-xl md:text-2xl font-bold">{pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <DollarSign className="h-6 w-6 md:h-8 md:w-8 opacity-80" />
              <div>
                <p className="text-xs md:text-sm opacity-80">Pendapatan</p>
                <p className="text-base md:text-xl font-bold">Rp{(totalRevenue / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari nama, telepon, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 sm:flex gap-2 md:gap-4 items-end">
              <div className="col-span-1">
                <label className="block text-xs md:text-sm font-medium text-muted-foreground mb-1">Dari</label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="text-sm" />
              </div>
              <div className="col-span-1">
                <label className="block text-xs md:text-sm font-medium text-muted-foreground mb-1">Sampai</label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-sm" />
              </div>
              <div className="col-span-2 sm:col-span-1 flex gap-2">
                {(dateFrom || dateTo) && (
                  <Button variant="outline" onClick={clearDateFilter} size="sm" className="flex-1 sm:flex-none bg-transparent">
                    Reset
                  </Button>
                )}
                <Button onClick={exportCsv} variant="outline" size="sm" className="flex-1 sm:flex-none gap-1 bg-transparent">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 md:pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-base md:text-lg">Daftar Pesanan ({filteredBookings.length})</CardTitle>
          <span className="text-sm text-muted-foreground">
              Halaman {currentPage} dari {totalPages || 1}
          </span>
        </CardHeader>
        <CardContent className="p-2 md:p-4">
          <div className="space-y-3">
            {paginatedBookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-1">
                        <h3 className="font-semibold text-base md:text-lg truncate">{booking.customer_name}</h3>
                        {getStatusBadge(booking.booking_status)}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">#{booking.order_number || booking.id.slice(0, 8)}</p>
                    </div>
                    <p className="font-bold text-teal-600 text-sm md:text-base whitespace-nowrap">
                      Rp{(booking.total || 0).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                      <span className="truncate">{booking.customer_phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                      <span className="truncate">
                        {format(new Date(booking.start_date), "d/M", { locale: localeID })} -{" "}
                        {format(new Date(booking.end_date), "d/M", { locale: localeID })}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs md:text-sm bg-muted/50 rounded p-2">
                    <span className="font-medium">Item: </span>
                    {booking.booking_items?.map((item, idx) => (
                      <span key={idx}>
                        {item.products?.name || "Produk"} x{item.quantity}
                        {idx < (booking.booking_items?.length || 0) - 1 ? ", " : ""}
                      </span>
                    )) || "Tidak ada item"}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)} className="flex-1 sm:flex-none">
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Detail Pesanan</DialogTitle>
                        </DialogHeader>
                        {selectedBooking && selectedBooking.id === booking.id && (
                          <div className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <span className="text-xs font-medium text-muted-foreground">Nama</span>
                                <p className="font-semibold">{selectedBooking.customer_name}</p>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-muted-foreground">WhatsApp</span>
                                <p>{selectedBooking.customer_phone}</p>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-muted-foreground">Order No</span>
                                <p className="font-mono">{selectedBooking.order_number}</p>
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">Item Disewa</span>
                              <div className="mt-1 space-y-1">
                                {selectedBooking.booking_items?.map((item, idx) => (
                                  <p key={idx}>
                                    {item.products?.name || "Produk"} x{item.quantity} - Rp
                                    {(item.price_per_trip * item.quantity).toLocaleString("id-ID")}
                                  </p>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-between border-t pt-2 font-semibold">
                              <span>Total</span>
                              <span className="text-teal-600">Rp{(selectedBooking.total || 0).toLocaleString("id-ID")}</span>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Select
                      value={booking.booking_status}
                      onValueChange={(value) => handleStatusUpdate(booking.id, value)}
                    >
                      <SelectTrigger className="w-32 sm:w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Menunggu</SelectItem>
                        <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="completed">Selesai</SelectItem>
                        <SelectItem value="cancelled">Dibatalkan</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="destructive" size="sm" onClick={() => confirmDelete(booking.id)} className="text-white">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {paginatedBookings.length === 0 && (
            <div className="text-center py-8 md:py-12">
              <Package className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-base md:text-lg font-semibold mb-2">Tidak ada pesanan</h3>
              <p className="text-sm text-muted-foreground">
                {bookings.length === 0 ? "Belum ada pesanan di database" : "Coba ubah filter pencarian"}
              </p>
            </div>
          )}

           {/* Pagination Controls */}
           {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                    Halaman {currentPage} dari {totalPages}
                </span>
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
           )}

        </CardContent>
      </Card>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pesanan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pesanan ini? 
              Tindakan ini tidak dapat dibatalkan dan akan menghapus data terkait dari histori.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction 
                onClick={(e) => {
                    e.preventDefault()
                    handleDelete()
                }}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleting}
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
