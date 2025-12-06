"use client"

import { Star } from "lucide-react"
import Image from "next/image"

const reviews = [
  {
    id: 1,
    name: "Budi Santoso",
    avatar: "/placeholder.svg?height=48&width=48&text=BS",
    rating: 5,
    text: "Pelayanan sangat memuaskan! Barang-barang berkualitas dan bersih. Pasti sewa lagi di sini.",
    date: "2 minggu lalu",
  },
  {
    id: 2,
    name: "Siti Rahayu",
    avatar: "/placeholder.svg?height=48&width=48&text=SR",
    rating: 5,
    text: "Tenda dan sleeping bag nya nyaman banget. Harga juga bersahabat. Recommended!",
    date: "1 bulan lalu",
  },
  {
    id: 3,
    name: "Ahmad Fauzi",
    avatar: "/placeholder.svg?height=48&width=48&text=AF",
    rating: 5,
    text: "Proses booking mudah, pengambilan cepat. Admin responsif dan ramah. Top!",
    date: "3 minggu lalu",
  },
  {
    id: 4,
    name: "Dewi Lestari",
    avatar: "/placeholder.svg?height=48&width=48&text=DL",
    rating: 4,
    text: "Sudah 3x sewa di sini, selalu puas. Stok lengkap dan kondisi barang selalu prima.",
    date: "1 minggu lalu",
  },
  {
    id: 5,
    name: "Rizky Pratama",
    avatar: "/placeholder.svg?height=48&width=48&text=RP",
    rating: 5,
    text: "Kompor dan peralatan masaknya lengkap. Camping jadi lebih seru!",
    date: "2 bulan lalu",
  },
  {
    id: 6,
    name: "Anisa Putri",
    avatar: "/placeholder.svg?height=48&width=48&text=AP",
    rating: 5,
    text: "Pertama kali camping dan sewa di sini. Adminnya sabar banget jelasin cara pakai alat-alatnya.",
    date: "1 bulan lalu",
  },
  {
    id: 7,
    name: "Hendra Wijaya",
    avatar: "/placeholder.svg?height=48&width=48&text=HW",
    rating: 5,
    text: "Harga paling murah di Cikarang dengan kualitas terbaik. Langganan!",
    date: "3 bulan lalu",
  },
  {
    id: 8,
    name: "Maya Sari",
    avatar: "/placeholder.svg?height=48&width=48&text=MS",
    rating: 4,
    text: "Carrier nya enak dipakai hiking. Bisa request antar juga, sangat membantu.",
    date: "2 minggu lalu",
  },
]

function ReviewCard({ review }: { review: (typeof reviews)[0] }) {
  return (
    <div className="flex-shrink-0 w-80 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mx-3">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative h-12 w-12 rounded-full overflow-hidden">
          <Image src={review.avatar || "/placeholder.svg"} alt={review.name} fill className="object-cover" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{review.name}</h4>
          <p className="text-xs text-gray-500">{review.date}</p>
        </div>
      </div>
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">{review.text}</p>
    </div>
  )
}

export default function ReviewMarquee() {
  return (
    <section className="py-20 overflow-hidden bg-gradient-to-br from-brand-cream via-white to-brand-mint/20">
      <div className="mx-auto max-w-6xl px-4 mb-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-brand-navy via-brand-teal to-brand-sage bg-clip-text text-transparent">
            Apa Kata Pelanggan Kami
          </h2>
          <p className="text-brand-navy/70 text-lg">Testimoni dari para petualang yang sudah mempercayai GASOUTDOOR</p>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-brand-cream to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-brand-cream to-transparent z-10 pointer-events-none" />

        {/* First Row - Right to Left */}
        <div className="flex mb-6 animate-marquee">
          {[...reviews, ...reviews].map((review, idx) => (
            <ReviewCard key={`row1-${idx}`} review={review} />
          ))}
        </div>

        {/* Second Row - Left to Right */}
        <div className="flex animate-marquee-reverse">
          {[...reviews.slice().reverse(), ...reviews.slice().reverse()].map((review, idx) => (
            <ReviewCard key={`row2-${idx}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  )
}
