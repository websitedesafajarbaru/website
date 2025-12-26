import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import Swal from "sweetalert2"

interface ProfileData {
  id: string
  nama_lengkap: string
  roles: string
  alamat_rumah?: string
  nomor_telepon?: string
}

interface UpdateProfileData {
  nama_lengkap: string
  password?: string
  alamat_rumah?: string
  nomor_telepon?: string
}

export function Settings() {
  const { user, apiRequest, updateUser } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    password: "",
    confirmPassword: "",
    alamat_rumah: "",
    nomor_telepon: "",
  })

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiRequest<ProfileData>("/api/auth/profile")
      setProfile(data)
      setFormData({
        nama_lengkap: data.nama_lengkap,
        password: "",
        confirmPassword: "",
        alamat_rumah: data.alamat_rumah || "",
        nomor_telepon: data.nomor_telepon || "",
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }, [apiRequest])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password && formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Password dan konfirmasi password tidak cocok",
      })
      return
    }

    try {
      setSaving(true)
      const updateData: UpdateProfileData = {
        nama_lengkap: formData.nama_lengkap,
      }
      if (formData.password) {
        updateData.password = formData.password
      }

      await apiRequest("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Profil berhasil diperbarui",
        timer: 2000,
        showConfirmButton: false,
      })
      updateUser({ ...user!, nama_lengkap: formData.nama_lengkap })
      fetchProfile()
    } catch (error) {
      console.error("Error updating profile:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal memperbarui profil",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  if (!profile) {
    return <div className="text-center">Gagal memuat profil</div>
  }

  return (
    <div className="container-fluid p-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Pengaturan Profil</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nama Lengkap</label>
                  <input type="text" className="form-control" value={formData.nama_lengkap} onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })} required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password Baru (kosongkan jika tidak ingin mengubah)</label>
                  <input type="password" className="form-control" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    className="form-control"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
