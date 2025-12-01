import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { SuratPBB } from "../../types"
import { StatistikCards } from "../../components/pengelolaan-pbb/StatistikCards"
import { FormTambahSuratPBB } from "../../components/pengelolaan-pbb/FormTambahSuratPBB"
import { TabelSuratPBB } from "../../components/pengelolaan-pbb/TabelSuratPBB"
import { DetailSuratPBB } from "../../components/pengelolaan-pbb/DetailSuratPBB"
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

export function DashboardKetuaRT() {
  const { user, apiRequest } = useAuth()
  const [suratPBB, setSuratPBB] = useState<SuratPBB[]>([])
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear())
  const [dusunId, setDusunId] = useState<number | null>(null)
  const [statistik, setStatistik] = useState<DusunStatistik | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedSurat, setSelectedSurat] = useState<SuratPBB | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatusSurat, setFilterStatusSurat] = useState("semua")
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<SuratPBB>>({})
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
  
  // Cache flag to prevent unnecessary fetches
  const [hasStatistikFetched, setHasStatistikFetched] = useState(false)

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
        }
      } catch (err) {
        console.error(err)
      }
    }

    loadDusunInfo()
  }, [user, fetchActiveYear])

  const loadStatistik = async () => {
    if (!dusunId) return

    try {
      const response = await fetch(`/api/statistik/dusun/${dusunId}`, {
        credentials: "include",
      })
      const data = await response.json()
      if (response.ok) {
        setStatistik(data)
        setSuratPBB(data.surat_pbb || [])
        setHasStatistikFetched(true)
      }
    } catch (err) {
      console.error("Error loading statistik:", err)
    }
  }

  // Fetch data only on first load
  useEffect(() => {
    if (dusunId && !hasStatistikFetched) {
      loadStatistik()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dusunId, hasStatistikFetched])

  useEffect(() => {
    setSuratForm((prev) => ({
      ...prev,
      dusun_id: dusunId?.toString() || "",
    }))
  }, [dusunId])

  const handleSuratClick = (surat: SuratPBB) => {
    setSelectedSurat(surat)
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
        setShowForm(false)
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

        // Reload statistik after creating surat
        const statistikResponse = await fetch(`/api/statistik/dusun/${dusunId}`, {
          credentials: "include",
        })
        const statistikData = await statistikResponse.json()
        if (statistikResponse.ok) {
          setStatistik(statistikData)
          setSuratPBB(statistikData.surat_pbb || [])
        }

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Surat PBB berhasil ditambahkan!",
          timer: 2000,
          showConfirmButton: false,
        })
      } else {
        const error = await response.json()
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: error.message || "Gagal menambahkan surat PBB",
        })
      }
    } catch (err) {
      console.error(err)
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan!",
        text: "Terjadi kesalahan saat menambahkan surat PBB",
      })
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedSurat) return

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

        // Reload statistik after status change
        if (dusunId) {
          const statistikResponse = await fetch(`/api/statistik/dusun/${dusunId}`, {
            credentials: "include",
          })
          const statistikData = await statistikResponse.json()
          if (statistikResponse.ok) {
            setStatistik(statistikData)
            setSuratPBB(statistikData.surat_pbb || [])
          }
        }
      } else {
        try {
          const error = await response.json()
          Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: error.error || "Gagal memperbarui status pembayaran",
          })
        } catch {
          Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: "Gagal memperbarui status pembayaran",
          })
        }
      }
    } catch (err) {
      console.error("Error updating status:", err)
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan!",
        text: "Terjadi kesalahan saat memperbarui status pembayaran",
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

        // Reload statistik after edit
        if (dusunId) {
          const statistikResponse = await fetch(`/api/statistik/dusun/${dusunId}`, {
            credentials: "include",
          })
          const statistikData = await statistikResponse.json()
          if (statistikResponse.ok) {
            setStatistik(statistikData)
            setSuratPBB(statistikData.surat_pbb || [])
          }
        }

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Surat PBB berhasil diperbarui",
          timer: 2000,
          showConfirmButton: false,
        })
      } else {
        const error = await response.json()
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: error.error || "Gagal memperbarui surat PBB",
        })
      }
    } catch (err) {
      console.error("Error updating surat:", err)
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan!",
        text: "Terjadi kesalahan saat memperbarui surat PBB",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditForm(selectedSurat || {})
    setIsEditing(false)
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Dashboard Ketua RT</h2>
        </div>
        <div className="text-end">
          <div className="badge bg-primary fs-6">
            <i className="bi bi-calendar me-1"></i>Tahun {activeYear}
          </div>
          <div className="small text-muted mt-1">Data yang ditampilkan untuk tahun {activeYear}</div>
        </div>
      </div>

      <>
        {statistik && (
          <StatistikCards
            data={{
              totalPajakTerhutang: statistik.total_pajak_terhutang,
              totalPajakDibayar: statistik.total_pajak_dibayar,
              totalSurat: statistik.total_surat,
              totalSuratDibayar: statistik.total_surat_dibayar,
              totalSuratBelumBayar: statistik.total_surat_belum_bayar,
              persentasePembayaran: statistik.persentase_pembayaran,
            }}
          />
        )}

        {!showForm && !selectedSurat ? (
          <>
            <div className="card mb-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="bi bi-file-text me-2"></i>Daftar Surat PBB
                </h6>
                <button className="btn btn-sm btn-primary" onClick={() => setShowForm(true)}>
                  <i className="bi bi-plus-circle me-1"></i>Tambah Surat PBB
                </button>
              </div>
            </div>
            <TabelSuratPBB suratPBB={suratPBB} searchTerm={searchTerm} onSearchChange={setSearchTerm} onSuratClick={handleSuratClick} onRefresh={loadStatistik} filterStatus={filterStatusSurat} onFilterStatusChange={setFilterStatusSurat} />
          </>
        ) : showForm ? (
          <FormTambahSuratPBB
            suratForm={suratForm}
            onFormChange={(field, value) => setSuratForm({ ...suratForm, [field]: value })}
            onSubmit={handleCreateSurat}
            onCancel={() => setShowForm(false)}
            isPerangkatDesa={true}
          />
        ) : selectedSurat ? (
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
            showAdminActions={user?.roles === "admin" || user?.roles === "kepala_dusun" || user?.roles === "ketua_rt"}
            isPerangkatDesa={user?.roles === "kepala_dusun" || user?.roles === "ketua_rt"}
          />
        ) : null}
      </>

    </div>
  )
}
