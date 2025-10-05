import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { SuratPBB } from "../../types"
import { formatStatusPembayaran, getStatusPembayaranColor } from "../../utils/formatters"

export function DashboardKetuaRT() {
  const { token, user } = useAuth()
  const [suratPBB, setSuratPBB] = useState<SuratPBB[]>([])
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear())
  const [dusunId, setDusunId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedSurat, setSelectedSurat] = useState<SuratPBB | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showStatistics, setShowStatistics] = useState(false)
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
        }
      } catch (err) {
        console.error(err)
      }
    }

    loadDusunInfo()
  }, [user, token, fetchActiveYear])

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
    fetchSuratPBB()
  }, [fetchSuratPBB])

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

  const totalPajakTerhutang = suratPBB.reduce((sum, s) => sum + Number(s.jumlah_pajak_terhutang), 0)
  const totalPajakDibayar = suratPBB
    .filter((s) => s.status_pembayaran === "bayar_sendiri_di_bank" || s.status_pembayaran === "bayar_lewat_perangkat_desa")
    .reduce((sum, s) => sum + Number(s.jumlah_pajak_terhutang), 0)
  const totalSurat = suratPBB.length
  const totalSuratDibayar = suratPBB.filter((s) => s.status_pembayaran === "bayar_sendiri_di_bank" || s.status_pembayaran === "bayar_lewat_perangkat_desa").length
  const totalSuratBelumBayar = totalSurat - totalSuratDibayar
  const persentasePembayaran = totalSurat > 0 ? (totalSuratDibayar / totalSurat) * 100 : 0

  const filteredSuratPBB = suratPBB.filter((surat) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      surat.nomor_objek_pajak.toLowerCase().includes(searchLower) ||
      surat.nama_wajib_pajak.toLowerCase().includes(searchLower) ||
      (surat.alamat_objek_pajak || "").toLowerCase().includes(searchLower) ||
      surat.tahun_pajak.toString().includes(searchLower) ||
      surat.jumlah_pajak_terhutang.toString().includes(searchLower) ||
      formatStatusPembayaran(surat.status_pembayaran).toLowerCase().includes(searchLower)
    )
  })

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
                        <div className="h4 mb-0 text-primary">Rp {totalPajakTerhutang.toLocaleString("id-ID")}</div>
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
                        <div className="h4 mb-0 text-success">Rp {totalPajakDibayar.toLocaleString("id-ID")}</div>
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
                        <div className="h4 mb-0 text-info">{persentasePembayaran.toFixed(1)}%</div>
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
                        <div className="h4 mb-0 text-secondary">{totalSurat}</div>
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
                        <div className="h4 mb-0 text-success">{totalSuratDibayar}</div>
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
                        <div className="h4 mb-0 text-warning">{totalSuratBelumBayar}</div>
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
          <div className="mb-3">
            <input type="text" className="form-control" placeholder="Cari surat PBB..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          {filteredSuratPBB.length === 0 ? (
            <div className="p-4 text-center text-muted">
              <i className="bi bi-inbox" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
              <p className="mt-2 mb-0">{searchTerm ? "Tidak ada surat PBB yang cocok dengan pencarian" : "Belum ada surat PBB yang terdaftar"}</p>
            </div>
          ) : (
            <div className="table-responsive mx-auto" style={{ maxHeight: "500px", overflowY: "auto", maxWidth: "100%" }}>
              <table className="table table-hover">
                <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <tr>
                    <th>NOP</th>
                    <th>Nama Wajib Pajak</th>
                    <th>Alamat</th>
                    <th>Tahun</th>
                    <th>Jumlah Pajak</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuratPBB.map((s) => (
                    <tr key={s.id}>
                      <td>{s.nomor_objek_pajak}</td>
                      <td>{s.nama_wajib_pajak}</td>
                      <td>{s.alamat_objek_pajak}</td>
                      <td>{s.tahun_pajak}</td>
                      <td>Rp {Number(s.jumlah_pajak_terhutang).toLocaleString("id-ID")}</td>
                      <td>
                        <span className={`badge bg-${getStatusPembayaranColor(s.status_pembayaran)}`}>{formatStatusPembayaran(s.status_pembayaran)}</span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleSuratClick(s)}>
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
      ) : showForm ? (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Tambah Surat PBB Baru</h6>
            <button className="btn btn-sm btn-secondary" onClick={() => setShowForm(false)}>
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
                    <option value="sudah_bayar">Sudah Bayar</option>
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
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : selectedSurat ? (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Detail Surat PBB - {selectedSurat.nomor_objek_pajak}</h6>
            <button className="btn btn-sm btn-secondary" onClick={() => setSelectedSurat(null)}>
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
      ) : null}
    </div>
  )
}
