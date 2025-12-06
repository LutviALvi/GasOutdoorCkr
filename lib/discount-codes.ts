// Discount codes database (in production, this would be in a database)
export const DISCOUNT_CODES: Record<string, { percentage: number; maxUses?: number; description: string }> = {
  GASOUTDOOR10: { percentage: 10, description: "Diskon 10% untuk semua produk" },
  PROMO20: { percentage: 20, maxUses: 50, description: "Diskon 20% - Promo terbatas" },
  MEMBER15: { percentage: 15, description: "Diskon 15% untuk member" },
  WEEKEND25: { percentage: 25, description: "Diskon 25% untuk pemesanan akhir pekan" },
}

export function validateDiscountCode(code: string): { valid: boolean; percentage: number; message: string } {
  const upperCode = code.toUpperCase().trim()

  if (!upperCode) {
    return { valid: false, percentage: 0, message: "Masukkan kode diskon" }
  }

  const discount = DISCOUNT_CODES[upperCode]

  if (!discount) {
    return { valid: false, percentage: 0, message: "Kode diskon tidak valid" }
  }

  return { valid: true, percentage: discount.percentage, message: `Diskon ${discount.percentage}% berhasil diterapkan` }
}

export function calculateDiscount(total: number, percentage: number): number {
  return Math.round((total * percentage) / 100)
}
