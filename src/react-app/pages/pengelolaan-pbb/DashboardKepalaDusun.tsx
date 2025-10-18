import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { SuratPBB } from "../../types"
import { StatistikCards } from "../../components/pengelolaan-pbb/StatistikCards"
import { FormTambahSuratPBB } from "../../components/pengelolaan-pbb/FormTambahSuratPBB"
import { TabelSuratPBB } from "../../components/pengelolaan-pbb/TabelSuratPBB"
import { DetailSuratPBB } from "../../components/pengelolaan-pbb/DetailSuratPBB"
import { DaftarKetuaRT } from "../../components/pengelolaan-pbb/DaftarKetuaRT"
import { FormTambahKetuaRT } from "../../components/pengelolaan-pbb/FormTambahKetuaRT"

interface DusunStatistik {
  dusun: {
    id: number
    nama_dusun: string
    status_data_pbb: string
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
  username: string
  jabatan: string
  nama_dusun?: string
}

interface DusunInfo {
  id: number
  nama_dusun: string
  status_data_pbb: string
}

export function DashboardKepalaDusun() {
  const { token, user } = useAuth()
  const [activeTab, setActiveTab] = useState<"ketua-rt" | "laporan" | "tambah-ketua-rt" | "tambah-surat-pbb" | "edit-ketua-rt">("ketua-rt")
  const [ketuaRT, setKetuaRT] = useState<PerangkatDesa[]>([])
  const [dusunInfo, setDusunInfo] = useState<DusunInfo | null>(null)
  const [dusunId, setDusunId] = useState<number | null>(null)
  const [statistik, setStatistik] = useState<DusunStatistik | null>(null)
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear())
  const [selectedSurat, setSelectedSurat] = useState<SuratPBB | null>(null)
  const [searchKetuaRT, setSearchKetuaRT] = useState("")
  const [searchSuratPBB, setSearchSuratPBB] = useState("")
  const [showStatistics, setShowStatistics] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<SuratPBB>>({})
  const [ketuaRTForm, setKetuaRTForm] = useState({
    nama_lengkap: "",
    username: "",
    password: "",
  })
  const [suratForm, setSuratForm] = useState({
    nomor_objek_pajak: "",
    nama_wajib_pajak: "",
    alamat_wajib_pajak: "",
    alamat_objek_pajak: "",
    luas_tanah: "",
    luas_bangunan: "",
    nilai_jual_objek_pajak: "",
    jumlah_pajak_terhutang: "",
    tahun_pajak: activeYear.toString(),
    status_pembayaran: "belum_bayar",
    dusun_id: dusunId?.toString() || "",
  })
  const [selectedKetuaRT, setSelectedKetuaRT] = useState<PerangkatDesa | null>(null)
  const [editKetuaRTForm, setEditKetuaRTForm] = useState({
    nama_lengkap: "",
    username: "",
    password: "",
  })

  const fetchActiveYear = useCallback(async () => {
    try {
      const response = await fetch("/api/statistik/active-year", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setActiveYear(data.active_year)
      }
    } catch (error) {
      console.error("Error fetching active year:", error)
    }
  }, [token])

  useEffect(() => {
    const loadDusunInfo = async () => {
      if (!user?.id || !token) return

      await fetchActiveYear()

      try {
        const response = await fetch(`/api/perangkat-desa/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const perangkat = await response.json()

        if (response.ok && perangkat.id_dusun) {
          setDusunId(perangkat.id_dusun)
          const dusunResponse = await fetch(`/api/dusun/${perangkat.id_dusun}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const dusun = await dusunResponse.json()
          setDusunInfo(dusun)
        }
      } catch (err) {
        console.error(err)
      }
    }

    loadDusunInfo()
  }, [user, token, fetchActiveYear])

