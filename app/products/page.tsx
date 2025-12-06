"use client"

import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import ProductCard from "@/components/product-card"
import { PRODUCTS, type Product } from "@/lib/products"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useMemo, useState } from "react"
import { DateRangePicker } from "@/components/date-range-picker"
import { useCartStore } from "@/lib/cart-store"
import { addDays } from "date-fns"
import type { DateRange } from "react-day-picker"

export default function ProductsPage() {
  const [q, setQ] = useState("")
  const [category, setCategory] = useState<string>("Semua")
  const { rentalPeriod, setRentalPeriod } = useCartStore()

  const categories = useMemo(() => {
    const s = new Set<string>(["Semua"])
    PRODUCTS.forEach((p) => s.add(p.category))
    return Array.from(s)
  }, [])

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const okCat = category === "Semua" || p.category === category
      const okQ = q.length === 0 || p.name.toLowerCase().includes(q.toLowerCase())
      return okCat && okQ
    })
  }, [q, category])

  const handleDateChange = (range: DateRange | undefined) => {
    if (range?.from && !range?.to) {
      const endDate = addDays(range.from, 3)
      setRentalPeriod({ from: range.from, to: endDate })
    } else {
      setRentalPeriod(range)
    }
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-8 grid gap-6">
        <div className="grid gap-2">
          <Label>Pilih Tanggal Sewa</Label>
          <DateRangePicker value={rentalPeriod} onChange={handleDateChange} />
          <p className="text-xs text-muted-foreground">
            Durasi otomatis terisi 3 hari. Anda bisa mengubahnya sesuai kebutuhan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-3 sm:items-end">
          <div className="grid gap-2 w-full sm:max-w-xs">
            <Label htmlFor="search">Cari produk</Label>
            <Input
              id="search"
              placeholder="Cari tenda, kompor, dll."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Kategori</Label>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((c) => (
              <Button
                key={c}
                variant={category === c ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap"
                onClick={() => setCategory(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p: Product) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
