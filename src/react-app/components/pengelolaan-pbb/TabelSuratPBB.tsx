import { SuratPBB } from "../../types"
import { formatStatusPembayaran, getStatusPembayaranColor } from "../../utils/formatters"
import { useState } from "react"

interface TabelSuratPBBProps {
  suratPBB: SuratPBB[]
  searchTerm: string
  onSearchChange: (value: string) => void
  onSuratClick: (surat: SuratPBB) => void
  showDusunColumn?: boolean
  onRefresh?: () => void
  filterStatus?: string
  onFilterStatusChange?: (value: string) => void
}

export function TabelSuratPBB({ suratPBB, searchTerm, onSearchChange, onSuratClick, showDusunColumn = false, onRefresh, filterStatus = "semua", onFilterStatusChange }: TabelSuratPBBProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const filteredSuratPBB = suratPBB.filter((surat) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = (
      surat.nomor_objek_pajak.toLowerCase().includes(searchLower) ||
      surat.nama_wajib_pajak.toLowerCase().includes(searchLower) ||
      (surat.alamat_objek_pajak || "").toLowerCase().includes(searchLower) ||
      (surat.tahun_pajak?.toString() || "").includes(searchLower) ||
      (surat.jumlah_pajak_terhutang?.toString() || "").includes(searchLower) ||
      formatStatusPembayaran(surat.status_pembayaran || "").toLowerCase().includes(searchLower)
    )
    
    const matchesStatus = filterStatus === "semua" || surat.status_pembayaran === filterStatus
    
    return matchesSearch && matchesStatus
  })

  return (
    <>
      <div className="card mb-2">
        <div className="card-body p-3">
          <div className="row align-items-center g-2">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text" style={{ width: "40px" }}>
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  style={{ height: "50px" }}
                  placeholder="Cari surat PBB..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            </div>
            {onFilterStatusChange && (
              <div className="col-md-4">
                <select
                  className="form-select"
                  style={{ height: "50px" }}
                  value={filterStatus}
                  onChange={(e) => onFilterStatusChange(e.target.value)}
                >
                  <option value="semua">Semua Status</option>
                  <option value="belum_bayar">Belum Bayar</option>
                  <option value="sudah_bayar">Sudah Bayar</option>
                </select>
              </div>
            )}
            {onRefresh && (
              <div className="col-md-2">
                <button
                  className="btn btn-outline-secondary"
                  style={{ width: "100%", height: "50px" }}
                  onClick={async () => {
                    setIsRefreshing(true)
                    await onRefresh()
                    setTimeout(() => setIsRefreshing(false), 500)
                  }}
                  disabled={isRefreshing}
                >
                  <i className={`bi bi-arrow-clockwise ${isRefreshing ? "spin" : ""}`}></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {isRefreshing ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Memuat data surat PBB...</p>
        </div>
      ) : filteredSuratPBB.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-box-seam" style={{ fontSize: "3rem", color: "#ccc" }}></i>
            <h4 className="mt-3">{searchTerm ? "Tidak Ada Surat PBB" : "Belum Ada Surat PBB"}</h4>
            <p className="text-muted">{searchTerm ? "Tidak ada surat PBB yang cocok dengan pencarian" : "Belum ada surat PBB yang terdaftar"}</p>
          </div>
        </div>
      ) : (
        <div className="table-responsive mx-auto" style={{ maxHeight: "500px", overflowY: "auto", maxWidth: "100%" }}>
          <table className="table table-hover">
            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr>
                <th>NOP</th>
                <th>Nama Wajib Pajak</th>
                {showDusunColumn && <th>Dusun</th>}
                <th>Tahun</th>
                <th>Jumlah Pajak</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuratPBB.map((s) => (
                <tr key={s.id}>
                  <td className="font-monospace small">{s.nomor_objek_pajak}</td>
                  <td>{s.nama_wajib_pajak}</td>
                  {showDusunColumn && <td>{s.nama_dusun}</td>}
                  <td>{s.tahun_pajak || "-"}</td>
                  <td>Rp {Number(s.jumlah_pajak_terhutang || 0).toLocaleString("id-ID")}</td>
                  <td>
                    <span className={`badge bg-${getStatusPembayaranColor(s.status_pembayaran || "")}`}>{formatStatusPembayaran(s.status_pembayaran || "")}</span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => onSuratClick(s)}>
                      <i className="bi bi-eye me-1"></i>
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
