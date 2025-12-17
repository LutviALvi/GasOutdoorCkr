"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { DateRange } from "react-day-picker"

type CartItem = {
  productId: string
  quantity: number
}

type CartState = {
  items: CartItem[] // Daftar barang di keranjang
  rentalPeriod?: DateRange // Tanggal sewa yang dipilih
  addItem: (productId: string, qty?: number) => void // Fungsi tambah barang
  removeItem: (productId: string) => void // Fungsi hapus barang
  setQuantity: (productId: string, quantity: number) => void // Fungsi ubah jumlah barang
  setRentalPeriod: (range: DateRange | undefined) => void // Fungsi atur tanggal sewa
  clear: () => void // Fungsi kosongkan keranjang
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      rentalPeriod: undefined,
      addItem: (productId, qty = 1) =>
        set((state) => {
          // Cari apakah barang sudah ada di keranjang
          const idx = state.items.findIndex((i) => i.productId === productId)
          if (idx >= 0) {
            // Jika ada, tambahkan jumlahnya saja
            const items = [...state.items]
            items[idx] = { ...items[idx], quantity: items[idx].quantity + qty }
            return { items }
          }
          // Jika belum ada, masukkan sebagai item baru
          return { items: [...state.items, { productId, quantity: qty }] }
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        })),
      setRentalPeriod: (range) => set({ rentalPeriod: range }),
      clear: () => set({ items: [], rentalPeriod: undefined }),
    }),
    {
      name: "gasoutdoor_cart", // Nama key di LocalStorage browser
      storage: createJSONStorage(() => localStorage),
      // Hanya simpan items dan rentalPeriod agar tidak hilang saat refresh
      partialize: (s) => ({ items: s.items, rentalPeriod: s.rentalPeriod }),
    },
  ),
)
