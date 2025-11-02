import { useAuth } from "../../contexts/AuthContext"

interface DashboardHeaderProps {
  role: "admin" | "masyarakat"
}

export function DashboardHeader({ role }: DashboardHeaderProps) {
  const { user } = useAuth()

  const title = role === "admin" ? "Dashboard Admin Pengaduan" : "Dashboard Pengaduan Masyarakat"
  const description = role === "admin" ? "Kelola semua aduan masyarakat" : `Selamat datang, ${user?.nama_lengkap || "User"}`

  return (
    <div className="dashboard-header">
      <div>
        <h2>{title}</h2>
        <p className="text-muted mb-0">{description}</p>
      </div>
    </div>
  )
}
