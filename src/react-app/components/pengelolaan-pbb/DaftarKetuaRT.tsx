interface PerangkatDesa {
  id: string
  nama_lengkap: string
  username: string
  jabatan: string
  nama_dusun?: string
  jumlahSurat?: number
}

interface DaftarKetuaRTProps {
  ketuaRT: PerangkatDesa[]
  searchTerm: string
  onSearchChange: (value: string) => void
  onEdit: (ketua: PerangkatDesa) => void
  onDelete?: (ketua: PerangkatDesa) => void
  showDeleteButton?: boolean
}

const formatJabatan = (jabatan: string) => {
  switch (jabatan) {
    case "ketua_rt":
      return "Ketua RT"
    case "kepala_dusun":
      return "Kepala Dusun"
    default:
      return jabatan
  }
}

export function DaftarKetuaRT({ ketuaRT, searchTerm, onSearchChange, onEdit, onDelete, showDeleteButton = true }: DaftarKetuaRTProps) {
  const filteredKetuaRT = ketuaRT.filter((k) => {
    const searchLower = searchTerm.toLowerCase()
    return k.nama_lengkap.toLowerCase().includes(searchLower) || k.username.toLowerCase().includes(searchLower) || k.jabatan.toLowerCase().includes(searchLower)
  })

  return (
    <>
      <div className="mb-3">
        <input type="text" className="form-control" placeholder="Cari ketua RT..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} />
      </div>
      {filteredKetuaRT.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-box text-muted mb-3" style={{ fontSize: "4rem" }}></i>
            <h4 className="mt-3">{searchTerm ? "Tidak Ada Ketua RT" : "Belum Ada Ketua RT"}</h4>
            <p className="text-muted">{searchTerm ? "Tidak ada ketua RT yang cocok dengan pencarian" : "Belum ada ketua RT yang terdaftar"}</p>
          </div>
        </div>
      ) : (
        <div className="table-responsive mx-auto" style={{ maxHeight: "500px", overflowY: "auto", maxWidth: "100%" }}>
          <table className="table table-hover">
            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr>
                <th>Nama Lengkap</th>
                <th>Username</th>
                <th>Jabatan</th>
                <th>Jumlah Surat Diinput</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredKetuaRT.map((k) => (
                <tr key={k.id}>
                  <td>{k.nama_lengkap}</td>
                  <td>{k.username}</td>
                  <td>
                    <span className="badge bg-warning">{formatJabatan(k.jabatan)}</span>
                  </td>
                  <td>
                    <span className="badge bg-info">{k.jumlahSurat || 0}</span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(k)} title="Edit">
                      <i className="bi bi-pencil"></i>
                    </button>
                    {showDeleteButton && onDelete && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(k)} title="Hapus">
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
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
