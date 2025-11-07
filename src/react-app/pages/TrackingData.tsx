import { useState, useEffect } from "react"
import { apiClient } from "../utils/api"

interface YearData {
  tahun: number
  total_surat_pbb: number
  surat_pbb_belum_bayar: number
  surat_pbb_bayar_sendiri: number
  surat_pbb_bayar_lewat_perangkat: number
  total_aduan: number
  aduan_menunggu: number
  aduan_diproses: number
  aduan_selesai: number
}

interface DeleteModalState {
  show: boolean
  tahun: number | null
  tipe: "surat_pbb" | "aduan" | null
}

export default function TrackingData() {
  const [data, setData] = useState<YearData[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({ show: false, tahun: null, tipe: null })
  const [confirmText, setConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<YearData[]>("/tracking")
      setData(response)
    } catch (error) {
      console.error("Error fetching tracking data:", error)
      alert("Gagal memuat data tracking")
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (tahun: number, tipe: "surat_pbb" | "aduan") => {
    try {
      setExporting(true)
      const response = await apiClient.get<Record<string, unknown>[]>(`/tracking/export/${tahun}?tipe=${tipe}`)
      
      // Convert to CSV
      if (response && response.length > 0) {
        const headers = Object.keys(response[0])
        const csvContent = [
          headers.join(","),
          ...response.map((row: Record<string, unknown>) => 
            headers.map((header) => {
              const value = row[header]
              // Escape quotes and wrap in quotes if contains comma
              const stringValue = String(value ?? "")
              return stringValue.includes(",") ? `"${stringValue.replace(/"/g, '""')}"` : stringValue
            }).join(",")
          ),
        ].join("\n")

        // Download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `${tipe}_${tahun}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        alert("Tidak ada data untuk diekspor")
      }
    } catch (error) {
      console.error("Error exporting data:", error)
      alert("Gagal mengekspor data")
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.tahun || !deleteModal.tipe) return
    
    const expectedText = `HAPUS-${deleteModal.tahun}`
    if (confirmText !== expectedText) {
      alert(`Ketik '${expectedText}' untuk konfirmasi`)
      return
    }

    try {
      setDeleting(true)
      await apiClient.delete(`/tracking/${deleteModal.tahun}?tipe=${deleteModal.tipe}&confirm=${confirmText}`)
      alert("Data berhasil dihapus")
      setDeleteModal({ show: false, tahun: null, tipe: null })
      setConfirmText("")
      fetchData()
    } catch (error) {
      console.error("Error deleting data:", error)
      alert("Gagal menghapus data")
    } finally {
      setDeleting(false)
    }
  }

  const openDeleteModal = (tahun: number, tipe: "surat_pbb" | "aduan") => {
    setDeleteModal({ show: true, tahun, tipe })
    setConfirmText("")
  }

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, tahun: null, tipe: null })
    setConfirmText("")
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="text-muted">Memuat data...</div>
      </div>
    )
  }

  return (
    <div className="container-wide py-4">
      <div className="mb-4">
        <h1 className="h3 mb-2">Tracking Data Per Tahun</h1>
        <p className="text-muted">Kelola dan pantau data surat PBB dan aduan berdasarkan tahun</p>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Tahun</th>
                  <th>Total Surat PBB</th>
                  <th>Status PBB</th>
                  <th>Total Aduan</th>
                  <th>Status Aduan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.tahun}>
                    <td className="fw-bold">{row.tahun}</td>
                    <td>{row.total_surat_pbb}</td>
                    <td>
                      <div className="small">
                        <div>Belum Bayar: {row.surat_pbb_belum_bayar}</div>
                        <div>Bayar Sendiri: {row.surat_pbb_bayar_sendiri}</div>
                        <div>Lewat Perangkat: {row.surat_pbb_bayar_lewat_perangkat}</div>
                      </div>
                    </td>
                    <td>{row.total_aduan}</td>
                    <td>
                      <div className="small">
                        <div>Menunggu: {row.aduan_menunggu}</div>
                        <div>Diproses: {row.aduan_diproses}</div>
                        <div>Selesai: {row.aduan_selesai}</div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-2">
                        {/* Surat PBB Actions */}
                        {row.total_surat_pbb > 0 && (
                          <div>
                            <div className="small fw-bold mb-1">Surat PBB:</div>
                            <div className="btn-group btn-group-sm">
                              <button
                                onClick={() => handleExport(row.tahun, "surat_pbb")}
                                disabled={exporting}
                                className="btn btn-success"
                              >
                                Export
                              </button>
                              <button
                                onClick={() => openDeleteModal(row.tahun, "surat_pbb")}
                                className="btn btn-danger"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Aduan Actions */}
                        {row.total_aduan > 0 && (
                          <div>
                            <div className="small fw-bold mb-1">Aduan:</div>
                            <div className="btn-group btn-group-sm">
                              <button
                                onClick={() => handleExport(row.tahun, "aduan")}
                                disabled={exporting}
                                className="btn btn-success"
                              >
                                Export
                              </button>
                              <button
                                onClick={() => openDeleteModal(row.tahun, "aduan")}
                                className="btn btn-danger"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      Tidak ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Konfirmasi Penghapusan</h5>
              </div>
              <div className="modal-body">
                <p>
                  Anda akan menghapus semua data{" "}
                  <strong>
                    {deleteModal.tipe === "surat_pbb" ? "Surat PBB" : "Aduan"}
                  </strong>{" "}
                  tahun <strong>{deleteModal.tahun}</strong>.
                </p>
                <p className="text-danger fw-bold">Tindakan ini tidak dapat dibatalkan!</p>
                <div className="mb-3">
                  <label className="form-label">
                    Ketik <strong>HAPUS-{deleteModal.tahun}</strong> untuk konfirmasi:
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="form-control"
                    placeholder={`HAPUS-${deleteModal.tahun}`}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="btn btn-secondary"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting || confirmText !== `HAPUS-${deleteModal.tahun}`}
                  className="btn btn-danger"
                >
                  {deleting ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
