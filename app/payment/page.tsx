"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createBooking } from "@/lib/booking"
import { sendOrderToWhatsApp } from "@/lib/whatsapp-service"
import { useCartStore } from "@/lib/cart-store"
import { CreditCard, Wallet, Building2, Smartphone, CheckCircle2 } from "lucide-react"

interface CheckoutData {
  customer: {
    name: string
    phone: string
    email: string
    address: string
    identityNumber: string
    note: string
  }
  items: Array<{
    productId: string
    productName: string
    quantity: number
    pricePerTrip: number
  }>
  rentalPeriod: {
    from: string
    to: string
  }
  subtotal: number
  discountCode: string
  discountPercentage: number
  discountAmount: number
  total: number
  days: number
}

const paymentMethods = [
  {
    id: "cash",
    name: "Bayar di Tempat (Cash)",
    description: "Bayar tunai saat pengambilan barang",
    icon: Wallet,
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "transfer_bca",
    name: "Transfer Bank BCA",
    description: "Transfer ke rekening BCA",
    icon: Building2,
    color: "from-blue-500 to-blue-700",
  },
  {
    id: "transfer_mandiri",
    name: "Transfer Bank Mandiri",
    description: "Transfer ke rekening Mandiri",
    icon: Building2,
    color: "from-yellow-500 to-yellow-700",
  },
  {
    id: "transfer_bri",
    name: "Transfer Bank BRI",
    description: "Transfer ke rekening BRI",
    icon: Building2,
    color: "from-blue-600 to-indigo-700",
  },
  {
    id: "ewallet_dana",
    name: "DANA",
    description: "Bayar dengan DANA",
    icon: Smartphone,
    color: "from-blue-400 to-cyan-500",
  },
  {
    id: "ewallet_gopay",
    name: "GoPay",
    description: "Bayar dengan GoPay",
    icon: Smartphone,
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "ewallet_ovo",
    name: "OVO",
    description: "Bayar dengan OVO",
    icon: Smartphone,
    color: "from-purple-500 to-purple-700",
  },
  {
    id: "qris",
    name: "QRIS",
    description: "Scan QR untuk pembayaran",
    icon: CreditCard,
    color: "from-red-500 to-orange-600",
  },
]

export default function PaymentPage() {
  const router = useRouter()
  const cart = useCartStore()
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const data = sessionStorage.getItem("gasoutdoor_checkout_data")
    if (!data) {
      router.push("/checkout")
      return
    }
    try {
      setCheckoutData(JSON.parse(data))
    } catch {
      router.push("/checkout")
    }
  }, [router])

  const handleSubmit = async () => {
    if (!checkoutData || !selectedMethod) return
    setSubmitting(true)

    try {
      const selectedPayment = paymentMethods.find((m) => m.id === selectedMethod)
      const paymentMethodName = selectedPayment?.name || selectedMethod

      // Create booking with payment method
      const bookingId = createBooking({
        customer: checkoutData.customer,
        rentalPeriod: {
          from: new Date(checkoutData.rentalPeriod.from),
          to: new Date(checkoutData.rentalPeriod.to),
        },
        items: checkoutData.items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          pricePerDay: it.pricePerTrip,
        })),
        discountCode: checkoutData.discountCode,
        discountPercentage: checkoutData.discountPercentage,
        discountAmount: checkoutData.discountAmount,
        paymentMethod: paymentMethodName,
      })

      // Send to WhatsApp with payment method
      await sendOrderToWhatsApp({
        bookingId,
        customer: checkoutData.customer,
        items: checkoutData.items.map((l) => ({
          productName: l.productName,
          quantity: l.quantity,
          pricePerTrip: l.pricePerTrip,
        })),
        rentalPeriod: {
          from: new Date(checkoutData.rentalPeriod.from),
          to: new Date(checkoutData.rentalPeriod.to),
        },
        subtotal: checkoutData.subtotal,
        discountCode: checkoutData.discountCode,
        discountPercentage: checkoutData.discountPercentage,
        discountAmount: checkoutData.discountAmount,
        total: checkoutData.total,
        days: checkoutData.days,
        paymentMethod: paymentMethodName,
      })

      // Clear cart and checkout data
      cart.clear()
      sessionStorage.removeItem("gasoutdoor_checkout_data")
      router.push(`/success?id=${encodeURIComponent(bookingId)}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (!checkoutData) {
    return (
      <main>
        <SiteHeader />
        <section className="min-h-screen flex items-center justify-center pt-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </section>
        <SiteFooter />
      </main>
    )
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Pilih Metode Pembayaran</h1>
          <p className="text-muted-foreground">Pilih metode pembayaran yang Anda inginkan</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          <div className="grid gap-4 sm:grid-cols-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon
              const isSelected = selectedMethod === method.id
              return (
                <Card
                  key={method.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    isSelected ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${method.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{method.name}</h3>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
                <CardDescription>Total yang harus dibayar</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rp{checkoutData.subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  {checkoutData.discountPercentage > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Diskon ({checkoutData.discountPercentage}%)</span>
                      <span>-Rp{checkoutData.discountAmount.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between border-t pt-4 font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">Rp{checkoutData.total.toLocaleString("id-ID")}</span>
                </div>

                {selectedMethod && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-1">Metode Pembayaran:</p>
                    <p className="font-semibold">{paymentMethods.find((m) => m.id === selectedMethod)?.name}</p>
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={!selectedMethod || submitting}
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                  size="lg"
                >
                  {submitting ? "Memproses..." : "Buat Pesanan"}
                </Button>
                <Button variant="outline" onClick={() => router.back()} className="w-full">
                  Kembali
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
