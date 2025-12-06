import { create } from "zustand"
import { persist } from "zustand/middleware"
import { type Product, PRODUCTS } from "./products"

interface ProductStore {
  products: Product[]
  updateStock: (productId: string, newStock: number) => void
  updateImage: (productId: string, newImage: string) => void
  updateProduct: (productId: string, updates: Partial<Product>) => void
  addProduct: (product: Product) => void
  getProducts: () => Product[]
}

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

export function getProductsWithStore(storedProducts: Product[]): Product[] {
  // Start with default products
  const productsMap = new Map<string, Product>()

  // Add all default products
  PRODUCTS.forEach((p) => {
    productsMap.set(p.id, { ...p })
  })

  // Override with stored product updates
  storedProducts.forEach((p) => {
    if (productsMap.has(p.id)) {
      // Merge stored updates with default product
      productsMap.set(p.id, { ...productsMap.get(p.id)!, ...p })
    } else {
      // Add new products that were created in admin
      productsMap.set(p.id, p)
    }
  })

  return Array.from(productsMap.values())
}
