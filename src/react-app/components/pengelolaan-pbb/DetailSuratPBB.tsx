import { SuratPBB } from "../../types"

interface DetailSuratPBBProps {
  surat: SuratPBB
  isEditing: boolean
  editForm: Partial<SuratPBB>
  onEditFormChange: (field: string, value: string | number) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onStatusChange: (newStatus: string) => void
  onDelete?: () => void
  onBack: () => void
  onStartEdit: () => void
  showAdminActions?: boolean
  isPerangkatDesa?: boolean
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
  isPerangkatDesa = false,
}: DetailSuratPBBProps) {
  // Define status options based on user role
  const statusOptions = isPerangkatDesa
    ? [
        { value: "menunggu_dicek_oleh_admin", label: "Menunggu Dicek Oleh Admin" },
        { value: "bayar_sendiri_di_bank", label: "Bayar Sendiri di Bank" },
        { value: "pindah_rumah", label: "Pindah Rumah" },
        { value: "tidak_diketahui", label: "Tidak Diketahui" },
      ]
    : [
        { value: "menunggu_dicek_oleh_admin", label: "Menunggu Dicek Oleh Admin" },
        { value: "bayar_sendiri_di_bank", label: "Bayar Sendiri di Bank" },
        { value: "sudah_bayar", label: "Sudah Bayar" },
        { value: "pindah_rumah", label: "Pindah Rumah" },
        { value: "tidak_diketahui", label: "Tidak Diketahui" },
      ]

  // Check if the surat is readonly for perangkat desa when status is sudah_bayar
  const isReadonlyForPerangkatDesa = isPerangkatDesa && surat.status_pembayaran === "sudah_bayar"

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Detail Surat PBB</h6>
          <div className="d-flex flex-wrap gap-2">
            {showAdminActions && !isReadonlyForPerangkatDesa && (
              <>
                {!isEditing ? (
                  <button className="btn btn-warning btn-sm flex-grow-1 flex-md-grow-0" onClick={onStartEdit}>
                    <i className="bi bi-pencil me-1 d-sm-inline"></i>
                    <span className="d-none d-sm-inline">Edit</span>
                  </button>
                ) : (
                  <>
                    <button className="btn btn-success btn-sm flex-grow-1 flex-md-grow-0" onClick={onSaveEdit}>
                      <i className="bi bi-check me-1"></i>
                      <span className="d-none d-sm-inline">Simpan</span>
                    </button>
                    <button className="btn btn-secondary btn-sm flex-grow-1 flex-md-grow-0" onClick={onCancelEdit}>
                      <i className="bi bi-x me-1"></i>
                      <span className="d-none d-sm-inline">Batal</span>
                    </button>
                  </>
                )}
                {!isPerangkatDesa && onDelete && (
                  <button className="btn btn-danger btn-sm flex-grow-1 flex-md-grow-0" onClick={onDelete}>
                    <i className="bi bi-trash me-1"></i>
                    <span className="d-none d-sm-inline">Hapus</span>
                  </button>
                )}
              </>
            )}
            <button className="btn btn-secondary btn-sm flex-grow-1 flex-md-grow-0" onClick={onBack}>
              <i className="bi bi-arrow-left me-1"></i>
              <span className="d-none d-sm-inline">Kembali ke Daftar</span>
              <span className="d-sm-none">Kembali</span>
            </button>
          </div>
        </div>
      </div>
      <div className="card-body p-3 p-md-4">
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label text-muted small mb-1">Nomor Objek Pajak (NOP)</label>
            {isEditing ? (
              <input type="text" className="form-control" value={editForm.nomor_objek_pajak || ""} onChange={(e) => onEditFormChange("nomor_objek_pajak", e.target.value)} />
            ) : (
              <div className="font-monospace text-break">{surat.nomor_objek_pajak}</div>
            )}
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label text-muted small mb-1">Tahun Pajak</label>
            {isEditing ? (
              <input type="number" className="form-control" value={editForm.tahun_pajak || ""} onChange={(e) => onEditFormChange("tahun_pajak", Number(e.target.value))} />
            ) : (
              <div>{surat.tahun_pajak}</div>
            )}
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label text-muted small mb-1">Nama Wajib Pajak</label>
            {isEditing ? (
              <input type="text" className="form-control" value={editForm.nama_wajib_pajak || ""} onChange={(e) => onEditFormChange("nama_wajib_pajak", e.target.value)} />
            ) : (
              <div className="text-break">{surat.nama_wajib_pajak}</div>
            )}
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label text-muted small mb-1">Status Pembayaran</label>
            {isEditing ? (
              <select
                className="form-select"
                value={editForm.status_pembayaran || ""}
                onChange={(e) => onEditFormChange("status_pembayaran", e.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <select
                className="form-select"
                value={surat.status_pembayaran}
                onChange={(e) => onStatusChange(e.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="col-12">
            <label className="form-label text-muted small mb-1">Alamat Wajib Pajak</label>
            {isEditing ? (
              <input type="text" className="form-control" value={editForm.alamat_wajib_pajak || ""} onChange={(e) => onEditFormChange("alamat_wajib_pajak", e.target.value)} />
            ) : (
              <div className="text-break">{surat.alamat_wajib_pajak || "-"}</div>
            )}
          </div>
          <div className="col-12">
            <label className="form-label text-muted small mb-1">Alamat Objek Pajak</label>
            {isEditing ? (
              <input type="text" className="form-control" value={editForm.alamat_objek_pajak || ""} onChange={(e) => onEditFormChange("alamat_objek_pajak", e.target.value)} />
            ) : (
              <div className="text-break">{surat.alamat_objek_pajak}</div>
            )}
          </div>
          <div className="col-12 col-sm-6 col-md-6">
            <label className="form-label text-muted small mb-1">Luas Tanah</label>
            {isEditing ? (
              <input type="number" className="form-control" value={editForm.luas_tanah || ""} onChange={(e) => onEditFormChange("luas_tanah", Number(e.target.value))} />
            ) : (
              <div>{surat.luas_tanah ? `${surat.luas_tanah} m²` : "-"}</div>
            )}
          </div>
          <div className="col-12 col-sm-6 col-md-6">
            <label className="form-label text-muted small mb-1">Luas Bangunan</label>
            {isEditing ? (
              <input type="number" className="form-control" value={editForm.luas_bangunan || ""} onChange={(e) => onEditFormChange("luas_bangunan", Number(e.target.value))} />
            ) : (
              <div>{surat.luas_bangunan ? `${surat.luas_bangunan} m²` : "-"}</div>
            )}
          </div>
          <div className="col-12 col-sm-6 col-md-6">
            <label className="form-label text-muted small mb-1">Jumlah Pajak Terhutang</label>
            {isEditing ? (
              <input
                type="number"
                className="form-control"
                value={editForm.jumlah_pajak_terhutang || ""}
                onChange={(e) => onEditFormChange("jumlah_pajak_terhutang", Number(e.target.value))}
              />
            ) : (
              <div className="text-primary text-break">Rp {Number(surat.jumlah_pajak_terhutang).toLocaleString("id-ID")}</div>
            )}
          </div>
          {surat.nama_dusun && (
            <div className="col-12 col-sm-6 col-md-6">
              <label className="form-label text-muted small mb-1">Dusun</label>
              <div className="text-break">{surat.nama_dusun}</div>
            </div>
          )}
          {surat.nama_perangkat && (
            <div className="col-12 col-sm-6 col-md-6">
              <label className="form-label text-muted small mb-1">Perangkat Desa</label>
              <div className="text-break">{surat.nama_perangkat}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
