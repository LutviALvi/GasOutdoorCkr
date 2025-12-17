"use client"

import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"
import { Badge } from "@/components/ui/badge"
import { DateRangePicker } from "@/components/date-range-picker"
import { useState, useEffect } from "react"
import { AlertCircle, Loader2, Star } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { DateRange } from "react-day-picker"
import type { Product } from "@/lib/products"
import { toast } from "sonner"

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const { addItem, rentalPeriod, setRentalPeriod } = useCartStore()
  const [quantity, setQuantity] = useState(1)

  // Fetch product details based on slug
  useEffect(() => {
    async function fetchProduct() {
      try {
        let url = "/api/products"
        // Append booking dates to calculate real-time stock availability
        if (rentalPeriod?.from && rentalPeriod?.to) {
          const start = new Date(rentalPeriod.from).toISOString()
          const end = new Date(rentalPeriod.to).toISOString()
          url += `?startDate=${start}&endDate=${end}`
        }

        const res = await fetch(url)
        if (res.ok) {
          const products = await res.json()
          const found = products.find((p: Product) => p.slug === params.slug)
          if (found) {
            setProduct({
              ...found,
              pricePerDay: found.price_per_day,
              pricePerTrip: found.price_per_trip,
              // Jika user belum memilih tanggal, gunakan stok dummy (50) agar terlihat banyak
              stock: (rentalPeriod?.from && rentalPeriod?.to) ? found.stock : 50,
            })
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [params.slug, rentalPeriod]) // Re-fetch when slug or rental period changes

  if (loading) {
    return (
      <main>
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-4 py-10 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <SiteFooter />
      </main>
    )
  }

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

  const isDateSelected = rentalPeriod?.from && rentalPeriod?.to
  const displayStock = product.stock

  // Add item to cart with validation
  const handleAddToCart = () => {
    if (!isDateSelected) {
      toast.error("Pilih tanggal sewa terlebih dahulu")
      return
    }
    addItem(product.id, quantity)
    toast.success(`${product.name} ditambahkan ke keranjang`)
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
            <div>
                <h1 className="text-2xl font-bold">{product.name}</h1>
                 {/* 5-Star Rating Badge */}
                <div className="flex items-center gap-1 mt-1">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-orange-400 fill-current" />
                        ))}
                    </div>
                    <span className="text-sm font-medium text-muted-foreground ml-1">5.0 (25 Review)</span>
                </div>
            </div>
            <Badge variant="secondary">{product.category}</Badge>
          </div>
          
          <div className="text-muted-foreground">{product.description}</div>
          
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold bg-gradient-to-r from-brand-teal to-brand-orange bg-clip-text text-transparent">
              Rp{(product.pricePerTrip || 0).toLocaleString("id-ID")}
            </div>
            <div className="text-muted-foreground">/ trip</div>
          </div>

          <Alert
            className={!isDateSelected ? "border-brand-orange/50 bg-brand-coral/10" : "border-green-200 bg-green-50"}
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {isDateSelected ? (
                <span className="text-green-700">Tanggal dipilih. Stok tersedia: {displayStock} unit</span>
              ) : (
                <span className="text-brand-orange">Pilih tanggal sewa terlebih dahulu (Jumat/Sabtu/Minggu)</span>
              )}
            </AlertDescription>
          </Alert>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Pilih Tanggal Sewa</label>
            <DateRangePicker value={rentalPeriod} onChange={setRentalPeriod} />
            <p className="text-xs text-muted-foreground">
              Sewa mulai di hari Jumat, Sabtu, atau Minggu. Maks 4 hari.
            </p>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Jumlah: {displayStock} tersedia</label>
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
