import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';

export interface OrderDetails {
	bookingId: string;
	customer: {
		name: string;
		phone: string;
		email: string;
		address: string;
		identityNumber?: string;
		note: string;
	};
	items: Array<{
		productName: string;
		quantity: number;
		pricePerTrip: number;
	}>;
	rentalPeriod: {
		from: Date;
		to: Date;
	};
	subtotal: number;
	discountCode?: string;
	discountPercentage?: number;
	discountAmount?: number;
	total: number;
	days: number;
	paymentMethod?: string; // Added paymentMethod
}

export async function sendOrderToWhatsApp(order: OrderDetails) {
	const adminPhone = '+6285156247282';

	// Format order message with invoice
	const itemsList = order.items.map((item) => `• ${item.productName} x${item.quantity} = Rp${(item.pricePerTrip * item.quantity).toLocaleString('id-ID')}`).join('\n');

	const discountSection =
		order.discountPercentage && order.discountPercentage > 0 ? `   Diskon (${order.discountCode} - ${order.discountPercentage}%): -Rp${(order.discountAmount ?? 0).toLocaleString('id-ID')}\n` : '';

	const paymentMethodSection = order.paymentMethod ? `\n💳 *METODE PEMBAYARAN:*\n   ${order.paymentMethod}\n` : '';

	const message = `

 *Haii Admin*   
aku Mau rental . Berikut detailnya:

📋 *KODE BOOKING :* ${order.bookingId}

👤 *DATA PENYEWA:*
   Nama           : ${order.customer.name}
   No. Identitas  : ${order.customer.identityNumber || '-'}
   No. WA         : ${order.customer.phone}
   Email          : ${order.customer.email || '-'}
   Alamat         : ${order.customer.address}

📅 *PERIODE SEWA:*
   Dari   : ${format(order.rentalPeriod.from, 'EEEE, d MMMM yyyy', { locale: localeID })}
   Sampai : ${format(order.rentalPeriod.to, 'EEEE, d MMMM yyyy', { locale: localeID })}
   Durasi : ${order.days} hari

📦 *ITEM SEWA:*
${itemsList}

💰 *RINGKASAN PEMBAYARAN:*
  Subtotal  : Rp${order.subtotal.toLocaleString('id-ID')}
  ${discountSection}   
  Total     : Rp${order.total.toLocaleString('id-ID')}

  *DP 30%   :* Rp${Math.round(order.total * 0.3).toLocaleString('id-ID')}

${paymentMethodSection}
📝 *CATATAN :*
${order.customer.note || 'Tidak ada catatan'}

═════════════════


Terima kasih! 🙏
  `.trim();

	// Create WhatsApp link
	const encodedMessage = encodeURIComponent(message);
	const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodedMessage}`;

	// Open WhatsApp in new window
	window.open(whatsappUrl, '_blank');

	// Also try to send via API if available (optional backend integration)
	try {
		await fetch('/api/send-whatsapp', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ phone: adminPhone, message }),
		}).catch(() => {
			// Silently fail if API not available
		});
	} catch {
		// Silently fail
	}
}
