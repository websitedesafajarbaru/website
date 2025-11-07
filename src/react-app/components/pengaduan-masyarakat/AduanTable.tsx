import { Aduan } from "../../types"
import { formatToWIB } from "../../utils/time"

interface AduanTableProps {
  aduan: Aduan[]
  loading: boolean
  onViewDetail: (id: string) => void
  role: "admin" | "masyarakat"
  searchTerm?: string
  setSearchTerm?: (term: string) => void
  onRefresh?: () => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
  readAduan?: Set<string>
}

export function AduanTable({ aduan, loading, onViewDetail, role, currentPage, itemsPerPage, totalItems, onPageChange, readAduan }: AduanTableProps) {
  const paginatedAduan = aduan.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const statusBadgeColor = (status: string) => {
    const colors: { [key: string]: string } = {
      menunggu: "warning",
      diproses: "info",
      selesai: "success",
      ditolak: "danger",
    }
    return colors[status?.toLowerCase()] || "secondary"
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        {role === "masyarakat" && <p className="mt-3 text-muted">Memuat data aduan...</p>}
      </div>
    )
  }

  const renderEmptyState = () => {
    if (role === "admin") {
      return (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-box text-muted mb-3" style={{ fontSize: "4rem" }}></i>
            <h4 className="mt-3">Tidak Ada Aduan</h4>
            <p className="text-muted">Belum ada aduan yang masuk</p>
          </div>
        </div>
      )
    } else {
      return (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-box text-muted mb-3" style={{ fontSize: "4rem" }}></i>
            <h4 className="mt-3">Belum Ada Aduan</h4>
            <p className="text-muted">Anda belum memiliki aduan. Buat aduan pertama Anda!</p>
          </div>
        </div>
      )
    }
  }

  const renderTable = () => (
    <div className={role === "admin" ? "table-container" : "table-responsive"}>
      <table className={role === "admin" ? "table" : "table table-hover mb-0"}>
        <thead className={role === "admin" ? "" : "table-light"}>
          <tr>
            <th style={{ width: "8%" }}>Pesan</th>
            <th style={{ width: "12%" }}>Tanggal</th>
            <th style={{ width: "30%" }}>Judul</th>
            <th style={{ width: "15%" }}>Kategori</th>
            <th style={{ width: "15%" }}>Status</th>
            <th style={{ width: "15%" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {paginatedAduan.map((item) => (
            <tr key={item.id} className={role === "admin" ? "" : "align-middle"}>
              <td>
                {item.jumlah_tanggapan && item.jumlah_tanggapan > 0 && (!readAduan || !readAduan.has(item.id)) ? <span className="badge bg-danger">{item.jumlah_tanggapan}</span> : null}
              </td>
              <td>{role === "admin" ? formatToWIB(item.waktu_dibuat) : <small>{formatToWIB(item.created_at || item.waktu_dibuat)}</small>}</td>
              <td>{item.judul}</td>
              <td>{item.kategori}</td>
              <td>
                <span className={`badge bg-${statusBadgeColor(item.status)}`}>{item.status.toUpperCase()}</span>
              </td>
              <td>
                <div className={role === "admin" ? "action-buttons d-flex justify-content-center" : ""}>
                  <button className="btn btn-sm btn-primary" onClick={() => onViewDetail(item.id)}>
                    <i className="bi bi-eye me-1"></i>
                    Lihat Detail
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderPagination = () => {
    if (totalPages <= 1) return null
    return (
      <nav className="mt-3">
        <ul className="pagination justify-content-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <li key={page} className={`page-item ${page === currentPage ? "active" : ""}`}>
              <button className="page-link" onClick={() => onPageChange(page)}>
                {page}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  if (role === "admin") {
    if (totalItems === 0) {
      return renderEmptyState()
    }
    return (
      <>
        {renderTable()}
        {renderPagination()}
      </>
    )
  } else {
    return (
      <>
        {totalItems === 0 ? renderEmptyState() : renderTable()}
        {renderPagination()}
      </>
    )
  }
}
