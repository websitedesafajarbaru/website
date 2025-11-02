interface CreateAduanFormProps {
  formData: {
    judul: string
    kategori: string
    isi_aduan: string
  }
  setFormData: (data: { judul: string; kategori: string; isi_aduan: string }) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function CreateAduanForm({ formData, setFormData, onSubmit, onCancel }: CreateAduanFormProps) {
  return (
    <div className="card">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="bi bi-plus-circle me-2"></i>
          Buat Aduan Baru
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label">
              <i className="bi bi-type me-2"></i>
              Judul Aduan *
            </label>
            <input
              type="text"
              className="form-control"
              style={{ height: "60px" }}
              value={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              placeholder="Masukkan judul aduan..."
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">
              <i className="bi bi-dash me-2"></i>
              Kategori *
            </label>
            <select className="form-select" style={{ height: "60px" }} value={formData.kategori} onChange={(e) => setFormData({ ...formData, kategori: e.target.value })} required>
              <option value="">Pilih Kategori</option>
              <option value="INFRASTRUKTUR">Infrastruktur</option>
              <option value="PELAYANAN">Pelayanan Publik</option>
              <option value="LINGKUNGAN">Lingkungan</option>
              <option value="SOSIAL">Sosial Kemasyarakatan</option>
              <option value="EKONOMI">Ekonomi</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">
              <i className="bi bi-file-text me-2"></i>
              Isi Aduan *
            </label>
            <textarea
              className="form-control"
              rows={10}
              style={{ height: "160px" }}
              value={formData.isi_aduan}
              onChange={(e) => setFormData({ ...formData, isi_aduan: e.target.value })}
              placeholder="Jelaskan aduan Anda secara detail..."
              required
            />
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
              <i className="bi bi-x me-2"></i>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-send me-2"></i>
              Kirim Aduan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
