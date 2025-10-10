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
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isAuthenticated: boolean
  apiRequest: <T = unknown>(url: string, options?: RequestInit) => Promise<T>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken)
    localStorage.setItem("user", JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }

  const authenticatedApiRequest = async <T = unknown>(url: string, options: RequestInit = {}): Promise<T> => {
    try {
      return await apiRequest<T>(url, options, logout)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        throw error
      }
      throw error
    }
  }

  return <AuthContext.Provider value={{
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    apiRequest: authenticatedApiRequest
  }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
