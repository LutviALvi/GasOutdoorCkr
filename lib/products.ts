// Tipe produk dan fungsi API untuk mengambil data dari Supabase (Database)
// File ini mengatur bagaimana cara mengambil data produk dari database

export type Product = {
  id: string
  slug: string
  name: string
  category: string
  price_per_day: number
  price_per_trip: number
  // Aliases for backward compatibility
  pricePerDay?: number
  pricePerTrip?: number
  stock: number
  image: string
  description: string
  rating?: number
  reviewCount?: number
  created_at?: string
  updated_at?: string
}

// Mengubah format produk dari database ke format yang digunakan di tampilan frontend
// Fungsi ini memastikan bahwa data yang diambil dari database sesuai dengan struktur yang dibutuhkan oleh aplikasi
function transformProduct(dbProduct: Product): Product {
  return {
    ...dbProduct,
    pricePerDay: dbProduct.price_per_day,
    pricePerTrip: dbProduct.price_per_trip,
  }
}

// Mengambil semua daftar produk dari API
// Fungsi ini akan melakukan request ke server untuk mendapatkan semua data produk yang tersedia
export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch('/api/products', { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch products')
    const products = await res.json()
    return products.map(transformProduct)
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

// Mengambil satu produk berdasarkan slug (nama url yang ramah dibaca)
// Fungsi ini mencari produk spesifik menggunakan slug, berguna untuk halaman detail produk
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const products = await fetchProducts()
    return products.find(p => p.slug === slug) || null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

// Mengambil satu produk berdasarkan ID uniknya
// Fungsi ini mencari produk spesifik menggunakan ID, biasanya digunakan saat operasi database yang presisi
export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`/api/products/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    // Mengubah response menjadi JSON
    const product = await res.json()
    // Mengubah format data agar sesuai dengan frontend
    return transformProduct(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

// Untuk kompatibilitas ke belakang dengan kode yang menggunakan fungsi sinkron
// Variabel ini akan diisi oleh halaman produk saat dimuat agar data produk tersimpan sementara (cache)
// Ini adalah tempat penyimpanan sementara data produk di memori browser
let cachedProducts: Product[] = []

export function setCachedProducts(products: Product[]) {
  cachedProducts = products
}

export function getProductById(id?: string): Product | undefined {
  if (!id) return undefined
  return cachedProducts.find(p => p.id === id)
}

export function getProductBySlug(slug?: string): Product | undefined {
  if (!slug) return undefined
  return cachedProducts.find(p => p.slug === slug)
}

// Legacy export for backward compatibility (will be empty until fetched)
export const PRODUCTS: Product[] = []
