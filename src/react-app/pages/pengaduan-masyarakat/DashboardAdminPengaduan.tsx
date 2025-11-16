import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Aduan, Masyarakat } from "../../types"
import { StatsCards, FilterSection } from "../../components/pengaduan-masyarakat/DashboardAdmin"
import { StatsCardsMasyarakat } from "../../components/pengaduan-masyarakat/DashboardAdmin/StatsCardsMasyarakat"
import { AduanDetail } from "../../components/pengaduan-masyarakat/AduanDetail"
import { AduanTable } from "../../components/pengaduan-masyarakat/AduanTable"
import { MasyarakatTable } from "../../components/pengaduan-masyarakat/DashboardAdmin/MasyarakatTable"
import { MasyarakatForm, MasyarakatFormData } from "../../components/pengaduan-masyarakat/DashboardAdmin/MasyarakatForm"

export function DashboardAdminPengaduan() {
  const { apiRequest } = useAuth()
  const [aduan, setAduan] = useState<Aduan[]>([])
  const [masyarakat, setMasyarakat] = useState<Masyarakat[]>([])
  const [selectedAduan, setSelectedAduan] = useState<Aduan | null>(null)
  const [selectedMasyarakat, setSelectedMasyarakat] = useState<Masyarakat | null>(null)
  const [tanggapan, setTanggapan] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingMasyarakat, setLoadingMasyarakat] = useState(false)
  const [activeTab, setActiveTab] = useState<"daftar" | "detail" | "masyarakat" | "masyarakat-form">("daftar")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchTermMasyarakat, setSearchTermMasyarakat] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [currentPageMasyarakat, setCurrentPageMasyarakat] = useState(1)
  const itemsPerPage = 100

  const fetchAduan = useCallback(async () => {
    try {
      setLoading(true)
      const url = statusFilter ? `/api/aduan?status=${statusFilter}` : "/api/aduan"
      const result = await apiRequest<Aduan[]>(url)
      setAduan(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, apiRequest])

  const fetchMasyarakat = useCallback(async () => {
    try {
      setLoadingMasyarakat(true)
      const result = await apiRequest<Masyarakat[]>("/api/masyarakat")
      setMasyarakat(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMasyarakat(false)
    }
  }, [apiRequest])

  useEffect(() => {
    fetchAduan()
  }, [fetchAduan])

  useEffect(() => {
    if (activeTab === "masyarakat" || activeTab === "masyarakat-form") {
      fetchMasyarakat()
    }
  }, [activeTab, fetchMasyarakat])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  useEffect(() => {
    setCurrentPageMasyarakat(1)
  }, [searchTermMasyarakat])

  const fetchDetail = async (id: string) => {
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

  const updateStatus = async (id: string, status: string) => {
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
        fetchDetail(id)
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
      fetchDetail(selectedAduan.id)
      fetchAduan()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateMasyarakat = () => {
    setSelectedMasyarakat(null)
    setActiveTab("masyarakat-form")
  }

  const handleEditMasyarakat = (masyarakat: Masyarakat) => {
    setSelectedMasyarakat(masyarakat)
    setActiveTab("masyarakat-form")
  }

  const handleEditMasyarakatById = (id: string) => {
    const foundMasyarakat = masyarakat.find((m: Masyarakat) => m.id === id)
    if (foundMasyarakat) {
      handleEditMasyarakat(foundMasyarakat)
    }
  }

  const handleToggleBan = async (id: string, currentStatus: string) => {
    const action = currentStatus === "active" ? "ban" : "unban"
    const result = await Swal.fire({
      title: `Apakah Anda yakin?`,
      text: `Masyarakat akan di${action} dari sistem`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: currentStatus === "active" ? "#d33" : "#28a745",
      cancelButtonColor: "#3085d6",
      confirmButtonText: currentStatus === "active" ? "Ya, Ban!" : "Ya, Unban!",
      cancelButtonText: "Batal",
    })

    if (result.isConfirmed) {
      try {
        await apiRequest(`/api/masyarakat/${id}/ban`, {
          method: "PUT",
        })
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: `Masyarakat berhasil di${action}`,
          timer: 2000,
          showConfirmButton: false,
        })
        fetchMasyarakat()
      } catch (err: unknown) {
        console.error(err)
        const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan"
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: errorMessage,
        })
      }
    }
  }

  const handleSubmitMasyarakat = async (data: MasyarakatFormData) => {
    try {
      if (selectedMasyarakat) {
        await apiRequest(`/api/masyarakat/${selectedMasyarakat.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        })
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Masyarakat berhasil diperbarui",
          timer: 2000,
          showConfirmButton: false,
        })
      } else {
        await apiRequest("/api/masyarakat", {
          method: "POST",
          body: JSON.stringify(data),
        })
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Masyarakat berhasil ditambahkan",
          timer: 2000,
          showConfirmButton: false,
        })
      }
      setActiveTab("masyarakat")
      fetchMasyarakat()
    } catch (err: unknown) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan"
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: errorMessage,
      })
    }
  }

  const filteredAduan = aduan.filter(
    (item) =>
      item.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kategori?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.isi_aduan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.isi?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredMasyarakat = masyarakat.filter(
    (item) =>
      item.nama_lengkap.toLowerCase().includes(searchTermMasyarakat.toLowerCase()) ||
      item.username.toLowerCase().includes(searchTermMasyarakat.toLowerCase()) ||
      item.alamat_rumah.toLowerCase().includes(searchTermMasyarakat.toLowerCase()) ||
      item.nomor_telepon.toLowerCase().includes(searchTermMasyarakat.toLowerCase())
  )

  return (
    <div className="container-wide">
      <div className="dashboard-header" style={{ minHeight: "80px" }}>
        <div>
          <h2>Dashboard Admin Pengaduan</h2>
          <p className="text-muted mb-0 small">Admin</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-3" style={{ backgroundColor: "#fff", padding: "0.5rem 1rem", borderRadius: "4px", border: "1px solid #dee2e6" }}>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "daftar" || activeTab === "detail" ? "active" : ""}`}
            onClick={() => setActiveTab("daftar")}
            style={{ border: "none", fontSize: "0.9rem" }}
          >
            <i className="bi bi-list-ul me-2"></i>Aduan
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "masyarakat" || activeTab === "masyarakat-form" ? "active" : ""}`}
            onClick={() => setActiveTab("masyarakat")}
            style={{ border: "none", fontSize: "0.9rem" }}
          >
            <i className="bi bi-people me-2"></i>Masyarakat
          </button>
        </li>
      </ul>

      {activeTab === "daftar" && (
        <div key="daftar">
          <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Daftar Aduan</h6>
            </div>
          </div>

          <StatsCards aduan={aduan} />

          <FilterSection statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} onRefresh={fetchAduan} searchTerm={searchTerm} onSearchChange={setSearchTerm} />

          <AduanTable
            aduan={filteredAduan}
            loading={loading}
            onViewDetail={fetchDetail}
            role="admin"
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredAduan.length}
            onPageChange={setCurrentPage}
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
              onStatusChange={updateStatus}
              onSubmitTanggapan={submitTanggapan}
              onEditMasyarakat={handleEditMasyarakatById}
            />
          </div>
        </div>
      )}

      {activeTab === "masyarakat" && (
        <div key="masyarakat">
          <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Daftar Masyarakat</h6>
              <button className="btn btn-sm btn-primary" onClick={handleCreateMasyarakat}>
                <i className="bi bi-plus-circle me-1"></i>Tambah Masyarakat
              </button>
            </div>
          </div>

          <StatsCardsMasyarakat masyarakat={masyarakat} />

          <FilterSection
            statusFilter=""
            onStatusFilterChange={() => {}}
            onRefresh={fetchMasyarakat}
            searchTerm={searchTermMasyarakat}
            onSearchChange={setSearchTermMasyarakat}
            showStatusFilter={false}
          />

          <MasyarakatTable
            masyarakat={filteredMasyarakat}
            loading={loadingMasyarakat}
            onEdit={handleEditMasyarakat}
            onToggleBan={handleToggleBan}
            currentPage={currentPageMasyarakat}
            itemsPerPage={itemsPerPage}
            totalItems={filteredMasyarakat.length}
            onPageChange={setCurrentPageMasyarakat}
          />
        </div>
      )}

      {activeTab === "masyarakat-form" && (
        <div key="masyarakat-form" className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">{selectedMasyarakat ? "Edit Masyarakat" : "Tambah Masyarakat Baru"}</h6>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab("masyarakat")}>
              <i className="bi bi-arrow-left me-1"></i>Kembali ke Daftar
            </button>
          </div>
          <div className="card-body">
            <MasyarakatForm
              masyarakat={selectedMasyarakat}
              onSubmit={handleSubmitMasyarakat}
              onCancel={() => setActiveTab("masyarakat")}
              loading={false}
              onToggleBan={handleToggleBan}
            />
          </div>
        </div>
      )}
    </div>
  )
}
