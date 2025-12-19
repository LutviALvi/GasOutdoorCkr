"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, UploadCloud } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

type Category = {
    id: string
    name: string
}

export default function AdminAddProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [fetchingCategories, setFetchingCategories] = useState(true)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: "",
    description: "",
    pricePerDay: "",
    pricePerTrip: "",
    stock: "",
    image: "",
  })

  // Fetch Categories on Mount
  useEffect(() => {
    async function getCategories() {
        try {
            const res = await fetch("/api/categories")
            if (res.ok) {
                const data = await res.json()
                setCategories(data)
            }
        } catch (err) {
            console.error(err)
            toast.error("Gagal mengambil data kategori")
        } finally {
            setFetchingCategories(false)
        }
    }
    getCategories()
  }, [])

  // Auto-generate slug from name
  useEffect(() => {
    const slug = form.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
    
    setForm(prev => ({ ...prev, slug }))
  }, [form.name])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          pricePerDay: Number(form.pricePerDay) || 0,
          pricePerTrip: Number(form.pricePerTrip) || 0,
          stock: Number(form.stock) || 0,
        }),
      })

      if (res.ok) {
        toast.success("Produk berhasil ditambahkan")
        router.push("/admin/products")
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal menambah produk")
      }
    } catch (error) {
      console.error(error)
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const file = e.target.files[0]
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Upload failed")
      }
      
      setForm(prev => ({ ...prev, image: data.url }))
      toast.success("Gambar berhasil diupload")
    } catch (error: any) {
      console.error("Error uploading image:", error)
      toast.error(error.message || "Gagal upload gambar")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
            <Link href="/admin/products">
                <ArrowLeft className="h-4 w-4" />
            </Link>
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Tambah Produk</h1>
          <p className="text-muted-foreground">Buat produk baru untuk disewakan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
            {/* Main Info */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Produk</CardTitle>
                        <CardDescription>Detail utama produk</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Produk*</Label>
                            <Input 
                                id="name" 
                                placeholder="Contoh: Tenda Eiger 4P" 
                                required
                                value={form.name}
                                onChange={e => setForm({...form, name: e.target.value})}
                            />
                        </div>
                        <div className="grid gap-2 text-muted-foreground hidden">
                            <Label htmlFor="slug">Slug (Auto-generated)</Label>
                            <Input 
                                id="slug" 
                                disabled
                                value={form.slug}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea 
                                id="description" 
                                placeholder="Berikan deskripsi detail tentang produk ini..." 
                                rows={5}
                                value={form.description}
                                onChange={e => setForm({...form, description: e.target.value})}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Harga & Stok</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="priceTrip">Harga per Trip (Rp)*</Label>
                            <Input 
                                id="priceTrip" 
                                type="number" 
                                min="0" 
                                placeholder="0" 
                                required
                                value={form.pricePerTrip}
                                onChange={e => setForm({...form, pricePerTrip: e.target.value})}
                            />
                            <p className="text-xs text-muted-foreground">Harga sewa per satu kali peminjaman (flat)</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="priceDay">Harga per Hari (Rp)</Label>
                            <Input 
                                id="priceDay" 
                                type="number" 
                                min="0" 
                                placeholder="0" 
                                value={form.pricePerDay}
                                onChange={e => setForm({...form, pricePerDay: e.target.value})}
                            />
                            <p className="text-xs text-muted-foreground">Opsional, jika ada hitungan harian</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="stock">Stok Awal*</Label>
                            <Input 
                                id="stock" 
                                type="number" 
                                min="0" 
                                placeholder="0" 
                                required
                                value={form.stock}
                                onChange={e => setForm({...form, stock: e.target.value})}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Side Info */}
            <div className="space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Kategori</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            <Label>Kategori Produk*</Label>
                            {fetchingCategories ? (
                                <div className="text-sm text-muted-foreground flex items-center">
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin"/> Loading kategori...
                                </div>
                            ) : (
                                <Select 
                                    onValueChange={val => setForm({...form, category: val})}
                                    value={form.category}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                                <Link href="/admin/categories" className="text-primary hover:underline">
                                    + Kelola Kategori
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Gambar</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <Label htmlFor="image">Foto Produk</Label>
                        <div className="flex flex-col gap-2">
                            {uploading ? (
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                                </div>
                            ) : (
                                <Input 
                                    id="image" 
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            )}
                            {/* Hidden Input for Manual URL if needed, or just rely on state */}
                        </div>
                         {form.image && (
                            <div className="mt-2 aspect-video relative rounded-md overflow-hidden border">
                                <img 
                                    src={form.image} 
                                    alt="Preview" 
                                    className="object-cover w-full h-full" 
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">Masukkan URL gambar langsung</p>
                    </CardContent>
                </Card>
            </div>
        </div>

        <div className="mt-8 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
            <Button type="submit" disabled={loading || !form.image}>
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                    </>
                ) : (
                    "Simpan Produk"
                )}
            </Button>
        </div>
      </form>
    </div>
  )
}
