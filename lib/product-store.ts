import { create } from "zustand"
import { persist } from "zustand/middleware"
import { type Product, PRODUCTS } from "./products"

interface ProductStore {
  // Daftar semua produk yang ada di store
  products: Product[]
  // Fungsi untuk memperbarui jumlah stok produk
  updateStock: (productId: string, newStock: number) => void
  // Fungsi untuk memperbarui gambar produk
  updateImage: (productId: string, newImage: string) => void
  // Fungsi untuk memperbarui detail produk lainnya
  updateProduct: (productId: string, updates: Partial<Product>) => void
  // Fungsi untuk menambahkan produk baru ke dalam store
  addProduct: (product: Product) => void
  // Fungsi untuk mendapatkan semua produk
  getProducts: () => Product[]
}

// Hook utama untuk mengakses store produk
// Menggunakan Zustand untuk state management dan persist agar data tersimpan di localStorage browser
export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],
      updateStock: (productId: string, newStock: number) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)),
        }))
      },
      updateImage: (productId: string, newImage: string) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === productId ? { ...p, image: newImage } : p)),
        }))
      },
      updateProduct: (productId: string, updates: Partial<Product>) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === productId ? { ...p, ...updates } : p)),
        }))
      },
      addProduct: (product: Product) => {
        set((state) => ({
          products: [...state.products, product],
        }))
      },
      getProducts: () => get().products,
    }),
    {
      name: "gasoutdoor_products",
    },
  ),
)

// Menggabungkan produk default dengan produk yang tersimpan di store
// Fungsi ini berguna untuk memastikan data produk yang ditampilkan adalah yang paling update (termasuk yang baru diedit/ditambah)
export function getProductsWithStore(storedProducts: Product[]): Product[] {
  // Mulai dengan map kosong untuk produk
  const productsMap = new Map<string, Product>()

  // Tambahkan semua produk default/awal ke dalam map
  PRODUCTS.forEach((p) => {
    productsMap.set(p.id, { ...p })
  })

  // Timpa dengan update produk yang tersimpan di localStorage
  storedProducts.forEach((p) => {
    if (productsMap.has(p.id)) {
      // Gabungkan update yang tersimpan dengan produk default
      productsMap.set(p.id, { ...productsMap.get(p.id)!, ...p })
    } else {
      // Tambahkan produk baru yang dibuat di halaman admin (tidak ada di default)
      productsMap.set(p.id, p)
    }
  })

  return Array.from(productsMap.values())
}
