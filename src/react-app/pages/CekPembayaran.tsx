import { useState } from "react"
import { formatStatusPembayaran, getStatusPembayaranColor } from "../utils/formatters"

interface PembayaranPBB {
  nomor_objek_pajak: string
  nama_wajib_pajak: string
  alamat_objek_pajak: string
  tahun_pajak: number
  jumlah_pajak_terhutang: number
  status_pembayaran: string
  nama_dusun: string
}

export function CekPembayaran() {
  const [nomorObjekPajak, setNomorObjekPajak] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState<PembayaranPBB | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setData(null)

    try {
      const response = await fetch(`/api/cek-pembayaran/${nomorObjekPajak}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Terjadi kesalahan")
      }

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card">
          <div className="card-header">
            <h4 className="mb-0">Cek Status Pembayaran PBB</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nomor Objek Pajak</label>
                <input
                  type="text"
                  className="form-control"
                  value={nomorObjekPajak}
                  onChange={(e) => setNomorObjekPajak(e.target.value)}
                  required
                  placeholder="Masukkan nomor objek pajak"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Mencari..." : "Cek Status"}
              </button>
            </form>

            {error && <div className="alert alert-danger mt-3">{error}</div>}

            {data && (
              <div className="mt-4">
                <h5>Hasil Pencarian</h5>
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th>Nomor Objek Pajak</th>
                      <td>{data.nomor_objek_pajak}</td>
                    </tr>
                    <tr>
                      <th>Nama Wajib Pajak</th>
                      <td>{data.nama_wajib_pajak}</td>
                    </tr>
                    <tr>
                      <th>Alamat Objek Pajak</th>
                      <td>{data.alamat_objek_pajak}</td>
                    </tr>
                    <tr>
                      <th>Dusun</th>
                      <td>{data.nama_dusun}</td>
                    </tr>
                    <tr>
                      <th>Tahun Pajak</th>
                      <td>{data.tahun_pajak}</td>
                    </tr>
                    <tr>
                      <th>Jumlah Pajak</th>
                      <td>Rp {Number(data.jumlah_pajak_terhutang).toLocaleString("id-ID")}</td>
                    </tr>
                    <tr>
                      <th>Status Pembayaran</th>
                      <td>
                        <span className={`badge bg-${getStatusPembayaranColor(data.status_pembayaran)}`}>{formatStatusPembayaran(data.status_pembayaran)}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
