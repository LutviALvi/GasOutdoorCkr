import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

// Metadata global untuk SEO dan ikon website
export const metadata: Metadata = {
	title: 'GasOutdoo.Ckr',
	description: 'V 1.0',
	generator: '',
	icons: {
		icon: '/images/icon.jpg',
	},
};

// Komponen Layout Utama (Root)
// Membungkus seluruh aplikasi dengan konfigurasi font, Analytics, dan Toaster (notifikasi)
export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`font-sans antialiased ${GeistSans.variable} ${GeistMono.variable}`}>
				{children}
				<Toaster position="top-center" richColors />
				<Analytics />
			</body>
		</html>
	);
}
