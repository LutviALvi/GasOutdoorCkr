'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart-store';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function SiteHeader() {
	const items = useCartStore((s) => s.items);
	const [mounted, setMounted] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	useEffect(() => setMounted(true), []);
	const count = items.reduce((acc, it) => acc + it.quantity, 0);

	return (
		<header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 shadow-sm">
			<div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
				<Link href="/" className="flex items-center gap-2">
					<span className="inline-flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-primary/20 overflow-hidden bg-gradient-to-br from-primary to-secondary p-0.5">
						<div className="h-full w-full rounded-full overflow-hidden bg-white">
							<Image src="/images/logo-gasoutdoor.jpg" alt="Logo GASOUTDOOR.CKR" width={36} height={36} className="object-cover" priority />
						</div>
					</span>
					<span className="font-extrabold tracking-tight text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text ">GASOUTDOOR.CKR</span>
				</Link>

				{/* Desktop Navigation */}
				<nav className="ml-auto hidden md:flex items-center gap-1">
					<Button asChild variant="ghost" className="hover:bg-primary/10">
						<Link href="/">Home</Link>
					</Button>
					<Button asChild variant="ghost" className="hover:bg-primary/10">
						<Link href="/products">Produk</Link>
					</Button>
					<Button asChild variant="ghost" className="hover:bg-primary/10">
						<Link href="/booking-status">Cek Booking</Link>
					</Button>
					<Button asChild variant="ghost" className="hover:bg-primary/10">
						<Link href="/#cara-sewa">Cara Sewa</Link>
					</Button>
					<Button asChild variant="ghost" className="hover:bg-primary/10">
						<Link href="/#kontak">Kontak</Link>
					</Button>
					{/* <Button asChild variant="ghost" className="hover:bg-primary/10">
						<Link href="/admin">Admin</Link>
					</Button> */}
					<Button asChild className="ml-2 relative  from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
						<Link href="/cart" aria-label="Buka keranjang">
							<ShoppingCart className="h-4 w-4" />
							<span className="sr-only">Keranjang</span>
							{mounted && count > 0 ? (
								<span
									aria-label="Jumlah item di keranjang"
									className="absolute -right-2 -top-2 min-w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-[10px] px-1 flex items-center justify-center font-semibold shadow-lg">
									{count}
								</span>
							) : null}
						</Link>
					</Button>
				</nav>

				{/* Mobile Navigation */}
				<div className="ml-auto  flex md:hidden items-center gap-2">
					<Button asChild variant="ghost" size="icon" className="relative">
						<Link href="/cart" aria-label="Buka keranjang">
							<ShoppingCart className="h-4 w-4" />
							<span className="sr-only ">Keranjang</span>
							{mounted && count > 0 ? (
								<span
									aria-label="Jumlah item di keranjang"
									className="absolute -right-1 -top-1 min-w-4 h-4 rounded-full bg-secondary text-secondary-foreground text-[9px] px-1 flex items-center justify-center font-semibold">
									{count}
								</span>
							) : null}
						</Link>
					</Button>
					<Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu" className="hover:bg-primary/10">
						{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
					</Button>
				</div>
			</div>

			{/* Mobile Menu Dropdown */}
			{mobileMenuOpen && (
				<div className="md:hidden border-t bg-white/90 backdrop-blur-xl shadow-lg">
					<nav className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-1">
						<Button asChild variant="ghost" className="justify-start hover:bg-primary/10" onClick={() => setMobileMenuOpen(false)}>
							<Link href="/">Home</Link>
						</Button>
						<Button asChild variant="ghost" className="justify-start hover:bg-primary/10" onClick={() => setMobileMenuOpen(false)}>
							<Link href="/products">Produk</Link>
						</Button>
						<Button asChild variant="ghost" className="justify-start hover:bg-primary/10" onClick={() => setMobileMenuOpen(false)}>
							<Link href="/booking-status">Cek Booking</Link>
						</Button>
						<Button asChild variant="ghost" className="justify-start hover:bg-primary/10" onClick={() => setMobileMenuOpen(false)}>
							<Link href="/#cara-sewa">Cara Sewa</Link>
						</Button>
						<Button asChild variant="ghost" className="justify-start hover:bg-primary/10" onClick={() => setMobileMenuOpen(false)}>
							<Link href="/#kontak">Kontak</Link>
						</Button>
						{/* <Button asChild variant="ghost" className="justify-start hover:bg-primary/10" onClick={() => setMobileMenuOpen(false)}>
							<Link href="/admin">Admin</Link>
						</Button> */}
					</nav>
				</div>
			)}
		</header>
	);
}
