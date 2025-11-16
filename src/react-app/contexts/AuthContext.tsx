import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { apiRequest, ApiError } from "../utils/api"

interface User {
  id: string
  nama_lengkap: string
  username: string
  roles: string
}

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  updateUser: (user: User) => void
  isAuthenticated: boolean
  apiRequest: <T = unknown>(url: string, options?: RequestInit) => Promise<T>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const profile = await apiRequest<{ id: string; nama_lengkap: string; username: string; roles: string }>("/auth/profile")
      setUser(profile)
    } catch {
      setUser(null)
    }
  }

  const login = (newUser: User) => {
    setUser(newUser)
  }

  const logout = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
    }
  }

  const updateUser = (newUser: User) => {
    setUser(newUser)
  }

  const authenticatedApiRequest = async <T = unknown,>(url: string, options: RequestInit = {}): Promise<T> => {
    try {
      return await apiRequest<T>(url, options, () => {
        setUser(null)
      })
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null)
        throw error
      }
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        apiRequest: authenticatedApiRequest,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
