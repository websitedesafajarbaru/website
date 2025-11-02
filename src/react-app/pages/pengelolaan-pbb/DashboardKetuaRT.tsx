import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { SuratPBB } from "../../types"
import { StatistikCards } from "../../components/pengelolaan-pbb/StatistikCards"
import { FormTambahSuratPBB } from "../../components/pengelolaan-pbb/FormTambahSuratPBB"
import { TabelSuratPBB } from "../../components/pengelolaan-pbb/TabelSuratPBB"
import { DetailSuratPBB } from "../../components/pengelolaan-pbb/DetailSuratPBB"

export function DashboardKetuaRT() {
  const { token, user } = useAuth()
  const [suratPBB, setSuratPBB] = useState<SuratPBB[]>([])
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear())
  const [dusunId, setDusunId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedSurat, setSelectedSurat] = useState<SuratPBB | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showStatistics, setShowStatistics] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<SuratPBB>>({})
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

  const fetchSuratPBB = useCallback(async () => {
    try {
      const response = await fetch("/api/surat-pbb", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (response.ok) {
        setSuratPBB(result.surat_pbb || result)
        if (result.active_year) {
          setActiveYear(result.active_year)
        }
      }
    } catch (err) {
      console.error(err)
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
          await fetchSuratPBB() // Fetch surat after dusunId is set
        }
      } catch (err) {
        console.error(err)
      }
    }

    loadDusunInfo()
  }, [user, token, fetchActiveYear, fetchSuratPBB])

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
        setShowForm(false)
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
        fetchSuratPBB()
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

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Apakah Anda yakin ingin menghapus surat PBB ini? Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    })

    if (!result.isConfirmed || !selectedSurat || !token) return

    try {
      const response = await fetch(`/api/surat-pbb/${selectedSurat.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Surat PBB berhasil dihapus",
          timer: 2000,
          showConfirmButton: false,
        })
        setSelectedSurat(null)
      } else {
        const error = await response.json()
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: error.error || "Gagal menghapus surat PBB",
        })
      }
    } catch (err) {
      console.error("Error deleting surat:", err)
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan!",
        text: "Terjadi kesalahan saat menghapus surat PBB",
      })
    }
  }

  const totalPajakTerhutang = suratPBB.reduce((sum, s) => sum + Number(s.jumlah_pajak_terhutang), 0)
  const totalPajakDibayar = suratPBB
    .filter((s) => s.status_pembayaran === "bayar_sendiri_di_bank" || s.status_pembayaran === "bayar_lewat_perangkat_desa")
    .reduce((sum, s) => sum + Number(s.jumlah_pajak_terhutang), 0)
  const totalSurat = suratPBB.length
  const totalSuratDibayar = suratPBB.filter((s) => s.status_pembayaran === "bayar_sendiri_di_bank" || s.status_pembayaran === "bayar_lewat_perangkat_desa").length
  const totalSuratBelumBayar = totalSurat - totalSuratDibayar
  const persentasePembayaran = totalSurat > 0 ? (totalSuratDibayar / totalSurat) * 100 : 0

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

      <StatistikCards
        data={{
          totalPajakTerhutang,
          totalPajakDibayar,
          totalSurat,
          totalSuratDibayar,
          totalSuratBelumBayar,
          persentasePembayaran,
        }}
        showStatistics={showStatistics}
        onToggle={() => setShowStatistics(!showStatistics)}
      />

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
          <TabelSuratPBB suratPBB={suratPBB} searchTerm={searchTerm} onSearchChange={setSearchTerm} onSuratClick={handleSuratClick} />
        </>
      ) : showForm ? (
        <FormTambahSuratPBB
          suratForm={suratForm}
          onFormChange={(field, value) => setSuratForm({ ...suratForm, [field]: value })}
          onSubmit={handleCreateSurat}
          onCancel={() => setShowForm(false)}
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
          onDelete={handleDelete}
          onBack={() => setSelectedSurat(null)}
          onStartEdit={() => {
            setIsEditing(true)
            setEditForm(selectedSurat)
          }}
          showAdminActions={user?.roles === "admin" || user?.roles === "kepala_dusun" || user?.roles === "ketua_rt"}
        />
      ) : null}
    </div>
  )
}
