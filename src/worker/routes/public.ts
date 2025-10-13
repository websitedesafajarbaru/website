import { Hono } from "hono"

const publicRoutes = new Hono<{ Bindings: Env }>()

publicRoutes.get("/cek-pembayaran/:nomor_objek_pajak", async (c) => {
  try {
    const nomorObjekPajak = c.req.param("nomor_objek_pajak")

    const surat = await c.env.DB.prepare(
      "SELECT s.nomor_objek_pajak, s.nama_wajib_pajak, s.alamat_objek_pajak, s.tahun_pajak, s.jumlah_pajak_terhutang, s.status_pembayaran, d.nama_dusun FROM surat_pbb s JOIN dusun d ON s.id_dusun = d.id WHERE s.nomor_objek_pajak = ?"
    )
      .bind(nomorObjekPajak)
      .first()

    if (!surat) {
      return c.json({ error: "Nomor objek pajak tidak ditemukan" }, 404)
    }

    return c.json(surat)
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

export default publicRoutes
