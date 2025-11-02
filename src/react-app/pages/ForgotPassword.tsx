import { useState } from "react"
import { Link } from "react-router-dom"

export function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      // TODO: Implement actual forgot password API call
      // For now, just show a success message
      setMessage("Link reset password telah dikirim ke email Anda")
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card">
          <div className="card-header">
            <h4 className="mb-0">Lupa Password</h4>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <p className="text-muted mb-3">Masukkan email Anda dan kami akan mengirim link untuk mereset password.</p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Masukkan email Anda" />
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Mengirim..." : "Kirim Link Reset"}
              </button>
            </form>

            <div className="mt-3 text-center">
              <Link to="/login" className="text-decoration-none">
                Kembali ke Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
