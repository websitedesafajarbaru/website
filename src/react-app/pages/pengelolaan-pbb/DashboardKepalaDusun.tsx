import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { SuratPBB } from "../../types"
import { formatStatusPembayaran, getStatusPembayaranColor } from "../../utils/formatters"

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
  const [activeTab, setActiveTab] = useState("ketua-rt")
  const [suratPBB, setSuratPBB] = useState<SuratPBB[]>([])
  const [ketuaRT, setKetuaRT] = useState<PerangkatDesa[]>([])
  const [dusunInfo, setDusunInfo] = useState<DusunInfo | null>(null)
  const [dusunId, setDusunId] = useState<number | null>(null)
  const [statistik, setStatistik] = useState<DusunStatistik | null>(null)
  const [selectedSurat, setSelectedSurat] = useState<SuratPBB | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear())

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

      if (activeTab === "surat-pbb") {
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

  const handleSuratClick = (surat: SuratPBB) => {
    setSelectedSurat(surat)
    setShowDetailModal(true)
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Dashboard Kepala Dusun</h2>
          {dusunInfo && (
            <p className="text-muted mb-0">
              <i className="bi bi-geo-alt me-2"></i>
              {dusunInfo.nama_dusun}
            </p>
          )}
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
          <button className={`nav-link ${activeTab === "surat-pbb" ? "active" : ""}`} onClick={() => setActiveTab("surat-pbb")} style={{ border: "none", fontSize: "0.9rem" }}>
            <i className="bi bi-file-text me-2"></i>Surat PBB
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "laporan" ? "active" : ""}`} onClick={() => setActiveTab("laporan")} style={{ border: "none", fontSize: "0.9rem" }}>
            <i className="bi bi-bar-chart me-2"></i>Laporan
          </button>
        </li>
      </ul>

      {activeTab === "ketua-rt" && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              <i className="bi bi-people me-2"></i>Daftar Ketua RT di {dusunInfo?.nama_dusun || "Dusun Ini"}
            </h6>
          </div>
          <div className="card-body p-0">
            {ketuaRT.length === 0 ? (
              <div className="p-4 text-center text-muted">
                <i className="bi bi-inbox" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
                <p className="mt-2 mb-0">Belum ada Ketua RT yang terdaftar di dusun ini</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama Lengkap</th>
                      <th>Username</th>
                      <th>Jabatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ketuaRT.map((ketua, index) => (
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
          </div>
        </div>
      )}

      {activeTab === "surat-pbb" && (
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="bi bi-file-text me-2"></i>Daftar Surat PBB di {dusunInfo?.nama_dusun || "Dusun Ini"}
            </h6>
          </div>
          <div className="card-body p-0">
            {suratPBB.length === 0 ? (
              <div className="p-4 text-center text-muted">
                <i className="bi bi-inbox" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
                <p className="mt-2 mb-0">Belum ada surat PBB yang terdaftar</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>NOP</th>
                      <th>Nama Wajib Pajak</th>
                      <th>Alamat</th>
                      <th>Tahun</th>
                      <th>Jumlah Pajak</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suratPBB.map((s) => (
                      <tr key={s.id}>
                        <td>{s.nomor_objek_pajak}</td>
                        <td>{s.nama_wajib_pajak}</td>
                        <td>{s.alamat_objek_pajak}</td>
                        <td>{s.tahun_pajak}</td>
                        <td>Rp {Number(s.jumlah_pajak_terhutang).toLocaleString("id-ID")}</td>
                        <td>
                          <span className={`badge bg-${getStatusPembayaranColor(s.status_pembayaran)}`}>{formatStatusPembayaran(s.status_pembayaran)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "laporan" && statistik && (
        <div>
          {/* Statistik Cards */}
          <div className="row g-3 mb-4">
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

          {/* Tabel Surat PBB */}
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-file-text me-2"></i>Daftar Surat PBB
              </h6>
            </div>
            <div className="card-body p-0">
              {statistik.surat_pbb.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <i className="bi bi-inbox" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
                  <p className="mt-2 mb-0">Belum ada surat PBB yang terdaftar</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table table-hover mb-0">
                    <thead>
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
                      {statistik.surat_pbb.map((surat) => (
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
                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleSuratClick(surat)}>
                              <i className="bi bi-eye me-1"></i>Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Surat */}
      {showDetailModal && selectedSurat && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <div>
                  <h5 className="modal-title mb-1">Detail Surat PBB</h5>
                  <small className="opacity-75">NOP: {selectedSurat.nomor_objek_pajak}</small>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body">
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
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
