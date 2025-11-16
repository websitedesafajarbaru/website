import { useState, useEffect } from "react"
import { Masyarakat } from "../../../types"

interface MasyarakatFormProps {
  masyarakat?: Masyarakat | null
  onSubmit: (data: MasyarakatFormData) => void
  onCancel: () => void
  loading: boolean
  onToggleBan?: (id: string, currentStatus: string) => void
}

export interface MasyarakatFormData {
  nama_lengkap: string
  username: string
  nomor_telepon: string
  alamat_rumah: string
  password?: string
}

export function MasyarakatForm({ masyarakat, onSubmit, onCancel, loading, onToggleBan }: MasyarakatFormProps) {
  const [formData, setFormData] = useState<MasyarakatFormData>({
    nama_lengkap: "",
    username: "",
    nomor_telepon: "",
    alamat_rumah: "",
    password: "",
  })

  const [errors, setErrors] = useState<Partial<MasyarakatFormData>>({})

  useEffect(() => {
    if (masyarakat) {
      setFormData({
        nama_lengkap: masyarakat.nama_lengkap,
        username: masyarakat.username,
        nomor_telepon: masyarakat.nomor_telepon,
        alamat_rumah: masyarakat.alamat_rumah,
        password: "",
      })
    }
  }, [masyarakat])

  const validateForm = (): boolean => {
    const newErrors: Partial<MasyarakatFormData> = {}

    if (!formData.nama_lengkap.trim()) {
      newErrors.nama_lengkap = "Nama lengkap harus diisi"
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username harus diisi"
    }

    if (!formData.nomor_telepon.trim()) {
      newErrors.nomor_telepon = "Nomor telepon harus diisi"
    }

    if (!formData.alamat_rumah.trim()) {
      newErrors.alamat_rumah = "Alamat rumah harus diisi"
    }

    if (!masyarakat && !formData.password?.trim()) {
      newErrors.password = "Password harus diisi"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleChange = (field: keyof MasyarakatFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-md-6">
          <label htmlFor="nama_lengkap" className="form-label">
            Nama Lengkap *
          </label>
          <input
            type="text"
            className={`form-control ${errors.nama_lengkap ? "is-invalid" : ""}`}
            id="nama_lengkap"
            value={formData.nama_lengkap}
            onChange={(e) => handleChange("nama_lengkap", e.target.value)}
            placeholder="Masukkan nama lengkap"
          />
          {errors.nama_lengkap && <div className="invalid-feedback">{errors.nama_lengkap}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="username" className="form-label">
            Username *
          </label>
          <input
            type="text"
            className={`form-control ${errors.username ? "is-invalid" : ""}`}
            id="username"
            value={formData.username}
            onChange={(e) => handleChange("username", e.target.value)}
            placeholder="Masukkan username"
          />
          {errors.username && <div className="invalid-feedback">{errors.username}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="nomor_telepon" className="form-label">
            Nomor Telepon *
          </label>
          <input
            type="tel"
            className={`form-control ${errors.nomor_telepon ? "is-invalid" : ""}`}
            id="nomor_telepon"
            value={formData.nomor_telepon}
            onChange={(e) => handleChange("nomor_telepon", e.target.value)}
            placeholder="Masukkan nomor telepon"
          />
          {errors.nomor_telepon && <div className="invalid-feedback">{errors.nomor_telepon}</div>}
        </div>

        <div className="col-12">
          <label htmlFor="alamat_rumah" className="form-label">
            Alamat Rumah *
          </label>
          <textarea
            className={`form-control ${errors.alamat_rumah ? "is-invalid" : ""}`}
            id="alamat_rumah"
            rows={3}
            value={formData.alamat_rumah}
            onChange={(e) => handleChange("alamat_rumah", e.target.value)}
            placeholder="Masukkan alamat rumah"
          />
          {errors.alamat_rumah && <div className="invalid-feedback">{errors.alamat_rumah}</div>}
        </div>

        <div className="col-12">
          <label htmlFor="password" className="form-label">
            Password {masyarakat ? "(Kosongkan jika tidak ingin mengubah)" : "*"}
          </label>
          <input
            type="password"
            className={`form-control ${errors.password ? "is-invalid" : ""}`}
            id="password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder={masyarakat ? "Masukkan password baru" : "Masukkan password"}
          />
          {errors.password && <div className="invalid-feedback">{errors.password}</div>}
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        {masyarakat && onToggleBan && (
          <button
            type="button"
            className={`btn ${masyarakat.status === "active" ? "btn-outline-warning" : "btn-outline-success"}`}
            onClick={() => onToggleBan(masyarakat.id, masyarakat.status)}
            disabled={loading}
          >
            {masyarakat.status === "active" ? (
              <>
                <i className="bi bi-x me-1"></i>Ban Masyarakat
              </>
            ) : (
              <>
                <i className="bi bi-check me-1"></i>Unban Masyarakat
              </>
            )}
          </button>
        )}
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          Batal
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {masyarakat ? "Menyimpan..." : "Membuat..."}
            </>
          ) : masyarakat ? (
            "Simpan Perubahan"
          ) : (
            "Tambah Masyarakat"
          )}
        </button>
      </div>
    </form>
  )
}
