import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import logo from "../assets/logo.png"

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white">
      <div className="container-wide navbar-custom-container">
        <Link className="navbar-brand" to="/">
          <img src={logo} alt="Logo" className="me-2" style={{ height: "24px" }} />
          SIFABAR
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {!isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Beranda
                </Link>
              </li>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/cek-pembayaran">
                Cek Pembayaran
              </Link>
            </li>
            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
              </>
            ) : (
              <>
                {(user?.roles === "admin" || user?.roles === "masyarakat") && (
                  <li className="nav-item">
                    <Link className="nav-link" to={user?.roles === "admin" ? "/pengaduan-masyarakat/dashboard-admin" : "/pengaduan-masyarakat/dashboard-masyarakat"}>
                      Dashboard Pengaduan
                    </Link>
                  </li>
                )}
                {(user?.roles === "kepala_dusun" || user?.roles === "ketua_rt") && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/pengaduan-masyarakat/dashboard-perangkat-desa">
                      Dashboard Pengaduan
                    </Link>
                  </li>
                )}
                {(user?.roles === "admin" || user?.roles === "kepala_dusun" || user?.roles === "ketua_rt") && (
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      to={
                        user?.roles === "admin"
                          ? "/pengelolaan-pbb/dashboard-admin"
                          : user?.roles === "kepala_dusun"
                            ? "/pengelolaan-pbb/dashboard-kepala-dusun"
                            : "/pengelolaan-pbb/dashboard-ketua-rt"
                      }
                    >
                      Dashboard PBB
                    </Link>
                  </li>
                )}
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    {user?.nama_lengkap || "User"}
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="userDropdown">
                    <li>
                      <Link className="dropdown-item" to="/settings">
                        <i className="bi bi-gear me-2"></i>
                        Pengaturan
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
