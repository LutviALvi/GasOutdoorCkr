"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users, Search, Phone, Mail, Calendar, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"

// Tipe data Pelanggan yang diagregasi dari history booking
type CustomerData = {
  phone: string
  name: string
  email: string | null
  totalBookings: number
  totalSpent: number
  lastBooking: string
  bookings: any[]
}

export default function CustomersPage() {
  const router = useRouter()
  const { isLoggedIn } = useAuthStore()
  const [customers, setCustomers] = useState<CustomerData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null)
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
      fetchCustomers(true)

      // Real-time listener for bookings (customers are derived from bookings)
      const channel = supabase
        .channel('admin-customers-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings' },
          () => {
            fetchCustomers(false) // Background update
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [isHydrated, isLoggedIn, router])

  // Ambil data pelanggan dari API (yang sudah diolah dari tabel bookings)
  async function fetchCustomers(showLoading = false) {
    try {
      if (showLoading) setLoading(true)
      const res = await fetch(`/api/admin/customers?t=${Date.now()}`, { cache: "no-store", headers: { 'Cache-Control': 'no-cache' } })
      if (res.ok) {
        const data = await res.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  )

  if (!isHydrated || !isLoggedIn) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          Histori Pelanggan
        </h1>
        <p className="text-muted-foreground">Data dari database Supabase</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{customers.length}</div>
            <p className="text-sm text-muted-foreground">Total Pelanggan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-emerald-600">
              {customers.reduce((sum, c) => sum + c.totalBookings, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Transaksi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {/* Hitung total pendapatan dari semua pelanggan (dalam Juta) */}
              Rp{(customers.reduce((sum, c) => sum + c.totalSpent, 0) / 1000000).toFixed(1)}M
            </div>
            <p className="text-sm text-muted-foreground">Total Pendapatan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {customers.filter((c) => c.totalBookings > 1).length}
            </div>
            <p className="text-sm text-muted-foreground">Repeat Customer</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama, telepon, atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pelanggan</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {customers.length === 0 ? "Belum ada data pelanggan" : "Tidak ada hasil pencarian"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead className="text-center">Transaksi</TableHead>
                  <TableHead className="text-right">Total Spend</TableHead>
                  <TableHead>Terakhir</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.phone}>
                    <TableCell>
                      <div className="font-medium">{customer.name}</div>
                      {customer.totalBookings > 2 && (
                        <Badge variant="secondary" className="mt-1">
                          VIP
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{customer.totalBookings}x</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Rp{Number(customer.totalSpent).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(customer.lastBooking), "d MMM yyyy", { locale: localeID })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{selectedCustomer.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedCustomer(null)}>
                ✕
              </Button>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold mb-3">Riwayat Transaksi</h4>
              <div className="space-y-3">
                {selectedCustomer.bookings.map((booking: any) => (
                  <div key={booking.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">#{booking.id.slice(-6)}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.start_date), "d MMM", { locale: localeID })} -{" "}
                          {format(new Date(booking.end_date), "d MMM yyyy", { locale: localeID })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Rp{Number(booking.total).toLocaleString("id-ID")}</p>
                        <Badge
                          className={
                            booking.booking_status === "completed"
                              ? "bg-green-100 text-green-800"
                              : booking.booking_status === "active"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {booking.booking_status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {booking.booking_items?.map((item: any) => (
                        <span key={item.id} className="mr-2">
                          {item.products?.name || "Product"} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
