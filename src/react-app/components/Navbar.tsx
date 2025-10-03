import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { formatRole } from "../utils/formatters"

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
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  {user?.nama_lengkap}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <span className="dropdown-item-text small">
                      <strong>Role:</strong> {formatRole(user?.roles || "")}
                    </span>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  {user?.roles === "superadmin" && (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/pengaduan-masyarakat/dashboard-superadmin">
                          Dashboard Pengaduan
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/pengelolaan-pbb/dashboard-superadmin">
                          Dashboard PBB
                        </Link>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                    </>
                  )}
                  {user?.roles === "masyarakat" && (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/pengaduan-masyarakat/dashboard-masyarakat">
                          Dashboard Saya
                        </Link>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                    </>
                  )}
                  {user?.roles === "kepala_dusun" && (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/pengelolaan-pbb/dashboard-kepala-dusun">
                          Dashboard Kepala Dusun
                        </Link>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                    </>
                  )}
                  {user?.roles === "ketua_rt" && (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/pengelolaan-pbb/dashboard-ketua-rt">
                          Dashboard Ketua RT
                        </Link>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                    </>
                  )}
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
