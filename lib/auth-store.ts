"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthStore {
  isLoggedIn: boolean
  user: { id: string; username: string } | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      login: async (username: string, password: string) => {
        try {
          const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          })

          const data = await res.json()

          if (data.success && data.user) {
            set({ isLoggedIn: true, user: data.user })
            return true
          }
          return false
        } catch (error) {
          console.error("Login error:", error)
          return false
        }
      },
      logout: () => set({ isLoggedIn: false, user: null }),
    }),
    {
      name: "gasoutdoor_auth",
    },
  ),
)
