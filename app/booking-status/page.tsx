"use client"

import type React from "react"

import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Calendar,
  User,
  Phone,
  MapPin,
  Package,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import type { Booking } from "@/lib/booking"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"
import { getProductById } from "@/lib/products"

const getStatusInfo = (status: string) => {
  switch (status) {
    case "confirmed":
      return { label: "Dikonfirmasi", color: "bg-blue-100 text-blue-800", icon: CheckCircle }
    case "active":
      return { label: "Sedang Disewa", color: "bg-green-100 text-green-800", icon: Clock }
    case "completed":
      return { label: "Selesai", color: "bg-gray-100 text-gray-800", icon: CheckCircle }
    case "cancelled":
      return { label: "Dibatalkan", color: "bg-red-100 text-red-800", icon: XCircle }
    case "pending":
    default:
      return { label: "Menunggu Konfirmasi", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle }
  }
}

export default function BookingStatusPage() {
  const [bookingCode, setBookingCode] = useState("")
  const [booking, setBooking] = useState<Booking | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [searching, setSearching] = useState(false)

  const searchBooking = () => {
    if (!bookingCode.trim()) return

    setSearching(true)
    setNotFound(false)

    // Simulate search delay
    setTimeout(() => {
      const raw = localStorage.getItem("gasoutdoor_bookings")
      if (raw) {
        try {
          const bookings: Booking[] = JSON.parse(raw)
          const found = bookings.find((b) => b.id.toLowerCase() === bookingCode.trim().toLowerCase())
          if (found) {
            setBooking(found)
            setNotFound(false)
          } else {
            setBooking(null)
            setNotFound(true)
          }
        } catch {
          setBooking(null)
          setNotFound(true)
        }
      } else {
        setBooking(null)
        setNotFound(true)
      }
      setSearching(false)
    }, 1000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchBooking()
  }

  const statusInfo = booking ? getStatusInfo(booking.status || "pending") : null
  const StatusIcon = statusInfo?.icon || AlertCircle

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-4 py-12 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Cek Status Booking
          </h1>
          <p className="text-muted-foreground text-lg">Masukkan kode booking untuk melihat detail pesanan Anda</p>
        </div>

        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Cari Booking
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="booking-code">Kode Booking</Label>
                <Input
                  id="booking-code"
                  placeholder="Contoh: GAS-11-25-001"
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value)}
                  className="text-center font-mono"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                disabled={searching || !bookingCode.trim()}
              >
                {searching ? "Mencari..." : "Cari Booking"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {notFound && (
          <Card className="border-2 border-destructive/20 bg-destructive/5">
            <CardContent className="p-6 text-center">
              <div className="text-destructive font-medium">
                Booking tidak ditemukan. Pastikan kode booking sudah benar.
              </div>
            </CardContent>
          </Card>
        )}

        {booking && (
          <div className="space-y-6">
            <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm opacity-80">Kode Booking</p>
                    <p className="text-2xl font-bold font-mono">{booking.id}</p>
                  </div>
                  <Badge className={`${statusInfo?.color} px-4 py-2 text-sm font-medium`}>
                    <StatusIcon className="h-4 w-4 mr-2" />
                    {statusInfo?.label}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">Nama Penyewa</div>
                        <div className="text-muted-foreground">{booking.customer.name}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">No. WhatsApp</div>
                        <div className="text-muted-foreground">{booking.customer.phone}</div>
                      </div>
                    </div>
                    {booking.customer.identityNumber && (
                      <div className="flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <div className="font-medium">No. Identitas</div>
                          <div className="text-muted-foreground">{booking.customer.identityNumber}</div>
                        </div>
                      </div>
                    )}
                    {booking.customer.email && (
                      <div className="flex items-start gap-3">
                        <div className="h-5 w-5 text-primary mt-0.5">@</div>
                        <div>
                          <div className="font-medium">Email</div>
                          <div className="text-muted-foreground">{booking.customer.email}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-secondary mt-0.5" />
                      <div>
                        <div className="font-medium">Periode Sewa</div>
                        <div className="text-muted-foreground">
                          {format(new Date(booking.rentalPeriod.from), "d MMMM yyyy", { locale: localeID })} -{" "}
                          {format(new Date(booking.rentalPeriod.to), "d MMMM yyyy", { locale: localeID })}
                        </div>
                      </div>
                    </div>
                    {booking.customer.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-secondary mt-0.5" />
                        <div>
                          <div className="font-medium">Alamat</div>
                          <div className="text-muted-foreground">{booking.customer.address}</div>
                        </div>
                      </div>
                    )}
                    {booking.paymentMethod && (
                      <div className="flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-secondary mt-0.5" />
                        <div>
                          <div className="font-medium">Metode Pembayaran</div>
                          <div className="text-muted-foreground">{booking.paymentMethod}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Item yang Disewa
                  </h3>
                  <div className="space-y-3">
                    {booking.items.map((item, index) => {
                      const product = getProductById(item.productId)
                      return (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div>
                            <div className="font-medium">{product?.name || "Produk"}</div>
                            <div className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × Rp
                              {(item.pricePerTrip || item.pricePerDay || 0).toLocaleString("id-ID")}/trip
                            </div>
                          </div>
                          <div className="font-semibold">
                            Rp{(item.quantity * (item.pricePerTrip || item.pricePerDay || 0)).toLocaleString("id-ID")}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {booking.discountCode && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>Rp{(booking.subtotal || booking.total || 0).toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-green-600 mt-2">
                      <span>Diskon ({booking.discountCode})</span>
                      <span>-Rp{(booking.discountAmount || 0).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                )}

                <div className="border-t pt-6 flex justify-between items-center">
                  <div className="text-lg font-semibold">Total Pembayaran</div>
                  <div className="text-2xl font-bold text-primary">
                    Rp{(booking.total || 0).toLocaleString("id-ID")}
                  </div>
                </div>

                {booking.customer.note && (
                  <div className="border-t pt-6">
                    <div className="font-medium mb-2">Catatan</div>
                    <div className="text-muted-foreground bg-muted/50 p-3 rounded-lg">{booking.customer.note}</div>
                  </div>
                )}

                <div className="border-t pt-6 text-center">
                  <div className="text-sm text-muted-foreground">
                    Booking dibuat pada{" "}
                    {format(new Date(booking.createdAt), "d MMMM yyyy 'pukul' HH:mm", { locale: localeID })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`border-2 ${
                booking.status === "confirmed"
                  ? "border-blue-200 bg-blue-50"
                  : booking.status === "active"
                    ? "border-green-200 bg-green-50"
                    : booking.status === "completed"
                      ? "border-gray-200 bg-gray-50"
                      : booking.status === "cancelled"
                        ? "border-red-200 bg-red-50"
                        : "border-yellow-200 bg-yellow-50"
              }`}
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`font-medium mb-2 ${
                    booking.status === "confirmed"
                      ? "text-blue-700"
                      : booking.status === "active"
                        ? "text-green-700"
                        : booking.status === "completed"
                          ? "text-gray-700"
                          : booking.status === "cancelled"
                            ? "text-red-700"
                            : "text-yellow-700"
                  }`}
                >
                  {booking.status === "confirmed" && "Pesanan Anda sudah dikonfirmasi!"}
                  {booking.status === "active" && "Barang sedang dalam masa sewa."}
                  {booking.status === "completed" && "Penyewaan telah selesai. Terima kasih!"}
                  {booking.status === "cancelled" && "Pesanan ini dibatalkan."}
                  {(!booking.status || booking.status === "pending") && "Pesanan menunggu konfirmasi admin."}
                </div>
                <div className="text-sm text-muted-foreground">
                  {booking.status === "confirmed" && "Silakan datang ke lokasi untuk mengambil barang sesuai jadwal."}
                  {booking.status === "active" && "Jaga barang dengan baik dan kembalikan tepat waktu."}
                  {booking.status === "completed" && "Semoga pengalaman camping Anda menyenangkan!"}
                  {booking.status === "cancelled" && "Hubungi kami jika ada pertanyaan."}
                  {(!booking.status || booking.status === "pending") &&
                    "Tim kami akan menghubungi Anda via WhatsApp untuk konfirmasi detail."}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  )
}
