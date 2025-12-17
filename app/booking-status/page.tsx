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
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"

// Define types based on Supabase response
// Tipe data untuk item booking (barang yang disewa)
type BookingItem = {
    quantity: number
    price_per_trip: number
    products: {
        name: string
        image: string
    }
}

// Tipe data Booking lengkap sesuai respon Supabase
type Booking = {
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
    notes?: string
    booking_status: string
    payment_method?: string // Not in core table yet, might need JOIN or just be null for now
    created_at: string
    booking_items: BookingItem[]
}

// Helper untuk mendapatkan warna dan label status
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

  // Fungsi untuk mencari booking berdasarkan kode/nomor HP
  const searchBooking = async () => {
    if (!bookingCode.trim()) return

    setSearching(true)
    setNotFound(false)
    setBooking(null)

    try {
        const res = await fetch(`/api/bookings/search?q=${encodeURIComponent(bookingCode.trim())}&t=${Date.now()}`, { cache: "no-store", headers: { 'Pragma': 'no-cache' } })
        if (res.ok) {
            const data = await res.json()
            if (data && data.length > 0) {
                // Use the recent one if multiple matches (e.g. by phone)
                setBooking(data[0]) 
                setNotFound(false)
            } else {
                setNotFound(true)
            }
        } else {
            setNotFound(true)
        }
    } catch (error) {
        // Handle error jika koneksi gagal
        console.error("Search failed", error)
        setNotFound(true)
    } finally {
        setSearching(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchBooking()
  }

  const statusInfo = booking ? getStatusInfo(booking.booking_status || "pending") : null
  const StatusIcon = statusInfo?.icon || AlertCircle

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-4 py-12 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Cek Status Booking
          </h1>
          <p className="text-muted-foreground text-lg">Masukkan Kode Order (GAS-...) atau Nomor WhatsApp</p>
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
                <Label htmlFor="booking-code">Kode Booking / No. WhatsApp</Label>
                <Input
                  id="booking-code"
                  placeholder="Contoh: GAS-1225-001 atau 081234..."
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
                Booking tidak ditemukan. Pastikan kode order atau nomor telepon sudah benar.
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
                    <p className="text-sm opacity-80">Kode Order</p>
                    <p className="text-2xl font-bold font-mono">{booking.order_number}</p>
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
                        <div className="text-muted-foreground">{booking.customer_name}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">No. WhatsApp</div>
                        <div className="text-muted-foreground">{booking.customer_phone}</div>
                      </div>
                    </div>
                    {booking.customer_identity && (
                      <div className="flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <div className="font-medium">No. Identitas</div>
                          <div className="text-muted-foreground">{booking.customer_identity}</div>
                        </div>
                      </div>
                    )}
                    {booking.customer_email && (
                      <div className="flex items-start gap-3">
                        <div className="h-5 w-5 text-primary mt-0.5">@</div>
                        <div>
                          <div className="font-medium">Email</div>
                          <div className="text-muted-foreground">{booking.customer_email}</div>
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
                          {format(new Date(booking.start_date), "d MMMM yyyy", { locale: localeID })} -{" "}
                          {format(new Date(booking.end_date), "d MMMM yyyy", { locale: localeID })}
                        </div>
                         <div className="text-xs text-muted-foreground mt-1">({booking.total_days} hari)</div>
                      </div>
                    </div>
                    {booking.customer_address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-secondary mt-0.5" />
                        <div>
                          <div className="font-medium">Alamat</div>
                          <div className="text-muted-foreground">{booking.customer_address}</div>
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
                    {booking.booking_items?.map((item, index) => {
                      return (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div>
                            <div className="font-medium">{item.products?.name || "Produk"}</div>
                            <div className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × Rp
                              {(item.price_per_trip || 0).toLocaleString("id-ID")}/trip
                            </div>
                          </div>
                          <div className="font-semibold">
                            Rp{(item.quantity * (item.price_per_trip || 0)).toLocaleString("id-ID")}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>Rp{(booking.subtotal || 0).toLocaleString("id-ID")}</span>
                    </div>
                     {booking.discount_amount > 0 && (
                        <div className="flex justify-between items-center text-sm text-green-600 mt-2">
                        <span>Diskon {booking.discount_code ? `(${booking.discount_code})` : ''}</span>
                        <span>-Rp{(booking.discount_amount || 0).toLocaleString("id-ID")}</span>
                        </div>
                    )}
                </div>


                <div className="border-t pt-6 flex justify-between items-center">
                  <div className="text-lg font-semibold">Total Pembayaran</div>
                  <div className="text-2xl font-bold text-primary">
                    Rp{(booking.total || 0).toLocaleString("id-ID")}
                  </div>
                </div>

                {booking.notes && (
                  <div className="border-t pt-6">
                    <div className="font-medium mb-2">Catatan</div>
                    <div className="text-muted-foreground bg-muted/50 p-3 rounded-lg">{booking.notes}</div>
                  </div>
                )}

                <div className="border-t pt-6 text-center">
                  <div className="text-sm text-muted-foreground">
                    Booking dibuat pada{" "}
                    {format(new Date(booking.created_at), "d MMMM yyyy 'pukul' HH:mm", { locale: localeID })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`border-2 ${
                booking.booking_status === "confirmed"
                  ? "border-blue-200 bg-blue-50"
                  : booking.booking_status === "active"
                    ? "border-green-200 bg-green-50"
                    : booking.booking_status === "completed"
                      ? "border-gray-200 bg-gray-50"
                      : booking.booking_status === "cancelled"
                        ? "border-red-200 bg-red-50"
                        : "border-yellow-200 bg-yellow-50"
              }`}
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`font-medium mb-2 ${
                    booking.booking_status === "confirmed"
                      ? "text-blue-700"
                      : booking.booking_status === "active"
                        ? "text-green-700"
                        : booking.booking_status === "completed"
                          ? "text-gray-700"
                          : booking.booking_status === "cancelled"
                            ? "text-red-700"
                            : "text-yellow-700"
                  }`}
                >
                  {booking.booking_status === "confirmed" && "Pesanan Anda sudah dikonfirmasi!"}
                  {booking.booking_status === "active" && "Barang sedang dalam masa sewa."}
                  {booking.booking_status === "completed" && "Penyewaan telah selesai. Terima kasih!"}
                  {booking.booking_status === "cancelled" && "Pesanan ini dibatalkan."}
                  {(!booking.booking_status || booking.booking_status === "pending") && "Pesanan menunggu konfirmasi admin."}
                </div>
                <div className="text-sm text-muted-foreground">
                  {booking.booking_status === "confirmed" && "Silakan datang ke lokasi untuk mengambil barang sesuai jadwal."}
                  {booking.booking_status === "active" && "Jaga barang dengan baik dan kembalikan tepat waktu."}
                  {booking.booking_status === "completed" && "Semoga pengalaman camping Anda menyenangkan!"}
                  {booking.booking_status === "cancelled" && "Hubungi kami jika ada pertanyaan."}
                  {(!booking.booking_status || booking.booking_status === "pending") &&
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
