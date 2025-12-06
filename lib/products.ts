export type Product = {
	id: string;
	slug: string;
	name: string;
	category: 'Tenda' | 'Tidur' | 'Dapur' | 'Penerangan' | 'Kursi/Meja' | 'Lainnya' | 'carrier' | 'hydropack' | 'sepatu';
	pricePerDay: number;
	pricePerTrip: number;
	stock: number;
	image: string;
	description: string;
};

export const PRODUCTS: Product[] = [
	{
		id: 'p-tenda-2p',
		slug: 'tenda-dome-2p',
		name: 'Tenda Dome 2P',
		category: 'Tenda',
		pricePerDay: 30000,
		pricePerTrip: 100000,
		stock: 8,
		image: '/images/tenda.jpg',
		description: 'Tenda dome kapasitas 2 orang, waterproof, frame fiberglass, mudah dipasang.',
	},
	{
		id: 'p-carrier-45l',
		slug: 'carrier-45l',
		name: 'carrier Eiger Ecosavior 45L',
		category: 'carrier',
		pricePerDay: 50000,
		pricePerTrip: 80000,
		stock: 5,
		image: '/images/carrier.jpg',
		description: 'carrier eiger kapasitas 45 l.',
	},
	{
		id: 'p-sleeping-std',
		slug: 'sleeping-bag-standar',
		name: 'Sleeping Bag Standar',
		category: 'Tidur',
		pricePerDay: 15000,
		pricePerTrip: 50000,
		stock: 20,
		image: '/images/sb.jpg',
		description: 'Sleeping bag hangat dan nyaman untuk suhu tropis.',
	},
	{
		id: 'p-sepatu-hiking',
		slug: 'sepatu-hiking',
		name: 'sepatu Hiking',
		category: 'sepatu',
		pricePerDay: 10000,
		pricePerTrip: 35000,
		stock: 25,
		image: '/images/sepatu.jpg',
		description: 'Matras busa EVA, ringan dan empuk, ukuran standar.',
	},
	{
		id: 'p-kompor-port',
		slug: 'kompor-portable',
		name: 'Kompor Portable',
		category: 'Dapur',
		pricePerDay: 20000,
		pricePerTrip: 70000,
		stock: 15,
		image: '/images/kompor.jpg',
		description: 'Kompor portable butane, api stabil, cocok untuk memasak di alam.',
	},
	{
		id: 'p-nesting-set',
		slug: 'nesting-set',
		name: 'Nesting Set',
		category: 'Dapur',
		pricePerDay: 15000,
		pricePerTrip: 50000,
		stock: 12,
		image: '/images/nesting.jpg',
		description: 'Peralatan masak camping (panci, wajan, mangkuk) aluminium.',
	},
	{
		id: 'p-lampu-camp',
		slug: 'lampu-camping-led',
		name: 'Lampu Camping LED',
		category: 'Penerangan',
		pricePerDay: 10000,
		pricePerTrip: 35000,
		stock: 18,
		image: '/images/lampu.jpg',
		description: 'Lampu LED rechargeable, terang dan hemat energi.',
	},
	{
		id: 'p-hydropack-10l',
		slug: 'hydropack-10l',
		name: 'hydropack Eiger 10L',
		category: 'hydropack',
		pricePerDay: 12000,
		pricePerTrip: 40000,
		stock: 20,
		image: '/images/hydropack.jpg',
		description: 'hydropack Eiger kapasitas 10 liter dengan kantong air.',
	},
];

export function getProductBySlug(slug?: string) {
	if (!slug) return undefined;
	return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductById(id?: string) {
	if (!id) return undefined;
	return PRODUCTS.find((p) => p.id === id);
}
