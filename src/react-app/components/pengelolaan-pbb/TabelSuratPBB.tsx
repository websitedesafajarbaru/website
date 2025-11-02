import { SuratPBB } from "../../types"
import { formatStatusPembayaran, getStatusPembayaranColor } from "../../utils/formatters"
import { Package, Eye } from "lucide-react"

interface TabelSuratPBBProps {
  suratPBB: SuratPBB[]
  searchTerm: string
  onSearchChange: (value: string) => void
  onSuratClick: (surat: SuratPBB) => void
  showDusunColumn?: boolean
}

export function TabelSuratPBB({ suratPBB, searchTerm, onSearchChange, onSuratClick, showDusunColumn = false }: TabelSuratPBBProps) {
  const filteredSuratPBB = suratPBB.filter((surat) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      surat.nomor_objek_pajak.toLowerCase().includes(searchLower) ||
      surat.nama_wajib_pajak.toLowerCase().includes(searchLower) ||
      (surat.alamat_objek_pajak || "").toLowerCase().includes(searchLower) ||
      surat.tahun_pajak.toString().includes(searchLower) ||
      surat.jumlah_pajak_terhutang.toString().includes(searchLower) ||
      formatStatusPembayaran(surat.status_pembayaran).toLowerCase().includes(searchLower)
    )
  })

  return (
    <>
      <div className="mb-3">
        <input type="text" className="form-control" placeholder="Cari surat PBB..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} />
      </div>
      {filteredSuratPBB.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <Package style={{ fontSize: "3rem", color: "#ccc" }} />
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
                  <td>{s.tahun_pajak}</td>
                  <td>Rp {Number(s.jumlah_pajak_terhutang).toLocaleString("id-ID")}</td>
                  <td>
                    <span className={`badge bg-${getStatusPembayaranColor(s.status_pembayaran)}`}>{formatStatusPembayaran(s.status_pembayaran)}</span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => onSuratClick(s)}>
                      <Eye className="me-1" />
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
