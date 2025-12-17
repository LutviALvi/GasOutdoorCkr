import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export type InvoiceData = {
  bookingId: string
  customerName: string
  customerEmail: string
  items: {
    name: string
    quantity: number
    price: number
  }[]
  subtotal: number
  taxAmount: number
  total: number
  rentalPeriod: {
    from: string
    to: string
  }
  paymentMethod: string
}

export async function sendInvoiceEmail(data: InvoiceData) {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">Rp${item.price.toLocaleString("id-ID")}</td>
      </tr>
    `
    )
    .join("")

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice #${data.bookingId}</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0d9488 0%, #f97316 100%); padding: 20px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">GASOUTDOOR.CKR</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Invoice Pembayaran</p>
      </div>
      
      <div style="border: 1px solid #eee; border-top: none; padding: 20px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #0d9488;">Invoice #${data.bookingId}</h2>
        
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 5px 0;"><strong>Nama:</strong> ${data.customerName}</p>
          <p style="margin: 5px 0;"><strong>Periode Sewa:</strong> ${data.rentalPeriod.from} - ${data.rentalPeriod.to}</p>
          <p style="margin: 5px 0;"><strong>Metode Pembayaran:</strong> ${data.paymentMethod}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Harga</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; text-align: right;">
          <p style="margin: 5px 0;">Subtotal: <strong>Rp${data.subtotal.toLocaleString("id-ID")}</strong></p>
          <p style="margin: 5px 0; color: #666;">Pajak (11%): <strong>Rp${data.taxAmount.toLocaleString("id-ID")}</strong></p>
          <p style="margin: 10px 0; font-size: 1.2em; color: #0d9488;">
            Total: <strong>Rp${data.total.toLocaleString("id-ID")}</strong>
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
          <p>Terima kasih telah menyewa di GASOUTDOOR.CKR!</p>
          <p style="font-size: 0.9em;">Jika ada pertanyaan, hubungi kami via WhatsApp.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"GasOutdoor" <noreply@gasoutdoor.com>',
      to: data.customerEmail,
      subject: `Invoice Pesanan #${data.bookingId} - GasOutdoor`,
      html,
    })
    console.log("Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Email Error:", error)
    return { success: false, error }
  }
}
