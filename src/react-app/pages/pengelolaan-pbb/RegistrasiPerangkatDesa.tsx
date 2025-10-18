import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

export function RegistrasiPerangkatDesa() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    username: "",
    password: "",
    token: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/pengelolaan-pbb/registrasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Terjadi kesalahan")
      }

      Swal.fire({
        title: "Registrasi Berhasil!",
        text: `Registrasi berhasil sebagai ${result.jabatan === "kepala_dusun" ? "Kepala Dusun" : "Ketua RT"}! Silakan login`,
        icon: "success",
        confirmButtonText: "OK",
      })
      navigate("/pengelolaan-pbb/login")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-header">
            <h4 className="mb-0">Registrasi Perangkat Desa</h4>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nama Lengkap</label>
                <input type="text" className="form-control" value={formData.nama_lengkap} onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Username</label>
                <input type="text" className="form-control" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Token Registrasi</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                  required
                  placeholder="Token dari admin"
                />
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Jabatan akan ditentukan otomatis berdasarkan token yang dimasukkan
                </small>
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Memproses..." : "Daftar"}
              </button>
            </form>

            <div className="mt-3 text-center">
              <Link to="/pengelolaan-pbb/login">Sudah punya akun? Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
