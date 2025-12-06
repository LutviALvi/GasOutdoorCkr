"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { AlertCircle } from "lucide-react"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!username || !password) {
      setError("Username dan password harus diisi")
      setIsLoading(false)
      return
    }

    if (login(username, password)) {
      router.push("/admin")
    } else {
      setError("Username atau password salah")
      setPassword("")
    }
    setIsLoading(false)
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-lg border bg-white p-8 shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-sm text-muted-foreground mt-2">Masukkan kredensial admin untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-sm font-semibold">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="mt-1"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="mt-1"
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-blue-50 p-3 text-xs text-blue-700 border border-blue-200">
            <p className="font-semibold mb-1">Demo Credentials:</p>
            <p>
              Username: <span className="font-mono">admin</span>
            </p>
            <p>
              Password: <span className="font-mono">admin123</span>
            </p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
