import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
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

export function DetailDusunLaporan() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState<"daftar" | "detail-surat">("daftar")
  const [statistik, setStatistik] = useState<DusunStatistik | null>(null)
  const [selectedSurat, setSelectedSurat] = useState<SuratPBB | null>(null)
  const [loading, setLoading] = useState(true)
  const [tokens, setTokens] = useState<{ tokenKepalaDusun: string; tokenKetuaRT: string } | null>(null)

  useEffect(() => {
    const fetchStatistik = async () => {
      if (!id) return
      try {
        setLoading(true)
        const response = await fetch(`/api/statistik/dusun/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (response.ok) {
          setStatistik(data)
        } else {
          alert("Gagal mengambil data dusun")
        }
        const tokenRes = await fetch(`/api/dusun/${id}/tokens`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const tokenData = await tokenRes.json()
        if (tokenRes.ok) {
          setTokens(tokenData)
        } else {
          setTokens(null)
        }
      } catch (err) {
        console.error(err)
        alert("Terjadi kesalahan")
      } finally {
        setLoading(false)
      }
    }
    fetchStatistik()
  }, [id, token])

  const handleSuratClick = (surat: SuratPBB) => {
    setSelectedSurat(surat)
    setActiveTab("detail-surat")
  }

  if (loading) {
    return (
      <div className="container-wide">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!statistik) {
    return (
      <div className="container-wide">
        <div className="alert alert-danger">Data tidak ditemukan</div>
      </div>
    )
  }

  return (
    <div className="container-wide">
      {activeTab === "daftar" && (
        <>
          <div className="dashboard-header">
            <div>
              <h2>Laporan {statistik.dusun.nama_dusun}</h2>
              <p className="text-muted mb-0 small">Detail statistik dan daftar surat PBB</p>
            </div>
            <div className="text-end">
              <div className="badge bg-primary fs-6">
                <i className="bi bi-calendar me-1"></i>Tahun {statistik.active_year || new Date().getFullYear()}
              </div>
              <div className="small text-muted mt-1">Data yang ditampilkan untuk tahun {statistik.active_year || new Date().getFullYear()}</div>
            </div>
          </div>
          {tokens && (
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="card border-info">
                  <div className="card-body py-2">
                    <div className="small text-muted mb-1">Token Kepala Dusun</div>
                    <div className="font-monospace fw-bold text-info" style={{ wordBreak: "break-all" }}>
                      {tokens.tokenKepalaDusun || "-"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-warning">
                  <div className="card-body py-2">
                    <div className="small text-muted mb-1">Token Ketua RT</div>
                    <div className="font-monospace fw-bold text-warning" style={{ wordBreak: "break-all" }}>
                      {tokens.tokenKetuaRT || "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="bi bi-file-text me-2"></i>Daftar Surat PBB
              </h6>
              <button className="btn btn-sm btn-secondary" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left me-1"></i>Kembali ke Laporan
              </button>
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
        </>
      )}

      {activeTab === "detail-surat" && selectedSurat && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Detail Surat PBB - {selectedSurat.nomor_objek_pajak}</h6>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab("daftar")}>
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
