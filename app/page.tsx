import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ReviewMarquee from '@/components/review-marquee';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Clock, Shield, Star, Award, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Page() {
	return (
		<main className="min-h-screen">
			<SiteHeader />

			{/* Hero Section with Multi-color Gradient */}
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 gradient-sunset opacity-15"></div>
				<div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-brand-mint/20"></div>
				<div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24 grid gap-8 md:grid-cols-2 items-center">
					<div className="space-y-6">
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-brand-lavender/20 to-brand-mint/20 border border-brand-sage/30">
							<Star className="h-4 w-4 text-brand-orange" />
							<span className="text-brand-navy font-semibold text-sm">Terpercaya sejak 2020</span>
						</div>
						<h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
							Sewa Perlengkapan <span className="bg-gradient-to-r from-brand-teal via-brand-sage to-brand-orange bg-clip-text text-transparent">Outdoor</span> di Cikarang
						</h1>
						<p className="text-muted-foreground text-lg leading-relaxed">
							Pilih tenda, sleeping bag, kompor, dan perlengkapan camping lainnya. Booking online mudah, pickup/antar tersedia di area Cikarang dan sekitarnya.
						</p>
						<div className="flex gap-3">
							<Button asChild size="lg" className="bg-gradient-to-r from-brand-teal to-brand-orange hover:from-brand-teal/90 hover:to-brand-orange/90 shadow-xl">
								<Link href="/products">Mulai Sewa Sekarang</Link>
							</Button>
							<Button asChild size="lg" variant="outline" className="border-brand-sage/40 hover:bg-brand-mint/10 bg-transparent text-brand-navy">
								<a href="#cara-sewa">Cara Sewa</a>
							</Button>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
							<div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-brand-mint/30 to-brand-cream/50 border border-brand-sage/20">
								<div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-teal to-brand-sage flex items-center justify-center">
									<CheckCircle className="h-5 w-5 text-white" />
								</div>
								<span className="font-semibold text-brand-navy">Harga Bersahabat</span>
							</div>
							<div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-brand-coral/20 to-brand-sunset/20 border border-brand-orange/20">
								<div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-orange to-brand-coral flex items-center justify-center">
									<Clock className="h-5 w-5 text-white" />
								</div>
								<span className="font-semibold text-brand-navy">Proses Cepat</span>
							</div>
							<div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-brand-lavender/20 to-brand-mint/20 border border-brand-sage/20">
								<div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-navy to-brand-teal flex items-center justify-center">
									<Shield className="h-5 w-5 text-white" />
								</div>
								<span className="font-semibold text-brand-navy">Barang Terawat</span>
							</div>
						</div>
					</div>
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-br from-brand-orange/30 via-brand-coral/20 to-brand-teal/30 rounded-3xl blur-3xl"></div>
						<div className="relative aspect-[4/3] rounded-3xl overflow-hidden border-4 border-white shadow-2xl ">
							<Image src="/images/banner.png" alt="Perlengkapan camping" fill className="object-cover" priority />
						</div>
					</div>
				</div>
			</section>

			{/* Enhanced Stats Section */}
			<section className="py-20 relative overflow-hidden">
				<div className="absolute inset-0 gradient-lavender opacity-20"></div>
				<div className="relative mx-auto max-w-6xl px-4">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div className="text-center group">
							<div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-teal to-brand-sage flex items-center justify-center group-hover:scale-110 transition-transform">
								<Users className="h-8 w-8 text-white" />
							</div>
							<div className="text-4xl font-bold bg-gradient-to-r from-brand-teal to-brand-sage bg-clip-text text-transparent">500+</div>
							<div className="text-brand-navy font-medium">Pelanggan Puas</div>
						</div>
						<div className="text-center group">
							<div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-orange to-brand-coral flex items-center justify-center group-hover:scale-110 transition-transform">
								<Award className="h-8 w-8 text-white" />
							</div>
							<div className="text-4xl font-bold bg-gradient-to-r from-brand-orange to-brand-coral bg-clip-text text-transparent">50+</div>
							<div className="text-brand-navy font-medium">Produk Tersedia</div>
						</div>
						<div className="text-center group">
							<div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-sunset to-brand-orange flex items-center justify-center group-hover:scale-110 transition-transform">
								<Star className="h-8 w-8 text-white" />
							</div>
							<div className="text-4xl font-bold bg-gradient-to-r from-brand-sunset to-brand-orange bg-clip-text text-transparent">4.9</div>
							<div className="text-brand-navy font-medium">Rating Pelanggan</div>
						</div>
						<div className="text-center group">
							<div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-teal flex items-center justify-center group-hover:scale-110 transition-transform">
								<Zap className="h-8 w-8 text-white" />
							</div>
							<div className="text-4xl font-bold bg-gradient-to-r from-brand-navy to-brand-teal bg-clip-text text-transparent">24/7</div>
							<div className="text-brand-navy font-medium">Support</div>
						</div>
					</div>
				</div>
			</section>

			<section id="cara-sewa" className="mx-auto max-w-6xl px-4 py-20 grid gap-12">
				<div className="text-center space-y-4">
					<h2 className="text-4xl font-bold bg-gradient-to-r from-brand-navy via-brand-teal to-brand-sage bg-clip-text text-transparent">Cara Sewa</h2>
					<p className="text-brand-navy/70 text-lg">Proses mudah dalam 3 langkah</p>
				</div>
				<div className="grid gap-8 md:grid-cols-3">
					<div className="relative group">
						<div className="absolute inset-0 gradient-ocean opacity-10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
						<div className="relative rounded-2xl border-2 border-brand-mint/30 bg-gradient-to-br from-white to-brand-cream/50 p-8 shadow-xl hover:shadow-2xl transition-all">
							<div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-teal to-brand-sage flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-lg">1</div>
							<div className="font-bold text-xl mb-3 text-brand-navy">Pilih Barang</div>
							<p className="text-brand-navy/70 leading-relaxed">Lihat katalog lengkap dan tambahkan produk yang diinginkan ke keranjang dengan mudah.</p>
						</div>
					</div>
					<div className="relative group">
						<div className="absolute inset-0 gradient-sunset opacity-10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
						<div className="relative rounded-2xl border-2 border-brand-coral/30 bg-gradient-to-br from-white to-brand-coral/10 p-8 shadow-xl hover:shadow-2xl transition-all">
							<div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-orange to-brand-coral flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-lg">2</div>
							<div className="font-bold text-xl mb-3 text-brand-navy">Atur Tanggal</div>
							<p className="text-brand-navy/70 leading-relaxed">Pilih rentang tanggal sewa dan lengkapi data diri untuk pemesanan yang akurat.</p>
						</div>
					</div>
					<div className="relative group">
						<div className="absolute inset-0 gradient-lavender opacity-10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
						<div className="relative rounded-2xl border-2 border-brand-lavender/30 bg-gradient-to-br from-white to-brand-lavender/10 p-8 shadow-xl hover:shadow-2xl transition-all">
							<div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-lavender flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-lg">3</div>
							<div className="font-bold text-xl mb-3 text-brand-navy">Checkout</div>
							<p className="text-brand-navy/70 leading-relaxed">Konfirmasi pesanan dan tunggu kami hubungi untuk detail pickup/pengantaran.</p>
						</div>
					</div>
				</div>
			</section>

			{/* Review Marquee Section */}
			<ReviewMarquee />

			<section className="mx-auto max-w-6xl px-4 py-20 grid gap-12">
				<div className="text-center space-y-4">
					<h2 className="text-4xl font-bold bg-gradient-to-r from-brand-teal via-brand-orange to-brand-coral bg-clip-text text-transparent">Kategori Populer</h2>
					<p className="text-brand-navy/70 text-lg">Pilih sesuai kebutuhan adventure Anda</p>
				</div>
				<div className="grid gap-8 sm:grid-cols-3">
					<Link href="/products?category=Tenda" className="group relative overflow-hidden rounded-3xl border-3 border-brand-teal/30  hover:shadow-2xl  transition-all duration-500">
						<div className="absolute inset-0 gradient-ocean opacity-0 group-hover:opacity-20 transition-all duration-500"></div>
						<div className="relative aspect-[16/9] overflow-hidden">
							<Image src="/images/tenda.jpg" alt="Kategori Tenda" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
						</div>
						<div className="relative p-8 bg-gradient-to-br from-white to-brand-mint/30">
							<div className="font-bold text-xl text-brand-teal mb-2">Tenda</div>
							<div className="text-brand-navy/70">Berbagai ukuran untuk solo hingga keluarga</div>
						</div>
					</Link>
					<Link href="/products?category=Tidur" className="group relative overflow-hidden rounded-3xl border-3 border-brand-orange/30  hover:shadow-2xl  transition-all duration-500">
						<div className="absolute inset-0 gradient-sunset opacity-0 group-hover:opacity-20 transition-all duration-500"></div>
						<div className="relative aspect-[16/9] overflow-hidden">
							<Image src="/images/sb.jpg" alt="Kategori Perlengkapan Tidur" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
						</div>
						<div className="relative p-8 bg-gradient-to-br from-white to-brand-coral/10">
							<div className="font-bold text-xl text-brand-orange mb-2">Perlengkapan Tidur</div>
							<div className="text-brand-navy/70">Sleeping bag dan matras berkualitas</div>
						</div>
					</Link>
					<Link href="/products?category=Dapur" className="group relative overflow-hidden rounded-3xl border-3 border-brand-sage/30 hover:hover:shadow-2xl  transition-all duration-500">
						<div className="absolute inset-0 gradient-lavender opacity-0 group-hover:opacity-20 transition-all duration-500"></div>
						<div className="relative aspect-[16/9] overflow-hidden">
							<Image src="/images/nesting.jpg" alt="Kategori Dapur Camping" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
						</div>
						<div className="relative p-8 bg-gradient-to-br from-white to-brand-lavender/10">
							<div className="font-bold text-xl text-brand-sage mb-2">Dapur Camping</div>
							<div className="text-brand-navy/70">Kompor dan peralatan masak lengkap</div>
						</div>
					</Link>
				</div>
			</section>
			<div className="footer">
				<SiteFooter />
			</div>
		</main>
	);
}
