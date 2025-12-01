import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Aduan } from "../../types"
import { StatsCards as StatsCardsPengaduan } from "../../components/pengaduan-masyarakat/DashboardAdmin"
import { FilterSection } from "../../components/pengaduan-masyarakat/DashboardAdmin/FilterSection"
import { AduanDetail } from "../../components/pengaduan-masyarakat/AduanDetail"
import { AduanTable } from "../../components/pengaduan-masyarakat/AduanTable"
import Swal from "sweetalert2"

export function DashboardPerangkatDesaPengaduan() {
  const { user, apiRequest } = useAuth()
  const [aduan, setAduan] = useState<Aduan[]>([])
  const [selectedAduan, setSelectedAduan] = useState<Aduan | null>(null)
  const [tanggapan, setTanggapan] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [loadingAduan, setLoadingAduan] = useState(false)
  const [searchTermAduan, setSearchTermAduan] = useState("")
  const [currentPageAduan, setCurrentPageAduan] = useState(1)
  const [activeTab, setActiveTab] = useState<"daftar" | "detail">("daftar")
  const itemsPerPage = 100

  // Cache flag to prevent unnecessary fetches
  const [hasDataFetched, setHasDataFetched] = useState(false)

  const fetchAduan = useCallback(async () => {
    try {
      setLoadingAduan(true)
      const url = statusFilter ? `/api/aduan?status=${statusFilter}` : "/api/aduan"
      const result = await apiRequest<Aduan[]>(url)
      setAduan(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingAduan(false)
    }
  }, [statusFilter, apiRequest])

  const fetchDetailAduan = async (id: string) => {
    try {
      const result = await apiRequest<Aduan>(`/api/aduan/${id}`)
      setSelectedAduan(result)
      setTanggapan("")
      setActiveTab("detail")
      // Mark as read
      await apiRequest(`/api/aduan/${id}/dibaca`, {
        method: "POST",
      })
    } catch (err) {
      console.error(err)
    }
  }

  const updateStatusAduan = async (id: string, status: string) => {
    try {
      await apiRequest(`/api/aduan/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      })
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Status berhasil diperbarui",
        timer: 2000,
        showConfirmButton: false,
      })
      fetchAduan()
      if (selectedAduan?.id === id) {
        fetchDetailAduan(id)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const submitTanggapan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAduan) return

    try {
      await apiRequest(`/api/aduan/${selectedAduan.id}/tanggapan`, {
        method: "POST",
        body: JSON.stringify({ isi_tanggapan: tanggapan }),
      })
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Tanggapan berhasil dikirim",
        timer: 2000,
        showConfirmButton: false,
      })
      setTanggapan("")
      fetchDetailAduan(selectedAduan.id)
      fetchAduan()
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (activeTab === "daftar" || activeTab === "detail") {
      fetchAduan()
    }
  }, [activeTab, fetchAduan])

  useEffect(() => {
    setCurrentPageAduan(1)
  }, [searchTermAduan, statusFilter])

  const filteredAduan = aduan.filter(
    (item) =>
      item.judul?.toLowerCase().includes(searchTermAduan.toLowerCase()) ||
      item.kategori?.toLowerCase().includes(searchTermAduan.toLowerCase()) ||
      item.isi_aduan?.toLowerCase().includes(searchTermAduan.toLowerCase()) ||
      item.isi?.toLowerCase().includes(searchTermAduan.toLowerCase())
  )

  // Initial fetch
  useEffect(() => {
    if (!hasDataFetched) {
      fetchAduan()
      setHasDataFetched(true)
    }
  }, [hasDataFetched, fetchAduan])

  const getDashboardTitle = () => {
    if (user?.roles === "kepala_dusun") return "Dashboard Pengaduan - Kepala Dusun"
    if (user?.roles === "ketua_rt") return "Dashboard Pengaduan - Ketua RT"
    return "Dashboard Pengaduan"
  }

  return (
    <div className="container-wide">
      <div className="dashboard-header" style={{ minHeight: "80px" }}>
        <div>
          <h2>{getDashboardTitle()}</h2>
          <p className="text-muted mb-0 small">{user?.roles === "kepala_dusun" ? "Kepala Dusun" : "Ketua RT"}</p>
        </div>
      </div>

      {activeTab === "daftar" && (
        <div key="daftar">
          <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Daftar Aduan</h6>
            </div>
          </div>

          <StatsCardsPengaduan aduan={aduan} />

          <FilterSection statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} onRefresh={fetchAduan} searchTerm={searchTermAduan} onSearchChange={setSearchTermAduan} />

          <AduanTable
            aduan={filteredAduan}
            loading={loadingAduan}
            onViewDetail={fetchDetailAduan}
            role="admin"
            currentPage={currentPageAduan}
            itemsPerPage={itemsPerPage}
            totalItems={filteredAduan.length}
            onPageChange={setCurrentPageAduan}
          />
        </div>
      )}

      {activeTab === "detail" && selectedAduan && (
        <div key="detail" className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Detail Aduan</h6>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab("daftar")}>
              <i className="bi bi-arrow-left me-1"></i>Kembali ke Daftar
            </button>
          </div>
          <div className="card-body">
            <AduanDetail
              aduan={selectedAduan}
              isAdmin={true}
              tanggapan={tanggapan}
              setTanggapan={setTanggapan}
              onStatusChange={updateStatusAduan}
              onSubmitTanggapan={submitTanggapan}
              onEditMasyarakat={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  )
}