import { Hono } from "hono"
import { authMiddleware } from "../middleware/auth"
import { JWTPayload, Variables } from "../types"

const trackingRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

// Get data summary per year
trackingRoutes.get("/", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as JWTPayload

    // Only admin can access
    if (user.roles !== "admin") {
      return c.json({ error: "Hanya admin yang dapat mengakses" }, 403)
    }

    // Get years with surat_pbb data
    const suratPBBYears = await c.env.DB.prepare(
      `SELECT 
        tahun_pajak as tahun,
        COUNT(*) as total_surat_pbb,
        SUM(CASE WHEN status_pembayaran = 'bayar_sendiri_di_bank' THEN 1 ELSE 0 END) as bayar_sendiri,
        SUM(CASE WHEN status_pembayaran = 'sudah_bayar' THEN 1 ELSE 0 END) as sudah_bayar,
        SUM(CASE WHEN status_pembayaran = 'pindah_rumah' THEN 1 ELSE 0 END) as pindah_rumah,
        SUM(CASE WHEN status_pembayaran = 'tidak_diketahui' THEN 1 ELSE 0 END) as tidak_diketahui
      FROM surat_pbb 
      GROUP BY tahun_pajak 
      ORDER BY tahun_pajak DESC`
    ).all()

    // Get years with aduan data
    const aduanYears = await c.env.DB.prepare(
      `SELECT 
        strftime('%Y', waktu_dibuat) as tahun,
        COUNT(*) as total_aduan,
        SUM(CASE WHEN status = 'menunggu' THEN 1 ELSE 0 END) as menunggu,
        SUM(CASE WHEN status = 'diproses' THEN 1 ELSE 0 END) as diproses,
        SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) as selesai
      FROM aduan 
      GROUP BY strftime('%Y', waktu_dibuat)
      ORDER BY tahun DESC`
    ).all()

    // Combine results
    const yearMap = new Map()

    // Add surat_pbb data
    for (const row of suratPBBYears.results as Record<string, number>[]) {
      yearMap.set(row.tahun, {
        tahun: row.tahun,
        total_surat_pbb: row.total_surat_pbb,
        surat_pbb_bayar_sendiri: row.bayar_sendiri,
        surat_pbb_sudah_bayar: row.sudah_bayar,
        surat_pbb_pindah_rumah: row.pindah_rumah,
        surat_pbb_tidak_diketahui: row.tidak_diketahui,
        total_aduan: 0,
        aduan_menunggu: 0,
        aduan_diproses: 0,
        aduan_selesai: 0,
      })
    }

    // Add aduan data
    for (const row of aduanYears.results as Record<string, number | string>[]) {
      const tahunNum = typeof row.tahun === "string" ? parseInt(row.tahun) : row.tahun
      const existing = yearMap.get(tahunNum)
      if (existing) {
        existing.total_aduan = row.total_aduan
        existing.aduan_menunggu = row.menunggu
        existing.aduan_diproses = row.diproses
        existing.aduan_selesai = row.selesai
      } else {
        yearMap.set(tahunNum, {
          tahun: tahunNum,
          total_surat_pbb: 0,
          surat_pbb_bayar_sendiri: 0,
          surat_pbb_sudah_bayar: 0,
          surat_pbb_pindah_rumah: 0,
          surat_pbb_tidak_diketahui: 0,
          total_aduan: row.total_aduan,
          aduan_menunggu: row.menunggu,
          aduan_diproses: row.diproses,
          aduan_selesai: row.selesai,
        })
      }
    }

    // Convert map to array and sort by year descending
    const results = Array.from(yearMap.values()).sort((a, b) => b.tahun - a.tahun)

    return c.json(results)
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

// Export data for specific year
trackingRoutes.get("/export/:tahun", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as JWTPayload

    // Only admin can access
    if (user.roles !== "admin") {
      return c.json({ error: "Hanya admin yang dapat mengakses" }, 403)
    }

    const tahun = parseInt(c.req.param("tahun"))
    const tipe = c.req.query("tipe") || "surat_pbb" // surat_pbb or aduan

    if (tipe === "surat_pbb") {
      const data = await c.env.DB.prepare(
        `SELECT 
          sp.id,
          sp.nomor_objek_pajak,
          sp.nama_wajib_pajak,
          sp.alamat_wajib_pajak,
          sp.alamat_objek_pajak,
          sp.luas_tanah,
          sp.luas_bangunan,
          sp.nilai_jual_objek_pajak,
          sp.jumlah_pajak_terhutang,
          sp.tahun_pajak,
          sp.status_pembayaran,
          d.nama_dusun,
          p.nama_lengkap as nama_pengguna,
          sp.waktu_dibuat,
          sp.waktu_diperbarui
        FROM surat_pbb sp
        JOIN dusun d ON sp.id_dusun = d.id
        JOIN pengguna p ON sp.id_pengguna = p.id
        WHERE sp.tahun_pajak = ?
        ORDER BY sp.waktu_dibuat DESC`
      )
        .bind(tahun)
        .all()

      return c.json(data.results)
    } else if (tipe === "aduan") {
      const data = await c.env.DB.prepare(
        `SELECT 
          a.id,
          a.judul,
          a.isi,
          a.kategori,
          a.status,
          p.nama_lengkap as nama_masyarakat,
          m.alamat_rumah,
          m.nomor_telepon,
          a.waktu_dibuat,
          a.waktu_diperbarui
        FROM aduan a
        JOIN masyarakat m ON a.id_masyarakat = m.id
        JOIN pengguna p ON m.id = p.id
        WHERE strftime('%Y', a.waktu_dibuat) = ?
        ORDER BY a.waktu_dibuat DESC`
      )
        .bind(tahun.toString())
        .all()

      return c.json(data.results)
    }

    return c.json({ error: "Tipe data tidak valid" }, 400)
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

// Prune/delete data for specific year
trackingRoutes.delete("/:tahun", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as JWTPayload

    // Only admin can access
    if (user.roles !== "admin") {
      return c.json({ error: "Hanya admin yang dapat mengakses" }, 403)
    }

    const tahun = parseInt(c.req.param("tahun"))
    const tipe = c.req.query("tipe") || "surat_pbb" // surat_pbb or aduan
    const confirmText = c.req.query("confirm")

    // Require confirmation
    if (confirmText !== `HAPUS-${tahun}`) {
      return c.json({ error: "Konfirmasi tidak valid. Ketik 'HAPUS-" + tahun + "' untuk konfirmasi" }, 400)
    }

    if (tipe === "surat_pbb") {
      const result = await c.env.DB.prepare("DELETE FROM surat_pbb WHERE tahun_pajak = ?").bind(tahun).run()

      return c.json({
        message: `Berhasil menghapus ${result.meta.changes} surat PBB tahun ${tahun}`,
        deleted: result.meta.changes,
      })
    } else if (tipe === "aduan") {
      // First, get aduan IDs to delete related images
      const aduanIds = await c.env.DB.prepare(
        `SELECT id FROM aduan WHERE strftime('%Y', waktu_dibuat) = ?`
      )
        .bind(tahun.toString())
        .all()

      // Delete related images
      for (const row of aduanIds.results as Record<string, string>[]) {
        await c.env.DB.prepare("DELETE FROM gambar_aduan WHERE id_aduan = ?").bind(row.id).run()
      }

      // Delete aduan (tanggapan will be cascade deleted)
      const result = await c.env.DB.prepare(
        `DELETE FROM aduan WHERE strftime('%Y', waktu_dibuat) = ?`
      )
        .bind(tahun.toString())
        .run()

      return c.json({
        message: `Berhasil menghapus ${result.meta.changes} aduan tahun ${tahun}`,
        deleted: result.meta.changes,
      })
    }

    return c.json({ error: "Tipe data tidak valid" }, 400)
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

export default trackingRoutes
