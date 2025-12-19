"use client"

import { useEffect, useState } from "react"
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Trash2, Loader2, Tag } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Category = {
  id: string
  name: string
  description: string | null
  created_at: string
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategory, setNewCategory] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories")
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Gagal mengambil data kategori")
    } finally {
      setLoading(false)
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCategory.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory, description: newDescription }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setCategories([...categories, data])
        setNewCategory("")
        setNewDescription("")
        toast.success("Kategori berhasil ditambahkan")
      } else {
        toast.error(data.error || "Gagal menambah kategori")
      }
    } catch (error) {
      console.error("Error creating category:", error)
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteCategory(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      })
      
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id))
        toast.success("Kategori berhasil dihapus")
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal menghapus kategori")
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Kelola Kategori</h1>
        <p className="text-muted-foreground">Tambah dan hapus kategori produk</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[350px_1fr]">
        {/* Form Tambah Kategori */}
        <Card>
          <CardHeader>
            <CardTitle>Tambah Kategori Baru</CardTitle>
            <CardDescription>Masukkan nama kategori baru</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCategory} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category-name">Nama Kategori</Label>
                <Input
                  id="category-name"
                  placeholder="Contoh: Tenda, Tas, dll"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category-desc">Deskripsi</Label>
                <Input
                  id="category-desc"
                  placeholder="Deskripsi singkat kategori..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={!newCategory.trim() || submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Kategori
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List Kategori */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Kategori</CardTitle>
            <CardDescription>Data kategori yang tersedia di sistem</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Belum ada kategori</div>
            ) : (
              <div className="rounded-md border">
                <div className="divide-y">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                           <Tag className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{category.name}</span>
                        {category.description && <span className="text-xs text-muted-foreground">({category.description})</span>}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-500">
                             {deletingId === category.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                             ) : (
                                <Trash2 className="h-4 w-4" />
                             )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus kategori <strong>{category.name}</strong>?
                              Tindakan ini tidak dapat dibatalkan. Produk dengan kategori ini mungkin perlu diperbarui.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteCategory(category.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Hapus
                              </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
