import { Masyarakat } from "../../../types"
import { formatToWIB } from "../../../utils/time"

interface MasyarakatTableProps {
  masyarakat: Masyarakat[]
  loading: boolean
  onEdit: (masyarakat: Masyarakat) => void
  onToggleBan: (id: string, currentStatus: string) => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
}

export function MasyarakatTable({ masyarakat, loading, onEdit, onToggleBan, currentPage, itemsPerPage, totalItems, onPageChange }: MasyarakatTableProps) {
  const paginatedMasyarakat = masyarakat.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Memuat data masyarakat...</p>
      </div>
    )
  }

  const renderEmptyState = () => (
    <div className="card">
      <div className="card-body text-center py-5">
        <i className="bi bi-box text-muted mb-3" style={{ fontSize: "4rem" }}></i>
        <h4 className="mt-3">Tidak Ada Masyarakat</h4>
        <p className="text-muted">Belum ada data masyarakat yang terdaftar</p>
      </div>
    </div>
  )

  const renderTable = () => (
    <div className="table-container mx-auto" style={{ maxHeight: "500px", overflowY: "auto", maxWidth: "100%" }}>
      <table className="table table-hover">
        <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
          <tr>
            <th style={{ width: "18%" }}>Nama Lengkap</th>
            <th style={{ width: "13%" }}>Username</th>
            <th style={{ width: "20%" }}>Alamat Rumah</th>
            <th style={{ width: "13%" }}>No. Telepon</th>
            <th style={{ width: "12%" }}>Status</th>
            <th style={{ width: "12%" }}>Tanggal Dibuat</th>
            <th style={{ width: "12%" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {paginatedMasyarakat.map((item) => (
            <tr key={item.id}>
              <td>{item.nama_lengkap}</td>
              <td>{item.username}</td>
              <td>{item.alamat_rumah}</td>
              <td>{item.nomor_telepon}</td>
              <td>
                <span className={`badge ${item.status === "active" ? "bg-success" : "bg-danger"}`}>{item.status === "active" ? "Aktif" : "Diblokir"}</span>
              </td>
              <td>{formatToWIB(item.waktu_dibuat)}</td>
              <td>
                <div className="action-buttons d-flex justify-content-center gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(item)}>
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className={`btn btn-sm ${item.status === "active" ? "btn-outline-warning" : "btn-outline-success"}`} onClick={() => onToggleBan(item.id, item.status)}>
                    {item.status === "active" ? <i className="bi bi-x"></i> : <i className="bi bi-check"></i>}
                    {item.status === "active" ? "Ban" : "Unban"}
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

  if (totalItems === 0) {
    return renderEmptyState()
  }

  return (
    <>
      {renderTable()}
      {renderPagination()}
    </>
  )
}
