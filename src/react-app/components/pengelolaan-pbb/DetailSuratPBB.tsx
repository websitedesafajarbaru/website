import { SuratPBB } from "../../types"
import { Pencil, Check, X, Trash2, ArrowLeft } from "lucide-react"

interface DetailSuratPBBProps {
  surat: SuratPBB
  isEditing: boolean
  editForm: Partial<SuratPBB>
  onEditFormChange: (field: string, value: string | number) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onStatusChange: (newStatus: string) => void
  onDelete: () => void
  onBack: () => void
  onStartEdit: () => void
  showAdminActions?: boolean
}

export function DetailSuratPBB({
  surat,
  isEditing,
  editForm,
  onEditFormChange,
  onSaveEdit,
  onCancelEdit,
  onStatusChange,
  onDelete,
  onBack,
  onStartEdit,
  showAdminActions = false,
}: DetailSuratPBBProps) {
  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Detail Surat PBB - {surat.nomor_objek_pajak}</h6>
        <div className="d-flex gap-2">
          {showAdminActions && (
            <>
              {!isEditing ? (
                <button className="btn btn-warning btn-sm" onClick={onStartEdit}>
                  <Pencil className="me-1" />
                  Edit
                </button>
              ) : (
                <>
                  <button className="btn btn-success btn-sm" onClick={onSaveEdit}>
                    <Check className="me-1" />
                    Simpan
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={onCancelEdit}>
                    <X className="me-1" />
                    Batal
                  </button>
                </>
              )}
              <button className="btn btn-danger btn-sm" onClick={onDelete}>
                <Trash2 className="me-1" />
                Hapus
              </button>
            </>
          )}
          <button className="btn btn-secondary btn-sm" onClick={onBack}>
            <ArrowLeft className="me-1" />
            Kembali ke Daftar
          </button>
        </div>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label text-muted small mb-1">Nomor Objek Pajak (NOP)</label>
            {isEditing ? (
              <input type="text" className="form-control" value={editForm.nomor_objek_pajak || ""} onChange={(e) => onEditFormChange("nomor_objek_pajak", e.target.value)} />
            ) : (
              <div className="font-monospace">{surat.nomor_objek_pajak}</div>
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label text-muted small mb-1">Tahun Pajak</label>
            {isEditing ? (
              <input type="number" className="form-control" value={editForm.tahun_pajak || ""} onChange={(e) => onEditFormChange("tahun_pajak", Number(e.target.value))} />
            ) : (
              <div>{surat.tahun_pajak}</div>
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label text-muted small mb-1">Nama Wajib Pajak</label>
            {isEditing ? (
              <input type="text" className="form-control" value={editForm.nama_wajib_pajak || ""} onChange={(e) => onEditFormChange("nama_wajib_pajak", e.target.value)} />
            ) : (
              <div>{surat.nama_wajib_pajak}</div>
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label text-muted small mb-1">Status Pembayaran</label>
            {isEditing ? (
              <select className="form-select" value={editForm.status_pembayaran || ""} onChange={(e) => onEditFormChange("status_pembayaran", e.target.value)}>
                <option value="belum_bayar">Belum Bayar</option>
                <option value="bayar_sendiri_di_bank">Bayar Sendiri di Bank</option>
                <option value="bayar_lewat_perangkat_desa">Bayar Lewat Perangkat Desa</option>
                <option value="pindah_rumah">Pindah Rumah</option>
                <option value="tidak_diketahui">Tidak Diketahui</option>
              </select>
            ) : (
              <select className="form-select" value={surat.status_pembayaran} onChange={(e) => onStatusChange(e.target.value)}>
                <option value="belum_bayar">Belum Bayar</option>
                <option value="bayar_sendiri_di_bank">Bayar Sendiri di Bank</option>
                <option value="bayar_lewat_perangkat_desa">Bayar Lewat Perangkat Desa</option>
                <option value="pindah_rumah">Pindah Rumah</option>
                <option value="tidak_diketahui">Tidak Diketahui</option>
              </select>
            )}
          </div>
          <div className="col-12">
            <label className="form-label text-muted small mb-1">Alamat Wajib Pajak</label>
            {isEditing ? (
              <input type="text" className="form-control" value={editForm.alamat_wajib_pajak || ""} onChange={(e) => onEditFormChange("alamat_wajib_pajak", e.target.value)} />
            ) : (
              <div>{surat.alamat_wajib_pajak || "-"}</div>
            )}
          </div>
          <div className="col-12">
            <label className="form-label text-muted small mb-1">Alamat Objek Pajak</label>
            {isEditing ? (
              <input type="text" className="form-control" value={editForm.alamat_objek_pajak || ""} onChange={(e) => onEditFormChange("alamat_objek_pajak", e.target.value)} />
            ) : (
              <div>{surat.alamat_objek_pajak}</div>
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label text-muted small mb-1">Luas Tanah</label>
            {isEditing ? (
              <input type="number" className="form-control" value={editForm.luas_tanah || ""} onChange={(e) => onEditFormChange("luas_tanah", Number(e.target.value))} />
            ) : (
              <div>{surat.luas_tanah ? `${surat.luas_tanah} m²` : "-"}</div>
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label text-muted small mb-1">Luas Bangunan</label>
            {isEditing ? (
              <input type="number" className="form-control" value={editForm.luas_bangunan || ""} onChange={(e) => onEditFormChange("luas_bangunan", Number(e.target.value))} />
            ) : (
              <div>{surat.luas_bangunan ? `${surat.luas_bangunan} m²` : "-"}</div>
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label text-muted small mb-1">Nilai Jual Objek Pajak (NJOP)</label>
            {isEditing ? (
              <input
                type="number"
                className="form-control"
                value={editForm.nilai_jual_objek_pajak || ""}
                onChange={(e) => onEditFormChange("nilai_jual_objek_pajak", Number(e.target.value))}
              />
            ) : (
              <div>{surat.nilai_jual_objek_pajak ? `Rp ${Number(surat.nilai_jual_objek_pajak).toLocaleString("id-ID")}` : "-"}</div>
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label text-muted small mb-1">Jumlah Pajak Terhutang</label>
            {isEditing ? (
              <input
                type="number"
                className="form-control"
                value={editForm.jumlah_pajak_terhutang || ""}
                onChange={(e) => onEditFormChange("jumlah_pajak_terhutang", Number(e.target.value))}
              />
            ) : (
              <div className="text-primary">Rp {Number(surat.jumlah_pajak_terhutang).toLocaleString("id-ID")}</div>
            )}
          </div>
          {surat.nama_dusun && (
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Dusun</label>
              <div>{surat.nama_dusun}</div>
            </div>
          )}
          {surat.nama_perangkat && (
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Perangkat Desa</label>
              <div>{surat.nama_perangkat}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
