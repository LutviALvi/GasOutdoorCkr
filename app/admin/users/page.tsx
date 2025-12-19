"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Save, X, Plus, Trash2, Loader2 } from "lucide-react"

interface AdminUser {
  id: string
  username: string
  created_at: string
  updated_at?: string
}

export default function UsersPage() {
  const router = useRouter()
  const { isLoggedIn } = useAuthStore()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<{ username: string; password: string }>({ username: "", password: "" })
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState({ username: "", password: "" })
  const [saving, setSaving] = useState(false)
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
      fetchUsers(true)

      // Real-time listener for admin_users table
      const channel = supabase
        .channel('admin-users-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'admin_users' },
          () => {
            fetchUsers(false) // Background update
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [isHydrated, isLoggedIn, router])

  // Ambil daftar user admin dari API
  async function fetchUsers(showLoading = false) {
    try {
      if (showLoading) setLoading(true)
      const res = await fetch(`/api/admin/users?t=${Date.now()}`, { 
        cache: "no-store",
        headers: { 'Cache-Control': 'no-cache' } 
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: AdminUser) => {
    setEditingId(user.id)
    setEditData({ username: user.username, password: "" })
  }

  const handleSave = async () => {
    if (!editingId || !editData.username) return
    setSaving(true)

    try {
      const body: Record<string, string> = { username: editData.username }
      if (editData.password) body.password = editData.password

      const res = await fetch(`/api/admin/users/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        await fetchUsers()
        setEditingId(null)
        setEditData({ username: "", password: "" })
      } else {
        alert("Gagal menyimpan perubahan")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      alert("Gagal menyimpan perubahan")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({ username: "", password: "" })
  }

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password) {
      alert("Username dan password harus diisi")
      return
    }

    setSaving(true)

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })

      if (res.ok) {
        await fetchUsers()
        setNewUser({ username: "", password: "" })
        setShowAddForm(false)
      } else {
        const data = await res.json()
        alert(data.error || "Gagal menambahkan user")
      }
    } catch (error) {
      console.error("Error adding user:", error)
      alert("Gagal menambahkan user")
    } finally {
      setSaving(false)
    }
  }

  // Hapus user admin
  const handleDeleteUser = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) return

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      if (res.ok) {
        await fetchUsers()
      } else {
        const data = await res.json()
        alert(data.error || "Gagal menghapus user")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Gagal menghapus user")
    }
  }

  if (!isHydrated || !isLoggedIn) {
    return null
  }

  if (loading) {
    return (
      <section className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </section>
    )
  }

  return (
    <section className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Kelola User Admin</h1>
          <p className="text-muted-foreground">Data dari database Supabase</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2 bg-gradient-to-r from-primary to-secondary">
          <Plus className="h-4 w-4" />
          Tambah User
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-8 rounded-lg border bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tambah User Baru</h2>
            <button onClick={() => setShowAddForm(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Username</label>
              <Input
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="mt-1"
                placeholder="Username"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Password</label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="mt-1"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleAddUser} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Tambah
            </Button>
            <Button onClick={() => setShowAddForm(false)} variant="outline">
              Batal
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Username</th>
                <th className="px-4 py-3 text-left font-semibold">Password</th>
                <th className="px-4 py-3 text-left font-semibold">Dibuat</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user.id} className={idx % 2 === 0 ? "bg-white" : "bg-muted/30"}>
                  {editingId === user.id ? (
                    <>
                      <td className="px-4 py-3">
                        <Input
                          value={editData.username}
                          onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                          className="h-8"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="password"
                          placeholder="Kosongkan jika tidak diubah"
                          value={editData.password}
                          onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                          className="h-8"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button onClick={handleSave} size="sm" variant="outline" disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                          <Button onClick={handleCancel} size="sm" variant="outline">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium">{user.username}</td>
                      <td className="px-4 py-3 text-sm">••••••••</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button onClick={() => handleEdit(user)} size="sm" variant="outline">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteUser(user.id)}
                            size="sm"
                            variant="destructive"
                            className="text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
