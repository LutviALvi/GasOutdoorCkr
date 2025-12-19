'use client';

import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Product } from '@/lib/products';
import { useCartStore } from '@/lib/cart-store';
import { DateRangePicker } from '@/components/date-range-picker';
import { Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getBookingDaysCount, getBookingErrorMessage } from '@/lib/booking-utils';
import { useEffect, useState } from 'react';

export default function CartPage() {
	const { items, rentalPeriod, setRentalPeriod, setQuantity, removeItem, clear } = useCartStore();
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchProducts() {
			setLoading(true);
			try {
				let url = '/api/products';
				if (rentalPeriod?.from && rentalPeriod?.to) {
					const start = new Date(rentalPeriod.from).toISOString();
					const end = new Date(rentalPeriod.to).toISOString();
					url += `?startDate=${start}&endDate=${end}`;
				}

				const res = await fetch(url);
				if (res.ok) {
					const data = await res.json();
					const transformed = data.map((p: Product) => ({
						...p,
						pricePerDay: p.price_per_day,
						pricePerTrip: p.price_per_trip,
					}));
					setProducts(transformed);
				}
			} catch (error) {
				console.error('Error fetching products:', error);
			} finally {
				setLoading(false);
			}
		}
		// Ambil ulang data produk saat periode sewa berubah
		// Ini penting untuk mengecek ketersediaan stok di tanggal tersebut
		fetchProducts();
	}, [rentalPeriod]);

	const getProduct = (productId: string) => products.find((p) => p.id === productId);

	// Hitung durasi sewa
	const bookingDays = rentalPeriod?.from && rentalPeriod?.to ? getBookingDaysCount(rentalPeriod.from, rentalPeriod.to) : 0;
	// Cek apakah ada barang yang melebihi stok tersedia
	const hasStockIssues = items.some(it => {
		const p = getProduct(it.productId);
		return !p || it.quantity > p.stock;
	});

	const lineItems = items.map((it) => {
		const p = getProduct(it.productId);
		const pricePerTrip = p?.pricePerTrip ?? p?.price_per_trip ?? 0;
		const name = p?.name ?? 'Produk';
		const image = p?.image ?? '/placeholder.svg';
		const stock = p?.stock ?? 0;
		const subtotal = pricePerTrip * it.quantity;
		// Tandai jika stok tidak cukup (Overbooked)
		const isOutOfStock = it.quantity > stock;
		
		return { ...it, name, image, pricePerTrip, stock, subtotal, isOutOfStock };
	});

	const total = lineItems.reduce((acc, li) => acc + li.subtotal, 0);
	const bookingError = rentalPeriod?.from && rentalPeriod?.to ? getBookingErrorMessage(rentalPeriod.from, rentalPeriod.to) : null;

	if (loading) {
		return (
			<main className="overflow-x-hidden">
				<SiteHeader />
				<div className="flex items-center justify-center min-h-[400px]">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
				<SiteFooter />
			</main>
		);
	}

	return (
		<main className="overflow-x-hidden">
			<SiteHeader />
			<section className="mx-auto max-w-6xl px-4 py-8 pt-20 grid gap-8 lg:grid-cols-[1fr_380px]">
				<div className="grid gap-6">
					<h1 className="text-2xl font-bold">Keranjang</h1>
					<div className="grid gap-2">
						<span className="text-sm font-medium">Tanggal Sewa (Maks 4 hari)</span>
						<DateRangePicker value={rentalPeriod} onChange={setRentalPeriod} />
						<p className="text-xs text-muted-foreground">Booking mulai hari Jumat, Sabtu, atau Minggu. Maks 4 hari.</p>
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
								// Cart Item Component: Displays product details, price, and quantity controls
								<li key={li.productId} className="flex flex-col sm:flex-row gap-4 border rounded-lg p-3">
									{/* Product Image */}
									<div className="relative w-24 h-24 sm:w-28 sm:h-20 flex-shrink-0 rounded-md overflow-hidden border">
										<Image src={li.image || '/placeholder.svg'} alt={li.name} fill className="object-cover" />
									</div>
									
									{/* Product Details & Quantity */}
									<div className="flex-1 grid gap-1">
										<div className="font-semibold">{li.name}</div>
										<div className="text-sm text-muted-foreground">Rp{li.pricePerTrip.toLocaleString('id-ID')} / trip</div>
										
										{/* Quantity Control: Update quantity with validation */}
										<div className="flex items-center gap-2 mt-2">
											<span className="text-sm">Qty:</span>
											<Input
												type="number"
												className="w-20"
												value={li.quantity}
												min={1}
												max={li.stock}
												onChange={(e) => {
													const val = e.target.value;
													if (val === '') {
														// Izinkan sementara agar user bisa menghapus angka
														// @ts-ignore - kita hack dikit biar UI update, nanti onBlur atau logic lain bisa handle
														setQuantity(li.productId, 0); 
														return; 
													}
													const numVal = parseInt(val, 10);
													if (!isNaN(numVal)) {
														setQuantity(li.productId, Math.min(Math.max(1, numVal), li.stock));
													}
												}}
											/>
											<Button size="icon" variant="ghost" className="ml-auto sm:ml-4" onClick={() => removeItem(li.productId)} aria-label={`Hapus ${li.name}`}>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>

									{/* Subtotal Display */}
									<div className="w-full sm:min-w-[120px] sm:text-right flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end mt-2 sm:mt-0 border-t sm:border-t-0 pt-2 sm:pt-0">
										<div className="text-sm text-muted-foreground sm:hidden">Subtotal</div>
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
						<p className="text-xs text-muted-foreground">Harga belum termasuk deposit/ongkir (jika ada).</p>
					</div>
				</aside>
			</section>
			<SiteFooter />
		</main>
	);
}
