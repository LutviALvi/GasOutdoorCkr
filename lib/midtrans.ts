import midtransClient from "midtrans-client"

// Initialize Snap client
export const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
})

// Tax rate (PPN 11%)
const TAX_RATE = 0.11

export type TransactionDetails = {
  orderId: string
  grossAmount: number
  customer: {
    first_name: string
    email: string
    phone: string
  }
  items: {
    id: string
    price: number
    quantity: number
    name: string
  }[]
}

export function calculateTax(subtotal: number) {
  return Math.round(subtotal * TAX_RATE)
}

export function calculateTotal(subtotal: number) {
  return subtotal + calculateTax(subtotal)
}

export async function createTransaction(details: TransactionDetails) {
  const subtotal = details.grossAmount
  const taxAmount = calculateTax(subtotal)
  const totalAmount = calculateTotal(subtotal)

  const parameter = {
    transaction_details: {
      order_id: details.orderId,
      gross_amount: totalAmount,
    },
    item_details: [
      ...details.items,
      {
        id: "TAX",
        price: taxAmount,
        quantity: 1,
        name: "Pajak (PPN 11%)",
      },
    ],
    customer_details: details.customer,
    // Only allow QRIS and E-Wallet payments
    enabled_payments: ["gopay", "qris", "shopeepay", "other_qris"],
  }

  try {
    const transaction = await snap.createTransaction(parameter)
    return {
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      subtotal,
      taxAmount,
      totalAmount,
    }
  } catch (error) {
    console.error("Midtrans Error:", error)
    throw error
  }
}

// Verify notification signature
export function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string
): boolean {
  const crypto = require("crypto")
  const hash = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex")
  return hash === signatureKey
}
