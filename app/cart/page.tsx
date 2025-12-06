'use client';

import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getProductById } from '@/lib/products';
import { useCartStore } from '@/lib/cart-store';
import { DateRangePicker } from '@/components/date-range-picker';
import { Trash2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getBookingDaysCount, getBookingErrorMessage } from '@/lib/booking-utils';

export default function CartPage() {
	const { items, rentalPeriod, setRentalPeriod, setQuantity, removeItem, clear } = useCartStore();

	const bookingDays = rentalPeriod?.from && rentalPeriod?.to ? getBookingDaysCount(rentalPeriod.from, rentalPeriod.to) : 0;

	const lineItems = items.map((it) => {
		const p = getProductById(it.productId);
		const pricePerTrip = p?.pricePerTrip ?? 0;
		const name = p?.name ?? 'Produk';
		const image = p?.image ?? '/placeholder.svg?height=480&width=640';
		const stock = p?.stock ?? 0;
		const subtotal = pricePerTrip * it.quantity;
		return { ...it, name, image, pricePerTrip, stock, subtotal };
	});

	const total = lineItems.reduce((acc, li) => acc + li.subtotal, 0);
	const bookingError = rentalPeriod?.from && rentalPeriod?.to ? getBookingErrorMessage(rentalPeriod.from, rentalPeriod.to) : null;

	return (
		<main>
			<SiteHeader />
			<section className="mx-auto max-w-6xl px-4 py-8 grid gap-8 lg:grid-cols-[1fr_380px]">
				<div className="grid gap-6">
					<h1 className="text-2xl font-bold">Keranjang</h1>
					<div className="grid gap-2">
						<span className="text-sm font-medium">Tanggal Sewa (Jumat, Sabtu, Minggu)</span>
						<DateRangePicker value={rentalPeriod} onChange={setRentalPeriod} />
						<p className="text-xs text-muted-foreground">Booking hanya tersedia untuk Jumat, Sabtu, dan Minggu. Hari pengembalian tidak dihitung (exclusive).</p>
					</div>

					{bookingError && (
						<Alert className="border-red-200 bg-red-50">
							<AlertCircle className="h-4 w-4 text-red-600" />
							<AlertDescription className="text-red-700">{bookingError}</AlertDescription>
						</Alert>
					)}

					{lineItems.length === 0 ? (
						<div className="rounded-lg border p-6 text-center">
							Keranjang kosong.{' '}
							<Link className="underline" href="/products">
								Lihat produk
							</Link>
						</div>
					) : (
						<ul className="grid gap-4">
							{lineItems.map((li) => (
								<li key={li.productId} className="flex gap-4 border rounded-lg p-3">
									<div className="relative w-28 h-20 rounded-md overflow-hidden border">
										<Image src={li.image || '/placeholder.svg'} alt={li.name} fill className="object-cover" />
									</div>
									<div className="flex-1 grid gap-1">
										<div className="font-semibold">{li.name}</div>
										<div className="text-sm text-muted-foreground">Rp{li.pricePerTrip.toLocaleString('id-ID')} / trip</div>
										<div className="flex items-center gap-2 mt-2">
											<span className="text-sm">Qty:</span>
											<Input
												type="number"
												className="w-20"
												value={li.quantity}
												min={1}
												max={li.stock}
												onChange={(e) => {
													const val = Number.parseInt(e.target.value || '1', 10);
													setQuantity(li.productId, Math.min(Math.max(1, val), li.stock));
												}}
											/>
											<Button size="icon" variant="ghost" className="ml-auto" onClick={() => removeItem(li.productId)} aria-label={`Hapus ${li.name}`}>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
									<div className="min-w-[120px] text-right">
										<div className="text-sm text-muted-foreground">Subtotal</div>
										<div className="font-semibold">Rp{li.subtotal.toLocaleString('id-ID')}</div>
									</div>
								</li>
							))}
						</ul>
					)}
					{lineItems.length > 0 ? (
						<div className="flex justify-between">
							<Button variant="outline" onClick={() => clear()}>
								Kosongkan
							</Button>
							{/* <Button asChild disabled={!rentalPeriod?.from || !rentalPeriod?.to || !!bookingError}>
                <Link href="/checkout">Lanjut Checkout</Link>
              </Button> */}
						</div>
					) : null}
				</div>

				<aside className="grid gap-4">
					<div className="rounded-lg border p-4 grid gap-2">
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">Hari Booking</span>
							<span className="font-medium">{bookingDays > 0 ? `${bookingDays} hari` : '-'}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">Total</span>
							<span className="font-bold bg-gradient-to-r from-brand-teal to-brand-orange bg-clip-text text-transparent">Rp{total.toLocaleString('id-ID')}</span>
						</div>
						<Button
							asChild
							className="w-full bg-gradient-to-r from-brand-teal to-brand-orange hover:from-brand-teal/90 hover:to-brand-orange/90"
							disabled={lineItems.length === 0 || bookingDays <= 0 || !!bookingError}>
							<Link href="/checkout">Checkout</Link>
						</Button>
						<p className="text-xs text-muted-foreground">Harga belum termasuk deposit/ongkir (jika ada). Ketentuan lengkap akan dikonfirmasi via WhatsApp.</p>
					</div>
				</aside>
			</section>
			<SiteFooter />
		</main>
	);
}
