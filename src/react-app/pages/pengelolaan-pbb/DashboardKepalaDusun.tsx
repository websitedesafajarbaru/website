import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { SuratPBB } from "../../types"
import { StatistikCards } from "../../components/pengelolaan-pbb/StatistikCards"
import { FormTambahSuratPBB } from "../../components/pengelolaan-pbb/FormTambahSuratPBB"
import { TabelSuratPBB } from "../../components/pengelolaan-pbb/TabelSuratPBB"
import { DetailSuratPBB } from "../../components/pengelolaan-pbb/DetailSuratPBB"
import { DaftarKetuaRT } from "../../components/pengelolaan-pbb/DaftarKetuaRT"
import Swal from "sweetalert2"

interface DusunStatistik {
  dusun: {
    id: number
    nama_dusun: string
  }
  active_year: number
  total_pajak_terhutang: number
  total_pajak_dibayar: number
  total_surat: number
  total_surat_dibayar: number
  total_surat_belum_bayar: number
  persentase_pembayaran: number
  surat_pbb: SuratPBB[]
}

interface PerangkatDesa {
  id: string
  nama_lengkap: string
  jabatan: string
  nama_dusun?: string
  jumlahSurat?: number
}

interface DusunInfo {
  id: number
  nama_dusun: string
}

