import { useState, useEffect } from "react"
import { Aduan } from "../../types"
import { CreateAduanForm } from "../../components/pengaduan-masyarakat/DashboardMasyarakat"
import { DashboardHeader } from "../../components/pengaduan-masyarakat/DashboardHeader"
import { AduanDetail } from "../../components/pengaduan-masyarakat/AduanDetail"
import { AduanTable } from "../../components/pengaduan-masyarakat/AduanTable"
import { FilterSection } from "../../components/pengaduan-masyarakat/DashboardAdmin"

declare global {
  interface Window {
    Swal: {
      fire: (options: { icon?: string; title?: string; text?: string }) => Promise<unknown>
    }
  }
}

export function DashboardMasyarakat() {
  const [activeTab, setActiveTab] = useState<"daftar" | "buat" | "detail">("daftar")
  const [aduan, setAduan] = useState<Aduan[]>([])
  const [selectedAduan, setSelectedAduan] = useState<Aduan | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 100
  const [formData, setFormData] = useState({
    judul: "",
    kategori: "",
    isi_aduan: "",
  })
  const [tanggapan, setTanggapan] = useState("")
  const [readAduan, setReadAduan] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchAduan()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const fetchAduan = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch("/api/aduan/saya", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAduan(data)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDetail = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/aduan/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedAduan(data)
        setTanggapan("")
        setActiveTab("detail")
        setReadAduan(prev => new Set(prev).add(id))
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/aduan", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          judul: formData.judul,
          isi: formData.isi_aduan,
          kategori: formData.kategori,
        }),
      })

      if (response.ok) {
        window.Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Pengaduan berhasil ditambahkan!",
        })
        setFormData({ judul: "", kategori: "", isi_aduan: "" })
        setActiveTab("daftar")
        fetchAduan()
      } else {
        window.Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Pengaduan gagal ditambahkan!",
        })
      }
    } catch (error) {
      console.error("Error:", error)
      window.Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat mengirim pengaduan!",
      })
    }
  }

  const filteredAduan = aduan.filter(
    (item) =>
      item.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kategori?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.isi_aduan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.isi?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const submitTanggapan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAduan) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/aduan/${selectedAduan.id}/tanggapan`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isi_tanggapan: tanggapan }),
      })

      if (response.ok) {
        window.Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Balasan berhasil dikirim",
        })
        setTanggapan("")
        fetchDetail(selectedAduan.id)
      } else {
        window.Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: "Gagal mengirim balasan",
        })
      }
    } catch (error) {
      console.error("Error:", error)
      window.Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Terjadi kesalahan saat mengirim balasan",
      })
    }
  }

  return (
    <div className="container-fluid p-4">
      <DashboardHeader role="masyarakat" />

      {activeTab === "daftar" && (
        <>
          <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Daftar Aduan Saya</h6>
              <button className="btn btn-sm btn-primary" onClick={() => setActiveTab("buat")}>
                <i className="bi bi-plus-circle me-1"></i>Buat Aduan Baru
              </button>
            </div>
          </div>

          <FilterSection statusFilter="" onStatusFilterChange={() => {}} onRefresh={fetchAduan} searchTerm={searchTerm} onSearchChange={setSearchTerm} showStatusFilter={false} />

          <AduanTable
            aduan={filteredAduan}
            loading={loading}
            onViewDetail={fetchDetail}
            role="masyarakat"
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredAduan.length}
            onPageChange={setCurrentPage}
            readAduan={readAduan}
          />
        </>
      )}

      {activeTab === "buat" && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Buat Aduan Baru</h6>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab("daftar")}>
              <i className="bi bi-arrow-left me-1"></i>Kembali ke Daftar
            </button>
          </div>
          <div className="card-body">
            <CreateAduanForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} onCancel={() => setActiveTab("daftar")} />
          </div>
        </div>
      )}

      {activeTab === "detail" && selectedAduan && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Detail Aduan - {selectedAduan.judul}</h6>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab("daftar")}>
              <i className="bi bi-arrow-left me-1"></i>Kembali ke Daftar
            </button>
          </div>
          <div className="card-body">
            <AduanDetail aduan={selectedAduan} tanggapan={tanggapan} setTanggapan={setTanggapan} onSubmitTanggapan={submitTanggapan} />
          </div>
        </div>
      )}
    </div>
  )
}
