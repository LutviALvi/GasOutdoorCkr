"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Save, X, Plus, LogOut, Trash2 } from "lucide-react"

interface AdminUser {
  id: string
  username: string
  password: string
  createdAt: string
}

export default function UsersPage() {
  const router = useRouter()
  const { logout } = useAuthStore()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<AdminUser>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState({ username: "", password: "" })

  useEffect(() => {
    const stored = localStorage.getItem("gasoutdoor_admin_users")
    if (stored) {
      try {
        setUsers(JSON.parse(stored))
      } catch {
        const defaultUsers: AdminUser[] = [
          {
            id: "admin-1",
            username: "admin",
            password: "admin123",
            createdAt: new Date().toISOString(),
          },
        ]
        setUsers(defaultUsers)
        localStorage.setItem("gasoutdoor_admin_users", JSON.stringify(defaultUsers))
      }
    } else {
      const defaultUsers: AdminUser[] = [
        {
          id: "admin-1",
          username: "admin",
          password: "admin123",
          createdAt: new Date().toISOString(),
        },
      ]
      setUsers(defaultUsers)
      localStorage.setItem("gasoutdoor_admin_users", JSON.stringify(defaultUsers))
    }
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }

  const handleEdit = (user: AdminUser) => {
    setEditingId(user.id)
    setEditData(user)
  }

  const handleSave = () => {
    if (!editingId) return
    if (!editData.username || !editData.password) {
      alert("Username dan password harus diisi")
      return
    }

    const updated = users.map((u) => (u.id === editingId ? { ...u, ...editData } : u))
    setUsers(updated)
    localStorage.setItem("gasoutdoor_admin_users", JSON.stringify(updated))
    setEditingId(null)
    setEditData({})
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
  }

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password) {
      alert("Username dan password harus diisi")
      return
    }

    const user: AdminUser = {
      id: `admin-${Date.now()}`,
      username: newUser.username,
      password: newUser.password,
      createdAt: new Date().toISOString(),
    }

    const updated = [...users, user]
    setUsers(updated)
    localStorage.setItem("gasoutdoor_admin_users", JSON.stringify(updated))
    setNewUser({ username: "", password: "" })
    setShowAddForm(false)
  }

  const handleDeleteUser = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      const updated = users.filter((u) => u.id !== id)
      setUsers(updated)
      localStorage.setItem("gasoutdoor_admin_users", JSON.stringify(updated))
    }
  }

  return (
    <section className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Kelola User Admin</h1>
          <p className="text-muted-foreground">Kelola akun admin dan password</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddForm(true)} className="gap-2 bg-gradient-to-r from-primary to-secondary">
            <Plus className="h-4 w-4" />
            Tambah User
          </Button>
          <Button onClick={handleLogout} variant="destructive" className="gap-2 text-white">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-8 rounded-lg border bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tambah User Baru</h2>
            <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground">
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
            <Button onClick={handleAddUser} className="gap-2 bg-gradient-to-r from-primary to-secondary">
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
                          value={editData.username || ""}
                          onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                          className="h-8"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="password"
                          value={editData.password || ""}
                          onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                          className="h-8"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button onClick={handleSave} size="sm" variant="outline" className="gap-1 bg-transparent">
                            <Save className="h-4 w-4" />
                            Simpan
                          </Button>
                          <Button onClick={handleCancel} size="sm" variant="outline" className="gap-1 bg-transparent">
                            <X className="h-4 w-4" />
                            Batal
                          </Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium">{user.username}</td>
                      <td className="px-4 py-3 text-sm">••••••••</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button onClick={() => handleEdit(user)} size="sm" variant="outline" className="gap-1">
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteUser(user.id)}
                            size="sm"
                            variant="destructive"
                            className="gap-1 text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                            Hapus
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
