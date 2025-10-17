import { useState, useEffect } from "react"
import { Aduan } from "../../types"
import { CreateAduanForm } from "../../components/pengaduan-masyarakat/DashboardMasyarakat"
import { DashboardHeader } from "../../components/pengaduan-masyarakat/DashboardHeader"
import { AduanDetail } from "../../components/pengaduan-masyarakat/AduanDetail"
import { AduanTable } from "../../components/pengaduan-masyarakat/AduanTable"

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
        setActiveTab("detail")
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

  return (
    <div className="container-fluid p-4">
      <DashboardHeader role="masyarakat" activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "daftar" && (
        <AduanTable
          aduan={filteredAduan}
          loading={loading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onViewDetail={fetchDetail}
          onCreateNew={() => setActiveTab("buat")}
          onRefresh={fetchAduan}
          role="masyarakat"
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredAduan.length}
          onPageChange={setCurrentPage}
        />
      )}

      {activeTab === "buat" && <CreateAduanForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} onCancel={() => setActiveTab("daftar")} />}

      {activeTab === "detail" && selectedAduan && <AduanDetail aduan={selectedAduan} />}
    </div>
  )
}
