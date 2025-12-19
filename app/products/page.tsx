'use client';

import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ProductCard from '@/components/product-card';
import { type Product } from '@/lib/products';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useEffect, useMemo, useState } from 'react';
import { DateRangePicker } from '@/components/date-range-picker';
import { useCartStore } from '@/lib/cart-store';
import { addDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Loader2 } from 'lucide-react';

export default function ProductsPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [q, setQ] = useState('');
	const [category, setCategory] = useState<string>('Semua');
	const { rentalPeriod, setRentalPeriod } = useCartStore();

	// Fetch products from API on mount or when rental period changes
	useEffect(() => {
		async function fetchProducts() {
			setLoading(true);
			try {
				let url = '/api/products';
				// Append booking dates to calculate real-time stock availability
				if (rentalPeriod?.from && rentalPeriod?.to) {
					const start = new Date(rentalPeriod.from).toISOString();
					const end = new Date(rentalPeriod.to).toISOString();
					url += `?startDate=${start}&endDate=${end}`;
				}

				const res = await fetch(url);
				if (res.ok) {
					const data = await res.json();
					// Transform API response to match Product type interface
					const transformed = data.map((p: any) => ({
						...p,
						pricePerDay: p.price_per_day,
						pricePerTrip: p.price_per_trip,
						// Jika user belum memilih tanggal, gunakan stok dummy (50) agar terlihat banyak
						// Jika sudah memilih tanggal, gunakan stok asli dari database
						stock: (rentalPeriod?.from && rentalPeriod?.to) ? p.stock : 50,
					}));
					setProducts(transformed);
				}
			} catch (error) {
				console.error('Error fetching products:', error);
			} finally {
				setLoading(false);
			}
		}
		
		fetchProducts();
	}, [rentalPeriod]); // Re-fetch when rental period changes

	// Extract unique categories from product list for filter tabs
	const categories = useMemo(() => {
		const s = new Set<string>(['Semua']);
		products.forEach((p) => s.add(p.category));
		return Array.from(s);
	}, [products]);

	// Filter products based on selected category and search term
	const filtered = useMemo(() => {
		return products.filter((p) => {
			const okCat = category === 'Semua' || p.category === category;
			const okQ = q.length === 0 || p.name.toLowerCase().includes(q.toLowerCase());
			return okCat && okQ;
		});
	}, [q, category, products]);

	// Handle date range updates from DateRangePicker
	const handleDateChange = (range: DateRange | undefined) => {
		setRentalPeriod(range);
	};

	return (
		<main>
			<SiteHeader />
			<section className="mx-auto max-w-6xl px-4 py-8 grid gap-6">
				{/* Date Picker Section */}
				<div className="grid gap-2">
					<Label>Pilih Tanggal Sewa</Label>
					<DateRangePicker value={rentalPeriod} onChange={handleDateChange} />
					<p className="text-sm text-brand-navy/60 mt-1">Durasi otomatis 4 hari (Jumat-Minggu/Senin)</p>
				</div>

                {/* Search and Filter Section */}
				<div className="flex flex-col sm:flex-row items-start gap-3 sm:items-end">
					<div className="grid gap-2 w-full sm:max-w-xs">
						<Label htmlFor="search">Cari produk</Label>
						<Input id="search" placeholder="Cari tenda, kompor, dll." value={q} onChange={(e) => setQ(e.target.value)} />
					</div>
				</div>

                {/* Category Tabs */}
				<div className="grid gap-2">
					<Label>Kategori</Label>
					<div className="flex gap-2 overflow-x-auto scrollbar-hide">
						{categories.map((c) => (
							<Button key={c} variant={category === c ? 'default' : 'outline'} size="sm" className="whitespace-nowrap" onClick={() => setCategory(c)}>
								{c}
							</Button>
						))}
					</div>
				</div>

                {/* Product List Grid */}
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : filtered.length === 0 ? (
					<div className="text-center py-12 text-muted-foreground">
						{products.length === 0 ? 'Belum ada produk di database' : 'Tidak ada produk yang cocok'}
					</div>
				) : (
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
						{filtered.map((p: Product) => (
							<ProductCard key={p.id} product={p} />
						))}
					</div>
				)}
			</section>
			<SiteFooter />
		</main>
	);
}