export function DashboardKepalaDusun() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"ketua-rt" | "laporan" | "tambah-surat-pbb" | "edit-ketua-rt" | "daftar-surat">("laporan")
  const [ketuaRT, setKetuaRT] = useState<PerangkatDesa[]>([])
  const [dusunInfo, setDusunInfo] = useState<DusunInfo | null>(null)
  const [dusunId, setDusunId] = useState<number | null>(null)
  const [statistik, setStatistik] = useState<DusunStatistik | null>(null)
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear())
  const [selectedSurat, setSelectedSurat] = useState<SuratPBB | null>(null)
  const [searchKetuaRT, setSearchKetuaRT] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<SuratPBB>>({})
  const [selectedKetuaRTForEdit, setSelectedKetuaRTForEdit] = useState<PerangkatDesa | null>(null)
  const [editKetuaRTForm, setEditKetuaRTForm] = useState({
    nama_lengkap: "",
    password: "",
  })
  const [suratForm, setSuratForm] = useState({
    nomor_objek_pajak: "",
    nama_wajib_pajak: "",
    alamat_wajib_pajak: "",
    alamat_objek_pajak: "",
    luas_tanah: "",
    luas_bangunan: "",
    jumlah_pajak_terhutang: "",
    tahun_pajak: "2025",
    status_pembayaran: "belum_bayar",
    dusun_id: dusunId?.toString() || "",
  })
  const [ketuaRTStats, setKetuaRTStats] = useState<{ totalSuratByRT: number }>({ totalSuratByRT: 0 })
  const [tokenKetuaRT, setTokenKetuaRT] = useState<string | null>(null)
  const [searchSuratPBB, setSearchSuratPBB] = useState("")
  const [filterStatusSurat, setFilterStatusSurat] = useState("semua")
  
  // Cache flag to prevent unnecessary fetches
  const [hasDataFetched, setHasDataFetched] = useState(false)

  const fetchActiveYear = useCallback(async () => {
    try {
      const response = await fetch("/api/statistik/active-year", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setActiveYear(data.active_year)
      }
    } catch (error) {
      console.error("Error fetching active year:", error)
    }
  }, [])

  useEffect(() => {
    const loadDusunInfo = async () => {
      if (!user?.id) return

      await fetchActiveYear()

      try {
        const response = await fetch(`/api/perangkat-desa/${user.id}`, {
          credentials: "include",
        })
        const perangkat = await response.json()

        if (response.ok && perangkat.id_dusun) {
          setDusunId(perangkat.id_dusun)
          // Nama dusun akan diambil dari statistik
        }
      } catch (err) {
        console.error(err)
      }
    }

    loadDusunInfo()
  }, [user, fetchActiveYear])

  const loadData = async () => {
    if (!dusunId) return

    try {
      // Load statistik
      const statistikResponse = await fetch(`/api/statistik/dusun/${dusunId}`, {
        credentials: "include",
      })
      const statistikData = await statistikResponse.json()
      if (statistikResponse.ok) {
        setStatistik(statistikData)
        // Set dusun info dari statistik
        if (statistikData.dusun) {
          setDusunInfo({
            id: statistikData.dusun.id,
            nama_dusun: statistikData.dusun.nama_dusun
          })
        }
      }

      // Load ketua RT with stats
      const perangkatResponse = await fetch(`/api/perangkat-desa?dusun_id=${dusunId}`, {
        credentials: "include",
      })
      const perangkatData = await perangkatResponse.json()
      
      if (perangkatResponse.ok) {
        const ketuaRTList = perangkatData.filter((p: PerangkatDesa) => p.jabatan === 'ketua_rt')
        
        // Get surat PBB created by ketua RT
        const suratResponse = await fetch(`/api/surat-pbb?dusun_id=${dusunId}`, {
          credentials: "include",
        })
        const suratData = await suratResponse.json()
        
        if (suratResponse.ok) {
          // Calculate total surat by all RT
          const totalSuratByRT = suratData.surat_pbb?.filter((surat: SuratPBB) => 
            ketuaRTList.some((rt: PerangkatDesa) => rt.id === surat.id_pengguna)
          ).length || 0
          
          // Calculate per RT stats
          const ketuaRTWithStats = ketuaRTList.map((rt: PerangkatDesa) => ({
            ...rt,
            jumlahSurat: suratData.surat_pbb?.filter((surat: SuratPBB) => surat.id_pengguna === rt.id).length || 0
          }))
          
          setKetuaRT(ketuaRTWithStats)
          setKetuaRTStats({ totalSuratByRT })
        }
      }

      // Load token ketua RT
      const tokenResponse = await fetch("/api/dusun/my/tokens", {
        credentials: "include",
      })
      const tokenData = await tokenResponse.json()
      if (tokenResponse.ok) {
        setTokenKetuaRT(tokenData.tokenKetuaRT)
      } else {
        console.error("Failed to fetch token:", tokenData)
      }
      
      setHasDataFetched(true)
    } catch (err) {
      console.error("Error loading data:", err)
    }
  }

  // Fetch data only on first load
  useEffect(() => {
    if (dusunId && !hasDataFetched) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dusunId, hasDataFetched])

  useEffect(() => {
    setSuratForm((prev) => ({
      ...prev,
      dusun_id: dusunId?.toString() || "",
    }))
  }, [dusunId])

  const handleSuratClick = (surat: SuratPBB) => {
    setSelectedSurat(surat)
  }

  const handleEditKetuaRT = (ketua: PerangkatDesa) => {
    setSelectedKetuaRTForEdit(ketua)
    setEditKetuaRTForm({
      nama_lengkap: ketua.nama_lengkap,
      password: "",
    })
    setActiveTab("edit-ketua-rt")
  }

  const handleSaveEditKetuaRT = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedKetuaRTForEdit) return

    try {
      const updateData: {
        nama_lengkap: string
        jabatan: string
        id_dusun: number
        password?: string
      } = {
        nama_lengkap: editKetuaRTForm.nama_lengkap,
        jabatan: "ketua_rt",
        id_dusun: dusunId!,
      }

      if (editKetuaRTForm.password.trim()) {
        updateData.password = editKetuaRTForm.password
      }

      const response = await fetch(`/api/perangkat-desa/${selectedKetuaRTForEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        setSelectedKetuaRTForEdit(null)
        setEditKetuaRTForm({
          nama_lengkap: "",
          password: "",
        })
        setActiveTab("ketua-rt")

        const response = await fetch(`/api/perangkat-desa?dusun_id=${dusunId}`, {
          credentials: "include",
        })
        const result = await response.json()
        if (response.ok) {
          const ketuaList = result.filter((p: PerangkatDesa) => p.jabatan === "ketua_rt")
          
          // Reload stats after update
          const suratResponse = await fetch(`/api/surat-pbb?dusun_id=${dusunId}`, {
            credentials: "include",
          })
          const suratData = await suratResponse.json()
          
          if (suratResponse.ok) {
            const ketuaRTWithStats = ketuaList.map((rt: PerangkatDesa) => ({
              ...rt,
              jumlahSurat: suratData.surat_pbb?.filter((surat: SuratPBB) => surat.id_pengguna === rt.id).length || 0
            }))
            setKetuaRT(ketuaRTWithStats)
          }
        }

        Swal.fire({
          title: "Berhasil!",
          text: "Data ketua RT berhasil diperbarui!",
          icon: "success",
          confirmButtonText: "OK",
        })
      } else {
        const error = await response.json()
        Swal.fire({
          title: "Error",
          text: error.message || "Gagal memperbarui data ketua RT",
          icon: "error",
          confirmButtonText: "OK",
        })
      }
    } catch (err) {
      console.error(err)
      Swal.fire({
        title: "Error",
        text: "Terjadi kesalahan",
        icon: "error",
        confirmButtonText: "OK",
      })
    }
  }

  const handleCreateSurat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dusunId) return

    try {
      const response = await fetch("/api/surat-pbb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          nomor_objek_pajak: suratForm.nomor_objek_pajak,
          nama_wajib_pajak: suratForm.nama_wajib_pajak,
          alamat_wajib_pajak: suratForm.alamat_wajib_pajak,
          alamat_objek_pajak: suratForm.alamat_objek_pajak,
          luas_tanah: Number(suratForm.luas_tanah),
          luas_bangunan: Number(suratForm.luas_bangunan),
          jumlah_pajak_terhutang: Number(suratForm.jumlah_pajak_terhutang),
          tahun_pajak: Number(suratForm.tahun_pajak),
          status_pembayaran: suratForm.status_pembayaran,
          id_dusun: dusunId,
        }),
      })
      if (response.ok) {
        setActiveTab("laporan")
        setSuratForm({
          nomor_objek_pajak: "",
          nama_wajib_pajak: "",
          alamat_wajib_pajak: "",
          alamat_objek_pajak: "",
          luas_tanah: "",
          luas_bangunan: "",
          jumlah_pajak_terhutang: "",
          tahun_pajak: "2025",
          status_pembayaran: "belum_bayar",
          dusun_id: dusunId?.toString() || "",
        })

        if (dusunId) {
          const statistikResponse = await fetch(`/api/statistik/dusun/${dusunId}`, {
            credentials: "include",
          })
          const statistikData = await statistikResponse.json()
          if (statistikResponse.ok) {
            setStatistik(statistikData)
          }
        }

        Swal.fire({
          title: "Berhasil!",
          text: "Surat PBB berhasil ditambahkan!",
          icon: "success",
          confirmButtonText: "OK",
        })
      } else {
        const error = await response.json()
        Swal.fire({
          title: "Error",
          text: error.message || "Gagal menambahkan surat PBB",
          icon: "error",
          confirmButtonText: "OK",
        })
      }
    } catch (err) {
      console.error(err)
      Swal.fire({
        title: "Error",
        text: "Terjadi kesalahan",
        icon: "error",
        confirmButtonText: "OK",
      })
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedSurat) return

    // Prevent status change if already "sudah_lunas" for non-admin users
    if (selectedSurat.status_pembayaran === "sudah_lunas" && user?.roles !== "admin") {
      Swal.fire({
        title: "Tidak Dapat Mengubah!",
        text: "Status sudah lunas dan hanya dapat diubah oleh admin",
        icon: "warning",
        timer: 3000,
        showConfirmButton: false,
      })
      return
    }

    try {
      const response = await fetch(`/api/surat-pbb/${selectedSurat.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          status_pembayaran: newStatus,
          tahun_pajak: selectedSurat.tahun_pajak || activeYear
        }),
      })

      if (response.ok) {
        setSelectedSurat({ ...selectedSurat, status_pembayaran: newStatus as SuratPBB["status_pembayaran"] })
        setEditForm({ ...editForm, status_pembayaran: newStatus as SuratPBB["status_pembayaran"] })
        
        Swal.fire({
          title: "Berhasil!",
          text: "Status pembayaran berhasil diperbarui",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        })
      } else {
        try {
          const error = await response.json()
          Swal.fire({
            title: "Error",
            text: error.error || "Gagal memperbarui status pembayaran",
            icon: "error",
            confirmButtonText: "OK",
          })
        } catch {
          Swal.fire({
            title: "Error",
            text: "Gagal memperbarui status pembayaran",
            icon: "error",
            confirmButtonText: "OK",
          })
        }
      }
    } catch (err) {
      console.error("Error updating status:", err)
      Swal.fire({
        title: "Error",
        text: "Terjadi kesalahan",
        icon: "error",
        confirmButtonText: "OK",
      })
    }
  }

  const handleEditFormChange = (field: string, value: string | number) => {
    setEditForm({ ...editForm, [field]: value })
  }

  const handleSaveEdit = async () => {
    if (!selectedSurat) return

    try {
      const response = await fetch(`/api/surat-pbb/${selectedSurat.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        setSelectedSurat(editForm as SuratPBB)
        setIsEditing(false)
        Swal.fire({
          title: "Berhasil!",
          text: "Surat PBB berhasil diperbarui",
          icon: "success",
          confirmButtonText: "OK",
        })
      } else {
        const error = await response.json()
        Swal.fire({
          title: "Error",
          text: error.error || "Gagal memperbarui surat PBB",
          icon: "error",
          confirmButtonText: "OK",
        })
      }
    } catch (err) {
      console.error("Error updating surat:", err)
      Swal.fire({
        title: "Error",
        text: "Terjadi kesalahan",
        icon: "error",
        confirmButtonText: "OK",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditForm(selectedSurat || {})
    setIsEditing(false)
  }

  return (
    <div className="container-wide">
      <div className="dashboard-header">
        <div>
          <h2>Dashboard Pengelolaan PBB</h2>
          <p className="text-muted mb-0 small">{user?.nama_lengkap} (Kepala Dusun)</p>
        </div>
        <div className="d-flex align-items-center gap-3" style={{ padding: "0.25rem 0" }}>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">Tahun Aktif: <strong>{activeYear}</strong></span>
          </div>
        </div>
      </div>

      <ul className="nav nav-tabs mb-3" style={{ backgroundColor: "#fff", padding: "0.5rem 1rem", borderRadius: "4px", border: "1px solid #dee2e6" }}>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "laporan" ? "active" : ""}`} onClick={() => setActiveTab("laporan")} style={{ border: "none", fontSize: "0.9rem" }}>
            <i className="bi bi-bar-chart me-2"></i>Surat PBB
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "ketua-rt" ? "active" : ""}`} onClick={() => setActiveTab("ketua-rt")} style={{ border: "none", fontSize: "0.9rem" }}>
            <i className="bi bi-people me-2"></i>Daftar Ketua RT
          </button>
        </li>
      </ul>

      {activeTab === "ketua-rt" && (
        <>
          <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="bi bi-key me-2"></i>Token Pendaftaran Ketua RT
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <label className="form-label">Token untuk Pendaftaran Ketua RT di {dusunInfo?.nama_dusun || "Dusun Ini"}</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={tokenKetuaRT || "Memuat..."}
                      readOnly
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => {
                        if (tokenKetuaRT) {
                          navigator.clipboard.writeText(tokenKetuaRT)
                          Swal.fire({
                            title: "Berhasil!",
                            text: "Token berhasil disalin ke clipboard",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false,
                          })
                        }
                      }}
                      disabled={!tokenKetuaRT}
                    >
                      <i className="bi bi-clipboard"></i>
                    </button>
                  </div>
                  <small className="text-muted">Berikan token ini kepada calon ketua RT untuk mendaftar ke dusun ini</small>
                </div>
              </div>
            </div>
          </div>
          <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="bi bi-people me-2"></i>Daftar Ketua RT di {dusunInfo?.nama_dusun || "Dusun Ini"}
              </h6>
            </div>
          </div>
          <DaftarKetuaRT ketuaRT={ketuaRT} searchTerm={searchKetuaRT} onSearchChange={setSearchKetuaRT} onEdit={handleEditKetuaRT} showDeleteButton={false} onRefresh={loadData} />
        </>
      )}

      {activeTab === "laporan" && statistik && (
        <div>
          <StatistikCards
            data={{
              totalPajakTerhutang: statistik.total_pajak_terhutang,
              totalPajakDibayar: statistik.total_pajak_dibayar,
              totalSurat: statistik.total_surat,
              totalSuratDibayar: statistik.total_surat_dibayar,
            totalSuratBelumBayar: statistik.total_surat_belum_bayar,
            persentasePembayaran: statistik.persentase_pembayaran,
            totalSuratByRT: ketuaRTStats.totalSuratByRT,
          }}
        />          {!selectedSurat ? (
            <>
              <div className="card mb-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">
                    <i className="bi bi-file-text me-2"></i>Daftar Surat PBB
                  </h6>
                  <button className="btn btn-sm btn-primary" onClick={() => setActiveTab("tambah-surat-pbb")}>
                    <i className="bi bi-plus-circle me-1"></i>Tambah Surat PBB
                  </button>
                </div>
              </div>
              <TabelSuratPBB
                suratPBB={statistik?.surat_pbb || []}
                searchTerm={searchSuratPBB}
                onSearchChange={setSearchSuratPBB}
                onSuratClick={(surat) => handleSuratClick(surat)}
                onRefresh={loadData}
                filterStatus={filterStatusSurat}
                onFilterStatusChange={setFilterStatusSurat}
              />
            </>
          ) : (
            <DetailSuratPBB
              surat={selectedSurat}
              isEditing={isEditing}
              editForm={editForm}
              onEditFormChange={handleEditFormChange}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onStatusChange={handleStatusChange}
              onBack={() => setSelectedSurat(null)}
              onStartEdit={() => {
                setIsEditing(true)
                setEditForm(selectedSurat)
              }}
              showAdminActions={user?.roles === "admin" || user?.roles === "kepala_dusun"}
              isPerangkatDesa={user?.roles === "kepala_dusun" || user?.roles === "ketua_rt"}
            />
          )}
        </div>
      )}

      {activeTab === "tambah-surat-pbb" && (
        <FormTambahSuratPBB
          suratForm={suratForm}
          onFormChange={(field, value) => setSuratForm({ ...suratForm, [field]: value })}
          onSubmit={handleCreateSurat}
          onCancel={() => setActiveTab("laporan")}
          isPerangkatDesa={true}
        />
      )}

      {activeTab === "edit-ketua-rt" && selectedKetuaRTForEdit && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Edit Ketua RT</h6>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab("ketua-rt")}>
              <i className="bi bi-arrow-left me-1"></i>
              Kembali ke Daftar
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSaveEditKetuaRT}>
              <div className="row g-3">
                <div className="col-md-12">
                  <label className="form-label">
                    Nama Lengkap <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editKetuaRTForm.nama_lengkap}
                    onChange={(e) => setEditKetuaRTForm({ ...editKetuaRTForm, nama_lengkap: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label">Password Baru (kosongkan jika tidak ingin mengubah)</label>
                  <input
                    type="password"
                    className="form-control"
                    value={editKetuaRTForm.password}
                    onChange={(e) => setEditKetuaRTForm({ ...editKetuaRTForm, password: e.target.value })}
                  />
                </div>
              </div>
              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-save me-1"></i>Simpan Perubahan
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab("ketua-rt")}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
