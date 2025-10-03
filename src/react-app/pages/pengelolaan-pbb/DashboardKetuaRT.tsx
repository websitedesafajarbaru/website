import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { SuratPBB } from "../../types"
import { formatStatusPembayaran, getStatusPembayaranColor } from "../../utils/formatters"

export function DashboardKetuaRT() {
  const { token } = useAuth()
  const [suratPBB, setSuratPBB] = useState<SuratPBB[]>([])
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear())

  const fetchActiveYear = useCallback(async () => {
    try {
      const response = await fetch("/api/statistik/active-year", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setActiveYear(data.active_year)
      }
    } catch (error) {
      console.error("Error fetching active year:", error)
    }
  }, [token])

  const fetchSuratPBB = useCallback(async () => {
    try {
      const response = await fetch("/api/surat-pbb", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (response.ok) {
        setSuratPBB(result.surat_pbb || result)
        if (result.active_year) {
          setActiveYear(result.active_year)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }, [token])

  useEffect(() => {
    const initData = async () => {
      await fetchActiveYear()
      fetchSuratPBB()
    }
    initData()
  }, [fetchActiveYear, fetchSuratPBB])

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Dashboard Ketua RT</h2>
        <div className="text-end">
          <div className="badge bg-primary fs-6">
            <i className="bi bi-calendar me-1"></i>Tahun {activeYear}
          </div>
          <div className="small text-muted mt-1">Data yang ditampilkan untuk tahun {activeYear}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5>Daftar Surat PBB</h5>
          <table className="table">
            <thead>
              <tr>
                <th>NOP</th>
                <th>Nama Wajib Pajak</th>
                <th>Alamat</th>
                <th>Tahun</th>
                <th>Jumlah Pajak</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {suratPBB.map((s) => (
                <tr key={s.id}>
                  <td>{s.nomor_objek_pajak}</td>
                  <td>{s.nama_wajib_pajak}</td>
                  <td>{s.alamat_objek_pajak}</td>
                  <td>{s.tahun_pajak}</td>
                  <td>Rp {Number(s.jumlah_pajak_terhutang).toLocaleString("id-ID")}</td>
                  <td>
                    <span className={`badge bg-${getStatusPembayaranColor(s.status_pembayaran)}`}>{formatStatusPembayaran(s.status_pembayaran)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
