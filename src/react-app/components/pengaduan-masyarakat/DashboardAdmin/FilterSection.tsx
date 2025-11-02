interface FilterSectionProps {
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  onRefresh: () => void
  searchTerm?: string
  onSearchChange?: (value: string) => void
  showStatusFilter?: boolean
}

export function FilterSection({ statusFilter, onStatusFilterChange, onRefresh, searchTerm = "", onSearchChange, showStatusFilter = true }: FilterSectionProps) {
  if (!showStatusFilter) {
    return (
      <div className="card mb-2">
        <div className="card-body p-3">
          <div className="row align-items-center g-2">
            <div className="col-md-10">
              <div className="input-group">
                <span className="input-group-text" style={{ width: "40px" }}>
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  style={{ height: "50px" }}
                  placeholder="Cari masyarakat..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-secondary" style={{ width: "100%", height: "50px" }} onClick={onRefresh}>
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card mb-3">
      <div className="card-body p-3">
        <div className="row align-items-center g-2">
          <div className="col-md-3">
            <div className="input-group">
              <span className="input-group-text" style={{ width: "40px" }}>
                <i className="bi bi-funnel"></i>
              </span>
              <select className="form-select" style={{ height: "50px" }} value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)}>
                <option value="">Semua Status</option>
                <option value="menunggu">Menunggu</option>
                <option value="diproses">Sedang Diproses</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
          </div>
          <div className="col-md-7">
            <div className="input-group">
              <span className="input-group-text" style={{ width: "40px" }}>
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                style={{ height: "50px" }}
                placeholder="Cari berdasarkan judul, kategori, atau isi..."
                value={searchTerm}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-secondary" style={{ width: "100%", height: "50px" }} onClick={onRefresh}>
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
