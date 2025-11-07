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

    const aduan = await c.env.DB.prepare(
      "SELECT a.*, COUNT(t.id) as jumlah_tanggapan FROM aduan a LEFT JOIN tanggapan_aduan t ON a.id = t.id_aduan WHERE a.id_masyarakat = ? GROUP BY a.id ORDER BY a.waktu_dibuat DESC"
    )
      .bind(user.userId)
      .all()

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
      "SELECT t.*, p.nama_lengkap, p.roles FROM tanggapan_aduan t JOIN pengguna p ON t.id_pengguna = p.id WHERE t.id_aduan = ? ORDER BY t.waktu_dibuat DESC"
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
    let query =
      "SELECT a.*, m.alamat_rumah, m.nomor_telepon, p.nama_lengkap, COUNT(t.id) as jumlah_tanggapan FROM aduan a JOIN masyarakat m ON a.id_masyarakat = m.id JOIN pengguna p ON m.id = p.id LEFT JOIN tanggapan_aduan t ON a.id = t.id_aduan"

    if (status) {
      query += " WHERE a.status = ?"
    }

    query += " GROUP BY a.id ORDER BY a.waktu_dibuat DESC"

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
    const aduanId = c.req.param("id")
    const { isi_tanggapan } = await c.req.json()

    if (!isi_tanggapan) {
      return c.json({ error: "Isi tanggapan harus diisi" }, 400)
    }

    const aduan = await c.env.DB.prepare("SELECT id_masyarakat FROM aduan WHERE id = ?").bind(aduanId).first()
    if (!aduan) {
      return c.json({ error: "Aduan tidak ditemukan" }, 404)
    }

    if (user.roles !== "admin" && aduan.id_masyarakat !== user.userId) {
      return c.json({ error: "Tidak memiliki akses untuk memberikan tanggapan" }, 403)
    }

    const tanggapanId = generateId()

    const perangkatDesa = user.roles === "admin" ? await c.env.DB.prepare("SELECT id FROM perangkat_desa WHERE id = ?").bind(user.userId).first() : null

    await c.env.DB.prepare("INSERT INTO tanggapan_aduan (id, isi_tanggapan, id_aduan, id_perangkat_desa, id_pengguna) VALUES (?, ?, ?, ?, ?)")
      .bind(tanggapanId, isi_tanggapan, aduanId, perangkatDesa?.id || null, user.userId)
      .run()

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

aduanRoutes.post("/upload-image", authMiddleware, async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return c.json({ error: "File tidak ditemukan" }, 400)
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return c.json({ error: "Hanya file gambar yang diperbolehkan" }, 400)
    }

    // Check file size (max 1MB)
    if (file.size > 1 * 1024 * 1024) {
      return c.json({ error: "Ukuran file maksimal 1MB" }, 400)
    }

    const imageId = generateId()
    const arrayBuffer = await file.arrayBuffer()

    // Store in D1 as base64 to avoid binary issues
    // Convert arrayBuffer to base64 in chunks to avoid stack overflow
    const uint8Array = new Uint8Array(arrayBuffer)
    let binaryString = ''
    const chunkSize = 8192
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize)
      binaryString += String.fromCharCode(...chunk)
    }
    const base64Data = btoa(binaryString)

    await c.env.DB.prepare("INSERT INTO gambar_aduan (id, nama_file, tipe_file, data) VALUES (?, ?, ?, ?)").bind(imageId, file.name, file.type, base64Data).run()

    // Return the URL
    const origin = new URL(c.req.url).origin
    const url = `${origin}/api/aduan/images/${imageId}`

    return c.json({ location: url })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

aduanRoutes.options("/images/:id", async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  })
})

aduanRoutes.get("/images/:id", async (c) => {
  try {
    const imageId = c.req.param("id")

    const result = await c.env.DB.prepare("SELECT data, tipe_file FROM gambar_aduan WHERE id = ?").bind(imageId).first()

    if (!result) {
      return c.json({ error: "Gambar tidak ditemukan" }, 404)
    }

    const base64Data = result.data as string
    const contentType = result.tipe_file as string

    if (!base64Data) {
      return c.json({ error: "Data gambar tidak valid" }, 500)
    }

    // Decode base64 to binary
    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const response = new Response(bytes.buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Content-Length": bytes.length.toString(),
      },
    })

    return response
  } catch (error) {
    console.error("Error in GET /images:", error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

export default aduanRoutes
