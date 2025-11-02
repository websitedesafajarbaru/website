import { Masyarakat } from "../../types"
import { formatToWIB } from "../../../utils/time"

interface MasyarakatTableProps {
  masyarakat: Masyarakat[]
  loading: boolean
  onEdit: (masyarakat: Masyarakat) => void
  onDelete: (id: string) => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
}

export function MasyarakatTable({
  masyarakat,
  loading,
  onEdit,
  onDelete,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
}: MasyarakatTableProps) {
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
        <i className="bi bi-inbox" style={{ fontSize: "3rem", color: "#ccc" }}></i>
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
            <th style={{ width: "20%" }}>Nama Lengkap</th>
            <th style={{ width: "15%" }}>Username</th>
            <th style={{ width: "25%" }}>Alamat Rumah</th>
            <th style={{ width: "15%" }}>No. Telepon</th>
            <th style={{ width: "15%" }}>Tanggal Dibuat</th>
            <th style={{ width: "10%" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {paginatedMasyarakat.map((item) => (
            <tr key={item.id}>
              <td>{item.nama_lengkap}</td>
              <td>{item.username}</td>
              <td>{item.alamat_rumah}</td>
              <td>{item.nomor_telepon}</td>
              <td>{formatToWIB(item.waktu_dibuat)}</td>
              <td>
                <div className="action-buttons d-flex justify-content-center gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(item)}>
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(item.id)}>
                    <i className="bi bi-trash"></i>
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