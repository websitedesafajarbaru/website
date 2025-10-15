import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { SuratPBB } from "../../types"
import { formatStatusPembayaran, getStatusPembayaranColor } from "../../utils/formatters"
import { formatToWIB } from "../../utils/time"

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
  const [activeTab, setActiveTab] = useState<"ketua-rt" | "laporan" | "tambah-ketua-rt" | "tambah-surat-pbb" | "detail-surat">("ketua-rt")
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
  })

  const filteredKetuaRT = ketuaRT.filter((k) => {
    const searchLower = searchKetuaRT.toLowerCase()
    return k.nama_lengkap.toLowerCase().includes(searchLower) || k.username.toLowerCase().includes(searchLower) || k.jabatan.toLowerCase().includes(searchLower)
  })

  const filteredSuratPBB =
    statistik?.surat_pbb.filter((s) => {
      const searchLower = searchSuratPBB.toLowerCase()
      return (
        s.nomor_objek_pajak.toLowerCase().includes(searchLower) ||
        s.nama_wajib_pajak.toLowerCase().includes(searchLower) ||
        (s.alamat_objek_pajak || "").toLowerCase().includes(searchLower) ||
        s.tahun_pajak.toString().includes(searchLower) ||
        s.jumlah_pajak_terhutang.toString().includes(searchLower) ||
        formatStatusPembayaran(s.status_pembayaran).toLowerCase().includes(searchLower)
      )
    }) || []

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
    const loadTabData = async () => {
      if (!token) return

      if (activeTab === "ketua-rt" && dusunId) {
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
          console.error(err)
        }
      }

      if (activeTab === "laporan" && dusunId) {
        try {
          const response = await fetch(`/api/statistik/dusun/${dusunId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const result = await response.json()
          if (response.ok) {
            setStatistik(result)
            if (result.active_year) {
              setActiveYear(result.active_year)
            }
          }
        } catch (err) {
          console.error(err)
        }
      }
    }

    loadTabData()
  }, [activeTab, dusunId, token])

  const handleSuratClick = (surat: SuratPBB, fromLaporan: boolean = false) => {
    setSelectedSurat(surat)
    if (!fromLaporan) {
      setActiveTab("detail-surat")
    }
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
        })
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
        setActiveTab("laporan")
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
                <i className="bi bi-person-plus me-1"></i>Tambah Ketua RT
              </button>
            </div>
          </div>
          <div className="mb-3">
            <input type="text" className="form-control" placeholder="Cari ketua RT..." value={searchKetuaRT} onChange={(e) => setSearchKetuaRT(e.target.value)} />
          </div>
          {filteredKetuaRT.length === 0 ? (
            <div className="p-4 text-center text-muted">
              <i className="bi bi-inbox" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
              <p className="mt-2 mb-0">{searchKetuaRT ? "Tidak ada ketua RT yang cocok dengan pencarian" : "Belum ada Ketua RT yang terdaftar di dusun ini"}</p>
            </div>
          ) : (
            <div className="table-responsive mx-auto" style={{ maxHeight: "500px", overflowY: "auto", maxWidth: "100%" }}>
              <table className="table table-hover">
                <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <tr>
                    <th>No</th>
                    <th>Nama Lengkap</th>
                    <th>Username</th>
                    <th>Jabatan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKetuaRT.map((ketua, index) => (
                    <tr key={ketua.id}>
                      <td>{index + 1}</td>
                      <td>{ketua.nama_lengkap}</td>
                      <td>{ketua.username}</td>
                      <td>
                        <span className="badge bg-info">Ketua RT</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === "laporan" && statistik && (
        <div>
          <div className="card mb-4">
            <div className="card-header" style={{ cursor: "pointer" }} onClick={() => setShowStatistics(!showStatistics)}>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="bi bi-bar-chart me-2"></i>Statistik PBB
                </h6>
                <i className={`bi bi-chevron-${showStatistics ? "up" : "down"}`}></i>
              </div>
            </div>
            {showStatistics && (
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="card border-primary h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <div className="text-muted small mb-1">Total Pajak Terhutang</div>
                            <div className="h4 mb-0 text-primary">Rp {statistik.total_pajak_terhutang.toLocaleString("id-ID")}</div>
                          </div>
                          <i className="bi bi-wallet2 text-primary" style={{ fontSize: "2.5rem", opacity: 0.3 }}></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-success h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <div className="text-muted small mb-1">Total Pajak Terbayar</div>
                            <div className="h4 mb-0 text-success">Rp {statistik.total_pajak_dibayar.toLocaleString("id-ID")}</div>
                          </div>
                          <i className="bi bi-check-circle text-success" style={{ fontSize: "2.5rem", opacity: 0.3 }}></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-info h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <div className="text-muted small mb-1">Persentase Pembayaran</div>
                            <div className="h4 mb-0 text-info">{statistik.persentase_pembayaran.toFixed(1)}%</div>
                          </div>
                          <i className="bi bi-percent text-info" style={{ fontSize: "2.5rem", opacity: 0.3 }}></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-secondary h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <div className="text-muted small mb-1">Total Surat</div>
                            <div className="h4 mb-0 text-secondary">{statistik.total_surat}</div>
                          </div>
                          <i className="bi bi-file-text text-secondary" style={{ fontSize: "2.5rem", opacity: 0.3 }}></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-success h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <div className="text-muted small mb-1">Surat Sudah Dibayar</div>
                            <div className="h4 mb-0 text-success">{statistik.total_surat_dibayar}</div>
                          </div>
                          <i className="bi bi-check2-square text-success" style={{ fontSize: "2.5rem", opacity: 0.3 }}></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-warning h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <div className="text-muted small mb-1">Surat Belum Dibayar</div>
                            <div className="h4 mb-0 text-warning">{statistik.total_surat_belum_bayar}</div>
                          </div>
                          <i className="bi bi-exclamation-square text-warning" style={{ fontSize: "2.5rem", opacity: 0.3 }}></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

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
              <div className="mb-3">
                <input type="text" className="form-control" placeholder="Cari surat PBB..." value={searchSuratPBB} onChange={(e) => setSearchSuratPBB(e.target.value)} />
              </div>
              {filteredSuratPBB.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <i className="bi bi-inbox" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
                  <p className="mt-2 mb-0">{searchSuratPBB ? "Tidak ada surat PBB yang cocok dengan pencarian" : "Belum ada surat PBB yang terdaftar"}</p>
                </div>
              ) : (
                <div className="table-container mx-auto" style={{ maxHeight: "500px", overflowY: "auto", maxWidth: "100%" }}>
                  <table className="table table-hover">
                    <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                      <tr>
                        <th>NOP</th>
                        <th>Nama Wajib Pajak</th>
                        <th>Alamat Objek Pajak</th>
                        <th>Tahun</th>
                        <th>Jumlah Pajak</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSuratPBB.map((surat) => (
                        <tr key={surat.id}>
                          <td className="font-monospace small">{surat.nomor_objek_pajak}</td>
                          <td>{surat.nama_wajib_pajak}</td>
                          <td className="small">{surat.alamat_objek_pajak}</td>
                          <td>{surat.tahun_pajak}</td>
                          <td>Rp {Number(surat.jumlah_pajak_terhutang).toLocaleString("id-ID")}</td>
                          <td>
                            <span className={`badge bg-${getStatusPembayaranColor(surat.status_pembayaran)}`}>{formatStatusPembayaran(surat.status_pembayaran)}</span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleSuratClick(surat, true)}>
                              <i className="bi bi-eye me-1"></i>Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Detail Surat PBB - {selectedSurat.nomor_objek_pajak}</h6>
                <div className="d-flex gap-2">
                  {(user?.roles === "superadmin" || user?.roles === "kepala_dusun") && (
                    <>
                      {!isEditing ? (
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => {
                            setIsEditing(true)
                            setEditForm(selectedSurat)
                          }}
                        >
                          <i className="bi bi-pencil me-1"></i>Edit
                        </button>
                      ) : (
                        <>
                          <button className="btn btn-success btn-sm" onClick={handleSaveEdit}>
                            <i className="bi bi-check me-1"></i>Simpan
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>
                            <i className="bi bi-x me-1"></i>Batal
                          </button>
                        </>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                        <i className="bi bi-trash me-1"></i>Hapus
                      </button>
                    </>
                  )}
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelectedSurat(null)}>
                    <i className="bi bi-arrow-left me-1"></i>Kembali ke Daftar
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Nomor Objek Pajak (NOP)</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.nomor_objek_pajak || ""}
                        onChange={(e) => handleEditFormChange("nomor_objek_pajak", e.target.value)}
                      />
                    ) : (
                      <div className="fw-semibold font-monospace">{selectedSurat.nomor_objek_pajak}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Tahun Pajak</label>
                    {isEditing ? (
                      <input
                        type="number"
                        className="form-control"
                        value={editForm.tahun_pajak || ""}
                        onChange={(e) => handleEditFormChange("tahun_pajak", Number(e.target.value))}
                      />
                    ) : (
                      <div className="fw-semibold">{selectedSurat.tahun_pajak}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Nama Wajib Pajak</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.nama_wajib_pajak || ""}
                        onChange={(e) => handleEditFormChange("nama_wajib_pajak", e.target.value)}
                      />
                    ) : (
                      <div className="fw-semibold">{selectedSurat.nama_wajib_pajak}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Status Pembayaran</label>
                    {isEditing ? (
                      <>
                        <select
                          className="form-select"
                          value={editForm.status_pembayaran || ""}
                          onChange={(e) => handleEditFormChange("status_pembayaran", e.target.value)}
                          disabled={user?.roles !== "superadmin" && selectedSurat?.status_data_pbb !== "sudah_lengkap"}
                        >
                          <option value="belum_bayar">Belum Bayar</option>
                          <option value="bayar_sendiri_di_bank">Bayar Sendiri di Bank</option>
                          <option value="bayar_lewat_perangkat_desa">Bayar Lewat Perangkat Desa</option>
                          <option value="pindah_rumah">Pindah Rumah</option>
                          <option value="tidak_diketahui">Tidak Diketahui</option>
                        </select>
                        {user?.roles !== "superadmin" && selectedSurat?.status_data_pbb !== "sudah_lengkap" && (
                          <div className="form-text text-warning">
                            <i className="bi bi-info-circle me-1"></i>
                            Status pembayaran hanya dapat diubah setelah data dusun diset sebagai lengkap oleh superadmin
                          </div>
                        )}
                      </>
                    ) : (
                      <select
                        className="form-select"
                        value={selectedSurat.status_pembayaran}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={user?.roles !== "superadmin" && selectedSurat?.status_data_pbb !== "sudah_lengkap"}
                      >
                        <option value="belum_bayar">Belum Bayar</option>
                        <option value="bayar_sendiri_di_bank">Bayar Sendiri di Bank</option>
                        <option value="bayar_lewat_perangkat_desa">Bayar Lewat Perangkat Desa</option>
                        <option value="pindah_rumah">Pindah Rumah</option>
                        <option value="tidak_diketahui">Tidak Diketahui</option>
                      </select>
                    )}
                    {user?.roles !== "superadmin" && selectedSurat?.status_data_pbb !== "sudah_lengkap" && !isEditing && (
                      <div className="form-text text-warning">
                        <i className="bi bi-info-circle me-1"></i>
                        Status pembayaran hanya dapat diubah setelah data dusun diset sebagai lengkap oleh superadmin
                      </div>
                    )}
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted small mb-1">Alamat Wajib Pajak</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.alamat_wajib_pajak || ""}
                        onChange={(e) => handleEditFormChange("alamat_wajib_pajak", e.target.value)}
                      />
                    ) : (
                      <div className="fw-semibold">{selectedSurat.alamat_wajib_pajak || "-"}</div>
                    )}
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted small mb-1">Alamat Objek Pajak</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.alamat_objek_pajak || ""}
                        onChange={(e) => handleEditFormChange("alamat_objek_pajak", e.target.value)}
                      />
                    ) : (
                      <div className="fw-semibold">{selectedSurat.alamat_objek_pajak}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Luas Tanah</label>
                    {isEditing ? (
                      <input
                        type="number"
                        className="form-control"
                        value={editForm.luas_tanah || ""}
                        onChange={(e) => handleEditFormChange("luas_tanah", Number(e.target.value))}
                      />
                    ) : (
                      <div className="fw-semibold">{selectedSurat.luas_tanah ? `${selectedSurat.luas_tanah} m²` : "-"}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Luas Bangunan</label>
                    {isEditing ? (
                      <input
                        type="number"
                        className="form-control"
                        value={editForm.luas_bangunan || ""}
                        onChange={(e) => handleEditFormChange("luas_bangunan", Number(e.target.value))}
                      />
                    ) : (
                      <div className="fw-semibold">{selectedSurat.luas_bangunan ? `${selectedSurat.luas_bangunan} m²` : "-"}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Nilai Jual Objek Pajak (NJOP)</label>
                    {isEditing ? (
                      <input
                        type="number"
                        className="form-control"
                        value={editForm.nilai_jual_objek_pajak || ""}
                        onChange={(e) => handleEditFormChange("nilai_jual_objek_pajak", Number(e.target.value))}
                      />
                    ) : (
                      <div className="fw-semibold">{selectedSurat.nilai_jual_objek_pajak ? `Rp ${Number(selectedSurat.nilai_jual_objek_pajak).toLocaleString("id-ID")}` : "-"}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Jumlah Pajak Terhutang</label>
                    {isEditing ? (
                      <input
                        type="number"
                        className="form-control"
                        value={editForm.jumlah_pajak_terhutang || ""}
                        onChange={(e) => handleEditFormChange("jumlah_pajak_terhutang", Number(e.target.value))}
                      />
                    ) : (
                      <div className="fw-semibold text-primary">Rp {Number(selectedSurat.jumlah_pajak_terhutang).toLocaleString("id-ID")}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Dusun</label>
                    <div className="fw-semibold">{selectedSurat.nama_dusun || "-"}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Perangkat Desa</label>
                    <div className="fw-semibold">{selectedSurat.nama_perangkat || "-"}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Waktu Dibuat</label>
                    <div className="small">{formatToWIB(selectedSurat.waktu_dibuat)}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Waktu Diperbarui</label>
                    <div className="small">{formatToWIB(selectedSurat.waktu_diperbarui)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "tambah-ketua-rt" && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Tambah Ketua RT Baru</h6>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab("ketua-rt")}>
              <i className="bi bi-arrow-left me-1"></i>Kembali ke Daftar
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateKetuaRT}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">
                    Nama Lengkap <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={ketuaRTForm.nama_lengkap}
                    onChange={(e) => setKetuaRTForm({ ...ketuaRTForm, nama_lengkap: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">
                    Username <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={ketuaRTForm.username}
                    onChange={(e) => setKetuaRTForm({ ...ketuaRTForm, username: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">
                    Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={ketuaRTForm.password}
                    onChange={(e) => setKetuaRTForm({ ...ketuaRTForm, password: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-person-plus me-1"></i>Simpan
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab("ketua-rt")}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === "tambah-surat-pbb" && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Tambah Surat PBB Baru</h6>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab("laporan")}>
              <i className="bi bi-arrow-left me-1"></i>Kembali ke Daftar
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateSurat}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Nomor Objek Pajak (NOP) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={suratForm.nomor_objek_pajak}
                    onChange={(e) => setSuratForm({ ...suratForm, nomor_objek_pajak: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Tahun Pajak <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={suratForm.tahun_pajak}
                    onChange={(e) => setSuratForm({ ...suratForm, tahun_pajak: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Nama Wajib Pajak <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={suratForm.nama_wajib_pajak}
                    onChange={(e) => setSuratForm({ ...suratForm, nama_wajib_pajak: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Status Pembayaran</label>
                  <select className="form-select" value={suratForm.status_pembayaran} onChange={(e) => setSuratForm({ ...suratForm, status_pembayaran: e.target.value })}>
                    <option value="belum_bayar">Belum Bayar</option>
                    <option value="bayar_sendiri_di_bank">Bayar Sendiri di Bank</option>
                    <option value="bayar_lewat_perangkat_desa">Bayar Lewat Perangkat Desa</option>
                    <option value="pindah_rumah">Pindah Rumah</option>
                    <option value="tidak_diketahui">Tidak Diketahui</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Alamat Wajib Pajak</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={suratForm.alamat_wajib_pajak}
                    onChange={(e) => setSuratForm({ ...suratForm, alamat_wajib_pajak: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">
                    Alamat Objek Pajak <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={suratForm.alamat_objek_pajak}
                    onChange={(e) => setSuratForm({ ...suratForm, alamat_objek_pajak: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Luas Tanah (m²) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={suratForm.luas_tanah}
                    onChange={(e) => setSuratForm({ ...suratForm, luas_tanah: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Luas Bangunan (m²) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={suratForm.luas_bangunan}
                    onChange={(e) => setSuratForm({ ...suratForm, luas_bangunan: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Nilai Jual Objek Pajak (NJOP) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={suratForm.nilai_jual_objek_pajak}
                    onChange={(e) => setSuratForm({ ...suratForm, nilai_jual_objek_pajak: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Jumlah Pajak Terhutang <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={suratForm.jumlah_pajak_terhutang}
                    onChange={(e) => setSuratForm({ ...suratForm, jumlah_pajak_terhutang: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-1"></i>Simpan
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab("laporan")}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === "detail-surat" && selectedSurat && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Detail Surat PBB - {selectedSurat.nomor_objek_pajak}</h6>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab("laporan")}>
              <i className="bi bi-arrow-left me-1"></i>Kembali ke Daftar
            </button>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1">Nomor Objek Pajak (NOP)</label>
                <div className="fw-semibold font-monospace">{selectedSurat.nomor_objek_pajak}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1">Tahun Pajak</label>
                <div className="fw-semibold">{selectedSurat.tahun_pajak}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1">Nama Wajib Pajak</label>
                <div className="fw-semibold">{selectedSurat.nama_wajib_pajak}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1">Status Pembayaran</label>
                <div>
                  <span className={`badge bg-${getStatusPembayaranColor(selectedSurat.status_pembayaran)}`}>{formatStatusPembayaran(selectedSurat.status_pembayaran)}</span>
                </div>
              </div>
              <div className="col-12">
                <label className="form-label text-muted small mb-1">Alamat Wajib Pajak</label>
                <div className="fw-semibold">{selectedSurat.alamat_wajib_pajak || "-"}</div>
              </div>
              <div className="col-12">
                <label className="form-label text-muted small mb-1">Alamat Objek Pajak</label>
                <div className="fw-semibold">{selectedSurat.alamat_objek_pajak}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1">Luas Tanah</label>
                <div className="fw-semibold">{selectedSurat.luas_tanah ? `${selectedSurat.luas_tanah} m²` : "-"}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1">Luas Bangunan</label>
                <div className="fw-semibold">{selectedSurat.luas_bangunan ? `${selectedSurat.luas_bangunan} m²` : "-"}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1">Nilai Jual Objek Pajak (NJOP)</label>
                <div className="fw-semibold">{selectedSurat.nilai_jual_objek_pajak ? `Rp ${Number(selectedSurat.nilai_jual_objek_pajak).toLocaleString("id-ID")}` : "-"}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1">Jumlah Pajak Terhutang</label>
                <div className="fw-semibold text-primary">Rp {Number(selectedSurat.jumlah_pajak_terhutang).toLocaleString("id-ID")}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1">Dusun</label>
                <div className="fw-semibold">{selectedSurat.nama_dusun || "-"}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1">Perangkat Desa</label>
                <div className="fw-semibold">{selectedSurat.nama_perangkat || "-"}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1">Waktu Dibuat</label>
                <div className="small">{formatToWIB(selectedSurat.waktu_dibuat)}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1">Waktu Diperbarui</label>
                <div className="small">{formatToWIB(selectedSurat.waktu_diperbarui)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
