"use client"

import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { useParams } from "next/navigation"
import { getProductBySlug } from "@/lib/products"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"
import { Badge } from "@/components/ui/badge"
import { DateRangePicker } from "@/components/date-range-picker"
import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { DateRange } from "react-day-picker"

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>()
  const product = getProductBySlug(params.slug)
  const { addItem, rentalPeriod } = useCartStore()
  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>(undefined)
  const [quantity, setQuantity] = useState(1)

  if (!product) {
    return (
      <main>
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="text-center">Produk tidak ditemukan.</div>
        </div>
        <SiteFooter />
      </main>
    )
  }

  const dummyStock = 10
  const displayStock = selectedDates?.from && selectedDates?.to ? product.stock : dummyStock
  const isDateSelected = selectedDates?.from && selectedDates?.to

  const handleAddToCart = () => {
    if (!isDateSelected) {
      return
    }
    addItem(product.id, quantity)
    setSelectedDates(undefined)
    setQuantity(1)
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-8 grid gap-8 lg:grid-cols-2">
        <div className="grid gap-3">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={`Foto ${product.name}`}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
        <div className="grid gap-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <Badge variant="secondary">{product.category}</Badge>
          </div>
          <div className="text-muted-foreground">{product.description}</div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold bg-gradient-to-r from-brand-teal to-brand-orange bg-clip-text text-transparent">
              Rp{product.pricePerDay.toLocaleString("id-ID")}
            </div>
            <div className="text-muted-foreground">/hari</div>
          </div>

          <Alert
            className={!isDateSelected ? "border-brand-orange/50 bg-brand-coral/10" : "border-green-200 bg-green-50"}
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {isDateSelected ? (
                <span className="text-green-700">Tanggal dipilih. Stok real: {displayStock} tersedia</span>
              ) : (
                <span className="text-brand-orange">Pilih tanggal sewa terlebih dahulu untuk melihat stok real</span>
              )}
            </AlertDescription>
          </Alert>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Pilih Tanggal Sewa</label>
            <DateRangePicker value={selectedDates} onChange={setSelectedDates} />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Stok Tersedia: {displayStock}</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={displayStock}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(Math.max(1, Number(e.target.value)), displayStock))}
                className="w-20 px-3 py-2 border rounded-md"
              />
              <span className="text-sm text-muted-foreground">unit</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAddToCart}
              disabled={displayStock <= 0 || !isDateSelected}
              className="bg-gradient-to-r from-brand-teal to-brand-orange hover:from-brand-teal/90 hover:to-brand-orange/90"
            >
              Tambah ke Keranjang
            </Button>
            <Button variant="outline" asChild>
              <a href="/cart">Lihat Keranjang</a>
            </Button>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
