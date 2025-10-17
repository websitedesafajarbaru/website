import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { Layout } from "./components/Layout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { LandingPage } from "./pages/LandingPage"
import { CekPembayaran } from "./pages/CekPembayaran"
import { RegistrasiMasyarakat } from "./pages/pengaduan-masyarakat/RegistrasiMasyarakat"
import { LoginPengaduan } from "./pages/pengaduan-masyarakat/LoginPengaduan"
import { DashboardMasyarakat } from "./pages/pengaduan-masyarakat/DashboardMasyarakat"
import { DashboardAdminPengaduan } from "./pages/pengaduan-masyarakat/DashboardAdminPengaduan"
import { RegistrasiPerangkatDesa } from "./pages/pengelolaan-pbb/RegistrasiPerangkatDesa"
import { LoginPBB } from "./pages/pengelolaan-pbb/LoginPBB"
import { DashboardAdminPBB } from "./pages/pengelolaan-pbb/DashboardAdminPBB"
import { DashboardKepalaDusun } from "./pages/pengelolaan-pbb/DashboardKepalaDusun"
import { DashboardKetuaRT } from "./pages/pengelolaan-pbb/DashboardKetuaRT"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/cek-pembayaran" element={<CekPembayaran />} />

            <Route path="/pengaduan-masyarakat/registrasi" element={<RegistrasiMasyarakat />} />
            <Route path="/pengaduan-masyarakat/login" element={<LoginPengaduan />} />
            <Route
              path="/pengaduan-masyarakat/dashboard-masyarakat"
              element={
                <ProtectedRoute allowedRoles={["masyarakat"]}>
                  <DashboardMasyarakat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pengaduan-masyarakat/dashboard-admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardAdminPengaduan />
                </ProtectedRoute>
              }
            />

            <Route path="/pengelolaan-pbb/registrasi" element={<RegistrasiPerangkatDesa />} />
            <Route path="/pengelolaan-pbb/login" element={<LoginPBB />} />
            <Route
              path="/pengelolaan-pbb/dashboard-admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardAdminPBB />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pengelolaan-pbb/dashboard-kepala-dusun"
              element={
                <ProtectedRoute allowedRoles={["kepala_dusun"]}>
                  <DashboardKepalaDusun />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pengelolaan-pbb/dashboard-ketua-rt"
              element={
                <ProtectedRoute allowedRoles={["ketua_rt"]}>
                  <DashboardKetuaRT />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
