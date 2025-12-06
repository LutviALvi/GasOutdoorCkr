import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthStore {
  isLoggedIn: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "admin123"

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      login: (username: string, password: string) => {
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          set({ isLoggedIn: true })
          return true
        }
        return false
      },
      logout: () => set({ isLoggedIn: false }),
    }),
    {
      name: "gasoutdoor_auth",
    },
  ),
)
