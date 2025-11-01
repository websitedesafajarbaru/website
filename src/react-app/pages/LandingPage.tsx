import { Link } from "react-router-dom"
import logo from "../assets/logo.png"

export function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section bg-primary text-white py-5">
        <div className="container-wide text-center">
          <img src={logo} alt="Logo SIFABAR" className="mb-3" style={{ height: "80px" }} />
          <h1 className="display-4 fw-bold mb-3">SIFABAR</h1>
          <p className="lead mb-4">Sistem Informasi Desa Fajar Baru - Portal Informasi dan Layanan Digital Untuk Warga Desa</p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/cek-pembayaran" className="btn btn-light btn-lg">
              Cek Pembayaran PBB
            </Link>
            <Link to="/pengaduan-masyarakat/login" className="btn btn-outline-light btn-lg">
              Pengaduan Masyarakat
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <div className="container-wide py-5">
        <h2 className="text-center mb-4">Layanan Kami</h2>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <i className="bi bi-receipt-cutoff text-primary mb-3" style={{ fontSize: "3rem" }}></i>
                <h5 className="card-title">Cek Pembayaran PBB</h5>
                <p className="card-text text-muted">Cek status pembayaran Pajak Bumi dan Bangunan secara online dengan mudah dan cepat.</p>
                <Link to="/cek-pembayaran" className="btn btn-primary">
                  Cek Sekarang
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <i className="bi bi-megaphone text-success mb-3" style={{ fontSize: "3rem" }}></i>
                <h5 className="card-title">Pengaduan Masyarakat</h5>
                <p className="card-text text-muted">Sampaikan keluhan dan aspirasi Anda kepada pemerintah desa melalui platform digital.</p>
                <div className="d-flex justify-content-center gap-2">
                  <Link to="/pengaduan-masyarakat/login" className="btn btn-success">
                    Login
                  </Link>
                  <Link to="/pengaduan-masyarakat/registrasi" className="btn btn-outline-success">
                    Daftar
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <i className="bi bi-briefcase text-info mb-3" style={{ fontSize: "3rem" }}></i>
                <h5 className="card-title">Pengelolaan PBB</h5>
                <p className="card-text text-muted">Layanan khusus perangkat desa untuk mengelola data Pajak Bumi dan Bangunan.</p>
                <Link to="/pengelolaan-pbb/login" className="btn btn-info">
                  Login Perangkat
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
