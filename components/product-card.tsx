'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/lib/cart-store';
import type { Product } from '@/lib/products';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductCard({ product }: { product?: Product }) {
	const addItem = useCartStore((s) => s.addItem); // Fungsi untuk tambah ke keranjang
	const rentalPeriod = useCartStore((s) => s.rentalPeriod); // Mengambil tanggal sewa dari global store
	
	// Data default jika produk tidak valid (fallback)
	const p: Product = product ?? {
		id: 'placeholder',
		slug: 'placeholder',
		name: 'Produk',
		category: 'Lainnya',
		price_per_day: 0,
		price_per_trip: 0,
		pricePerDay: 0,
		pricePerTrip: 0,
		stock: 0,
		image: '/placeholder.svg?height=480&width=640',
		description: 'Deskripsi produk.',
	};

	// Fungsi helper untuk menentukan warna label kategori
	const getCategoryColor = (category: string) => {
		switch (category) {
			case 'Tenda':
				return 'bg-gradient-to-r from-brand-teal to-brand-sage text-white';
			case 'Tidur':
				return 'bg-gradient-to-r from-brand-orange to-brand-coral text-white';
			case 'Dapur':
				return 'bg-gradient-to-r from-brand-sage to-brand-mint text-brand-navy';
			case 'Penerangan':
				return 'bg-gradient-to-r from-brand-sunset to-brand-orange text-white';
			case 'Kursi/Meja':
				return 'bg-gradient-to-r from-brand-navy to-brand-teal text-white';
			default:
				return 'bg-gradient-to-r from-brand-lavender to-brand-mint text-brand-navy';
		}
	};

	// Cek apakah user sudah pilih tanggal sewa
	const isDateSelected = rentalPeriod?.from && rentalPeriod?.to;

	const handleAddToCart = () => {
		// Tambahkan item ke keranjang belanja
		addItem(p.id, 1);
		// Munculkan notifikasi sukses (Toast)
		toast.success(`${p.name} ditambahkan ke keranjang!`, {
			description: 'Klik keranjang untuk melihat pesanan Anda.',
			icon: <ShoppingCart className="h-4 w-4" />,
			duration: 3000,
		});
	};

	return (
		<Card className="h-full flex flex-col group hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-brand-mint/40 overflow-hidden bg-gradient-to-br from-white to-brand-cream/30">
			<div className="relative">
				<Link href={`/products/${p.slug}`} className="relative block aspect-[4/3] overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-t from-brand-navy/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 z-10"></div>
					<Image
						src={p.image || '/placeholder.svg'}
						alt={`Foto ${p.name}`}
						fill
						className="object-cover transition-transform duration-700 group-hover:scale-110"
						sizes="(max-width: 768px) 100vw, 33vw"
					/>
				</Link>
				<div className="absolute top-3 right-3 flex gap-2">
					<Badge className={`${getCategoryColor(p.category)} font-semibold shadow-lg border-0`}>{p.category}</Badge>
				</div>
				<div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
					<Button size="icon" variant="ghost" className="h-8 w-8 bg-white/90 hover:bg-white text-brand-coral hover:text-brand-orange">
						<Heart className="h-4 w-4" />
					</Button>
				</div>
			</div>
			<CardHeader className="pb-2 p-3 sm:p-6">
				<CardTitle className="text-base text-mobile-title line-clamp-1 group-hover:text-brand-teal transition-colors duration-300">{p.name}</CardTitle>
			</CardHeader>
			<CardContent className="text-sm text-muted-foreground flex-1 space-y-3">
				<div className="flex items-baseline gap-1">
					<span className="text-2xl text-mobile-price font-bold bg-gradient-to-r from-brand-teal via-brand-sage to-brand-orange bg-clip-text text-transparent">Rp{(p.pricePerTrip ?? 0).toLocaleString('id-ID')}</span>
					<span className="text-brand-navy/60 text-xs sm:text-sm">/trip</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-brand-navy/70 text-xs sm:text-sm">
						Stok: <span className="font-semibold text-brand-teal">{p.stock}</span>
					</span>
						{/* 5-Star Rating Display */}
						<div className="flex items-center gap-1">
							<div className="flex">
								{[...Array(5)].map((_, i) => (
									<Star key={i} className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-brand-sunset fill-current" />
								))}
							</div>
							<span className="text-[10px] sm:text-xs font-medium text-brand-navy/70 ml-1">5.0</span>
						</div>
					</div>
			</CardContent>
			<CardFooter className="pt-0 p-3 sm:p-6">
				<div className="flex w-full gap-2">
					<Button asChild variant="outline" className="w-1/2 h-8 sm:h-10 text-xs sm:text-sm border-brand-sage/40 hover:bg-brand-mint/20 bg-transparent text-brand-navy hover:text-brand-teal transition-colors">
						<Link href={`/products/${p.slug}`}>Detail</Link>
					</Button>
					<Button
						className="w-1/2 h-8 sm:h-10 text-xs sm:text-sm bg-gradient-to-r from-brand-teal to-brand-orange hover:from-brand-teal/90 hover:to-brand-orange/90 shadow-lg hover:shadow-xl transition-all duration-300"
						onClick={handleAddToCart}
						disabled={p.stock <= 0 || !isDateSelected}
						title={!isDateSelected ? 'Pilih tanggal sewa terlebih dahulu' : ''}>
						Tambah
					</Button>
				</div>
			</CardFooter>
		</Card>
	);
}
