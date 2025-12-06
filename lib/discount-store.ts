"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface DiscountCode {
  id: string
  code: string
  percentage: number
  maxUses?: number
  usedCount: number
  description: string
  validFrom?: string
  validTo?: string
  isActive: boolean
  createdAt: string
}

interface DiscountStore {
  discountCodes: DiscountCode[]
  addDiscountCode: (discount: Omit<DiscountCode, "id" | "usedCount" | "createdAt">) => void
  updateDiscountCode: (id: string, discount: Partial<DiscountCode>) => void
  deleteDiscountCode: (id: string) => void
  validateCode: (code: string) => { valid: boolean; percentage: number; message: string }
  incrementUsage: (code: string) => void
}

// Default discount codes
const defaultDiscounts: DiscountCode[] = [
  {
    id: "1",
    code: "GASOUTDOOR10",
    percentage: 10,
    description: "Diskon 10% untuk semua produk",
    usedCount: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    code: "PROMO20",
    percentage: 20,
    maxUses: 50,
    description: "Diskon 20% - Promo terbatas",
    usedCount: 12,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    code: "MEMBER15",
    percentage: 15,
    description: "Diskon 15% untuk member",
    usedCount: 8,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    code: "WEEKEND25",
    percentage: 25,
    description: "Diskon 25% untuk pemesanan akhir pekan",
    usedCount: 3,
    isActive: false,
    createdAt: new Date().toISOString(),
  },
]

export const useDiscountStore = create<DiscountStore>()(
  persist(
    (set, get) => ({
      discountCodes: defaultDiscounts,
      addDiscountCode: (discount) =>
        set((state) => ({
          discountCodes: [
            ...state.discountCodes,
            {
              ...discount,
              id: Date.now().toString(),
              usedCount: 0,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateDiscountCode: (id, discount) =>
        set((state) => ({
          discountCodes: state.discountCodes.map((d) => (d.id === id ? { ...d, ...discount } : d)),
        })),
      deleteDiscountCode: (id) =>
        set((state) => ({
          discountCodes: state.discountCodes.filter((d) => d.id !== id),
        })),
      validateCode: (code) => {
        const upperCode = code.toUpperCase().trim()
        if (!upperCode) {
          return { valid: false, percentage: 0, message: "Masukkan kode diskon" }
        }
        const discount = get().discountCodes.find((d) => d.code.toUpperCase() === upperCode && d.isActive)
        if (!discount) {
          return { valid: false, percentage: 0, message: "Kode diskon tidak valid atau sudah tidak aktif" }
        }
        if (discount.maxUses && discount.usedCount >= discount.maxUses) {
          return { valid: false, percentage: 0, message: "Kode diskon sudah mencapai batas penggunaan" }
        }
        if (discount.validFrom && new Date(discount.validFrom) > new Date()) {
          return { valid: false, percentage: 0, message: "Kode diskon belum aktif" }
        }
        if (discount.validTo && new Date(discount.validTo) < new Date()) {
          return { valid: false, percentage: 0, message: "Kode diskon sudah expired" }
        }
        return {
          valid: true,
          percentage: discount.percentage,
          message: `Diskon ${discount.percentage}% berhasil diterapkan`,
        }
      },
      incrementUsage: (code) =>
        set((state) => ({
          discountCodes: state.discountCodes.map((d) =>
            d.code.toUpperCase() === code.toUpperCase() ? { ...d, usedCount: d.usedCount + 1 } : d,
          ),
        })),
    }),
    {
      name: "gasoutdoor-discounts",
    },
  ),
)
