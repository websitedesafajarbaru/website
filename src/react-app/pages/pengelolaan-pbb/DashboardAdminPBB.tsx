import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Dusun, SuratPBB, Laporan } from "../../types"
import { TabelSuratPBB } from "../../components/pengelolaan-pbb/TabelSuratPBB"
import { DetailSuratPBB } from "../../components/pengelolaan-pbb/DetailSuratPBB"
import { DetailDusunLaporan } from "../../components/pengelolaan-pbb/DetailDusunLaporan"
import { FormTambahSuratPBB } from "../../components/pengelolaan-pbb/FormTambahSuratPBB"

interface PerangkatDesa {
  id: string
  nama_lengkap: string
  username: string
  jabatan: string
  id_dusun?: number
  nama_dusun?: string
}

export function DashboardAdminPBB() {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState<
    "dusun" | "surat" | "laporan" | "tambah-dusun" | "tambah-surat" | "detail-dusun" | "detail-perangkat" | "tambah-perangkat" | "detail-laporan-dusun"
  >("dusun")
  const [dusun, setDusun] = useState<Dusun[]>([])
  const [suratPBB, setSuratPBB] = useState<SuratPBB[]>([])
  const [laporan, setLaporan] = useState<Laporan | null>(null)

  const [dusunForm, setDusunForm] = useState({ nama_dusun: "" })
  const [suratForm, setSuratForm] = useState({
    dusun_id: "",
    nomor_objek_pajak: "",
    nama_wajib_pajak: "",
    alamat_wajib_pajak: "",
    alamat_objek_pajak: "",
    luas_tanah: "",
    luas_bangunan: "",
    nilai_jual_objek_pajak: "",
    tahun_pajak: new Date().getFullYear().toString(),
    jumlah_pajak_terhutang: "",
    status_pembayaran: "belum_bayar",
  })

  const [selectedSurat, setSelectedSurat] = useState<SuratPBB | null>(null)
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear())
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [isEditingDusun, setIsEditingDusun] = useState<boolean>(false)
  const [editDusunName, setEditDusunName] = useState<string>("")
  const [isAddingPerangkat, setIsAddingPerangkat] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<SuratPBB>>({})
  const [selectedDusun, setSelectedDusun] = useState<Dusun | null>(null)
  const [selectedPerangkat, setSelectedPerangkat] = useState<PerangkatDesa | null>(null)
  const [perangkatForm, setPerangkatForm] = useState({
    nama_lengkap: "",
    username: "",
    password: "",
    id_dusun: "",
    jabatan: "",
  })

  const [searchDusun, setSearchDusun] = useState("")
  const [searchSuratPBB, setSearchSuratPBB] = useState("")
  const [searchStatistik, setSearchStatistik] = useState("")
  const [searchPerangkat, setSearchPerangkat] = useState("")
  const [showStatistics, setShowStatistics] = useState(false)
  const [dusunTokens, setDusunTokens] = useState<{ tokenKepalaDusun: string; tokenKetuaRT: string } | null>(null)
  const [perangkatDesa, setPerangkatDesa] = useState<PerangkatDesa[]>([])
  const [selectedDusunId, setSelectedDusunId] = useState<string | null>(null)

  const filteredDusun = dusun.filter((d) => {
    const searchLower = searchDusun.toLowerCase()
    return (
      d.nama_dusun.toLowerCase().includes(searchLower) ||
      (d.nama_kepala_dusun || "").toLowerCase().includes(searchLower) ||
      (d.total_perangkat_desa || 0).toString().includes(searchLower)
    )
  })

  const filteredStatistik =
    laporan?.statistik_per_dusun.filter((stat) => {
      const searchLower = searchStatistik.toLowerCase()
      return (
        stat.nama_dusun.toLowerCase().includes(searchLower) ||
        (stat.total_surat || 0).toString().includes(searchLower) ||
        formatStatusDataPBB(stat.status_data_pbb || "belum_lengkap")
          .toLowerCase()
          .includes(searchLower) ||
        (stat.persentase_pembayaran || 0).toString().includes(searchLower)
      )
    }) || []

  const filteredPerangkat: PerangkatDesa[] = perangkatDesa.filter((p) => {
    const searchLower = searchPerangkat.toLowerCase()
    return p.nama_lengkap.toLowerCase().includes(searchLower) || p.username.toLowerCase().includes(searchLower) || p.jabatan.toLowerCase().includes(searchLower)
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

  const setYear = async (year: number) => {
    try {
      const response = await fetch("/api/statistik/active-year", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ year }),
      })
      if (response.ok) {
        setActiveYear(year)
        fetchDusun()
        fetchSuratPBB()
        fetchLaporan()
      } else {
        const error = await response.json()
        Swal.fire({
          title: "Error",
          text: error.message || "Gagal mengatur tahun aktif",
          icon: "error",
          confirmButtonText: "OK",
        })
      }
    } catch (error) {
      console.error("Error setting active year:", error)
      Swal.fire({
        title: "Error",
        text: "Terjadi kesalahan saat mengatur tahun aktif",
        icon: "error",
        confirmButtonText: "OK",
      })
    }
  }

  const fetchDusun = useCallback(async () => {
    try {
      const response = await fetch("/api/dusun", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setDusun(data)
      }
    } catch (error) {
      console.error("Error fetching dusun:", error)
    }
  }, [token])

  const fetchSuratPBB = useCallback(async () => {
    try {
      const response = await fetch("/api/surat-pbb", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setSuratPBB(data.surat_pbb || data)
        if (data.active_year) {
          setActiveYear(data.active_year)
        }
      }
    } catch (error) {
      console.error("Error fetching surat PBB:", error)
    }
  }, [token])

  const fetchLaporan = useCallback(async () => {
    try {
      const response = await fetch("/api/statistik/laporan", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setLaporan(data)
      }
    } catch (error) {
      console.error("Error fetching laporan:", error)
    }
  }, [token])

  useEffect(() => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let year = currentYear - 5; year <= currentYear + 2; year++) {
      years.push(year)
    }
    setAvailableYears(years)
    fetchActiveYear()
  }, [fetchActiveYear])

  useEffect(() => {
    if (activeTab === "dusun") fetchDusun()
    if (activeTab === "surat") fetchSuratPBB()
    if (activeTab === "laporan") fetchLaporan()
  }, [activeTab, fetchDusun, fetchSuratPBB, fetchLaporan])

  const openDusunDetail = async (dusunId: number) => {
    try {
      const response = await fetch(`/api/dusun/${dusunId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setSelectedDusun(data)
        setIsEditingDusun(false)
        setIsAddingPerangkat(false)
        setActiveTab("detail-dusun")

        const tokenResponse = await fetch(`/api/dusun/${dusunId}/tokens`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json()
          setDusunTokens(tokenData)
        }

        const perangkatResponse = await fetch(`/api/perangkat-desa?dusun_id=${dusunId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (perangkatResponse.ok) {
          const perangkatData = await perangkatResponse.json()
          setPerangkatDesa(perangkatData)
        }
      }
    } catch (error) {
      console.error("Error fetching dusun detail:", error)
    }
  }

  const openPerangkatDetail = (perangkat: PerangkatDesa) => {
    setSelectedPerangkat(perangkat)
    setPerangkatForm({
      nama_lengkap: perangkat.nama_lengkap,
      username: perangkat.username,
      password: "",
      id_dusun: perangkat.id_dusun?.toString() || "",
      jabatan: perangkat.jabatan,
    })
    setActiveTab("detail-perangkat")
  }

  const handleCreateDusun = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/dusun", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dusunForm),
      })
      if (response.ok) {
        setActiveTab("dusun")
        setDusunForm({ nama_dusun: "" })
        fetchDusun()
        Swal.fire({
          title: "Berhasil!",
          text: "Dusun berhasil ditambahkan!",
          icon: "success",
          confirmButtonText: "OK",
        })
      } else {
        const error = await response.json()
        Swal.fire({
          title: "Error",
          text: error.message || "Gagal menambahkan dusun",
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
          id_dusun: Number(suratForm.dusun_id),
        }),
      })
      if (response.ok) {
        setActiveTab("surat")
        setSuratForm({
          dusun_id: "",
          nomor_objek_pajak: "",
          nama_wajib_pajak: "",
          alamat_wajib_pajak: "",
          alamat_objek_pajak: "",
          luas_tanah: "",
          luas_bangunan: "",
          nilai_jual_objek_pajak: "",
          tahun_pajak: new Date().getFullYear().toString(),
          jumlah_pajak_terhutang: "",
          status_pembayaran: "belum_bayar",
        })
        fetchSuratPBB()
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

  const handleCreatePerangkatDesa = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/perangkat-desa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nama_lengkap: perangkatForm.nama_lengkap,
          username: perangkatForm.username,
          password: perangkatForm.password,
          jabatan: perangkatForm.jabatan,
          id_dusun: Number(perangkatForm.id_dusun),
        }),
      })
      if (response.ok) {
        setActiveTab("detail-dusun")
        setPerangkatForm({
          nama_lengkap: "",
          username: "",
          password: "",
          id_dusun: "",
          jabatan: "",
        })
        setIsAddingPerangkat(false)
        if (selectedDusun) {
          openDusunDetail(selectedDusun.id)
        }
        Swal.fire({
          title: "Berhasil!",
          text: "Perangkat desa berhasil ditambahkan!",
          icon: "success",
          confirmButtonText: "OK",
        })
      } else {
        const error = await response.json()
        Swal.fire({
          title: "Error",
          text: error.message || "Gagal menambahkan perangkat desa",
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

  const updatePerangkatDesa = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPerangkat) return

    try {
      const updateData: {
        nama_lengkap: string
        username: string
        jabatan: string
        id_dusun: number
        password?: string
      } = {
        nama_lengkap: perangkatForm.nama_lengkap,
        username: perangkatForm.username,
        jabatan: perangkatForm.jabatan,
        id_dusun: Number(perangkatForm.id_dusun),
      }

      if (perangkatForm.password.trim()) {
        updateData.password = perangkatForm.password
      }

      const response = await fetch(`/api/perangkat-desa/${selectedPerangkat.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        Swal.fire({
          title: "Berhasil!",
          text: "Data perangkat desa berhasil diperbarui!",
          icon: "success",
          confirmButtonText: "OK",
        })
        setActiveTab("detail-dusun")
        if (selectedDusun) {
          openDusunDetail(selectedDusun.id)
        }
      } else {
        const error = await response.json()
        Swal.fire({
          title: "Error",
          text: error.message || "Gagal memperbarui data perangkat desa",
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

  const deletePerangkatDesa = async (perangkat?: PerangkatDesa) => {
    const targetPerangkat = perangkat || selectedPerangkat
    if (!targetPerangkat) return

    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: `Apakah Anda yakin ingin menghapus perangkat desa "${targetPerangkat.nama_lengkap}"? Tindakan ini tidak dapat dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    })

    if (!result.isConfirmed) return

    try {
      const response = await fetch(`/api/perangkat-desa/${targetPerangkat.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        Swal.fire({
          title: "Berhasil!",
          text: "Perangkat desa berhasil dihapus!",
          icon: "success",
          confirmButtonText: "OK",
        })
        setActiveTab("detail-dusun")
        if (selectedDusun) {
          openDusunDetail(selectedDusun.id)
        }
      } else {
        const error = await response.json()
        Swal.fire({
          title: "Error",
          text: error.message || "Gagal menghapus perangkat desa",
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

  const deleteDusun = async () => {
    if (!selectedDusun) return

    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: `Apakah Anda yakin ingin menghapus dusun "${selectedDusun.nama_dusun}"? Semua data terkait (surat PBB, perangkat desa, dll.) akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    })

    if (!result.isConfirmed) return

    try {
      const response = await fetch(`/api/dusun/${selectedDusun.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        Swal.fire({
          title: "Berhasil!",
          text: "Dusun berhasil dihapus!",
          icon: "success",
          confirmButtonText: "OK",
        })
        setActiveTab("dusun")
        fetchDusun()
      } else {
        const error = await response.json()
        Swal.fire({
          title: "Error",
          text: error.message || "Gagal menghapus dusun",
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

  const startEditDusun = () => {
    if (!selectedDusun) return
    setIsEditingDusun(true)
    setEditDusunName(selectedDusun.nama_dusun)
  }

  const saveEditDusun = async () => {
    if (!selectedDusun || !editDusunName.trim()) {
      Swal.fire({
        title: "Error",
        text: "Nama dusun tidak boleh kosong",
        icon: "error",
        confirmButtonText: "OK",
      })
      return
    }

    try {
      const response = await fetch(`/api/dusun/${selectedDusun.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nama_dusun: editDusunName.trim() }),
      })

      if (response.ok) {
        Swal.fire({
          title: "Berhasil!",
          text: "Nama dusun berhasil diperbarui!",
          icon: "success",
          confirmButtonText: "OK",
        })
        setIsEditingDusun(false)
        setEditDusunName("")
        openDusunDetail(selectedDusun.id)
      } else {
        const error = await response.json()
        Swal.fire({
          title: "Error",
          text: error.message || "Gagal memperbarui nama dusun",
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

  const cancelEditDusun = () => {
    setIsEditingDusun(false)
    setEditDusunName("")
  }

  const formatStatusDataPBB = (status: string) => {
    switch (status) {
      case "belum_lengkap":
        return "Belum Lengkap"
      case "sudah_lengkap":
        return "Sudah Lengkap"
      default:
        return "Belum Lengkap"
    }
  }

  const getStatusDataPBBColor = (status: string) => {
    switch (status) {
      case "belum_lengkap":
        return "warning"
      case "sudah_lengkap":
        return "success"
      default:
        return "secondary"
    }
  }

  const updateDusunStatus = async (dusunId: number, status: string) => {
    try {
      const response = await fetch(`/api/dusun/${dusunId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status_data_pbb: status }),
      })

      if (response.ok) {
        Swal.fire({
          title: "Berhasil!",
          text: "Status data PBB berhasil diperbarui!",
          icon: "success",
          confirmButtonText: "OK",
        })
        fetchLaporan()
      } else {
        const error = await response.json()
        Swal.fire({
          title: "Error",
          text: error.message || "Gagal memperbarui status data PBB",
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
        Swal.fire({
          title: "Error",
          text: "Gagal memperbarui status pembayaran",
          icon: "error",
          confirmButtonText: "OK",
        })
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
          text: error.message || "Gagal memperbarui surat PBB",
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
        fetchSuratPBB()
      } else {
        const error = await response.json()
        Swal.fire({
          title: "Error",
          text: error.message || "Gagal menghapus surat PBB",
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
    <div className="container-wide">
      <div className="dashboard-header">
        <div>
          <h2>Dashboard Pengelolaan PBB</h2>
          <p className="text-muted mb-0 small">Admin</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <label className="form-label mb-0 text-muted small">Tahun Aktif:</label>
            <select className="form-select form-select-sm" style={{ width: "auto", minWidth: "100px" }} value={activeYear} onChange={(e) => setYear(parseInt(e.target.value))}>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="text-end">
            <small className="text-muted">Data yang ditampilkan untuk tahun {activeYear}</small>
          </div>
        </div>
      </div>

      <ul className="nav nav-tabs mb-3" style={{ backgroundColor: "#fff", padding: "0.5rem 1rem", borderRadius: "4px", border: "1px solid #dee2e6" }}>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "dusun" ? "active" : ""}`} onClick={() => setActiveTab("dusun")} style={{ border: "none", fontSize: "0.9rem" }}>
            <i className="bi bi-house me-2"></i>
            Dusun
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "surat" ? "active" : ""}`} onClick={() => setActiveTab("surat")} style={{ border: "none", fontSize: "0.9rem" }}>
            <i className="bi bi-file-text me-2"></i>
            Surat PBB
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "laporan" ? "active" : ""}`} onClick={() => setActiveTab("laporan")} style={{ border: "none", fontSize: "0.9rem" }}>
            <i className="bi bi-bar-chart me-2"></i>
            Laporan
          </button>
        </li>
      </ul>

      {activeTab === "dusun" && (
        <>
          <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Daftar Dusun</h6>
              <button className="btn btn-sm btn-primary" onClick={() => setActiveTab("tambah-dusun")}>
                <i className="bi bi-plus-circle me-1"></i>
                Tambah Dusun
              </button>
            </div>
          </div>
          <div className="mb-3">
            <input type="text" className="form-control" placeholder="Cari dusun..." value={searchDusun} onChange={(e) => setSearchDusun(e.target.value)} />
          </div>
          {filteredDusun.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-box text-muted" style={{ fontSize: "4rem" }}></i>
                <h4 className="mt-3">{searchDusun ? "Tidak Ada Dusun" : "Belum Ada Dusun"}</h4>
                <p className="text-muted">{searchDusun ? "Tidak ada dusun yang cocok dengan pencarian" : "Belum ada dusun yang terdaftar"}</p>
              </div>
            </div>
          ) : (
            <div className="table-container mx-auto" style={{ maxHeight: "500px", overflowY: "auto", maxWidth: "100%" }}>
              <table className="table table-hover">
                <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <tr>
                    <th>Nama Dusun</th>
                    <th>Kepala Dusun</th>
                    <th>Total Perangkat Desa</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDusun.map((d) => (
                    <tr key={d.id}>
                      <td>{d.nama_dusun}</td>
                      <td>{d.nama_kepala_dusun || "Belum ada"}</td>
                      <td>
                        <span className="badge bg-info">
                          <i className="bi bi-person me-1"></i>
                          {d.total_perangkat_desa || 0} Orang
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-primary" onClick={() => openDusunDetail(d.id)}>
                          <i className="bi bi-eye me-1"></i>
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === "surat" && (
        <>
          {!selectedSurat ? (
            <>
              <div className="card mb-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Daftar Surat PBB</h6>
                  <button className="btn btn-sm btn-primary" onClick={() => setActiveTab("tambah-surat")}>
                    <i className="bi bi-plus-circle me-1"></i>
                    Tambah Surat
                  </button>
                </div>
              </div>
              <TabelSuratPBB suratPBB={suratPBB} searchTerm={searchSuratPBB} onSearchChange={setSearchSuratPBB} onSuratClick={setSelectedSurat} showDusunColumn={true} />
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
              showAdminActions={true}
            />
          )}
        </>
      )}

      {activeTab === "laporan" && laporan && (
        <div>
          <div className="card mb-3">
            <div className="card-header">
              <button
                className="btn btn-link text-decoration-none p-0 d-flex align-items-center justify-content-between w-100"
                type="button"
                onClick={() => setShowStatistics(!showStatistics)}
                aria-expanded={showStatistics}
                aria-controls="statisticsCollapse"
              >
                <h6 className="mb-0">
                  <i className="bi bi-bar-chart me-2"></i>
                  Statistik Keseluruhan
                </h6>
                {showStatistics ? <i className="bi bi-chevron-up"></i> : <i className="bi bi-chevron-down"></i>}
              </button>
            </div>
            <div className={`collapse ${showStatistics ? "show" : ""}`} id="statisticsCollapse">
              <div className="card-body">
                <div className="row g-1 g-md-2">
                  <div className="col-md-4">
                    <div className="card border-primary h-100">
                      <div className="card-body p-1 p-md-3">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <div className="text-muted small mb-1">Total Pajak Terhutang</div>
                            <div className="h4 mb-0 text-primary">
                              Rp {laporan.statistik_per_dusun.reduce((sum, stat) => sum + (stat.total_pajak_terhutang || 0), 0).toLocaleString("id-ID")}
                            </div>
                          </div>
                          <div className="ms-3">
                            <i className="bi bi-wallet text-primary opacity-75" style={{ fontSize: "2rem" }}></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-success h-100">
                      <div className="card-body p-1 p-md-3">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <div className="text-muted small mb-1">Total Pajak Terbayar</div>
                            <div className="h4 mb-0 text-success">
                              Rp {laporan.statistik_per_dusun.reduce((sum, stat) => sum + (stat.total_pajak_dibayar || 0), 0).toLocaleString("id-ID")}
                            </div>
                          </div>
                          <div className="ms-3">
                            <i className="bi bi-check-circle text-success opacity-75" style={{ fontSize: "2rem" }}></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-info h-100">
                      <div className="card-body p-1 p-md-3">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <div className="text-muted small mb-1">Persentase Pembayaran</div>
                            <div className="h4 mb-0 text-info">
                              {(() => {
                                const totalSurat = laporan.statistik_per_dusun.reduce((sum, stat) => sum + (stat.total_surat || 0), 0)
                                const totalSuratDibayar = laporan.statistik_per_dusun.reduce((sum, stat) => sum + (stat.total_surat_dibayar || 0), 0)
                                const percentage = totalSurat > 0 ? (totalSuratDibayar / totalSurat) * 100 : 0
                                return `${percentage.toFixed(1)}%`
                              })()}
                            </div>
                          </div>
                          <div className="ms-3">
                            <i className="bi bi-percent text-info opacity-75" style={{ fontSize: "2rem" }}></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-secondary h-100">
                      <div className="card-body p-1 p-md-3">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <div className="text-muted small mb-1">Total Surat</div>
                            <div className="h4 mb-0 text-secondary">{laporan.total_surat_keseluruhan}</div>
                          </div>
                          <div className="ms-3">
                            <i className="bi bi-file-text text-secondary opacity-75" style={{ fontSize: "2rem" }}></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-success h-100">
                      <div className="card-body p-1 p-md-3">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <div className="text-muted small mb-1">Surat Sudah Dibayar</div>
                            <div className="h4 mb-0 text-success">{laporan.statistik_per_dusun.reduce((sum, stat) => sum + (stat.total_surat_dibayar || 0), 0)}</div>
                          </div>
                          <div className="ms-3">
                            <i className="bi bi-check-square text-success opacity-75" style={{ fontSize: "2rem" }}></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-warning h-100">
                      <div className="card-body p-1 p-md-3">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <div className="text-muted small mb-1">Surat Belum Dibayar</div>
                            <div className="h4 mb-0 text-warning">{laporan.statistik_per_dusun.reduce((sum, stat) => sum + (stat.total_surat_belum_bayar || 0), 0)}</div>
                          </div>
                          <div className="ms-3">
                            <i className="bi bi-exclamation-triangle text-warning opacity-75" style={{ fontSize: "2rem" }}></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-bar-chart me-2"></i>
                Statistik Per Dusun
              </h6>
            </div>
          </div>
          <div className="mb-3">
            <input type="text" className="form-control" placeholder="Cari statistik dusun..." value={searchStatistik} onChange={(e) => setSearchStatistik(e.target.value)} />
          </div>
          {filteredStatistik.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-inbox text-muted" style={{ fontSize: "4rem" }}></i>
                <h4 className="mt-3">{searchStatistik ? "Tidak Ada Statistik" : "Belum Ada Data Statistik"}</h4>
                <p className="text-muted">{searchStatistik ? "Tidak ada statistik dusun yang cocok dengan pencarian" : "Belum ada data statistik dusun"}</p>
              </div>
            </div>
          ) : (
            <div className="table-container mx-auto" style={{ maxHeight: "500px", overflowY: "auto", maxWidth: "100%" }}>
              <table className="table table-hover">
                <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <tr>
                    <th>Nama Dusun</th>
                    <th>Total Surat</th>
                    <th>Status Data PBB</th>
                    <th>Persentase</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStatistik.map((stat) => (
                    <tr key={stat.id} style={{ cursor: "pointer" }}>
                      <td>{stat.nama_dusun}</td>
                      <td>
                        <span className="badge bg-info">
                          <i className="bi bi-file-text me-1"></i>
                          {stat.total_surat || 0}
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${getStatusDataPBBColor(stat.status_data_pbb || "belum_lengkap")}`}>
                          {formatStatusDataPBB(stat.status_data_pbb || "belum_lengkap")}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress flex-grow-1 me-2" style={{ height: "20px", minWidth: "80px" }}>
                            <div
                              className="progress-bar bg-success"
                              role="progressbar"
                              style={{ width: `${stat.persentase_pembayaran || 0}%` }}
                              aria-valuenow={stat.persentase_pembayaran || 0}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              {(stat.persentase_pembayaran || 0).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              setSelectedDusunId(stat.id.toString())
                              setActiveTab("detail-laporan-dusun")
                            }}
                          >
                            <i className="bi bi-eye me-1"></i>
                            Detail
                          </button>
                          <select
                            className="form-select form-select-sm"
                            style={{
                              width: "auto",
                              minWidth: "120px",
                              height: "31px",
                              fontSize: "0.875rem",
                              lineHeight: "1",
                              paddingTop: "0.125rem",
                              paddingBottom: "0.25rem",
                              paddingRight: "2rem",
                            }}
                            value={stat.status_data_pbb || "belum_lengkap"}
                            onChange={(e) => updateDusunStatus(stat.id, e.target.value)}
                          >
                            <option value="belum_lengkap">Belum Lengkap</option>
                            <option value="sudah_lengkap">Sudah Lengkap</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "tambah-dusun" && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Tambah Dusun Baru</h6>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab("dusun")}>
              <i className="bi bi-arrow-left me-1"></i>
              Kembali ke Daftar
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateDusun}>
              <div className="mb-3">
                <label className="form-label">
                  Nama Dusun <span className="text-danger">*</span>
                </label>
                <input type="text" className="form-control" value={dusunForm.nama_dusun} onChange={(e) => setDusunForm({ ...dusunForm, nama_dusun: e.target.value })} required />
              </div>
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Setelah dusun dibuat, token untuk registrasi perangkat desa akan ditampilkan. Simpan token tersebut untuk diberikan kepada perangkat desa.
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-save me-1"></i>
                  Simpan
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab("dusun")}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === "tambah-surat" && (
        <FormTambahSuratPBB
          suratForm={suratForm}
          onFormChange={(field, value) => setSuratForm({ ...suratForm, [field]: value })}
          onSubmit={handleCreateSurat}
          onCancel={() => setActiveTab("surat")}
          showDusunField={true}
          dusunOptions={dusun}
        />
      )}

      {activeTab === "tambah-perangkat" && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Tambah Perangkat Desa Baru</h6>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab("detail-dusun")}>
              <i className="bi bi-arrow-left me-1"></i>
              Kembali ke Detail Dusun
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreatePerangkatDesa}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Nama Lengkap <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={perangkatForm.nama_lengkap}
                    onChange={(e) => setPerangkatForm({ ...perangkatForm, nama_lengkap: e.target.value })}
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
                    value={perangkatForm.username}
                    onChange={(e) => setPerangkatForm({ ...perangkatForm, username: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={perangkatForm.password}
                    onChange={(e) => setPerangkatForm({ ...perangkatForm, password: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Jabatan <span className="text-danger">*</span>
                  </label>
                  <select className="form-select" value={perangkatForm.jabatan} onChange={(e) => setPerangkatForm({ ...perangkatForm, jabatan: e.target.value })} required>
                    <option value="">Pilih Jabatan</option>
                    <option value="kepala_dusun">Kepala Dusun</option>
                    <option value="ketua_rt">Ketua RT</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">
                    Dusun <span className="text-danger">*</span>
                  </label>
                  <select className="form-select" value={perangkatForm.id_dusun} onChange={(e) => setPerangkatForm({ ...perangkatForm, id_dusun: e.target.value })} required>
                    <option value="">Pilih Dusun</option>
                    {dusun.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nama_dusun}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-save me-1"></i>
                  Simpan
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab("detail-dusun")}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === "detail-dusun" && selectedDusun && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Detail Dusun: {selectedDusun.nama_dusun}</h6>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => {
                setActiveTab("dusun")
                setDusunTokens(null)
              }}
            >
              <i className="bi bi-arrow-left me-1"></i>
              Kembali ke Daftar
            </button>
          </div>
          <div className="card-body">
            <div className="row g-4">
              <div className="col-12">
                <div className="card border-primary mb-3">
                  <div className="card-header bg-primary text-white">
                    <h6 className="mb-0">
                      <i className="bi bi-info-circle me-2"></i>
                      Informasi Dusun
                    </h6>
                  </div>
                  <div className="card-body">
                    {isEditingDusun ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          saveEditDusun()
                        }}
                      >
                        <div className="mb-3">
                          <label className="form-label">
                            Nama Dusun <span className="text-danger">*</span>
                          </label>
                          <input type="text" className="form-control" value={editDusunName} onChange={(e) => setEditDusunName(e.target.value)} required autoFocus />
                        </div>
                        <div className="d-flex gap-2">
                          <button type="submit" className="btn btn-primary">
                            <i className="bi bi-save me-1"></i>
                            Simpan
                          </button>
                          <button type="button" className="btn btn-secondary" onClick={cancelEditDusun}>
                            Batal
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="row g-3">
                        <div className="col-md-6">
                          <strong>Nama Dusun:</strong>
                          <p className="mb-0">{selectedDusun.nama_dusun}</p>
                        </div>
                        <div className="col-md-6 d-flex justify-content-between align-items-start">
                          <div>
                            <strong>Kepala Dusun:</strong>
                            <p className="mb-0">{selectedDusun.nama_kepala_dusun || "Belum ada"}</p>
                          </div>
                          <div className="d-flex flex-column gap-2">
                            <button className="btn btn-warning btn-sm" onClick={startEditDusun}>
                              <i className="bi bi-pencil me-1"></i>
                              Edit Dusun
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={deleteDusun}>
                              <i className="bi bi-trash me-1"></i>
                              Hapus Dusun
                            </button>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <strong>Total Perangkat Desa:</strong>
                          <p className="mb-0">
                            <span className="badge bg-info">
                              <i className="bi bi-people me-1"></i>
                              {selectedDusun.total_perangkat_desa || 0} Perangkat
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card border-warning mb-3">
                  <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                      <i className="bi bi-key me-2"></i>
                      Token Registrasi Perangkat Desa
                    </h6>
                    <button
                      className="btn btn-sm btn-outline-dark"
                      onClick={async () => {
                        const result = await Swal.fire({
                          title: "Konfirmasi Regenerate Token",
                          text: "Apakah Anda yakin ingin meregenerate token? Token lama akan tidak valid lagi.",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonColor: "#d33",
                          cancelButtonColor: "#3085d6",
                          confirmButtonText: "Ya, Regenerate",
                          cancelButtonText: "Batal",
                        })

                        if (result.isConfirmed && selectedDusun) {
                          try {
                            const response = await fetch(`/api/dusun/${selectedDusun.id}/regenerate-tokens`, {
                              method: "POST",
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            })

                            if (response.ok) {
                              const data = await response.json()
                              setDusunTokens({
                                tokenKepalaDusun: data.tokenKepalaDusun,
                                tokenKetuaRT: data.tokenKetuaRT,
                              })
                              Swal.fire({
                                title: "Berhasil!",
                                text: "Token berhasil diregenerate!",
                                icon: "success",
                                confirmButtonText: "OK",
                              })
                            } else {
                              const error = await response.json()
                              Swal.fire({
                                title: "Error",
                                text: error.message || "Gagal meregenerate token",
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
                      }}
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      Regenerate Token
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      Token ini digunakan oleh perangkat desa untuk mendaftar ke sistem. Berikan token yang sesuai dengan jabatan kepada calon perangkat desa.
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-success">
                          <i className="bi bi-person me-1"></i>
                          Token Kepala Dusun
                        </label>
                        <div className="input-group">
                          <input type="text" className="form-control font-monospace" value={dusunTokens?.tokenKepalaDusun || "Token sudah digunakan"} readOnly />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => {
                              if (dusunTokens?.tokenKepalaDusun) {
                                navigator.clipboard.writeText(dusunTokens.tokenKepalaDusun)
                                Swal.fire({
                                  title: "Berhasil!",
                                  text: "Token berhasil disalin!",
                                  icon: "success",
                                  confirmButtonText: "OK",
                                  timer: 1500,
                                  showConfirmButton: false,
                                })
                              }
                            }}
                            disabled={!dusunTokens?.tokenKepalaDusun}
                          >
                            <i className="bi bi-clipboard me-1"></i>
                            Salin
                          </button>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-warning">
                          <i className="bi bi-people me-1"></i>
                          Token Ketua RT
                        </label>
                        <div className="input-group">
                          <input type="text" className="form-control font-monospace" value={dusunTokens?.tokenKetuaRT || "Token tidak tersedia"} readOnly />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => {
                              if (dusunTokens?.tokenKetuaRT) {
                                navigator.clipboard.writeText(dusunTokens.tokenKetuaRT)
                                Swal.fire({
                                  title: "Berhasil!",
                                  text: "Token berhasil disalin!",
                                  icon: "success",
                                  confirmButtonText: "OK",
                                  timer: 1500,
                                  showConfirmButton: false,
                                })
                              }
                            }}
                            disabled={!dusunTokens?.tokenKetuaRT}
                          >
                            <i className="bi bi-clipboard me-1"></i>
                            Salin
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card mb-3">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                      <i className="bi bi-people me-2"></i>
                      Daftar Perangkat Desa
                    </h6>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => {
                        setPerangkatForm({
                          nama_lengkap: "",
                          username: "",
                          password: "",
                          id_dusun: selectedDusun.id.toString(),
                          jabatan: "",
                        })
                        setIsAddingPerangkat(true)
                      }}
                    >
                      <i className="bi bi-person me-1"></i>
                      Tambah Perangkat
                    </button>
                  </div>
                </div>
                {isAddingPerangkat ? (
                  <div className="card">
                    <div className="card-body">
                      <form onSubmit={handleCreatePerangkatDesa}>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label">
                              Nama Lengkap <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={perangkatForm.nama_lengkap}
                              onChange={(e) => setPerangkatForm({ ...perangkatForm, nama_lengkap: e.target.value })}
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
                              value={perangkatForm.username}
                              onChange={(e) => setPerangkatForm({ ...perangkatForm, username: e.target.value })}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">
                              Password <span className="text-danger">*</span>
                            </label>
                            <input
                              type="password"
                              className="form-control"
                              value={perangkatForm.password}
                              onChange={(e) => setPerangkatForm({ ...perangkatForm, password: e.target.value })}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">
                              Jabatan <span className="text-danger">*</span>
                            </label>
                            <select
                              className="form-select"
                              value={perangkatForm.jabatan}
                              onChange={(e) => setPerangkatForm({ ...perangkatForm, jabatan: e.target.value })}
                              required
                            >
                              <option value="">Pilih Jabatan</option>
                              <option value="kepala_dusun">Kepala Dusun</option>
                              <option value="ketua_rt">Ketua RT</option>
                            </select>
                          </div>
                        </div>
                        <div className="d-flex gap-2 mt-4">
                          <button type="submit" className="btn btn-primary">
                            <i className="bi bi-save me-1"></i>
                            Simpan
                          </button>
                          <button type="button" className="btn btn-secondary" onClick={() => setIsAddingPerangkat(false)}>
                            Batal
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Cari perangkat desa..."
                        value={searchPerangkat}
                        onChange={(e) => setSearchPerangkat(e.target.value)}
                      />
                    </div>
                    <div className="table-container mx-auto" style={{ maxHeight: "500px", overflowY: "auto", maxWidth: "100%" }}>
                      <table className="table table-hover">
                        <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                          <tr>
                            <th>Nama Lengkap</th>
                            <th>Username</th>
                            <th>Jabatan</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPerangkat.map((perangkat: PerangkatDesa) => (
                            <tr key={perangkat.id}>
                              <td>{perangkat.nama_lengkap}</td>
                              <td>{perangkat.username}</td>
                              <td>
                                <span className={`badge bg-${perangkat.jabatan === "kepala_dusun" ? "success" : "warning"}`}>
                                  {perangkat.jabatan === "kepala_dusun" ? "Kepala Dusun" : "Ketua RT"}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <button className="btn btn-sm btn-primary" onClick={() => openPerangkatDetail(perangkat)}>
                                    <i className="bi bi-pencil me-1"></i>
                                    Edit
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={async () => {
                                      const result = await Swal.fire({
                                        title: "Konfirmasi Hapus",
                                        text: `Apakah Anda yakin ingin menghapus perangkat desa "${perangkat.nama_lengkap}"? Tindakan ini tidak dapat dibatalkan.`,
                                        icon: "warning",
                                        showCancelButton: true,
                                        confirmButtonColor: "#d33",
                                        cancelButtonColor: "#3085d6",
                                        confirmButtonText: "Ya, Hapus",
                                        cancelButtonText: "Batal",
                                      })

                                      if (result.isConfirmed) {
                                        deletePerangkatDesa(perangkat)
                                      }
                                    }}
                                  >
                                    <i className="bi bi-trash me-1"></i>
                                    Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "detail-perangkat" && selectedPerangkat && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Edit Perangkat Desa: {selectedPerangkat.nama_lengkap}</h6>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab("detail-dusun")}>
              <i className="bi bi-arrow-left me-1"></i>
              Kembali ke Detail Dusun
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={updatePerangkatDesa}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Nama Lengkap <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={perangkatForm.nama_lengkap}
                    onChange={(e) => setPerangkatForm({ ...perangkatForm, nama_lengkap: e.target.value })}
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
                    value={perangkatForm.username}
                    onChange={(e) => setPerangkatForm({ ...perangkatForm, username: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Password Baru (kosongkan jika tidak ingin mengubah)</label>
                  <input
                    type="password"
                    className="form-control"
                    value={perangkatForm.password}
                    onChange={(e) => setPerangkatForm({ ...perangkatForm, password: e.target.value })}
                    placeholder="Masukkan password baru atau kosongkan"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Jabatan <span className="text-danger">*</span>
                  </label>
                  <select className="form-select" value={perangkatForm.jabatan} onChange={(e) => setPerangkatForm({ ...perangkatForm, jabatan: e.target.value })} required>
                    <option value="kepala_dusun">Kepala Dusun</option>
                    <option value="ketua_rt">Ketua RT</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">
                    Dusun <span className="text-danger">*</span>
                  </label>
                  <select className="form-select" value={perangkatForm.id_dusun} onChange={(e) => setPerangkatForm({ ...perangkatForm, id_dusun: e.target.value })} required>
                    <option value="">Pilih Dusun</option>
                    {dusun.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nama_dusun}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-save me-1"></i>
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === "detail-laporan-dusun" && selectedDusunId && token && <DetailDusunLaporan dusunId={selectedDusunId} token={token} onBack={() => setActiveTab("laporan")} />}
    </div>
  )
}
