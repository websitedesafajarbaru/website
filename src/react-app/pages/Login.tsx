import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    nama_lengkap: "",
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
        navigate("/pengelolaan-pbb/dashboard-admin")
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
                <label className="form-label">Nama Lengkap</label>
                <input type="text" className="form-control" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} required />
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
              <p className="mb-0">
                Belum punya akun? <Link to="/pengelolaan-pbb/registrasi">Daftar disini</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
