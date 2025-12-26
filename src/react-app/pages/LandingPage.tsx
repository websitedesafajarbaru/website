import { Link, Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import logo from "../assets/logo.png"

export function LandingPage() {
  const { isAuthenticated, user } = useAuth()

  if (isAuthenticated && user) {
    let dashboardPath = "/"
    switch (user.roles) {
      case "masyarakat":
        dashboardPath = "/settings"
        break
      case "admin":
        dashboardPath = "/pengelolaan-pbb/dashboard-admin"
        break
      case "kepala_dusun":
        dashboardPath = "/pengelolaan-pbb/dashboard-kepala-dusun"
        break
      case "ketua_rt":
        dashboardPath = "/pengelolaan-pbb/dashboard-ketua-rt"
        break
      default:
        dashboardPath = "/"
    }
    return <Navigate to={dashboardPath} replace />
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section bg-primary text-white py-5">
        <div className="container-wide text-center px-3">
          <img src={logo} alt="Logo SIFABAR" className="mb-3" style={{ height: "80px" }} />
          <h1 className="display-4 fw-bold mb-3">SIFABAR</h1>
          <p className="lead mb-4">Sistem Informasi Desa Fajar Baru - Portal Digital untuk Pengelolaan PBB</p>
          <div className="d-flex justify-content-center gap-3 flex-column flex-md-row mx-3">
            <Link to="/cek-pembayaran" className="btn btn-light btn-lg" style={{ minWidth: "200px" }}>
              Cek Pembayaran
            </Link>
            <Link to="/login" className="btn btn-outline-light btn-lg" style={{ minWidth: "200px" }}>
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <div className="container-wide py-5">
        <h2 className="text-center mb-4">Fitur Kami</h2>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column justify-content-between text-center">
                <div>
                  <i className="bi bi-receipt-cutoff text-primary mb-3" style={{ fontSize: "3rem" }}></i>
                  <h5 className="card-title">Cek Pembayaran PBB</h5>
                  <p className="card-text text-muted">Cek status pembayaran Pajak Bumi dan Bangunan secara online dengan mudah dan cepat.</p>
                </div>
                <Link to="/cek-pembayaran" className="btn btn-primary" style={{ minWidth: "120px" }}>
                  Cek Sekarang
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column justify-content-between text-center">
                <div>
                  <i className="bi bi-briefcase text-info mb-3" style={{ fontSize: "3rem" }}></i>
                  <h5 className="card-title">Pengelolaan PBB</h5>
                  <p className="card-text text-muted">Sistem lengkap untuk perangkat desa mengelola data Pajak Bumi dan Bangunan.</p>
                </div>
                <Link to="/login" className="btn btn-info" style={{ minWidth: "120px" }}>
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
