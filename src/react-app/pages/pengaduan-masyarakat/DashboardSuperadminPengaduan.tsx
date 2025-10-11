import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Aduan } from "../../types"

export function DashboardSuperadminPengaduan() {
  const { apiRequest } = useAuth()
  const [aduan, setAduan] = useState<Aduan[]>([])
  const [selectedAduan, setSelectedAduan] = useState<Aduan | null>(null)
  const [tanggapan, setTanggapan] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"daftar" | "detail">("daftar")

  const fetchAduan = useCallback(async () => {
    try {
      setLoading(true)
      const url = statusFilter ? `/api/aduan?status=${statusFilter}` : "/api/aduan"
      const result = await apiRequest<Aduan[]>(url)
      setAduan(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, apiRequest])

  useEffect(() => {
    fetchAduan()
  }, [fetchAduan])

  const fetchDetail = async (id: string) => {
    try {
      const result = await apiRequest<Aduan>(`/api/aduan/${id}`)
      setSelectedAduan(result)
      setTanggapan("")
      setActiveTab("detail")
    } catch (err) {
      console.error(err)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiRequest(`/api/aduan/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      })
      alert("Status berhasil diperbarui")
      fetchAduan()
      if (selectedAduan?.id === id) {
        fetchDetail(id)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const submitTanggapan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAduan) return

    try {
      await apiRequest(`/api/aduan/${selectedAduan.id}/tanggapan`, {
        method: "POST",
        body: JSON.stringify({ isi_tanggapan: tanggapan }),
      })
      alert("Tanggapan berhasil dikirim")
      setTanggapan("")
      fetchDetail(selectedAduan.id)
      fetchAduan()
    } catch (err) {
      console.error(err)
    }
  }

  const statusBadgeColor = (status: string) => {
    switch (status) {
      case "selesai":
        return "success"
      case "diproses":
        return "warning"
      default:
        return "secondary"
    }
  }

  const kategoriBadgeColor = (kategori: string) => {
    switch (kategori) {
      case "Infrastruktur":
        return "primary"
      case "Lingkungan":
        return "success"
      case "Pelayanan":
        return "info"
      case "Keamanan":
        return "danger"
      default:
        return "secondary"
    }
  }

  return (
    <div className="container-wide">
      <div className="dashboard-header">
        <div>
          <h2>Dashboard Superadmin Pengaduan</h2>
          <p className="text-muted mb-0">Kelola semua aduan masyarakat</p>
        </div>
        <div className="d-flex gap-2">
          {activeTab === "detail" && (
            <button className="btn btn-outline-primary" onClick={() => setActiveTab("daftar")}>
              <i className="bi bi-arrow-left me-2"></i>Kembali ke Daftar
            </button>
          )}
        </div>
      </div>

      {activeTab === "daftar" && (
        <>
          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <div className="card">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small">Total Aduan</div>
                      <div className="h4 mb-0">{aduan.length}</div>
                    </div>
                    <i className="bi bi-inbox text-muted" style={{ fontSize: "2rem" }}></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small">Baru</div>
                      <div className="h4 mb-0 text-secondary">{aduan.filter((a) => a.status === "baru").length}</div>
                    </div>
                    <i className="bi bi-inbox-fill text-secondary" style={{ fontSize: "2rem" }}></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small">Diproses</div>
                      <div className="h4 mb-0 text-warning">{aduan.filter((a) => a.status === "diproses").length}</div>
                    </div>
                    <i className="bi bi-hourglass-split text-warning" style={{ fontSize: "2rem" }}></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small">Selesai</div>
                      <div className="h4 mb-0 text-success">{aduan.filter((a) => a.status === "selesai").length}</div>
                    </div>
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "2rem" }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-body p-3">
              <div className="row align-items-center g-2">
                <div className="col-md-3">
                  <label className="form-label small mb-1">Filter Status</label>
                  <select className="form-select form-select-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">Semua Status</option>
                    <option value="baru">Baru</option>
                    <option value="diproses">Sedang Diproses</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
                <div className="col-md-9 text-end">
                  <button className="btn btn-sm btn-outline-secondary" onClick={fetchAduan}>
                    <i className="bi bi-arrow-clockwise me-1"></i>Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : aduan.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-inbox" style={{ fontSize: "3rem", color: "#ccc" }}></i>
                <h4 className="mt-3">Tidak Ada Aduan</h4>
                <p className="text-muted">Belum ada aduan yang masuk</p>
              </div>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ minWidth: "50px" }}>No</th>
                    <th style={{ minWidth: "250px" }}>Judul Aduan</th>
                    <th style={{ minWidth: "180px" }}>Pelapor</th>
                    <th style={{ minWidth: "150px" }}>Kategori</th>
                    <th style={{ minWidth: "120px" }}>Status</th>
                    <th style={{ minWidth: "150px" }}>Tanggal Dibuat</th>
                    <th style={{ minWidth: "300px", textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {aduan.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <strong>{item.judul}</strong>
                      </td>
                      <td>{item.nama_lengkap}</td>
                      <td>
                        <span className={`badge bg-${kategoriBadgeColor(item.kategori)}`}>{item.kategori}</span>
                      </td>
                      <td>
                        <span className={`badge bg-${statusBadgeColor(item.status)}`}>{item.status.toUpperCase()}</span>
                      </td>
                      <td>{new Date(item.waktu_dibuat).toLocaleDateString("id-ID")}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-sm btn-primary" onClick={() => fetchDetail(item.id)}>
                            <i className="bi bi-eye me-1"></i>Lihat
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === "detail" && selectedAduan && (
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-file-text me-2"></i>
              Detail Aduan
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="p-4 border-bottom bg-light">
              <h4 className="mb-3">{selectedAduan.judul}</h4>
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-person-fill text-primary me-2 mt-1"></i>
                    <div>
                      <small className="text-muted d-block">Pelapor</small>
                      <strong>{selectedAduan.nama_lengkap}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-tag-fill text-primary me-2 mt-1"></i>
                    <div>
                      <small className="text-muted d-block">Kategori</small>
                      <span className={`badge bg-${kategoriBadgeColor(selectedAduan.kategori)}`}>{selectedAduan.kategori}</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-calendar-fill text-primary me-2 mt-1"></i>
                    <div>
                      <small className="text-muted d-block">Tanggal</small>
                      <strong>
                        {new Date(selectedAduan.waktu_dibuat).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-info-circle-fill text-primary me-2 mt-1"></i>
                    <div>
                      <small className="text-muted d-block">Status</small>
                      <span className={`badge bg-${statusBadgeColor(selectedAduan.status)}`}>{selectedAduan.status.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-bottom">
              <h6 className="mb-3">
                <i className="bi bi-pencil-square me-2"></i>
                Ubah Status Aduan
              </h6>
              <div className="row align-items-center">
                <div className="col-md-4">
                  <select className="form-select" value={selectedAduan.status} onChange={(e) => updateStatus(selectedAduan.id, e.target.value)}>
                    <option value="baru">Baru</option>
                    <option value="diproses">Sedang Diproses</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
                <div className="col-md-8">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Status akan diperbarui otomatis setelah memilih
                  </small>
                </div>
              </div>
            </div>

            <div className="p-4 border-bottom">
              <h6 className="mb-3">
                <i className="bi bi-file-earmark-text me-2"></i>
                Isi Aduan
              </h6>
              <div className="card bg-light">
                <div className="card-body">
                  <p className="mb-0" style={{ whiteSpace: "pre-wrap", lineHeight: "1.8" }}>
                    {selectedAduan.isi}
                  </p>
                </div>
              </div>
            </div>

            {selectedAduan.tanggapan && Array.isArray(selectedAduan.tanggapan) && selectedAduan.tanggapan.length > 0 && (
              <div className="p-4 border-bottom">
                <h6 className="mb-3">
                  <i className="bi bi-chat-left-text me-2"></i>
                  Riwayat Tanggapan ({selectedAduan.tanggapan.length})
                </h6>
                <div className="timeline">
                  {selectedAduan.tanggapan.map((t: { id: string; nama_lengkap: string; waktu_dibuat: string; isi_tanggapan: string }, index: number) => (
                    <div key={t.id} className="mb-3">
                      <div className="card border-left-primary">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex align-items-center">
                              <div
                                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                                style={{ width: "32px", height: "32px", fontSize: "14px" }}
                              >
                                {t.nama_lengkap.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <strong className="d-block">{t.nama_lengkap}</strong>
                                <small className="text-muted">
                                  <i className="bi bi-clock me-1"></i>
                                  {new Date(t.waktu_dibuat).toLocaleString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </small>
                              </div>
                            </div>
                            <span className="badge bg-success">Tanggapan #{index + 1}</span>
                          </div>
                          <p className="mb-0 mt-2" style={{ whiteSpace: "pre-wrap", lineHeight: "1.8" }}>
                            {t.isi_tanggapan}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-light">
              <h6 className="mb-3">
                <i className="bi bi-plus-circle me-2"></i>
                Tambah Tanggapan Baru
              </h6>
              <form onSubmit={submitTanggapan}>
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    value={tanggapan}
                    onChange={(e) => setTanggapan(e.target.value)}
                    required
                    rows={5}
                    placeholder="Tulis tanggapan Anda di sini..."
                    style={{ resize: "vertical" }}
                  />
                  <small className="text-muted mt-1 d-block">
                    <i className="bi bi-info-circle me-1"></i>
                    Tanggapan akan dikirimkan kepada pelapor
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-send me-2"></i>Kirim Tanggapan
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setTanggapan("")}>
                    <i className="bi bi-x-circle me-2"></i>Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
