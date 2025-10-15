import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { SuratPBB } from "../../types"
import { formatToWIB } from "../../utils/time"

export function DetailSuratPBB() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const [surat, setSurat] = useState<SuratPBB | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<SuratPBB>>({})

  useEffect(() => {
    const fetchSuratDetail = async () => {
      if (!id || !token) return

      try {
        const response = await fetch(`/api/surat-pbb/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setSurat(data)
          setEditForm(data)
        } else {
          setError("Surat PBB tidak ditemukan")
        }
      } catch (err) {
        console.error("Error fetching surat detail:", err)
        setError("Terjadi kesalahan saat memuat data")
      } finally {
        setLoading(false)
      }
    }

    fetchSuratDetail()
  }, [id, token])

  const handleStatusChange = async (newStatus: string) => {
    if (!surat || !token) return

    try {
      const response = await fetch(`/api/surat-pbb/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status_pembayaran: newStatus }),
      })

      if (response.ok) {
        setSurat({ ...surat, status_pembayaran: newStatus as SuratPBB["status_pembayaran"] })
        setEditForm({ ...editForm, status_pembayaran: newStatus as SuratPBB["status_pembayaran"] })
      } else {
        Swal.fire({
          title: "Error",
          text: "Gagal memperbarui status pembayaran",
          icon: "error",
          confirmButtonText: "OK",
        })
      }
    } catch (err) {
      console.error("Error updating status:", err)
      Swal.fire({
        title: "Error",
        text: "Terjadi kesalahan",
        icon: "error",
        confirmButtonText: "OK",
      })
    }
  }

  const handleEditFormChange = (field: string, value: string | number) => {
    setEditForm({ ...editForm, [field]: value })
  }

  const handleSaveEdit = async () => {
    if (!surat || !token) return

    try {
      const response = await fetch(`/api/surat-pbb/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        setSurat(editForm as SuratPBB)
        setIsEditing(false)
        Swal.fire({
          title: "Berhasil!",
          text: "Surat PBB berhasil diperbarui",
          icon: "success",
          confirmButtonText: "OK",
        })
      } else {
        const error = await response.json()
        Swal.fire({
          title: "Error",
          text: error.message || "Gagal memperbarui surat PBB",
          icon: "error",
          confirmButtonText: "OK",
        })
      }
    } catch (err) {
      console.error("Error updating surat:", err)
      Swal.fire({
        title: "Error",
        text: "Terjadi kesalahan",
        icon: "error",
        confirmButtonText: "OK",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditForm(surat || {})
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!surat || !token) return

    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Apakah Anda yakin ingin menghapus surat PBB ini? Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    })

    if (!result.isConfirmed) return

    try {
      const response = await fetch(`/api/surat-pbb/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        Swal.fire({
          title: "Berhasil!",
          text: "Surat PBB berhasil dihapus",
          icon: "success",
          confirmButtonText: "OK",
        })
        navigate(-1)
      } else {
        const error = await response.json()
        Swal.fire({
          title: "Error",
          text: error.message || "Gagal menghapus surat PBB",
          icon: "error",
          confirmButtonText: "OK",
        })
      }
    } catch (err) {
      console.error("Error deleting surat:", err)
      Swal.fire({
        title: "Error",
        text: "Terjadi kesalahan",
        icon: "error",
        confirmButtonText: "OK",
      })
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error || !surat) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error || "Data tidak ditemukan"}
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Detail Surat PBB</h2>
          <p className="text-muted mb-0">
            <i className="bi bi-file-text me-2"></i>
            NOP: {surat.nomor_objek_pajak}
          </p>
        </div>
        <div className="d-flex gap-2">
          {(user?.roles === "superadmin" || user?.roles === "kepala_dusun") && (
            <>
              {!isEditing ? (
                <button className="btn btn-warning" onClick={() => setIsEditing(true)}>
                  <i className="bi bi-pencil me-1"></i>Edit
                </button>
              ) : (
                <>
                  <button className="btn btn-success" onClick={handleSaveEdit}>
                    <i className="bi bi-check me-1"></i>Simpan
                  </button>
                  <button className="btn btn-secondary" onClick={handleCancelEdit}>
                    <i className="bi bi-x me-1"></i>Batal
                  </button>
                </>
              )}
              <button className="btn btn-danger" onClick={handleDelete}>
                <i className="bi bi-trash me-1"></i>Hapus
              </button>
            </>
          )}
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-1"></i>Kembali
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Nomor Objek Pajak (NOP)</label>
              {isEditing ? (
                <input type="text" className="form-control" value={editForm.nomor_objek_pajak || ""} onChange={(e) => handleEditFormChange("nomor_objek_pajak", e.target.value)} />
              ) : (
                <div className="fw-semibold font-monospace">{surat.nomor_objek_pajak}</div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Tahun Pajak</label>
              {isEditing ? (
                <input type="number" className="form-control" value={editForm.tahun_pajak || ""} onChange={(e) => handleEditFormChange("tahun_pajak", Number(e.target.value))} />
              ) : (
                <div className="fw-semibold">{surat.tahun_pajak}</div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Nama Wajib Pajak</label>
              {isEditing ? (
                <input type="text" className="form-control" value={editForm.nama_wajib_pajak || ""} onChange={(e) => handleEditFormChange("nama_wajib_pajak", e.target.value)} />
              ) : (
                <div className="fw-semibold">{surat.nama_wajib_pajak}</div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Status Pembayaran</label>
              {isEditing ? (
                <select className="form-select" value={editForm.status_pembayaran || ""} onChange={(e) => handleEditFormChange("status_pembayaran", e.target.value)}>
                  <option value="belum_bayar">Belum Bayar</option>
                  <option value="bayar_sendiri_di_bank">Bayar Sendiri di Bank</option>
                  <option value="bayar_lewat_perangkat_desa">Bayar Lewat Perangkat Desa</option>
                  <option value="pindah_rumah">Pindah Rumah</option>
                  <option value="tidak_diketahui">Tidak Diketahui</option>
                </select>
              ) : (
                <>
                  <select
                    className="form-select"
                    value={surat.status_pembayaran}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={user?.roles !== "superadmin" && surat.status_data_pbb !== "sudah_lengkap"}
                  >
                    <option value="belum_bayar">Belum Bayar</option>
                    <option value="bayar_sendiri_di_bank">Bayar Sendiri di Bank</option>
                    <option value="bayar_lewat_perangkat_desa">Bayar Lewat Perangkat Desa</option>
                    <option value="pindah_rumah">Pindah Rumah</option>
                    <option value="tidak_diketahui">Tidak Diketahui</option>
                  </select>
                  {user?.roles !== "superadmin" && surat.status_data_pbb !== "sudah_lengkap" && (
                    <div className="form-text text-warning">
                      <i className="bi bi-info-circle me-1"></i>
                      Status pembayaran hanya dapat diubah setelah data dusun diset sebagai lengkap oleh superadmin
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="col-12">
              <label className="form-label text-muted small mb-1">Alamat Wajib Pajak</label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-control"
                  value={editForm.alamat_wajib_pajak || ""}
                  onChange={(e) => handleEditFormChange("alamat_wajib_pajak", e.target.value)}
                />
              ) : (
                <div className="fw-semibold">{surat.alamat_wajib_pajak || "-"}</div>
              )}
            </div>
            <div className="col-12">
              <label className="form-label text-muted small mb-1">Alamat Objek Pajak</label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-control"
                  value={editForm.alamat_objek_pajak || ""}
                  onChange={(e) => handleEditFormChange("alamat_objek_pajak", e.target.value)}
                />
              ) : (
                <div className="fw-semibold">{surat.alamat_objek_pajak}</div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Luas Tanah</label>
              {isEditing ? (
                <input type="number" className="form-control" value={editForm.luas_tanah || ""} onChange={(e) => handleEditFormChange("luas_tanah", Number(e.target.value))} />
              ) : (
                <div className="fw-semibold">{surat.luas_tanah ? `${surat.luas_tanah} m²` : "-"}</div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Luas Bangunan</label>
              {isEditing ? (
                <input
                  type="number"
                  className="form-control"
                  value={editForm.luas_bangunan || ""}
                  onChange={(e) => handleEditFormChange("luas_bangunan", Number(e.target.value))}
                />
              ) : (
                <div className="fw-semibold">{surat.luas_bangunan ? `${surat.luas_bangunan} m²` : "-"}</div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Nilai Jual Objek Pajak (NJOP)</label>
              {isEditing ? (
                <input
                  type="number"
                  className="form-control"
                  value={editForm.nilai_jual_objek_pajak || ""}
                  onChange={(e) => handleEditFormChange("nilai_jual_objek_pajak", Number(e.target.value))}
                />
              ) : (
                <div className="fw-semibold">{surat.nilai_jual_objek_pajak ? `Rp ${Number(surat.nilai_jual_objek_pajak).toLocaleString("id-ID")}` : "-"}</div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Jumlah Pajak Terhutang</label>
              {isEditing ? (
                <input
                  type="number"
                  className="form-control"
                  value={editForm.jumlah_pajak_terhutang || ""}
                  onChange={(e) => handleEditFormChange("jumlah_pajak_terhutang", Number(e.target.value))}
                />
              ) : (
                <div className="fw-semibold text-primary">Rp {Number(surat.jumlah_pajak_terhutang).toLocaleString("id-ID")}</div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Dusun</label>
              <div className="fw-semibold">{surat.nama_dusun || "-"}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Perangkat Desa</label>
              <div className="fw-semibold">{surat.nama_perangkat || "-"}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Waktu Dibuat</label>
              <div className="small">{formatToWIB(surat.waktu_dibuat)}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Waktu Diperbarui</label>
              <div className="small">{formatToWIB(surat.waktu_diperbarui)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
