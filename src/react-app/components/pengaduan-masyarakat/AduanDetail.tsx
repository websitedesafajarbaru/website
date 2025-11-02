import { Aduan } from "../../types"
import { formatToWIB } from "../../utils/time"
import { FileText, User, Minus, Info, Calendar, Pencil, FileIcon, MessageCircle, Clock, PlusCircle, Send, XCircle } from "lucide-react"

interface AduanDetailProps {
  aduan: Aduan
  isAdmin?: boolean
  tanggapan?: string
  setTanggapan?: (value: string) => void
  onStatusChange?: (id: string, status: string) => void
  onSubmitTanggapan?: (e: React.FormEvent) => void
}

export function AduanDetail({ aduan, isAdmin = false, tanggapan, setTanggapan, onStatusChange, onSubmitTanggapan }: AduanDetailProps) {
  const statusBadgeColor = (status: string) => {
    const colors: { [key: string]: string } = {
      menunggu: "warning",
      diproses: "info",
      selesai: "success",
      ditolak: "danger",
    }
    return colors[status?.toLowerCase()] || "secondary"
  }

  const sortedTanggapan =
    aduan.tanggapan && Array.isArray(aduan.tanggapan)
      ? isAdmin
        ? [...aduan.tanggapan].sort((a, b) => new Date(a.waktu_dibuat).getTime() - new Date(b.waktu_dibuat).getTime())
        : aduan.tanggapan.slice().reverse()
      : []

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <FileText className="me-2" />
          Detail Aduan
        </h5>
      </div>
      <div className="card-body p-0">
        <div className="p-4 border-bottom bg-light">
          <h4 className="mb-3">{aduan.judul}</h4>
          <div className="row g-3">
            {isAdmin && (
              <div className="col-md-3">
                <div className="d-flex align-items-start">
                  <User className="text-primary me-2 mt-1" />
                  <div>
                    <small className="text-muted d-block">Pelapor</small>
                    <strong>{aduan.nama_lengkap}</strong>
                  </div>
                </div>
              </div>
            )}
            <div className={`col-md-${isAdmin ? 3 : 4}`}>
              <div className="d-flex align-items-start">
                <Minus className="text-primary me-2 mt-1" />
                <div>
                  <small className="text-muted d-block">Kategori</small>
                  <span>{aduan.kategori}</span>
                </div>
              </div>
            </div>
            <div className={`col-md-${isAdmin ? 3 : 4}`}>
              <div className="d-flex align-items-start">
                <Info className="text-primary me-2 mt-1" />
                <div>
                  <small className="text-muted d-block">Status</small>
                  <span className={`badge bg-${statusBadgeColor(aduan.status)}`}>{aduan.status.toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div className={`col-md-${isAdmin ? 3 : 4}`}>
              <div className="d-flex align-items-start">
                <Calendar className="text-primary me-2 mt-1" />
                <div>
                  <small className="text-muted d-block">Tanggal Dibuat</small>
                  <strong>{formatToWIB(aduan.created_at || aduan.waktu_dibuat)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isAdmin && onStatusChange && (
          <div className="p-4 border-bottom">
            <h6 className="mb-3">
              <Pencil className="me-2" />
              Ubah Status Aduan
            </h6>
            <div className="row align-items-center">
              <div className="col-md-4">
                <select className="form-select" value={aduan.status} onChange={(e) => onStatusChange(aduan.id, e.target.value)}>
                  <option value="menunggu">Menunggu</option>
                  <option value="diproses">Sedang Diproses</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>
              <div className="col-md-8">
                <small className="text-muted">
                  <Info className="me-1" />
                  Status akan diperbarui otomatis setelah memilih
                </small>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border-bottom">
          <h6 className="mb-3">
            <FileIcon className="me-2" />
            Isi Aduan
          </h6>
          <div className="card bg-light">
            <div className="card-body">
              <p className="mb-0" style={{ whiteSpace: "pre-wrap", lineHeight: "1.8" }}>
                {aduan.isi_aduan || aduan.isi}
              </p>
            </div>
          </div>
        </div>

        {sortedTanggapan.length > 0 && (
          <div className="p-4 border-bottom">
            <h6 className="mb-3">
              <MessageCircle className="me-2" />
              {isAdmin ? `Riwayat Tanggapan (${sortedTanggapan.length})` : `Tanggapan dari Perangkat Desa (${sortedTanggapan.length})`}
            </h6>
            <div className="timeline">
              {sortedTanggapan.map((t: { id: string; nama_lengkap: string; waktu_dibuat: string; isi_tanggapan: string; roles?: string }, index: number) => (
                <div key={t.id} className="mb-3">
                  <div className={`card border-left-${t.roles === "masyarakat" ? "info" : "primary"}`}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center">
                          <div
                            className={`bg-${t.roles === "masyarakat" ? "info" : "primary"} text-white rounded-circle d-flex align-items-center justify-content-center me-2`}
                            style={{ width: "32px", height: "32px", fontSize: "14px" }}
                          >
                            {t.nama_lengkap.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong className="d-block">{t.nama_lengkap}</strong>
                            <small className="text-muted">
                              <Clock className="me-1" />
                              {formatToWIB(t.waktu_dibuat)}
                              {t.roles && (
                                <span className={`badge ms-2 bg-${t.roles === "masyarakat" ? "info" : "success"} text-white`}>
                                  {t.roles === "masyarakat" ? "Masyarakat" : "Admin"}
                                </span>
                              )}
                            </small>
                          </div>
                        </div>
                        <span className={`badge bg-${t.roles === "masyarakat" ? "info" : "success"}`}>Tanggapan #{index + 1}</span>
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

        {((isAdmin && setTanggapan !== undefined && onSubmitTanggapan) || (!isAdmin && setTanggapan !== undefined && onSubmitTanggapan)) && (
          <div className="p-4 bg-light">
            <h6 className="mb-3">
              <PlusCircle className="me-2" />
              {isAdmin ? "Tambah Tanggapan Baru" : "Balas Tanggapan"}
            </h6>
            <form onSubmit={onSubmitTanggapan}>
              <div className="mb-3">
                <textarea
                  className="form-control"
                  value={tanggapan}
                  onChange={(e) => setTanggapan(e.target.value)}
                  required
                  rows={4}
                  placeholder={isAdmin ? "Tulis tanggapan Anda di sini..." : "Tulis balasan Anda di sini..."}
                  style={{ resize: "vertical" }}
                />
                <small className="text-muted mt-1 d-block">
                  <Info className="me-1" />
                  {isAdmin ? "Tanggapan akan dikirimkan kepada pelapor" : "Balasan Anda akan terlihat oleh admin"}
                </small>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  <Send className="me-2" />
                  {isAdmin ? "Kirim Tanggapan" : "Kirim Balasan"}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setTanggapan("")}>
                  <XCircle className="me-2" />
                  Reset
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
