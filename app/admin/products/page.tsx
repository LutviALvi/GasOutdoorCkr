"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProductStore } from "@/lib/product-store"
import { Edit2, Save, X, Upload, Plus, Search } from "lucide-react"
import Image from "next/image"
import { type Product, PRODUCTS } from "@/lib/products"

export default function ProductManagementPage() {
  const router = useRouter()
  const { isLoggedIn, logout } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Product>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    category: "Tenda",
    description: "",
    pricePerDay: 0,
    pricePerTrip: 0,
    stock: 0,
    image: "",
  })
  const [newProductImage, setNewProductImage] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const productStore = useProductStore()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.push("/admin/login")
    }
  }, [isHydrated, isLoggedIn, router])

  useEffect(() => {
    const stored = localStorage.getItem("gasoutdoor_products")
    if (stored) {
      try {
        setProducts(JSON.parse(stored))
      } catch {
        setProducts(PRODUCTS)
      }
    } else {
      setProducts(PRODUCTS)
      localStorage.setItem("gasoutdoor_products", JSON.stringify(PRODUCTS))
    }
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setEditData(product)
    setImagePreview(product.image)
  }

  const handleSave = () => {
    if (!editingId) return

    const updated = products.map((p) => (p.id === editingId ? { ...p, ...editData } : p))
    setProducts(updated)
    localStorage.setItem("gasoutdoor_products", JSON.stringify(updated))
    setEditingId(null)
    setEditData({})
    setImagePreview(null)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
    setImagePreview(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        setEditData({ ...editData, image: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNewProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setNewProductImage(result)
        setNewProduct({ ...newProduct, image: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.pricePerTrip || newProduct.stock === undefined) {
      alert("Nama, harga, dan stok harus diisi")
      return
    }

    const id = `prod-${Date.now()}`
    const productToAdd: Product = {
      id,
      name: newProduct.name || "",
      category: newProduct.category || "Tenda",
      description: newProduct.description || "",
      pricePerDay: newProduct.pricePerDay || 0,
      pricePerTrip: newProduct.pricePerTrip || 0,
      stock: newProduct.stock || 0,
      image: newProduct.image || "/placeholder.svg",
    }

    const updated = [...products, productToAdd]
    setProducts(updated)
    localStorage.setItem("gasoutdoor_products", JSON.stringify(updated))

    setNewProduct({
      name: "",
      category: "Tenda",
      description: "",
      pricePerDay: 0,
      pricePerTrip: 0,
      stock: 0,
      image: "",
    })
    setNewProductImage(null)
    setShowAddForm(false)
  }

  const handleStockChange = (value: string) => {
    const stock = Number.parseInt(value) || 0
    setEditData({ ...editData, stock })
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!isHydrated || !isLoggedIn) {
    return null
  }

  return (
    <section className="flex-1 mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Produk</h1>
          <p className="text-muted-foreground">Kelola stok dan gambar produk</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddForm(true)}
            className="gap-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800"
          >
            <Plus className="h-4 w-4" />
            Tambah Produk
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk berdasarkan nama, kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {showAddForm && (
        <div className="mb-8 rounded-lg border bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tambah Produk Baru</h2>
            <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Image Section */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Gambar Produk</label>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-dashed border-primary/30 bg-muted flex items-center justify-center">
                {newProductImage ? (
                  <Image src={newProductImage || "/placeholder.svg"} alt="New Product" fill className="object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Klik untuk upload</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleNewProductImageUpload}
                className="hidden"
                id="new-product-image"
              />
              <Button
                asChild
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => document.getElementById("new-product-image")?.click()}
              >
                <label className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Pilih Gambar
                </label>
              </Button>
            </div>

            {/* Product Details */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold">Nama Produk</label>
                <Input
                  value={newProduct.name || ""}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="mt-1"
                  placeholder="Nama produk"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Kategori</label>
                <Input
                  value={newProduct.category || ""}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="mt-1"
                  placeholder="Kategori"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Stok</label>
                <Input
                  type="number"
                  value={newProduct.stock || 0}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: Number.parseInt(e.target.value) || 0 })}
                  className="mt-1"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="text-sm font-semibold">Harga/Hari</label>
              <Input
                type="number"
                value={newProduct.pricePerDay || 0}
                onChange={(e) => setNewProduct({ ...newProduct, pricePerDay: Number.parseInt(e.target.value) || 0 })}
                className="mt-1"
                min="0"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Harga/Trip</label>
              <Input
                type="number"
                value={newProduct.pricePerTrip || 0}
                onChange={(e) => setNewProduct({ ...newProduct, pricePerTrip: Number.parseInt(e.target.value) || 0 })}
                className="mt-1"
                min="0"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Deskripsi</label>
              <Input
                value={newProduct.description || ""}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="mt-1"
                placeholder="Deskripsi produk"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleAddProduct} className="gap-2 bg-gradient-to-r from-primary to-secondary">
              <Plus className="h-4 w-4" />
              Tambah
            </Button>
            <Button onClick={() => setShowAddForm(false)} variant="outline" className="gap-2 bg-transparent">
              <X className="h-4 w-4" />
              Batal
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {products.length === 0 ? "Belum ada produk" : "Tidak ada produk yang cocok dengan pencarian"}
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="rounded-lg border overflow-hidden bg-white">
              {editingId === product.id ? (
                <div className="p-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Gambar Produk</label>
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-dashed border-primary/30 bg-muted flex items-center justify-center">
                        {imagePreview ? (
                          <Image
                            src={imagePreview || "/placeholder.svg"}
                            alt={editData.name || "Product"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Klik untuk upload</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id={`image-${product.id}`}
                      />
                      <Button
                        asChild
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => document.getElementById(`image-${product.id}`)?.click()}
                      >
                        <label className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Pilih Gambar
                        </label>
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-semibold">Nama Produk</label>
                        <Input
                          value={editData.name || ""}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold">Stok</label>
                        <Input
                          type="number"
                          value={editData.stock || 0}
                          onChange={(e) => handleStockChange(e.target.value)}
                          className="mt-1"
                          min="0"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-sm font-semibold">Harga/Hari</label>
                          <Input
                            type="number"
                            value={editData.pricePerDay || 0}
                            onChange={(e) =>
                              setEditData({ ...editData, pricePerDay: Number.parseInt(e.target.value) || 0 })
                            }
                            className="mt-1"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold">Harga/Trip</label>
                          <Input
                            type="number"
                            value={editData.pricePerTrip || 0}
                            onChange={(e) =>
                              setEditData({ ...editData, pricePerTrip: Number.parseInt(e.target.value) || 0 })
                            }
                            className="mt-1"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={handleSave} className="gap-2 bg-gradient-to-r from-primary to-secondary">
                      <Save className="h-4 w-4" />
                      Simpan
                    </Button>
                    <Button onClick={handleCancel} variant="outline" className="gap-2 bg-transparent">
                      <X className="h-4 w-4" />
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-6 flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      <Button onClick={() => handleEdit(product)} variant="outline" size="sm" className="gap-2">
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Stok</p>
                        <p className="text-xl font-bold text-primary">{product.stock}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Harga/Hari</p>
                        <p className="text-sm font-semibold">Rp{product.pricePerDay.toLocaleString("id-ID")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Harga/Trip</p>
                        <p className="text-sm font-semibold">Rp{product.pricePerTrip.toLocaleString("id-ID")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">ID Produk</p>
                        <p className="text-sm font-mono">{product.id}</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mt-4 line-clamp-2">{product.description}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-8">
        Catatan: Data produk disimpan di localStorage. Untuk produksi, hubungkan dengan database dan tambahkan
        autentikasi admin.
      </p>
    </section>
  )
}
