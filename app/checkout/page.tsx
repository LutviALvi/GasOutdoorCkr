"use client"

import type React from "react"

import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { useCartStore } from "@/lib/cart-store"
import { getProductById } from "@/lib/products"
import { differenceInCalendarDays, format } from "date-fns"
import { id as localeID } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { validateDiscountCode, calculateDiscount } from "@/lib/discount-codes"

export default function CheckoutPage() {
  const router = useRouter()
  const cart = useCartStore()
  const [discountCode, setDiscountCode] = useState("")
  const [discountMessage, setDiscountMessage] = useState("")
  const [discountPercentage, setDiscountPercentage] = useState(0)
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    identityNumber: "",
    note: "",
  })

  const days = useMemo(() => {
    if (cart.rentalPeriod?.from && cart.rentalPeriod?.to) {
      return Math.max(1, differenceInCalendarDays(cart.rentalPeriod.to, cart.rentalPeriod.from))
    }
    return 0
  }, [cart.rentalPeriod])

  const lines = cart.items.map((it) => {
    const p = getProductById(it.productId)
    const pricePerTrip = p?.pricePerTrip ?? 0
    const name = p?.name ?? "Produk"
    const subtotal = pricePerTrip * it.quantity
    return { ...it, name, pricePerTrip, subtotal }
  })
  const subtotal = lines.reduce((a, l) => a + l.subtotal, 0)
  const discountAmount = calculateDiscount(subtotal, discountPercentage)
  const total = subtotal - discountAmount

  const handleApplyDiscount = () => {
    const result = validateDiscountCode(discountCode)
    if (result.valid) {
      setDiscountPercentage(result.percentage)
      setDiscountMessage(result.message)
    } else {
      setDiscountPercentage(0)
      setDiscountMessage(result.message)
    }
  }

  useEffect(() => {
    if (cart.items.length === 0 || days <= 0) {
      // Redirect if no items or dates not set
      // Keep it silent
    }
  }, [cart.items.length, days])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (cart.items.length === 0 || days <= 0) return

    // Store checkout data in sessionStorage for payment page
    const checkoutData = {
      customer: {
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address,
        identityNumber: form.identityNumber,
        note: form.note,
      },
      items: lines.map((l) => ({
        productId: l.productId,
        productName: l.name,
        quantity: l.quantity,
        pricePerTrip: l.pricePerTrip,
      })),
      rentalPeriod: {
        from: cart.rentalPeriod?.from?.toISOString(),
        to: cart.rentalPeriod?.to?.toISOString(),
      },
      subtotal,
      discountCode: discountCode.toUpperCase(),
      discountPercentage,
      discountAmount,
      total,
      days,
    }

    sessionStorage.setItem("gasoutdoor_checkout_data", JSON.stringify(checkoutData))
    router.push("/payment")
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-8 pt-24 grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="grid gap-6">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="identity">No. Identitas (KTP/SIM/Paspor)</Label>
              <Input
                id="identity"
                required
                placeholder="Contoh: 3201234567890123"
                value={form.identityNumber}
                onChange={(e) => setForm({ ...form, identityNumber: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">No. WhatsApp</Label>
              <Input
                id="phone"
                required
                inputMode="tel"
                placeholder="08xxxxxxxxxx"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email (opsional)</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Alamat (untuk antar / pengembalian)</Label>
              <Textarea
                id="address"
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note">Catatan</Label>
              <Textarea
                id="note"
                rows={3}
                placeholder="Contoh: minta disertakan pasak cadangan, dll."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={cart.items.length === 0 || days <= 0}>
                Lanjut ke Pembayaran
              </Button>
              <Button type="button" variant="outline" onClick={() => history.back()}>
                Kembali
              </Button>
            </div>
          </form>
        </div>

        <aside className="rounded-lg border p-4 grid gap-4 h-fit">
          <div className="font-semibold">Ringkasan</div>
          <div className="text-sm grid gap-1">
            <div className="flex justify-between">
              <span>Tanggal</span>
              <span>
                {cart.rentalPeriod?.from && cart.rentalPeriod?.to
                  ? `${format(cart.rentalPeriod.from, "d LLL y", { locale: localeID })} - ${format(
                      cart.rentalPeriod.to,
                      "d LLL y",
                      { locale: localeID },
                    )}`
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Durasi</span>
              <span>{days > 0 ? `${days} hari` : "-"}</span>
            </div>
          </div>
          <ul className="grid gap-2">
            {lines.map((l) => (
              <li key={l.productId} className="flex justify-between text-sm">
                <span className="line-clamp-1">
                  {l.name} x{l.quantity}
                </span>
                <span>Rp{l.subtotal.toLocaleString("id-ID")}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t pt-2 text-sm">
            <span>Subtotal</span>
            <span>Rp{subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="grid gap-2 border-t pt-2">
            <Label htmlFor="discount" className="text-sm">
              Kode Diskon
            </Label>
            <div className="flex gap-2">
              <Input
                id="discount"
                placeholder="Masukkan kode diskon"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="text-sm"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleApplyDiscount}>
                Terapkan
              </Button>
            </div>
            {discountMessage && (
              <p className={`text-xs ${discountPercentage > 0 ? "text-emerald-600" : "text-red-600"}`}>
                {discountMessage}
              </p>
            )}
          </div>
          {discountPercentage > 0 && (
            <div className="flex justify-between text-sm text-emerald-600">
              <span>Diskon ({discountPercentage}%)</span>
              <span>-Rp{discountAmount.toLocaleString("id-ID")}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Total</span>
            <span className="text-primary">Rp{total.toLocaleString("id-ID")}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Dengan menekan "Lanjut ke Pembayaran", Anda setuju dengan syarat & ketentuan penyewaan GASOUTDOOR.CKR.
          </p>
        </aside>
      </section>
      <SiteFooter />
    </main>
  )
}
