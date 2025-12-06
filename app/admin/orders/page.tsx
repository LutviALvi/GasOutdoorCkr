"use client"

import type React from "react"
import { useEffect, useState } from "react"
import type { Booking } from "@/lib/booking"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Eye, Phone, Calendar, DollarSign, Download, Trash2, Package, User } from "lucide-react"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"
import { useProductStore } from "@/lib/product-store"
import { PRODUCTS } from "@/lib/products"

type BookingStatus = "menunggu" | "aktif" | "selesai" | "dibatalkan"

interface BookingWithStatus extends Booking {
  status?: BookingStatus
}

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<BookingWithStatus | null>(null)
  const [bookings, setBookings] = useState<BookingWithStatus[]>([])
  const { products: storedProducts } = useProductStore()

  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  useEffect(() => {
    const raw = localStorage.getItem("gasoutdoor_bookings")
    if (raw) {
      try {
        const data = JSON.parse(raw) as BookingWithStatus[]
        const withStatus = data.map((b) => ({
          ...b,
          status: b.status || ("menunggu" as BookingStatus),
        }))
        setBookings(withStatus)
      } catch {
        setBookings([])
      }
    }
  }, [])

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "aktif":
        return <Badge className="bg-green-500 text-white">Aktif</Badge>
      case "selesai":
        return <Badge className="bg-gray-500 text-white">Selesai</Badge>
      case "menunggu":
        return <Badge className="bg-amber-500 text-white">Menunggu</Badge>
      case "dibatalkan":
        return <Badge className="bg-red-500 text-white">Dibatalkan</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer.phone.includes(searchTerm) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter

    let matchesDate = true
    if (dateFrom) {
      const filterFrom = new Date(dateFrom)
      const bookingFrom = new Date(booking.rentalPeriod.from)
      matchesDate = matchesDate && bookingFrom >= filterFrom
    }
    if (dateTo) {
      const filterTo = new Date(dateTo)
      const bookingTo = new Date(booking.rentalPeriod.to)
      matchesDate = matchesDate && bookingTo <= filterTo
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  const handleStatusUpdate = (bookingId: string, newStatus: string) => {
    const updated = bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, status: newStatus as BookingStatus } : booking,
    )
    setBookings(updated)
    localStorage.setItem("gasoutdoor_bookings", JSON.stringify(updated))
  }

  const deleteBooking = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus booking ini?")) {
      const updated = bookings.filter((b) => b.id !== id)
      setBookings(updated)
      localStorage.setItem("gasoutdoor_bookings", JSON.stringify(updated))
    }
  }

  const exportCsv = () => {
    const rows = [
      [
        "ID",
        "Status",
        "Nama",
        "No. Identitas",
        "Telepon",
        "Email",
        "Alamat",
        "Tanggal dari",
        "Tanggal ke",
        "Subtotal (Rp)",
        "Diskon (%)",
        "Diskon (Rp)",
        "Total (Rp)",
        "Tanggal Pesanan",
      ].join(","),
      ...filteredBookings.map((b) =>
        [
          b.id,
          b.status || "menunggu",
          `"${b.customer.name}"`,
          `"${b.customer.identityNumber || ""}"`,
          `"${b.customer.phone}"`,
          `"${b.customer.email || ""}"`,
          `"${b.customer.address || ""}"`,
          b.rentalPeriod.from,
          b.rentalPeriod.to,
          b.subtotal || b.total,
          b.discountPercentage || 0,
          b.discountAmount || 0,
          b.total,
          b.createdAt,
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

  const getProductName = (productId: string) => {
    const stored = storedProducts.find((p) => p.id === productId)
    if (stored) return stored.name
    const original = PRODUCTS.find((p) => p.id === productId)
    return original?.name || productId
  }

  const clearDateFilter = () => {
    setDateFrom("")
    setDateTo("")
  }

  const totalOrders = bookings.length
  const activeOrders = bookings.filter((b) => b.status === "aktif").length
  const pendingOrders = bookings.filter((b) => b.status === "menunggu").length
  const totalRevenue = bookings.filter((b) => b.status !== "dibatalkan").reduce((acc, b) => acc + (b.total || 0), 0)

  return (
    <section className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Manajemen Pesanan</h1>
        <p className="text-muted-foreground text-sm md:text-base">Kelola semua transaksi penyewaan alat outdoor</p>
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
                <p className="text-xs md:text-sm opacity-80">Aktif</p>
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

      {/* Search and Filter */}
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
                  <SelectItem value="menunggu">Menunggu</SelectItem>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
                  <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
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
                  <Button
                    variant="outline"
                    onClick={clearDateFilter}
                    size="sm"
                    className="flex-1 sm:flex-none bg-transparent"
                  >
                    Reset
                  </Button>
                )}
                <Button
                  onClick={exportCsv}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none gap-1 bg-transparent"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg">Daftar Pesanan ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-4">
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow">
                {/* Mobile-first layout */}
                <div className="flex flex-col gap-3">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-1">
                        <h3 className="font-semibold text-base md:text-lg truncate">{booking.customer.name}</h3>
                        {getStatusBadge(booking.status || "menunggu")}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">#{booking.id.slice(-8)}</p>
                    </div>
                    <p className="font-bold text-teal-600 text-sm md:text-base whitespace-nowrap">
                      Rp{(booking.total || 0).toLocaleString("id-ID")}
                    </p>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                      <span className="truncate">{booking.customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                      <span className="truncate">
                        {format(new Date(booking.rentalPeriod.from), "d/M", { locale: localeID })} -{" "}
                        {format(new Date(booking.rentalPeriod.to), "d/M", { locale: localeID })}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="text-xs md:text-sm bg-muted/50 rounded p-2">
                    <span className="font-medium">Item: </span>
                    {booking.items.map((item, idx) => (
                      <span key={idx}>
                        {getProductName(item.productId)} x{item.quantity}
                        {idx < booking.items.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedBooking(booking)}
                          className="flex-1 sm:flex-none"
                        >
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
                                <Label className="text-xs font-medium text-muted-foreground">Nama</Label>
                                <p className="font-semibold">{selectedBooking.customer.name}</p>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">WhatsApp</Label>
                                <p>{selectedBooking.customer.phone}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">No. Identitas</Label>
                                <p>{selectedBooking.customer.identityNumber || "-"}</p>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                                <p className="truncate">{selectedBooking.customer.email || "-"}</p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Alamat</Label>
                              <p>{selectedBooking.customer.address || "-"}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">Tanggal Sewa</Label>
                                <p>
                                  {format(new Date(selectedBooking.rentalPeriod.from), "d MMM yyyy", {
                                    locale: localeID,
                                  })}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">Tanggal Kembali</Label>
                                <p>
                                  {format(new Date(selectedBooking.rentalPeriod.to), "d MMM yyyy", {
                                    locale: localeID,
                                  })}
                                </p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Item Disewa</Label>
                              <div className="mt-1 space-y-1">
                                {selectedBooking.items.map((item, idx) => (
                                  <p key={idx}>
                                    {getProductName(item.productId)} x{item.quantity} - Rp
                                    {(item.pricePerDay * item.quantity).toLocaleString("id-ID")}
                                  </p>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">Subtotal</Label>
                                <p>
                                  Rp{(selectedBooking.subtotal || selectedBooking.total || 0).toLocaleString("id-ID")}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">Diskon</Label>
                                <p className="text-green-600">
                                  {selectedBooking.discountCode
                                    ? `-Rp${(selectedBooking.discountAmount || 0).toLocaleString("id-ID")} (${selectedBooking.discountCode})`
                                    : "-"}
                                </p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Total Pembayaran</Label>
                              <p className="text-xl font-bold text-teal-600">
                                Rp{(selectedBooking.total || 0).toLocaleString("id-ID")}
                              </p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Select
                      value={booking.status || "menunggu"}
                      onValueChange={(value) => handleStatusUpdate(booking.id, value)}
                    >
                      <SelectTrigger className="w-28 sm:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="menunggu">Menunggu</SelectItem>
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="selesai">Selesai</SelectItem>
                        <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteBooking(booking.id)}
                      className="text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-8 md:py-12">
              <Package className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-base md:text-lg font-semibold mb-2">Tidak ada pesanan</h3>
              <p className="text-sm text-muted-foreground">
                {bookings.length === 0 ? "Belum ada pesanan yang masuk" : "Coba ubah filter pencarian"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`block ${className || ""}`}>{children}</label>
}
