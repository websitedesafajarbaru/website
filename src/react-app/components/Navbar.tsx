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
      <div className="container-wide">
        <div className="d-flex align-items-center">
          <Link className="navbar-brand" to="/">
            <img src={logo} alt="Logo" className="me-2" style={{ height: "24px" }} />
            SIFABAR
          </Link>
          <button className="navbar-toggler ms-auto" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
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
                {(user?.roles === "admin" || user?.roles === "masyarakat") && (
                  <li className="nav-item">
                    <Link className="nav-link" to={user?.roles === "admin" ? "/pengaduan-masyarakat/dashboard-admin" : "/pengaduan-masyarakat/dashboard-masyarakat"}>
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
