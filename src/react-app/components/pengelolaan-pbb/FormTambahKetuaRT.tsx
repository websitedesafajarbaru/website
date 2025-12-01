import React from "react"

interface FormTambahKetuaRTProps {
  form: {
    nama_lengkap: string
    password: string
  }
  onFormChange: (field: string, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function FormTambahKetuaRT({ form, onFormChange, onSubmit, onCancel }: FormTambahKetuaRTProps) {
  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Tambah Ketua RT Baru</h6>
        <button className="btn btn-sm btn-secondary" onClick={onCancel}>
          <i className="bi bi-arrow-left me-1"></i>
          Kembali ke Daftar
        </button>
      </div>
      <div className="card-body">
        <form onSubmit={onSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">
                Nama Lengkap <span className="text-danger">*</span>
              </label>
              <input type="text" className="form-control" value={form.nama_lengkap} onChange={(e) => onFormChange("nama_lengkap", e.target.value)} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">
                Password <span className="text-danger">*</span>
              </label>
              <input type="password" className="form-control" value={form.password} onChange={(e) => onFormChange("password", e.target.value)} required />
            </div>
          </div>
          <div className="d-flex gap-2 mt-4">
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-save me-1"></i>
              Simpan
            </button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
