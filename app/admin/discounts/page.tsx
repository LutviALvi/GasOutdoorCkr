"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Ticket, Search, Percent, Calendar, Loader2 } from "lucide-react"
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
import { toast } from "sonner"

// Interface untuk Kode Diskon
interface DiscountCode {
  id: string
  code: string
  percentage: number
  max_uses: number | null
  used_count: number
  description: string
  valid_from: string | null
  valid_to: string | null
  is_active: boolean
  created_at: string
}

export default function DiscountsPage() {
  const router = useRouter()
  const { isLoggedIn } = useAuthStore()
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null)

  // Form states
  const [formCode, setFormCode] = useState("")
  const [formPercentage, setFormPercentage] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formMaxUses, setFormMaxUses] = useState("")
  const [formValidFrom, setFormValidFrom] = useState("")
  const [formValidTo, setFormValidTo] = useState("")
  const [formIsActive, setFormIsActive] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.push("/admin/login")
      return
    }
    if (isHydrated) {
      fetchDiscounts()
    }
  }, [isHydrated, isLoggedIn, router])

  async function fetchDiscounts() {
    try {
      const res = await fetch("/api/discounts", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setDiscountCodes(data)
      }
    } catch (error) {
      console.error("Error fetching discounts:", error)
      toast.error("Gagal mengambil data diskon")
    } finally {
      setLoading(false)
    }
  }

  if (!isHydrated || !isLoggedIn) {
    return null
  }

  const resetForm = () => {
    setFormCode("")
    setFormPercentage("")
    setFormDescription("")
    setFormMaxUses("")
    setFormValidFrom("")
    setFormValidTo("")
    setFormIsActive(true)
  }

  const openEditDialog = (discount: DiscountCode) => {
    setEditingDiscount(discount)
    setFormCode(discount.code)
    setFormPercentage(discount.percentage.toString())
    setFormDescription(discount.description || "")
    setFormMaxUses(discount.max_uses?.toString() || "")
    setFormValidFrom(discount.valid_from?.split("T")[0] || "")
    setFormValidTo(discount.valid_to?.split("T")[0] || "")
    setFormIsActive(discount.is_active)
  }

  // Tambah kode diskon baru
  const handleAdd = async () => {
    // Validasi form
    if (!formCode.trim() || !formPercentage || !formDescription.trim()) {
      toast.warning("Kode, persentase, dan deskripsi harus diisi")
      return
    }

    setIsSaving(true)

    try {
      const res = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formCode.toUpperCase().trim(),
          percentage: parseInt(formPercentage),
          description: formDescription.trim(),
          maxUses: formMaxUses ? parseInt(formMaxUses) : null,
          validFrom: formValidFrom || null,
          validTo: formValidTo || null,
          isActive: formIsActive,
        }),
      })

      if (res.ok) {
        toast.success("Kode diskon baru berhasil ditambahkan")
        await fetchDiscounts() // Refresh data
        resetForm()
        setIsAddOpen(false) // Tutup dialog
      } else {
        toast.error("Gagal menambahkan kode diskon")
      }
    } catch (error) {
      console.error("Error adding discount:", error)
      toast.error("Terjadi kesalahan saat menambah kode diskon")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingDiscount) return
    if (!formCode.trim() || !formPercentage || !formDescription.trim()) {
      toast.warning("Kode, persentase, dan deskripsi harus diisi")
      return
    }

    setIsSaving(true)

    try {
      const res = await fetch(`/api/discounts/${editingDiscount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formCode.toUpperCase().trim(),
          percentage: parseInt(formPercentage),
          description: formDescription.trim(),
          maxUses: formMaxUses ? parseInt(formMaxUses) : null,
          validFrom: formValidFrom || null,
          validTo: formValidTo || null,
          isActive: formIsActive,
        }),
      })

      if (res.ok) {
        toast.success("Kode diskon berhasil diperbarui")
        await fetchDiscounts()
        resetForm()
        setEditingDiscount(null)
      } else {
        toast.error("Gagal memperbarui kode diskon")
      }
    } catch (error) {
      console.error("Error updating discount:", error)
      toast.error("Terjadi kesalahan saat memperbarui")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {

    try {
      const res = await fetch(`/api/discounts/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Kode diskon berhasil dihapus")
        await fetchDiscounts()
      } else {
        toast.error("Gagal menghapus kode diskon")
      }
    } catch (error) {
      console.error("Error deleting discount:", error)
      toast.error("Terjadi kesalahan saat menghapus")
    }
  }

  const filteredDiscounts = discountCodes.filter(
    (d) =>
      d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const totalActive = discountCodes.filter((d) => d.is_active).length
  const totalUsed = discountCodes.reduce((sum, d) => sum + d.used_count, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Kode Diskon</h1>
          <p className="text-muted-foreground">Data dari database Supabase</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kode Diskon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Kode Diskon Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Kode Diskon *</Label>
                <Input
                  placeholder="PROMO10"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                />
              </div>
              <div className="space-y-2">
                <Label>Persentase Diskon (%) *</Label>
                <Input
                  type="number"
                  placeholder="10"
                  min="1"
                  max="100"
                  value={formPercentage}
                  onChange={(e) => setFormPercentage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi *</Label>
                <Input
                  placeholder="Diskon 10% untuk semua produk"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Maksimal Penggunaan</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={formMaxUses}
                  onChange={(e) => setFormMaxUses(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Berlaku Dari</Label>
                  <Input type="date" value={formValidFrom} onChange={(e) => setFormValidFrom(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Berlaku Sampai</Label>
                  <Input type="date" value={formValidTo} onChange={(e) => setFormValidTo(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Status Aktif</Label>
                <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
              </div>
              <Button
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                onClick={handleAdd}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {isSaving ? "Menyimpan..." : "Simpan Kode Diskon"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-600">Total Kode</p>
                <p className="text-2xl font-bold text-teal-800">{discountCodes.length}</p>
              </div>
              <Ticket className="h-8 w-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Kode Aktif</p>
                <p className="text-2xl font-bold text-green-800">{totalActive}</p>
              </div>
              <Percent className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Total Penggunaan</p>
                <p className="text-2xl font-bold text-orange-800">{totalUsed}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Tidak Aktif</p>
                <p className="text-2xl font-bold text-blue-800">{discountCodes.length - totalActive}</p>
              </div>
              <Ticket className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kode diskon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Discount Codes List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar Kode Diskon</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDiscounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {discountCodes.length === 0 ? "Belum ada kode diskon" : "Tidak ada hasil pencarian"}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDiscounts.map((discount) => (
                <div
                  key={discount.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono font-bold text-lg text-teal-600">{discount.code}</span>
                      <Badge className={discount.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {discount.is_active ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                      <Badge variant="outline">{discount.percentage}%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{discount.description}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                      <span>
                        Digunakan: {discount.used_count}
                        {discount.max_uses ? `/${discount.max_uses}` : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog
                      open={editingDiscount?.id === discount.id}
                      onOpenChange={(open) => !open && setEditingDiscount(null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(discount)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit Kode Diskon</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label>Kode Diskon *</Label>
                            <Input
                              value={formCode}
                              onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Persentase Diskon (%) *</Label>
                            <Input
                              type="number"
                              value={formPercentage}
                              onChange={(e) => setFormPercentage(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Deskripsi *</Label>
                            <Input
                              value={formDescription}
                              onChange={(e) => setFormDescription(e.target.value)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Status Aktif</Label>
                            <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
                          </div>
                          <Button
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                            onClick={handleUpdate}
                            disabled={isSaving}
                          >
                            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Kode Diskon?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus kode {discount.code}? Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(discount.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
