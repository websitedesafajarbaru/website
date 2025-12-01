import { Hono } from "hono"

const publicRoutes = new Hono<{ Bindings: Env }>()

publicRoutes.get("/cek-pembayaran/:nomor_objek_pajak", async (c) => {
  try {
    const nomorObjekPajak = c.req.param("nomor_objek_pajak")

    // Get active year
    const activeYear = await c.env.KV.get("active_year")
    const currentYear = activeYear ? parseInt(activeYear) : new Date().getFullYear()

    const surat = await c.env.DB.prepare(
      "SELECT s.nomor_objek_pajak, s.nama_wajib_pajak, s.alamat_objek_pajak, st.tahun_pajak, st.jumlah_pajak_terhutang, st.status_pembayaran, d.nama_dusun FROM surat_pbb s JOIN surat_pbb_tahun st ON s.id = st.id_surat_pbb JOIN dusun d ON s.id_dusun = d.id WHERE s.nomor_objek_pajak = ? AND st.tahun_pajak = ?"
    )
      .bind(nomorObjekPajak, currentYear)
      .first()

    if (!surat) {
      return c.json({ error: "Nomor objek pajak tidak ditemukan atau tidak ada data untuk tahun ini" }, 404)
    }

    return c.json(surat)
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

export default publicRoutes
