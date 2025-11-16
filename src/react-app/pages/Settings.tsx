import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"

interface ProfileData {
  id: string
  nama_lengkap: string
  username: string
  roles: string
  alamat_rumah?: string
  nomor_telepon?: string
}

interface UpdateProfileData {
  nama_lengkap: string
  username: string
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
    username: "",
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
        username: data.username,
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
      alert("Password dan konfirmasi password tidak cocok")
      return
    }

    try {
      setSaving(true)
      const updateData: UpdateProfileData = {
        nama_lengkap: formData.nama_lengkap,
        username: formData.username,
      }
      if (formData.password) {
        updateData.password = formData.password
      }
      if (user?.roles === "masyarakat") {
        updateData.alamat_rumah = formData.alamat_rumah
        updateData.nomor_telepon = formData.nomor_telepon
      }

      await apiRequest("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      alert("Profil berhasil diperbarui")
      updateUser({ ...user!, nama_lengkap: formData.nama_lengkap, username: formData.username })
      fetchProfile()
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Gagal memperbarui profil")
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
                  <label className="form-label">Username</label>
                  <input type="text" className="form-control" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
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
                {user?.roles === "masyarakat" && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Alamat Rumah</label>
                      <textarea className="form-control" value={formData.alamat_rumah} onChange={(e) => setFormData({ ...formData, alamat_rumah: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Nomor Telepon</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.nomor_telepon}
                        onChange={(e) => setFormData({ ...formData, nomor_telepon: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}
                <button type="submit" className="btn btn-primary" disabled={saving}>
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
