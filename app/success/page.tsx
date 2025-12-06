"use client"

import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { useSearchParams } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function SuccessPage() {
  const sp = useSearchParams()
  const id = sp.get("id") ?? "—"

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-16 grid place-items-center text-center gap-6">
        <CheckCircle2 className="h-14 w-14 text-emerald-600" />
        <div className="grid gap-2">
          <h1 className="text-2xl font-bold">Pesanan Berhasil Dibuat</h1>
          <p className="text-muted-foreground">Terima kasih! Kode booking Anda:</p>
          <div className="text-2xl font-extrabold tracking-wide">{id}</div>
        </div>
        <div className="flex gap-3">
          <Link href="/products" className="underline">
            Sewa Lagi
          </Link>
          <Link href="/" className="underline">
            Kembali ke Beranda
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
