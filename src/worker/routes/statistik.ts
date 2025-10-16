import { Hono } from "hono"
import { authMiddleware } from "../middleware/auth"
import { JWTPayload, Variables } from "../types"

const statistikRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

statistikRoutes.use("/*", authMiddleware)
statistikRoutes.get("/active-year", async (c) => {
  try {
    const activeYear = await c.env.KV.get("active_year")
    const currentYear = new Date().getFullYear()

    return c.json({
      active_year: activeYear ? parseInt(activeYear) : currentYear,
    })
  } catch (err) {
    console.error("Error getting active year:", err)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

statistikRoutes.post("/active-year", async (c) => {
  try {
    const user = c.get("user") as JWTPayload

    if (user.roles !== "admin") {
      return c.json({ error: "Hanya admin yang dapat mengatur tahun aktif" }, 403)
    }

    const { year } = await c.req.json()

    if (!year || typeof year !== "number" || year < 2020 || year > 2050) {
      return c.json({ error: "Tahun tidak valid" }, 400)
    }

    await c.env.KV.put("active_year", year.toString())

    return c.json({
      message: "Tahun aktif berhasil diatur",
      active_year: year,
    })
  } catch (err) {
    console.error("Error setting active year:", err)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

statistikRoutes.get("/dusun/:id", async (c) => {
  try {
    const dusunId = c.req.param("id")

    const activeYear = await c.env.KV.get("active_year")
    const currentYear = activeYear ? parseInt(activeYear) : new Date().getFullYear()

    const dusun = await c.env.DB.prepare("SELECT * FROM dusun WHERE id = ?").bind(dusunId).first()

    if (!dusun) {
      return c.json({ error: "Dusun tidak ditemukan" }, 404)
    }

    const totalPajakResult = await c.env.DB.prepare(
      "SELECT COALESCE(SUM(jumlah_pajak_terhutang), 0) as total_pajak_terhutang FROM surat_pbb WHERE id_dusun = ? AND tahun_pajak = ?"
    )
      .bind(dusunId, currentYear)
      .first()

    const pajakDibayarResult = await c.env.DB.prepare(
      "SELECT COALESCE(SUM(jumlah_pajak_terhutang), 0) as total_pajak_dibayar FROM surat_pbb WHERE id_dusun = ? AND tahun_pajak = ? AND status_pembayaran IN ('bayar_sendiri_di_bank', 'bayar_lewat_perangkat_desa')"
    )
      .bind(dusunId, currentYear)
      .first()

    const statusCount = await c.env.DB.prepare("SELECT status_pembayaran, COUNT(*) as jumlah FROM surat_pbb WHERE id_dusun = ? AND tahun_pajak = ? GROUP BY status_pembayaran")
      .bind(dusunId, currentYear)
      .all()

    const totalSurat = await c.env.DB.prepare("SELECT COUNT(*) as total FROM surat_pbb WHERE id_dusun = ? AND tahun_pajak = ?").bind(dusunId, currentYear).first()

    const totalSuratDibayar = await c.env.DB.prepare(
      "SELECT COUNT(*) as total FROM surat_pbb WHERE id_dusun = ? AND tahun_pajak = ? AND status_pembayaran IN ('bayar_sendiri_di_bank', 'bayar_lewat_perangkat_desa')"
    )
      .bind(dusunId, currentYear)
      .first()

    const totalSuratBelumBayar = await c.env.DB.prepare('SELECT COUNT(*) as total FROM surat_pbb WHERE id_dusun = ? AND tahun_pajak = ? AND status_pembayaran = "belum_bayar"')
      .bind(dusunId, currentYear)
      .first()

    const totalSuratTidakDiketahui = await c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM surat_pbb WHERE id_dusun = ? AND tahun_pajak = ? AND status_pembayaran = "tidak_diketahui"'
    )
      .bind(dusunId, currentYear)
      .first()

    const statusPembayaran = statusCount.results || []

    const totalPajak = Number(totalPajakResult?.total_pajak_terhutang || 0)
    const totalDibayar = Number(pajakDibayarResult?.total_pajak_dibayar || 0)
    const persentasePembayaran = totalPajak > 0 ? (totalDibayar / totalPajak) * 100 : 0

    const suratPBBList = await c.env.DB.prepare(
      "SELECT sp.*, d.nama_dusun, p.nama_lengkap as nama_perangkat FROM surat_pbb sp LEFT JOIN dusun d ON sp.id_dusun = d.id LEFT JOIN pengguna p ON sp.id_perangkat_desa = p.id WHERE sp.id_dusun = ? AND sp.tahun_pajak = ? ORDER BY sp.waktu_dibuat DESC"
    )
      .bind(dusunId, currentYear)
      .all()

    return c.json({
      dusun,
      active_year: currentYear,
      total_pajak_terhutang: totalPajak,
      total_pajak_dibayar: totalDibayar,
      total_surat: Number(totalSurat?.total || 0),
      total_surat_dibayar: Number(totalSuratDibayar?.total || 0),
      total_surat_belum_bayar: Number(totalSuratBelumBayar?.total || 0),
      total_surat_tidak_diketahui: Number(totalSuratTidakDiketahui?.total || 0),
      persentase_pembayaran: persentasePembayaran,
      statusPembayaran,
      surat_pbb: suratPBBList.results || [],
    })
  } catch (err) {
    console.error("Error in /dusun/:id:", err)
    return c.json({ error: "Terjadi kesalahan server", details: err instanceof Error ? err.message : String(err) }, 500)
  }
})

statistikRoutes.get("/laporan", async (c) => {
  try {
    const user = c.get("user") as JWTPayload

    if (user.roles !== "admin") {
      return c.json({ error: "Hanya admin yang dapat mengakses laporan" }, 403)
    }

    const activeYear = await c.env.KV.get("active_year")
    const currentYear = activeYear ? parseInt(activeYear) : new Date().getFullYear()

    const dusunList = await c.env.DB.prepare(
      `SELECT d.id, d.nama_dusun, d.status_data_pbb, 
       (SELECT p.nama_lengkap FROM perangkat_desa pd 
        JOIN pengguna p ON pd.id = p.id 
        WHERE pd.id_dusun = d.id AND pd.jabatan = 'kepala_dusun' LIMIT 1) as nama_kepala_dusun 
       FROM dusun d`
    ).all()

    const statistikPerDusun = []

    for (const dusun of dusunList.results) {
      const totalPajakResult = await c.env.DB.prepare(
        "SELECT COALESCE(SUM(jumlah_pajak_terhutang), 0) as total_pajak_terhutang FROM surat_pbb WHERE id_dusun = ? AND tahun_pajak = ?"
      )
        .bind(dusun.id, currentYear)
        .first()

      const pajakDibayarResult = await c.env.DB.prepare(
        "SELECT COALESCE(SUM(jumlah_pajak_terhutang), 0) as total_pajak_dibayar FROM surat_pbb WHERE id_dusun = ? AND tahun_pajak = ? AND status_pembayaran IN ('bayar_sendiri_di_bank', 'bayar_lewat_perangkat_desa')"
      )
        .bind(dusun.id, currentYear)
        .first()

      const totalSurat = await c.env.DB.prepare("SELECT COUNT(*) as total FROM surat_pbb WHERE id_dusun = ? AND tahun_pajak = ?").bind(dusun.id, currentYear).first()

      const totalSuratDibayar = await c.env.DB.prepare(
        "SELECT COUNT(*) as total FROM surat_pbb WHERE id_dusun = ? AND tahun_pajak = ? AND status_pembayaran IN ('bayar_sendiri_di_bank', 'bayar_lewat_perangkat_desa')"
      )
        .bind(dusun.id, currentYear)
        .first()

      const totalSuratBelumBayar = await c.env.DB.prepare('SELECT COUNT(*) as total FROM surat_pbb WHERE id_dusun = ? AND tahun_pajak = ? AND status_pembayaran = "belum_bayar"')
        .bind(dusun.id, currentYear)
        .first()

      const totalSuratTidakDiketahui = await c.env.DB.prepare(
        'SELECT COUNT(*) as total FROM surat_pbb WHERE id_dusun = ? AND tahun_pajak = ? AND status_pembayaran = "tidak_diketahui"'
      )
        .bind(dusun.id, currentYear)
        .first()

      const totalPerangkatDesa = await c.env.DB.prepare("SELECT COUNT(*) as total FROM perangkat_desa WHERE id_dusun = ?").bind(dusun.id).first()

      const totalPajak = Number(totalPajakResult?.total_pajak_terhutang || 0)
      const totalDibayar = Number(pajakDibayarResult?.total_pajak_dibayar || 0)
      const persentasePembayaran = totalPajak > 0 ? (totalDibayar / totalPajak) * 100 : 0

      statistikPerDusun.push({
        ...dusun,
        total_pajak_terhutang: totalPajak,
        total_pajak_dibayar: totalDibayar,
        total_surat: Number(totalSurat?.total || 0),
        total_surat_dibayar: Number(totalSuratDibayar?.total || 0),
        total_surat_belum_bayar: Number(totalSuratBelumBayar?.total || 0),
        total_surat_tidak_diketahui: Number(totalSuratTidakDiketahui?.total || 0),
        total_perangkat_desa: Number(totalPerangkatDesa?.total || 0),
        persentase_pembayaran: persentasePembayaran,
      })
    }

    const totalKeseluruhan = await c.env.DB.prepare("SELECT COALESCE(SUM(jumlah_pajak_terhutang), 0) as total_pajak_terhutang FROM surat_pbb WHERE tahun_pajak = ?")
      .bind(currentYear)
      .first()

    const totalDibayarKeseluruhan = await c.env.DB.prepare(
      "SELECT COALESCE(SUM(jumlah_pajak_terhutang), 0) as total_pajak_dibayar FROM surat_pbb WHERE tahun_pajak = ? AND status_pembayaran IN ('bayar_sendiri_di_bank', 'bayar_lewat_perangkat_desa')"
    )
      .bind(currentYear)
      .first()

    const totalSuratKeseluruhan = await c.env.DB.prepare("SELECT COUNT(*) as total FROM surat_pbb WHERE tahun_pajak = ?").bind(currentYear).first()

    const totalSuratDibayarKeseluruhan = await c.env.DB.prepare(
      "SELECT COUNT(*) as total FROM surat_pbb WHERE tahun_pajak = ? AND status_pembayaran IN ('bayar_sendiri_di_bank', 'bayar_lewat_perangkat_desa')"
    )
      .bind(currentYear)
      .first()

    const totalSuratBelumBayarKeseluruhan = await c.env.DB.prepare('SELECT COUNT(*) as total FROM surat_pbb WHERE tahun_pajak = ? AND status_pembayaran = "belum_bayar"')
      .bind(currentYear)
      .first()

    const totalPajakAll = Number(totalKeseluruhan?.total_pajak_terhutang || 0)
    const totalDibayarAll = Number(totalDibayarKeseluruhan?.total_pajak_dibayar || 0)
    const persentasePembayaranKeseluruhan = totalPajakAll > 0 ? (totalDibayarAll / totalPajakAll) * 100 : 0

    return c.json({
      active_year: currentYear,
      statistik_per_dusun: statistikPerDusun,
      total_pajak_terhutang_keseluruhan: totalPajakAll,
      total_pajak_dibayar_keseluruhan: totalDibayarAll,
      total_surat_keseluruhan: Number(totalSuratKeseluruhan?.total || 0),
      total_surat_dibayar_keseluruhan: Number(totalSuratDibayarKeseluruhan?.total || 0),
      total_surat_belum_bayar_keseluruhan: Number(totalSuratBelumBayarKeseluruhan?.total || 0),
      persentase_pembayaran_keseluruhan: persentasePembayaranKeseluruhan,
    })
  } catch (err) {
    console.error("Error in /laporan:", err)
    return c.json({ error: "Terjadi kesalahan server", details: err instanceof Error ? err.message : String(err) }, 500)
  }
})

export default statistikRoutes
