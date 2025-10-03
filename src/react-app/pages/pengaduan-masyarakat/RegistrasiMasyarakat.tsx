import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

export function RegistrasiMasyarakat() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    username: "",
    nomor_telepon: "",
    email: "",
    alamat_rumah: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const response = await fetch("/api/pengaduan-masyarakat/registrasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Terjadi kesalahan")
      }

      alert("Registrasi berhasil! Silakan login")
      navigate("/pengaduan-masyarakat/login")
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
            <h4 className="mb-0">Registrasi Masyarakat</h4>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nama Lengkap</label>
                <input type="text" className="form-control" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Username</label>
                <input type="text" className="form-control" name="username" value={formData.username} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Nomor Telepon</label>
                <input type="tel" className="form-control" name="nomor_telepon" value={formData.nomor_telepon} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Alamat Rumah</label>
                <textarea className="form-control" name="alamat_rumah" value={formData.alamat_rumah} onChange={handleChange} required rows={3} />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required />
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Memproses..." : "Daftar"}
              </button>
            </form>

            <div className="mt-3 text-center">
              <Link to="/pengaduan-masyarakat/login">Sudah punya akun? Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
