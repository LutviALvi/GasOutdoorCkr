"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Save, X, Upload, Plus, Search, Trash2, Loader2 } from "lucide-react"
import Image from "next/image"
import type { Product } from "@/lib/products"

const CATEGORIES = ["Tenda", "Tidur", "Dapur", "Penerangan", "Kursi/Meja", "Lainnya"]

export default function ProductManagementPage() {
  const router = useRouter()
  const { isLoggedIn } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([]) // State untuk menyimpan daftar produk
  const [loading, setLoading] = useState(true) // Loading indikator saat ambil data
  const [editingId, setEditingId] = useState<string | null>(null) // ID produk yang sedang diedit
  const [editData, setEditData] = useState<Partial<Product>>({}) // Data sementara untuk form edit
  const [imagePreview, setImagePreview] = useState<string | null>(null) // Preview gambar yang diupload
  const [showAddForm, setShowAddForm] = useState(false) // Toggle form tambah produk
  const [searchTerm, setSearchTerm] = useState("") // Keyword pencarian
  const [saving, setSaving] = useState(false) // Loading indikator saat simpan data
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    slug: "",
    category: "Tenda",
    description: "",
    price_per_day: 0,
    price_per_trip: 0,
    stock: 0,
    image: "",
  })
  const [newProductImage, setNewProductImage] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.push("/admin/login")
      return
    }
    if (isHydrated) {
      fetchProducts(true)

      // Real-time listener for products table
      const channel = supabase
        .channel('admin-products-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          () => {
            fetchProducts(false) // Background update
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [isHydrated, isLoggedIn, router])

  // Fungsi untuk mengambil semua produk dari API
  async function fetchProducts(showLoading = false) {
    try {
      if (showLoading) setLoading(true)
      const res = await fetch(`/api/products?t=${Date.now()}`, { 
        cache: "no-store",
        headers: { 'Cache-Control': 'no-cache' } 
      })
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setEditData({
      ...product,
      price_per_day: product.price_per_day || product.pricePerDay,
      price_per_trip: product.price_per_trip || product.pricePerTrip,
    })
    setImagePreview(product.image)
  }

  // Simpan perubahan produk (Update ke Database)
  const handleSave = async () => {
    if (!editingId) return
    setSaving(true)

    try {
      const res = await fetch(`/api/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editData.name,
          slug: editData.slug,
          category: editData.category,
          description: editData.description,
          pricePerDay: editData.price_per_day,
          pricePerTrip: editData.price_per_trip,
          stock: editData.stock,
          image: editData.image,
        }),
      })

      if (res.ok) {
        await fetchProducts() // Refresh data setelah update
        setEditingId(null)
        setEditData({})
        setImagePreview(null)
      }
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Gagal menyimpan perubahan")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
    setImagePreview(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (res.ok) {
        await fetchProducts()
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Gagal menghapus produk")
    }
  }

  // Handle upload gambar produk (mengubah file jadi Base64 string untuk disimpan di text)
  // Catatan: Idealnya upload ke Storage bucket (S3/Supabase Storage), tapi ini versi simpel simpan string base64.
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

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price_per_trip) {
      alert("Nama dan harga harus diisi")
      return
    }

    setSaving(true)

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProduct.name,
          slug: newProduct.slug || generateSlug(newProduct.name || ""),
          category: newProduct.category || "Tenda",
          description: newProduct.description || "",
          pricePerDay: newProduct.price_per_day || 0,
          pricePerTrip: newProduct.price_per_trip || 0,
          stock: newProduct.stock || 0,
          image: newProduct.image || "/placeholder.svg",
        }),
      })

      if (res.ok) {
        await fetchProducts()
        setNewProduct({
          name: "",
          slug: "",
          category: "Tenda",
          description: "",
          price_per_day: 0,
          price_per_trip: 0,
          stock: 0,
          image: "",
        })
        setNewProductImage(null)
        setShowAddForm(false)
      }
    } catch (error) {
      console.error("Error adding product:", error)
      alert("Gagal menambahkan produk")
    } finally {
      setSaving(false)
    }
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!isHydrated || !isLoggedIn) {
    return null
  }

  if (loading) {
    return (
      <section className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </section>
    )
  }

  return (
    <section className="flex-1 mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Produk</h1>
          <p className="text-muted-foreground">Data dari database Supabase</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="gap-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white"
        >
          <Plus className="h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk..."
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
            <button onClick={() => setShowAddForm(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Gambar</label>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-dashed">
                {newProductImage ? (
                  <Image src={newProductImage} alt="New Product" fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Upload className="h-8 w-8 text-muted-foreground" />
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
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById("new-product-image")?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Pilih Gambar
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold">Nama Produk</label>
                <Input
                  value={newProduct.name || ""}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value, slug: generateSlug(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Kategori</label>
                <select
                  value={newProduct.category || "Tenda"}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border rounded-md text-sm bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold">Deskripsi</label>
                <textarea
                  value={newProduct.description || ""}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border rounded-md text-sm min-h-[80px]"
                  placeholder="Deskripsi produk..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-semibold">Harga/Trip</label>
                  <Input
                    type="number"
                    value={newProduct.price_per_trip || 0}
                    onChange={(e) => setNewProduct({ ...newProduct, price_per_trip: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Stok</label>
                  <Input
                    type="number"
                    value={newProduct.stock || 0}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleAddProduct} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Tambah
            </Button>
            <Button onClick={() => setShowAddForm(false)} variant="outline">
              Batal
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {products.length === 0 ? "Belum ada produk di database" : "Tidak ada hasil"}
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="rounded-lg border overflow-hidden bg-white">
              {editingId === product.id ? (
                <div className="p-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Gambar</label>
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-dashed">
                        {imagePreview ? (
                          <Image src={imagePreview} alt={editData.name || ""} fill className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Upload className="h-8 w-8 text-muted-foreground" />
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
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById(`image-${product.id}`)?.click()}
                      >
                        Pilih Gambar
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-semibold">Nama</label>
                        <Input
                          value={editData.name || ""}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold">Kategori</label>
                        <select
                          value={editData.category || ""}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                          className="mt-1 w-full px-3 py-2 border rounded-md text-sm bg-white"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        {/* Description Field (Added as per request) */}
                        <label className="text-sm font-semibold">Deskripsi</label>
                        <textarea
                          value={editData.description || ""}
                          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                          className="mt-1 w-full px-3 py-2 border rounded-md text-sm min-h-[80px]"
                          placeholder="Deskripsi produk..."
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold">Stok</label>
                        <Input
                          type="number"
                          value={editData.stock || 0}
                          onChange={(e) => setEditData({ ...editData, stock: parseInt(e.target.value) || 0 })}
                          className="mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-sm font-semibold">Harga/Hari</label>
                          <Input
                            type="number"
                            value={editData.price_per_day || 0}
                            onChange={(e) => setEditData({ ...editData, price_per_day: parseInt(e.target.value) || 0 })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold">Harga/Trip</label>
                          <Input
                            type="number"
                            value={editData.price_per_trip || 0}
                            onChange={(e) => setEditData({ ...editData, price_per_trip: parseInt(e.target.value) || 0 })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Simpan
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode: Displays product details
                <div className="p-6 flex flex-col md:flex-row gap-6">
                  {/* ... view mode content ... */}
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
                      <div className="flex gap-2">
                        <Button onClick={() => handleEdit(product)} variant="outline" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => handleDelete(product.id)} variant="destructive" size="sm" className="text-white">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Product Stats */}
                      <div>
                        <p className="text-xs text-muted-foreground">Stok</p>
                        <p className="text-xl font-bold text-primary">{product.stock}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Harga/Hari</p>
                        <p className="text-sm font-semibold">
                          Rp{(product.price_per_day || product.pricePerDay || 0).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Harga/Trip</p>
                        <p className="text-sm font-semibold">
                          Rp{(product.price_per_trip || product.pricePerTrip || 0).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">ID</p>
                        <p className="text-xs font-mono truncate">{product.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  )
}
