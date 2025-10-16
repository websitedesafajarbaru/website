import { Hono } from "hono"
import { authMiddleware } from "../middleware/auth"
import { generateId } from "../utils/db"
import { JWTPayload, Variables } from "../types"

const aduanRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

aduanRoutes.post("/", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as JWTPayload
    const { judul, isi, kategori } = await c.req.json()

    if (!judul || !isi || !kategori) {
      return c.json({ error: "Semua field harus diisi" }, 400)
    }

    const aduanId = generateId()

    await c.env.DB.prepare("INSERT INTO aduan (id, judul, isi, kategori, status, id_masyarakat) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(aduanId, judul, isi, kategori, "menunggu", user.userId)
      .run()

    return c.json(
      {
        message: "Aduan berhasil dibuat",
        aduanId,
      },
      201
    )
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

aduanRoutes.get("/saya", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as JWTPayload

    const aduan = await c.env.DB.prepare("SELECT * FROM aduan WHERE id_masyarakat = ? ORDER BY waktu_dibuat DESC").bind(user.userId).all()

    return c.json(aduan.results)
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

aduanRoutes.get("/:id", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as JWTPayload
    const aduanId = c.req.param("id")

    const aduan = await c.env.DB.prepare(
      "SELECT a.*, p.nama_lengkap, m.alamat_rumah, m.nomor_telepon FROM aduan a JOIN masyarakat m ON a.id_masyarakat = m.id JOIN pengguna p ON m.id = p.id WHERE a.id = ?"
    )
      .bind(aduanId)
      .first()

    if (!aduan) {
      return c.json({ error: "Aduan tidak ditemukan" }, 404)
    }

    if (user.roles !== "admin" && aduan.id_masyarakat !== user.userId) {
      return c.json({ error: "Tidak memiliki akses" }, 403)
    }

    const tanggapan = await c.env.DB.prepare(
      "SELECT t.*, p.nama_lengkap FROM tanggapan_aduan t JOIN pengguna p ON t.id_pengguna = p.id WHERE t.id_aduan = ? ORDER BY t.waktu_dibuat DESC"
    )
      .bind(aduanId)
      .all()

    return c.json({
      ...aduan,
      tanggapan: tanggapan.results,
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

aduanRoutes.get("/", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as JWTPayload

    if (user.roles !== "admin") {
      return c.json({ error: "Hanya admin yang dapat mengakses" }, 403)
    }

    const status = c.req.query("status")
    let query = "SELECT a.*, m.alamat_rumah, m.nomor_telepon, p.nama_lengkap FROM aduan a JOIN masyarakat m ON a.id_masyarakat = m.id JOIN pengguna p ON m.id = p.id"

    if (status) {
      query += " WHERE a.status = ?"
    }

    query += " ORDER BY a.waktu_dibuat DESC"

    const result = status ? await c.env.DB.prepare(query).bind(status).all() : await c.env.DB.prepare(query).all()

    return c.json(result.results)
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

aduanRoutes.put("/:id/status", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as JWTPayload

    if (user.roles !== "admin") {
      return c.json({ error: "Hanya admin yang dapat mengubah status" }, 403)
    }

    const aduanId = c.req.param("id")
    const { status } = await c.req.json()

    if (!["menunggu", "diproses", "selesai"].includes(status)) {
      return c.json({ error: "Status tidak valid" }, 400)
    }

    await c.env.DB.prepare('UPDATE aduan SET status = ?, waktu_diperbarui = datetime("now") WHERE id = ?').bind(status, aduanId).run()

    return c.json({ message: "Status aduan berhasil diperbarui" })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

aduanRoutes.post("/:id/tanggapan", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as JWTPayload

    if (user.roles !== "admin") {
      return c.json({ error: "Hanya admin yang dapat memberikan tanggapan" }, 403)
    }

    const aduanId = c.req.param("id")
    const { isi_tanggapan } = await c.req.json()

    if (!isi_tanggapan) {
      return c.json({ error: "Isi tanggapan harus diisi" }, 400)
    }

    const tanggapanId = generateId()

    // Check if user is also a perangkat_desa
    const perangkatDesa = await c.env.DB.prepare("SELECT id FROM perangkat_desa WHERE id = ?").bind(user.userId).first()

    await c.env.DB.prepare("INSERT INTO tanggapan_aduan (id, isi_tanggapan, id_aduan, id_perangkat_desa, id_pengguna) VALUES (?, ?, ?, ?, ?)")
      .bind(tanggapanId, isi_tanggapan, aduanId, perangkatDesa?.id || null, user.userId)
      .run()

    // Update aduan waktu_diperbarui
    await c.env.DB.prepare('UPDATE aduan SET waktu_diperbarui = datetime("now") WHERE id = ?').bind(aduanId).run()

    return c.json(
      {
        message: "Tanggapan berhasil ditambahkan",
        tanggapanId,
      },
      201
    )
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

export default aduanRoutes