  useEffect(() => {
    const loadKetuaRT = async () => {
      if (!dusunId || !token) return

      try {
        const response = await fetch(`/api/perangkat-desa?dusun_id=${dusunId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await response.json()
        if (response.ok) {
          const ketuaList = result.filter((p: PerangkatDesa) => p.jabatan === "ketua_rt")
          setKetuaRT(ketuaList)
        }
      } catch (err) {
        console.error("Error loading ketua RT:", err)
      }
    }

    loadKetuaRT()
  }, [dusunId, token])

  useEffect(() => {
    const loadStatistik = async () => {
      if (!dusunId || !token) return

      try {
        const response = await fetch(`/api/statistik/dusun/${dusunId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (response.ok) {
          setStatistik(data)
        }
      } catch (err) {
        console.error("Error loading statistik:", err)
      }
    }

    loadStatistik()
  }, [dusunId, token])

  useEffect(() => {
    setSuratForm((prev) => ({
      ...prev,
      dusun_id: dusunId?.toString() || "",
    }))
  }, [dusunId])

  const handleSuratClick = (surat: SuratPBB) => {
    setSelectedSurat(surat)
  }

  const handleCreateKetuaRT = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dusunId) return

    try {
      const response = await fetch("/api/perangkat-desa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nama_lengkap: ketuaRTForm.nama_lengkap,
          username: ketuaRTForm.username,
          password: ketuaRTForm.password,
          jabatan: "ketua_rt",
          id_dusun: dusunId,
        }),
      })
      if (response.ok) {
        setActiveTab("ketua-rt")
        setKetuaRTForm({
          nama_lengkap: "",
          username: "",
          password: "",
        })

        const response = await fetch(`/api/perangkat-desa?dusun_id=${dusunId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await response.json()
        if (response.ok) {
          const ketuaList = result.filter((p: PerangkatDesa) => p.jabatan === "ketua_rt")
          setKetuaRT(ketuaList)
        }
        Swal.fire({
          title: "Berhasil!",
          text: "Ketua RT berhasil ditambahkan!",
          icon: "success",
          confirmButtonText: "OK",
        })
      } else {
        const error = await response.json()
        Swal.fire({
          title: "Error",
          text: error.message || "Gagal menambahkan ketua RT",
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

  const handleEditKetuaRT = (ketua: PerangkatDesa) => {
    setSelectedKetuaRT(ketua)
    setEditKetuaRTForm({
      nama_lengkap: ketua.nama_lengkap,
      username: ketua.username,
      password: "",
    })
    setActiveTab("edit-ketua-rt")
  }

  const handleSaveEditKetuaRT = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedKetuaRT || !token) return

    try {
      const updateData: {
        nama_lengkap: string
        username: string
        jabatan: string
        id_dusun: number
        password?: string
      } = {
        nama_lengkap: editKetuaRTForm.nama_lengkap,
        username: editKetuaRTForm.username,
        jabatan: "ketua_rt",
        id_dusun: dusunId!,
      }

      if (editKetuaRTForm.password.trim()) {
        updateData.password = editKetuaRTForm.password
      }

      const response = await fetch(`/api/perangkat-desa/${selectedKetuaRT.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        setSelectedKetuaRT(null)
        setActiveTab("ketua-rt")
        setEditKetuaRTForm({
          nama_lengkap: "",
          username: "",
          password: "",
        })

        // Reload ketua RT
        const response = await fetch(`/api/perangkat-desa?dusun_id=${dusunId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await response.json()
        if (response.ok) {
          const ketuaList = result.filter((p: PerangkatDesa) => p.jabatan === "ketua_rt")
          setKetuaRT(ketuaList)
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

  const handleDeleteKetuaRT = async (ketua: PerangkatDesa) => {
    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: `Apakah Anda yakin ingin menghapus ketua RT "${ketua.nama_lengkap}"? Tindakan ini tidak dapat dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    })

    if (!result.isConfirmed) return

    try {
      const response = await fetch(`/api/perangkat-desa/${ketua.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        // Reload ketua RT
        const response = await fetch(`/api/perangkat-desa?dusun_id=${dusunId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await response.json()
        if (response.ok) {
          const ketuaList = result.filter((p: PerangkatDesa) => p.jabatan === "ketua_rt")
          setKetuaRT(ketuaList)
        }

        Swal.fire({
          title: "Berhasil!",
          text: "Ketua RT berhasil dihapus!",
          icon: "success",
          confirmButtonText: "OK",
        })
      } else {
        const error = await response.json()
        Swal.fire({
          title: "Error",
          text: error.message || "Gagal menghapus ketua RT",
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nomor_objek_pajak: suratForm.nomor_objek_pajak,
          nama_wajib_pajak: suratForm.nama_wajib_pajak,
          alamat_wajib_pajak: suratForm.alamat_wajib_pajak,
          alamat_objek_pajak: suratForm.alamat_objek_pajak,
          luas_tanah: Number(suratForm.luas_tanah),
          luas_bangunan: Number(suratForm.luas_bangunan),
          nilai_jual_objek_pajak: Number(suratForm.nilai_jual_objek_pajak),
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
          nilai_jual_objek_pajak: "",
          jumlah_pajak_terhutang: "",
          tahun_pajak: activeYear.toString(),
          status_pembayaran: "belum_bayar",
          dusun_id: dusunId?.toString() || "",
        })

        // Reload statistik after adding surat PBB
        if (dusunId) {
          const statistikResponse = await fetch(`/api/statistik/dusun/${dusunId}`, {
            headers: { Authorization: `Bearer ${token}` },
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
    if (!selectedSurat || !token) return

    try {
      const response = await fetch(`/api/surat-pbb/${selectedSurat.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status_pembayaran: newStatus }),
      })

      if (response.ok) {
        setSelectedSurat({ ...selectedSurat, status_pembayaran: newStatus as SuratPBB["status_pembayaran"] })
        setEditForm({ ...editForm, status_pembayaran: newStatus as SuratPBB["status_pembayaran"] })
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
    if (!selectedSurat || !token) return

    try {
      const response = await fetch(`/api/surat-pbb/${selectedSurat.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

  const handleDelete = async () => {
    if (!selectedSurat || !token) return

    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Apakah Anda yakin ingin menghapus surat PBB ini? Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    })

    if (!result.isConfirmed) return

    try {
      const response = await fetch(`/api/surat-pbb/${selectedSurat.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        Swal.fire({
          title: "Berhasil!",
          text: "Surat PBB berhasil dihapus",
          icon: "success",
          confirmButtonText: "OK",
        })
        setSelectedSurat(null)
        setActiveTab("laporan")
      } else {
        const error = await response.json()
        Swal.fire({
          title: "Error",
          text: error.error || "Gagal menghapus surat PBB",
          icon: "error",
          confirmButtonText: "OK",
        })
      }
    } catch (err) {
      console.error("Error deleting surat:", err)
      Swal.fire({
        title: "Error",
        text: "Terjadi kesalahan",
        icon: "error",
        confirmButtonText: "OK",
      })
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Dashboard Kepala Dusun</h2>
        </div>
        <div className="text-end">
          <div className="badge bg-primary fs-6">
            <i className="bi bi-calendar me-1"></i>Tahun {activeYear}
          </div>
          <div className="small text-muted mt-1">Data yang ditampilkan untuk tahun {activeYear}</div>
        </div>
      </div>

      <ul className="nav nav-tabs mb-3" style={{ backgroundColor: "#fff", padding: "0.5rem 1rem", borderRadius: "4px", border: "1px solid #dee2e6" }}>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "ketua-rt" ? "active" : ""}`} onClick={() => setActiveTab("ketua-rt")} style={{ border: "none", fontSize: "0.9rem" }}>
            <i className="bi bi-people me-2"></i>Daftar Ketua RT
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "laporan" ? "active" : ""}`} onClick={() => setActiveTab("laporan")} style={{ border: "none", fontSize: "0.9rem" }}>
            <i className="bi bi-bar-chart me-2"></i>Laporan & Surat PBB
          </button>
        </li>
      </ul>

      {activeTab === "ketua-rt" && (
        <>
          <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="bi bi-people me-2"></i>Daftar Ketua RT di {dusunInfo?.nama_dusun || "Dusun Ini"}
              </h6>
              <button className="btn btn-sm btn-primary" onClick={() => setActiveTab("tambah-ketua-rt")}>
                <i className="bi bi-plus-circle me-1"></i>Tambah Ketua RT
              </button>
            </div>
          </div>
          <DaftarKetuaRT ketuaRT={ketuaRT} searchTerm={searchKetuaRT} onSearchChange={setSearchKetuaRT} onEdit={handleEditKetuaRT} onDelete={handleDeleteKetuaRT} />
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
            }}
            showStatistics={showStatistics}
            onToggle={() => setShowStatistics(!showStatistics)}
          />

          {!selectedSurat ? (
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
              onDelete={handleDelete}
              onBack={() => setSelectedSurat(null)}
              onStartEdit={() => {
                setIsEditing(true)
                setEditForm(selectedSurat)
              }}
              showAdminActions={user?.roles === "admin" || user?.roles === "kepala_dusun"}
            />
          )}
        </div>
      )}

      {activeTab === "tambah-ketua-rt" && (
        <FormTambahKetuaRT
          form={ketuaRTForm}
          onFormChange={(field, value) => setKetuaRTForm({ ...ketuaRTForm, [field]: value })}
          onSubmit={handleCreateKetuaRT}
          onCancel={() => setActiveTab("ketua-rt")}
        />
      )}

      {activeTab === "tambah-surat-pbb" && (
        <FormTambahSuratPBB
          suratForm={suratForm}
          onFormChange={(field, value) => setSuratForm({ ...suratForm, [field]: value })}
          onSubmit={handleCreateSurat}
          onCancel={() => setActiveTab("laporan")}
        />
      )}

      {activeTab === "edit-ketua-rt" && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Edit Ketua RT</h6>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab("ketua-rt")}>
              <i className="bi bi-arrow-left me-1"></i>Kembali ke Daftar
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSaveEditKetuaRT}>
              <div className="row g-3">
                <div className="col-md-6">
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
                <div className="col-md-6">
                  <label className="form-label">
                    Username <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editKetuaRTForm.username}
                    onChange={(e) => setEditKetuaRTForm({ ...editKetuaRTForm, username: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
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
