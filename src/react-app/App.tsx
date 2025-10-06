import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { Layout } from "./components/Layout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { LandingPage } from "./pages/LandingPage"
import { CekPembayaran } from "./pages/CekPembayaran"
import { RegistrasiMasyarakat } from "./pages/pengaduan-masyarakat/RegistrasiMasyarakat"
import { LoginPengaduan } from "./pages/pengaduan-masyarakat/LoginPengaduan"
import { DashboardMasyarakat } from "./pages/pengaduan-masyarakat/DashboardMasyarakat"
import { DashboardSuperadminPengaduan } from "./pages/pengaduan-masyarakat/DashboardSuperadminPengaduan"
import { RegistrasiPerangkatDesa } from "./pages/pengelolaan-pbb/RegistrasiPerangkatDesa"
import { LoginPBB } from "./pages/pengelolaan-pbb/LoginPBB"
import { DashboardSuperadminPBB } from "./pages/pengelolaan-pbb/DashboardSuperadminPBB"
import { DashboardKepalaDusun } from "./pages/pengelolaan-pbb/DashboardKepalaDusun"
import { DashboardKetuaRT } from "./pages/pengelolaan-pbb/DashboardKetuaRT"
import { DetailDusunLaporan } from "./pages/pengelolaan-pbb/DetailDusunLaporan"
import { DetailSuratPBB } from "./pages/pengelolaan-pbb/DetailSuratPBB"

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
              path="/pengaduan-masyarakat/dashboard-superadmin"
              element={
                <ProtectedRoute allowedRoles={["superadmin"]}>
                  <DashboardSuperadminPengaduan />
                </ProtectedRoute>
              }
            />

            <Route path="/pengelolaan-pbb/registrasi" element={<RegistrasiPerangkatDesa />} />
            <Route path="/pengelolaan-pbb/login" element={<LoginPBB />} />
            <Route
              path="/pengelolaan-pbb/dashboard-superadmin"
              element={
                <ProtectedRoute allowedRoles={["superadmin"]}>
                  <DashboardSuperadminPBB />
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
            <Route
              path="/dashboard/pbb/laporan/dusun/:id"
              element={
                <ProtectedRoute allowedRoles={["superadmin", "kepala_dusun"]}>
                  <DetailDusunLaporan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/pbb/surat/:id"
              element={
                <ProtectedRoute allowedRoles={["superadmin", "kepala_dusun", "ketua_rt"]}>
                  <DetailSuratPBB />
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
