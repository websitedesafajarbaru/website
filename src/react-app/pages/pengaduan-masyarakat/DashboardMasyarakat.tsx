import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Aduan } from "../../types"
import { formatToWIB } from "../../utils/time"

export function DashboardMasyarakat() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"daftar" | "buat" | "detail">("daftar")
  const [aduan, setAduan] = useState<Aduan[]>([])
  const [selectedAduan, setSelectedAduan] = useState<Aduan | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    judul: "",
    kategori: "",
    isi_aduan: "",
  })

  useEffect(() => {
    fetchAduan()
  }, [])

  const fetchAduan = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch("/api/aduan/saya", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAduan(data)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDetail = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/aduan/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedAduan(data)
        setActiveTab("detail")
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/aduan", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          judul: formData.judul,
          isi: formData.isi_aduan,
          kategori: formData.kategori,
        }),
      })

      if (response.ok) {
        setFormData({ judul: "", kategori: "", isi_aduan: "" })
        setActiveTab("daftar")
        fetchAduan()
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const filteredAduan = aduan.filter(
    (item) =>
      item.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kategori?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.isi_aduan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.isi?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusBadgeColor = (status: string) => {
    const colors: { [key: string]: string } = {
      menunggu: "warning",
      diproses: "info",
      selesai: "success",
      ditolak: "danger",
    }
    return colors[status?.toLowerCase()] || "secondary"
  }

  return (
    <div className="container-fluid p-4">
      <div className="dashboard-header">
        <div>
          <h2>Dashboard Pengaduan Masyarakat</h2>
          <p className="text-muted mb-0">
            Selamat datang, <strong>{user?.nama_lengkap || "User"}</strong>
          </p>
        </div>
        <div className="d-flex gap-2">
          {activeTab === "buat" && (
            <button className="btn btn-outline-primary" onClick={() => setActiveTab("daftar")}>
              <i className="bi bi-arrow-left me-2"></i>Kembali ke Daftar
            </button>
          )}
          {activeTab === "detail" && (
            <button className="btn btn-outline-primary" onClick={() => setActiveTab("daftar")}>
              <i className="bi bi-arrow-left me-2"></i>Kembali ke Daftar
            </button>
          )}
          {activeTab === "daftar" && (
            <button className="btn btn-primary" onClick={() => setActiveTab("buat")}>
              <i className="bi bi-plus-circle me-2"></i>Buat Aduan Baru
            </button>
          )}
        </div>
      </div>

      {activeTab === "daftar" && (
        <>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Memuat data aduan...</p>
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h5 className="mb-0">
                      <i className="bi bi-list-ul me-2"></i>
                      Daftar Aduan Anda
                    </h5>
                    <small className="text-muted">Total: {aduan.length} aduan</small>
                  </div>
                  <div className="col-md-4">
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-search"></i>
                      </span>
                      <input type="text" className="form-control" placeholder="Cari aduan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                {filteredAduan.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox display-1 text-muted"></i>
                    <h4 className="mt-3">Belum Ada Aduan</h4>
                    <p className="text-muted">Anda belum memiliki aduan. Buat aduan pertama Anda!</p>
                    <button className="btn btn-primary" onClick={() => setActiveTab("buat")}>
                      <i className="bi bi-plus-circle me-2"></i>Buat Aduan Baru
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Tanggal</th>
                          <th>Judul</th>
                          <th>Kategori</th>
                          <th>Status</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAduan.map((item) => (
                          <tr key={item.id} className="align-middle">
                            <td>
                              <small>{formatToWIB(item.created_at || item.waktu_dibuat)}</small>
                            </td>
                            <td>{item.judul}</td>
                            <td>{item.kategori}</td>
                            <td>
                              <span className={`badge bg-${statusBadgeColor(item.status)}`}>{item.status.toUpperCase()}</span>
                            </td>
                            <td>
                              <button className="btn btn-sm btn-outline-primary" onClick={() => fetchDetail(item.id)}>
                                <i className="bi bi-eye me-1"></i>Lihat Detail
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
          )}
        </>
      )}

      {activeTab === "buat" && (
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-plus-circle me-2"></i>
              Buat Aduan Baru
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">
                  <i className="bi bi-card-heading me-2"></i>
                  Judul Aduan *
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  placeholder="Masukkan judul aduan..."
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <i className="bi bi-tags me-2"></i>
                  Kategori *
                </label>
                <select className="form-select" value={formData.kategori} onChange={(e) => setFormData({ ...formData, kategori: e.target.value })} required>
                  <option value="">Pilih Kategori</option>
                  <option value="INFRASTRUKTUR">Infrastruktur</option>
                  <option value="PELAYANAN">Pelayanan Publik</option>
                  <option value="LINGKUNGAN">Lingkungan</option>
                  <option value="SOSIAL">Sosial Kemasyarakatan</option>
                  <option value="EKONOMI">Ekonomi</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <i className="bi bi-file-text me-2"></i>
                  Isi Aduan *
                </label>
                <textarea
                  className="form-control"
                  rows={6}
                  value={formData.isi_aduan}
                  onChange={(e) => setFormData({ ...formData, isi_aduan: e.target.value })}
                  placeholder="Jelaskan aduan Anda secara detail..."
                  required
                />
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setActiveTab("daftar")}>
                  <i className="bi bi-x-lg me-2"></i>Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-send me-2"></i>Kirim Aduan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === "detail" && selectedAduan && (
        <div className="card shadow-sm">
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
                <div className="col-md-4">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-tag-fill text-primary me-2 mt-1"></i>
                    <div>
                      <small className="text-muted d-block">Kategori</small>
                      <span>{selectedAduan.kategori}</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-info-circle-fill text-primary me-2 mt-1"></i>
                    <div>
                      <small className="text-muted d-block">Status</small>
                      <span className={`badge bg-${statusBadgeColor(selectedAduan.status)}`}>{selectedAduan.status.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-calendar-fill text-primary me-2 mt-1"></i>
                    <div>
                      <small className="text-muted d-block">Tanggal Dibuat</small>
                      <strong>{formatToWIB(selectedAduan.created_at || selectedAduan.waktu_dibuat)}</strong>
                    </div>
                  </div>
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
                    {selectedAduan.isi_aduan || selectedAduan.isi}
                  </p>
                </div>
              </div>
            </div>

            {selectedAduan.tanggapan && Array.isArray(selectedAduan.tanggapan) && selectedAduan.tanggapan.length > 0 && (
              <div className="p-4 border-bottom">
                <h6 className="mb-3">
                  <i className="bi bi-chat-left-text me-2"></i>
                  Tanggapan dari Perangkat Desa ({selectedAduan.tanggapan.length})
                </h6>
                <div className="timeline">
                  {selectedAduan.tanggapan
                    .slice()
                    .reverse()
                    .map((t: { id: string; nama_lengkap: string; waktu_dibuat: string; isi_tanggapan: string }, index: number) => (
                      <div key={t.id} className="mb-3">
                        <div className="card border-left-success">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="d-flex align-items-center">
                                <div
                                  className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                                  style={{ width: "32px", height: "32px", fontSize: "14px" }}
                                >
                                  {t.nama_lengkap.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <strong className="d-block">{t.nama_lengkap}</strong>
                                  <small className="text-muted">
                                    <i className="bi bi-clock me-1"></i>
                                    {formatToWIB(t.waktu_dibuat)}
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
              <div className="row">
                <div className="col-md-6">
                  <small className="text-muted d-block mb-1">
                    <i className="bi bi-calendar-plus me-1"></i>
                    Dibuat
                  </small>
                  <strong>{formatToWIB(selectedAduan.created_at || selectedAduan.waktu_dibuat)}</strong>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block mb-1">
                    <i className="bi bi-calendar-check me-1"></i>
                    Terakhir Update
                  </small>
                  <strong>{formatToWIB(selectedAduan.updated_at || selectedAduan.waktu_diperbarui)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
