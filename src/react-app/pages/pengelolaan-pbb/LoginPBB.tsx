import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

export function LoginPBB() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

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

      login(result.token, result.user)

      if (result.user.roles === "superadmin") {
        navigate("/pengelolaan-pbb/dashboard-superadmin")
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
            <h4 className="mb-0">Login Pengelolaan PBB</h4>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input type="text" className="form-control" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Memproses..." : "Login"}
              </button>
            </form>

            <div className="mt-3 text-center">
              <Link to="/pengelolaan-pbb/registrasi">Belum punya akun? Daftar</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
