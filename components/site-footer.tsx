import { Instagram, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function SiteFooter() {
	return (
		<footer className="relative overflow-hidden">
			<div className="absolute inset-0 gradient-navy opacity-95"></div>
			<div className="relative">
				<div className="mx-auto max-w-6xl px-4 py-16 grid gap-12 lg:grid-cols-4">
					<div className="lg:col-span-2 space-y-6">
						<div className="space-y-4">
							<div className="font-bold text-2xl bg-gradient-to-r from-brand-orange to-brand-coral bg-clip-text text-transparent">GASOUTDOOR.CKR</div>
							<p className="text-white/80 leading-relaxed max-w-md">
								Penyewaan perlengkapan outdoor terpercaya di Cikarang. Kami menyediakan gear berkualitas untuk petualangan outdoor Anda dengan harga terjangkau dan pelayanan terbaik.
							</p>
						</div>
						<div className="flex gap-4">
							<a
								href="https://instagram.com/"
								target="_blank"
								rel="noopener noreferrer"
								className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-orange to-brand-coral flex items-center justify-center text-white hover:scale-110 transition-transform">
								<Instagram className="h-5 w-5" />
							</a>
							<a
								href="tel:0851-5624-7282"
								className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-teal to-brand-sage flex items-center justify-center text-white hover:scale-110 transition-transform">
								<Phone className="h-5 w-5" />
							</a>
							<a
								href="mailto:cs@gasoutdoor.ckr"
								className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-lavender to-brand-mint flex items-center justify-center text-brand-navy hover:scale-110 transition-transform">
								<Mail className="h-5 w-5" />
							</a>
						</div>
					</div>

					<div className="space-y-6">
						<div className="font-semibold text-lg text-brand-orange">Menu</div>
						<ul className="space-y-3">
							<li>
								<Link className="text-white/80 hover:text-brand-mint transition-colors" href="/products">
									Katalog Produk
								</Link>
							</li>
							<li>
								<Link className="text-white/80 hover:text-brand-mint transition-colors" href="/booking-status">
									Cek Status Booking
								</Link>
							</li>
							<li>
								<a className="text-white/80 hover:text-brand-mint transition-colors" href="/#cara-sewa">
									Cara Sewa
								</a>
							</li>
							<li>
								<a className="text-white/80 hover:text-brand-mint transition-colors" href="/#kontak">
									Hubungi Kami
								</a>
							</li>
						</ul>
					</div>

					<div className="space-y-6">
						<div className="font-semibold text-lg text-brand-coral">Kontak</div>
						<ul className="space-y-4">
							<li className="flex items-start gap-3">
								<Phone className="h-5 w-5 text-brand-mint mt-0.5" />
								<div>
									<div className="text-white/90 font-medium">WhatsApp</div>
									<div className="text-white/70 text-sm">08xx-xxxx-xxxx</div>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<Mail className="h-5 w-5 text-brand-mint mt-0.5" />
								<div>
									<div className="text-white/90 font-medium">Email</div>
									<div className="text-white/70 text-sm">cs@gasoutdoor.ckr</div>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<MapPin className="h-5 w-5 text-brand-mint mt-0.5" />
								<div>
									<div className="text-white/90 font-medium">Lokasi</div>
									<div className="text-white/70 text-sm">Cikarang, Bekasi</div>
								</div>
							</li>
						</ul>
					</div>
				</div>

				<div className="border-t border-white/20 py-8">
					<div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row justify-between items-center gap-4">
						<div className="text-sm text-white/60">© {new Date().getFullYear()} GASOUTDOOR.CKR · All rights reserved.</div>
						<div className="flex gap-6 text-sm">
							<a href="#" className="text-white/60 hover:text-brand-mint transition-colors">
								Privacy Policy
							</a>
							<a href="#" className="text-white/60 hover:text-brand-mint transition-colors">
								Terms of Service
							</a>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
