import { Link } from "react-router-dom"

export function LandingPage() {
  return (
    <div className="container-wide">
      <div className="card mb-4">
        <div className="card-body text-center py-4">
          <i className="bi bi-building text-primary" style={{ fontSize: "3rem" }}></i>
          <h1 className="h2 fw-bold mt-3 mb-2">Desa Fajar Baru</h1>
          <p className="text-muted mb-0">Portal Informasi dan Layanan Digital Untuk Warga Desa</p>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-receipt-cutoff text-primary me-3" style={{ fontSize: "2rem" }}></i>
                <h5 className="card-title mb-0">Cek Pembayaran PBB</h5>
              </div>
              <p className="card-text text-muted small mb-3">Cek status pembayaran Pajak Bumi dan Bangunan secara online</p>
              <Link to="/cek-pembayaran" className="btn btn-sm btn-primary">
                Cek Sekarang
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-megaphone text-success me-3" style={{ fontSize: "2rem" }}></i>
                <h5 className="card-title mb-0">Pengaduan Masyarakat</h5>
              </div>
              <p className="card-text text-muted small mb-3">Sampaikan keluhan dan aspirasi kepada pemerintah desa</p>
              <div className="d-flex gap-2">
                <Link to="/pengaduan-masyarakat/login" className="btn btn-sm btn-success">
                  Login
                </Link>
                <Link to="/pengaduan-masyarakat/registrasi" className="btn btn-sm btn-outline-success">
                  Daftar
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-briefcase text-info me-3" style={{ fontSize: "2rem" }}></i>
                <h5 className="card-title mb-0">Pengelolaan PBB</h5>
              </div>
              <p className="card-text text-muted small mb-3">Layanan khusus perangkat desa untuk mengelola data PBB</p>
              <Link to="/pengelolaan-pbb/login" className="btn btn-sm btn-info">
                Login Perangkat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
