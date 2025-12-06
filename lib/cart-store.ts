"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { DateRange } from "react-day-picker"

type CartItem = {
  productId: string
  quantity: number
}

type CartState = {
  items: CartItem[]
  rentalPeriod?: DateRange
  addItem: (productId: string, qty?: number) => void
  removeItem: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  setRentalPeriod: (range: DateRange | undefined) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      rentalPeriod: undefined,
      addItem: (productId, qty = 1) =>
        set((state) => {
          const idx = state.items.findIndex((i) => i.productId === productId)
          if (idx >= 0) {
            const items = [...state.items]
            items[idx] = { ...items[idx], quantity: items[idx].quantity + qty }
            return { items }
          }
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
      name: "gasoutdoor_cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, rentalPeriod: s.rentalPeriod }),
    },
  ),
)
