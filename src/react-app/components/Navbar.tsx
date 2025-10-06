import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white">
      <div className="container-wide">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-building me-2"></i>
          Desa Fajar Baru
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Beranda
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/cek-pembayaran">
                Cek Pembayaran
              </Link>
            </li>
            {!isAuthenticated ? (
              <>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    Pengaduan
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link className="dropdown-item" to="/pengaduan-masyarakat/login">
                        Login
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/pengaduan-masyarakat/registrasi">
                        Registrasi
                      </Link>
                    </li>
                  </ul>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    PBB
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link className="dropdown-item" to="/pengelolaan-pbb/login">
                        Login
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/pengelolaan-pbb/registrasi">
                        Registrasi
                      </Link>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                {(user?.roles === "superadmin" || user?.roles === "masyarakat") && (
                  <li className="nav-item">
                    <Link className="nav-link" to={user?.roles === "superadmin" ? "/pengaduan-masyarakat/dashboard-superadmin" : "/pengaduan-masyarakat/dashboard-masyarakat"}>
                      Dashboard Pengaduan
                    </Link>
                  </li>
                )}
                {(user?.roles === "superadmin" || user?.roles === "kepala_dusun" || user?.roles === "ketua_rt") && (
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      to={
                        user?.roles === "superadmin"
                          ? "/pengelolaan-pbb/dashboard-superadmin"
                          : user?.roles === "kepala_dusun"
                            ? "/pengelolaan-pbb/dashboard-kepala-dusun"
                            : "/pengelolaan-pbb/dashboard-ketua-rt"
                      }
                    >
                      Dashboard PBB
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <button className="nav-link" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
