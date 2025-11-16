import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Terjadi kesalahan")
      }

      login(result.user)

      if (result.user.roles === "admin") {
        navigate("/pengaduan-masyarakat/dashboard-admin")
      } else if (result.user.roles === "masyarakat") {
        navigate("/pengaduan-masyarakat/dashboard-masyarakat")
      } else if (result.user.roles === "kepala_dusun") {
        navigate("/pengelolaan-pbb/dashboard-kepala-dusun")
      } else if (result.user.roles === "ketua_rt") {
        navigate("/pengelolaan-pbb/dashboard-ketua-rt")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card">
          <div className="card-header">
            <h4 className="mb-0">Login</h4>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input type="text" className="form-control" name="username" value={formData.username} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required />
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Memproses..." : "Login"}
              </button>
            </form>

            <div className="mt-3 text-center">
              <p className="mb-2">Belum punya akun?</p>
              <div className="d-flex gap-2 justify-content-center">
                <Link to="/pengaduan-masyarakat/registrasi" className="btn btn-outline-primary btn-sm">
                  Registrasi Masyarakat
                </Link>
                <Link to="/pengelolaan-pbb/registrasi" className="btn btn-outline-secondary btn-sm">
                  Registrasi Perangkat Desa
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
