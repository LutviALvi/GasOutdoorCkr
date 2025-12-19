"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Trash2, Loader2, MoreHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import type { Product } from "@/lib/products"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    try {
      const res = await fetch("/api/products")
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Gagal mengambil data produk")
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setProducts(products.filter((p) => p.id !== productToDelete.id))
        toast.success("Produk berhasil dihapus")
        setDeleteDialogOpen(false)
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal menghapus produk")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setDeleting(false)
      setProductToDelete(null)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Kelola Produk</h1>
          <p className="text-muted-foreground">Daftar semua produk yang tersedia</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/add">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk ({products.length})</CardTitle>
          <CardDescription>
             Kelola inventaris dan stok barang
          </CardDescription>
          <div className="mt-4">
             <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari nama produk atau kategori..."
                  className="pl-9 w-full md:w-[300px]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="py-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
          ) : filteredProducts.length === 0 ? (
             <div className="py-12 text-center text-muted-foreground">
                Tidak ada produk yang ditemukan
             </div>
          ) : (
            <div className="border rounded-md">
                {/* Table Header (Hidden on small screens) */}
                <div className="hidden md:grid grid-cols-[80px_2fr_1fr_1fr_1fr_80px] gap-4 p-4 border-b bg-muted/40 font-medium text-sm">
                    <div>Gambar</div>
                    <div>Nama Produk</div>
                    <div>Kategori</div>
                    <div>Stok</div>
                    <div>Harga/Trip</div>
                    <div className="text-right">Aksi</div>
                </div>

                {/* Table Body */}
                <div className="divide-y">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="grid grid-cols-1 md:grid-cols-[80px_2fr_1fr_1fr_1fr_80px] gap-4 p-4 items-center">
                            {/* Mobile Label Layout or Grid Layout */}
                            <div className="flex items-center gap-4 md:contents">
                                <div className="relative h-16 w-16 min-w-[64px] rounded-md overflow-hidden border bg-muted">
                                    <Image 
                                        src={product.image || "/placeholder.svg"} 
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="md:hidden flex-1">
                                    <h3 className="font-semibold">{product.name}</h3>
                                    <p className="text-sm text-muted-foreground">{product.category}</p>
                                </div>
                                {/* Correct placement for MD screens */}
                                <div className="hidden md:block font-medium truncate" title={product.name}>
                                    {product.name}
                                </div>
                            </div>
                            
                            <div className="hidden md:block text-muted-foreground">{product.category}</div>
                            
                            <div className="flex justify-between md:block">
                                <span className="md:hidden text-muted-foreground text-sm">Stok</span>
                                <span className={product.stock <= 5 ? "text-red-500 font-medium" : ""}>
                                    {product.stock} unit
                                </span>
                            </div>

                            <div className="flex justify-between md:block">
                                <span className="md:hidden text-muted-foreground text-sm">Harga</span>
                                <span>Rp{product.price_per_trip.toLocaleString("id-ID")}</span>
                            </div>

                            <div className="flex justify-end md:block text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/admin/products/edit/${product.id}`} className="cursor-pointer">
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            className="text-red-600 focus:text-red-600 cursor-pointer"
                                            onClick={() => openDeleteDialog(product)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Hapus
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus produk <strong>{productToDelete?.name}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction 
                onClick={(e) => {
                    e.preventDefault(); 
                    handleDelete();
                }}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleting}
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
