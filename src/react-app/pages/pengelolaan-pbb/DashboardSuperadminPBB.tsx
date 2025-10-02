import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Dusun, SuratPBB, Laporan } from "../../types"
import { formatStatusPembayaran, getStatusPembayaranColor } from "../../utils/formatters"

interface PerangkatDesa {
  id: string
  nama_lengkap: string
  username: string
  id_dusun?: number
  jabatan: "kepala_dusun" | "ketua_rt"
}

interface DusunDetail extends Dusun {
  token_kepala_dusun: string
  token_ketua_rt: string
  perangkat_desa?: PerangkatDesa[]
  total_perangkat_desa?: number
}

export function DashboardSuperadminPBB() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"dusun" | "surat" | "laporan" | "tambah-dusun" | "tambah-surat" | "detail-dusun" | "detail-perangkat" | "detail-surat">("dusun")
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

  const [selectedDusun, setSelectedDusun] = useState<DusunDetail | null>(null)
  const [dusunTokens, setDusunTokens] = useState<{ tokenKepalaDusun: string; tokenKetuaRT: string } | null>(null)
  const [selectedPerangkat, setSelectedPerangkat] = useState<PerangkatDesa | null>(null)
  const [selectedSurat, setSelectedSurat] = useState<SuratPBB | null>(null)
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear())
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [editingDusun, setEditingDusun] = useState<number | null>(null)
  const [editDusunName, setEditDusunName] = useState<string>("")
  const [perangkatForm, setPerangkatForm] = useState({
    nama_lengkap: "",
    username: "",
    password: "",
    id_dusun: "",
    jabatan: "",
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
        alert(error.message || "Gagal mengatur tahun aktif")
      }
    } catch (error) {
      console.error("Error setting active year:", error)
      alert("Terjadi kesalahan saat mengatur tahun aktif")
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
        setActiveTab("detail-dusun")
        const tokenRes = await fetch(`/api/dusun/${dusunId}/tokens`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const tokenData = await tokenRes.json()
        if (tokenRes.ok) {
          setDusunTokens(tokenData)
        } else {
          setDusunTokens(null)
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

  const openSuratDetail = (surat: SuratPBB) => {
    setSelectedSurat(surat)
    setActiveTab("detail-surat")
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
        const result = await response.json()
        alert(
          `Dusun berhasil ditambahkan!\n\nToken Kepala Dusun: ${result.tokenKepalaDusun}\nToken Ketua RT: ${result.tokenKetuaRT}\n\nSimpan token ini untuk registrasi perangkat desa!`
        )
      } else {
        const error = await response.json()
        alert(error.message || "Gagal menambahkan dusun")
      }
    } catch (err) {
      console.error(err)
      alert("Terjadi kesalahan")
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
        alert("Surat PBB berhasil ditambahkan!")
      } else {
        const error = await response.json()
        alert(error.message || "Gagal menambahkan surat PBB")
      }
    } catch (err) {
      console.error(err)
      alert("Terjadi kesalahan")
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
        alert("Data perangkat desa berhasil diperbarui!")
        setActiveTab("detail-dusun")
        if (selectedDusun) {
          openDusunDetail(selectedDusun.id)
        }
      } else {
        const error = await response.json()
        alert(error.message || "Gagal memperbarui data perangkat desa")
      }
    } catch (err) {
      console.error(err)
      alert("Terjadi kesalahan")
    }
  }

  const deletePerangkatDesa = async () => {
    if (!selectedPerangkat) return

    const confirmation = confirm(`Apakah Anda yakin ingin menghapus perangkat desa "${selectedPerangkat.nama_lengkap}"? Tindakan ini tidak dapat dibatalkan.`)
    if (!confirmation) return

    try {
      const response = await fetch(`/api/perangkat-desa/${selectedPerangkat.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        alert("Perangkat desa berhasil dihapus!")
        setActiveTab("detail-dusun")
        if (selectedDusun) {
          openDusunDetail(selectedDusun.id)
        }
      } else {
        const error = await response.json()
        alert(error.message || "Gagal menghapus perangkat desa")
      }
    } catch (err) {
      console.error(err)
      alert("Terjadi kesalahan")
    }
  }

  const startEditDusun = (dusun: Dusun) => {
    setEditingDusun(dusun.id)
    setEditDusunName(dusun.nama_dusun)
  }

  const cancelEditDusun = () => {
    setEditingDusun(null)
    setEditDusunName("")
  }

  const saveEditDusun = async (dusunId: number) => {
    if (!editDusunName.trim()) {
      alert("Nama dusun tidak boleh kosong")
      return
    }

    try {
      const response = await fetch(`/api/dusun/${dusunId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nama_dusun: editDusunName.trim() }),
      })

      if (response.ok) {
        alert("Nama dusun berhasil diperbarui!")
        setEditingDusun(null)
        setEditDusunName("")
        fetchDusun()
      } else {
        const error = await response.json()
        alert(error.message || "Gagal memperbarui nama dusun")
      }
    } catch (err) {
      console.error(err)
      alert("Terjadi kesalahan")
    }
  }

  return (
    <div className="container-wide">
      <div className="dashboard-header">
        <div>
          <h2>Dashboard Pengelolaan PBB</h2>
          <p className="text-muted mb-0 small">Superadmin</p>
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
            <i className="bi bi-building me-2"></i>Dusun
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "surat" ? "active" : ""}`} onClick={() => setActiveTab("surat")} style={{ border: "none", fontSize: "0.9rem" }}>
            <i className="bi bi-file-text me-2"></i>Surat PBB
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "laporan" ? "active" : ""}`} onClick={() => setActiveTab("laporan")} style={{ border: "none", fontSize: "0.9rem" }}>
            <i className="bi bi-bar-chart me-2"></i>Laporan
          </button>
        </li>
      </ul>

      {activeTab === "dusun" && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Daftar Dusun</h6>
            <button className="btn btn-sm btn-primary" onClick={() => setActiveTab("tambah-dusun")}>
              <i className="bi bi-plus-circle me-1"></i>Tambah Dusun
            </button>
          </div>
          <div className="card-body p-0">
            <div className="table-container">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>
                      Nama Dusun
                      <i className="bi bi-pencil-square ms-1 text-muted" style={{ fontSize: "0.8rem" }} title="Klik ikon pensil untuk edit"></i>
                    </th>
                    <th>Kepala Dusun</th>
                    <th>Total Perangkat Desa</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {dusun.map((d) => (
                    <tr key={d.id}>
                      <td>
                        {editingDusun === d.id ? (
                          <div className="d-flex gap-1 align-items-center">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={editDusunName}
                              onChange={(e) => setEditDusunName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  saveEditDusun(d.id)
                                } else if (e.key === "Escape") {
                                  cancelEditDusun()
                                }
                              }}
                              style={{ minWidth: "120px" }}
                              autoFocus
                            />
                            <button className="btn btn-sm btn-success" onClick={() => saveEditDusun(d.id)} title="Simpan perubahan">
                              <i className="bi bi-check"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-secondary" onClick={cancelEditDusun} title="Batal edit">
                              <i className="bi bi-x"></i>
                            </button>
                          </div>
                        ) : (
                          <div className="d-flex gap-1 align-items-center">
                            <span>{d.nama_dusun}</span>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => startEditDusun(d)} title="Edit nama dusun">
                              <i className="bi bi-pencil"></i>
                            </button>
                          </div>
                        )}
                      </td>
                      <td>{d.nama_kepala_dusun || "Belum ada"}</td>
                      <td>
                        <span className="badge bg-info">
                          <i className="bi bi-people me-1"></i>
                          {d.total_perangkat_desa || 0} Orang
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-primary" onClick={() => openDusunDetail(d.id)}>
                          <i className="bi bi-eye me-1"></i>Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "surat" && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Daftar Surat PBB</h6>
            <button className="btn btn-sm btn-primary" onClick={() => setActiveTab("tambah-surat")}>
              <i className="bi bi-plus-circle me-1"></i>Tambah Surat
            </button>
          </div>
          <div className="card-body p-0">
            <div className="table-container">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>NOP</th>
                    <th>Nama Wajib Pajak</th>
                    <th>Dusun</th>
                    <th>Tahun</th>
                    <th>Jumlah Pajak</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {suratPBB.map((s) => (
                    <tr key={s.id}>
                      <td className="font-monospace small">{s.nomor_objek_pajak}</td>
                      <td>{s.nama_wajib_pajak}</td>
                      <td>{s.nama_dusun}</td>
                      <td>{s.tahun_pajak}</td>
                      <td>Rp {Number(s.jumlah_pajak_terhutang).toLocaleString("id-ID")}</td>
                      <td>
                        <span className={`badge bg-${getStatusPembayaranColor(s.status_pembayaran)}`}>{formatStatusPembayaran(s.status_pembayaran)}</span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openSuratDetail(s)}>
                          <i className="bi bi-eye me-1"></i>Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "laporan" && laporan && (
        <div>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card border-primary h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h6 className="text-primary mb-1">Total Dusun</h6>
                      <h3 className="mb-0">{laporan.statistik_per_dusun.length}</h3>
                    </div>
                    <div className="text-primary fs-3">
                      <i className="bi bi-building"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-info h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h6 className="text-info mb-1">Total Surat PBB</h6>
                      <h3 className="mb-0">{laporan.total_surat_keseluruhan}</h3>
                    </div>
                    <div className="text-info fs-3">
                      <i className="bi bi-people"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-success h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h6 className="text-success mb-1">Total Pajak Dibayar</h6>
                      <h3 className="mb-0">Rp {Number(laporan.total_pajak_dibayar_keseluruhan).toLocaleString("id-ID")}</h3>
                    </div>
                    <div className="text-success fs-3">
                      <i className="bi bi-file-text"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-bar-chart me-2"></i>Statistik Per Dusun
              </h6>
            </div>
            <div className="card-body p-0">
              <div className="table-container">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Dusun</th>
                      <th>Total Surat</th>
                      <th>Status Pembayaran</th>
                      <th>Pajak Terhutang</th>
                      <th>Pajak Dibayar</th>
                      <th>Persentase</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {laporan.statistik_per_dusun.map((stat) => (
                      <tr key={stat.id} style={{ cursor: "pointer" }}>
                        <td>{stat.nama_dusun}</td>
                        <td>
                          <span className="badge bg-info">
                            <i className="bi bi-file-text me-1"></i>
                            {stat.total_surat || 0}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1 flex-wrap">
                            <span className="badge bg-success">
                              <i className="bi bi-check-circle me-1"></i>
                              {stat.total_surat_dibayar || 0} Dibayar
                            </span>
                            <span className="badge bg-warning">
                              <i className="bi bi-clock me-1"></i>
                              {stat.total_surat_belum_bayar || 0} Belum
                            </span>
                          </div>
                        </td>
                        <td>Rp {Number(stat.total_pajak_terhutang || 0).toLocaleString("id-ID")}</td>
                        <td>Rp {Number(stat.total_pajak_dibayar || 0).toLocaleString("id-ID")}</td>
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
                          <button className="btn btn-sm btn-primary" onClick={() => navigate(`/dashboard/pbb/laporan/dusun/${stat.id}`)}>
                            <i className="bi bi-eye me-1"></i>Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "tambah-dusun" && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Tambah Dusun Baru</h6>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab("dusun")}>
              <i className="bi bi-arrow-left me-1"></i>Kembali ke Daftar
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
                  <i className="bi bi-save me-1"></i>Simpan
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
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Tambah Surat PBB Baru</h6>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab("surat")}>
              <i className="bi bi-arrow-left me-1"></i>Kembali ke Daftar
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateSurat}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Dusun <span className="text-danger">*</span>
                  </label>
                  <select className="form-select" value={suratForm.dusun_id} onChange={(e) => setSuratForm({ ...suratForm, dusun_id: e.target.value })} required>
                    <option value="">Pilih Dusun</option>
                    {dusun.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nama_dusun}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Nomor Objek Pajak <span className="text-danger">*</span>
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
                  <label className="form-label">
                    Alamat Wajib Pajak <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={suratForm.alamat_wajib_pajak}
                    onChange={(e) => setSuratForm({ ...suratForm, alamat_wajib_pajak: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">
                    Alamat Objek Pajak <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
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
                    Nilai Jual Objek Pajak <span className="text-danger">*</span>
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
                <div className="col-md-6">
                  <label className="form-label">
                    Status Pembayaran <span className="text-danger">*</span>
                  </label>
                  <select className="form-select" value={suratForm.status_pembayaran} onChange={(e) => setSuratForm({ ...suratForm, status_pembayaran: e.target.value })} required>
                    <option value="belum_bayar">Belum Bayar</option>
                    <option value="sudah_bayar">Sudah Bayar</option>
                    <option value="tidak_diketahui">Tidak Diketahui</option>
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-save me-1"></i>Simpan
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab("surat")}>
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
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab("dusun")}>
              <i className="bi bi-arrow-left me-1"></i>Kembali ke Daftar
            </button>
          </div>
          <div className="card-body">
            <div className="row g-4">
              <div className="col-12">
                <div className="card border-primary mb-3">
                  <div className="card-header bg-primary text-white">
                    <h6 className="mb-0">
                      <i className="bi bi-info-circle me-2"></i>Informasi Dusun
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <strong>Nama Dusun:</strong>
                        <p className="mb-0">{selectedDusun.nama_dusun}</p>
                      </div>
                      <div className="col-md-6">
                        <strong>Kepala Dusun:</strong>
                        <p className="mb-0">{selectedDusun.nama_kepala_dusun || "Belum ada"}</p>
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
                  </div>
                </div>
                {dusunTokens && (
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="card border-info">
                        <div className="card-body py-2">
                          <div className="small text-muted mb-1">Token Kepala Dusun</div>
                          <div className="font-monospace fw-bold text-info" style={{ wordBreak: "break-all" }}>
                            {dusunTokens.tokenKepalaDusun || "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card border-warning">
                        <div className="card-body py-2">
                          <div className="small text-muted mb-1">Token Ketua RT</div>
                          <div className="font-monospace fw-bold text-warning" style={{ wordBreak: "break-all" }}>
                            {dusunTokens.tokenKetuaRT || "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">
                      <i className="bi bi-people me-2"></i>Daftar Perangkat Desa
                    </h6>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-container">
                      <table className="table table-hover mb-0">
                        <thead>
                          <tr>
                            <th>Nama Lengkap</th>
                            <th>Username</th>
                            <th>Jabatan</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDusun.perangkat_desa?.map((perangkat) => (
                            <tr key={perangkat.id}>
                              <td>{perangkat.nama_lengkap}</td>
                              <td>{perangkat.username}</td>
                              <td>
                                <span className={`badge bg-${perangkat.jabatan === "kepala_dusun" ? "success" : "warning"}`}>
                                  {perangkat.jabatan === "kepala_dusun" ? "Kepala Dusun" : "Ketua RT"}
                                </span>
                              </td>
                              <td>
                                <button className="btn btn-sm btn-primary" onClick={() => openPerangkatDetail(perangkat)}>
                                  <i className="bi bi-pencil me-1"></i>Edit
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
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
              <i className="bi bi-arrow-left me-1"></i>Kembali ke Detail Dusun
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
                  <i className="bi bi-save me-1"></i>Simpan Perubahan
                </button>
                <button type="button" className="btn btn-danger" onClick={deletePerangkatDesa}>
                  <i className="bi bi-trash me-1"></i>Hapus
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
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab("surat")}>
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
                <div className="small">{new Date(selectedSurat.waktu_dibuat).toLocaleString("id-ID")}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1">Waktu Diperbarui</label>
                <div className="small">{new Date(selectedSurat.waktu_diperbarui).toLocaleString("id-ID")}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
