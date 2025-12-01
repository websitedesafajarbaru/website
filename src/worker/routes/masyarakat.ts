import { Hono } from "hono"
import { authMiddleware } from "../middleware/auth"
import { hashPassword } from "../utils/hash"
import { generateId } from "../utils/db"
import { JWTPayload, Variables } from "../types"

const masyarakatRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

masyarakatRoutes.get("/", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as JWTPayload

    if (user.roles !== "admin") {
      return c.json({ error: "Hanya admin yang dapat mengakses" }, 403)
    }

    const masyarakat = await c.env.DB.prepare(
      "SELECT p.id, p.nama_lengkap, p.roles, p.waktu_dibuat, p.waktu_diperbarui, m.alamat_rumah, m.nomor_telepon, m.status FROM pengguna p JOIN masyarakat m ON p.id = m.id ORDER BY p.waktu_dibuat DESC"
    ).all()

    return c.json(masyarakat.results)
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

masyarakatRoutes.post("/", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as JWTPayload

    if (user.roles !== "admin") {
      return c.json({ error: "Hanya admin yang dapat membuat masyarakat" }, 403)
    }

    const { nama_lengkap, nomor_telepon, alamat_rumah, password } = await c.req.json()

    if (!nama_lengkap || !nomor_telepon || !alamat_rumah || !password) {
      return c.json({ error: "Semua field harus diisi" }, 400)
    }

    const existingUser = await c.env.DB.prepare("SELECT id FROM pengguna WHERE LOWER(nama_lengkap) = ?").bind(nama_lengkap.toLowerCase()).first()

    if (existingUser) {
      return c.json({ error: "Nama lengkap sudah digunakan" }, 400)
    }

    const userId = generateId()
    const hashedPassword = await hashPassword(password)

    await c.env.DB.batch([
      c.env.DB.prepare("INSERT INTO pengguna (id, nama_lengkap, password, roles) VALUES (?, ?, ?, ?)").bind(
        userId,
        nama_lengkap,
        hashedPassword,
        "masyarakat"
      ),
      c.env.DB.prepare("INSERT INTO masyarakat (id, alamat_rumah, nomor_telepon) VALUES (?, ?, ?)").bind(userId, alamat_rumah, nomor_telepon),
    ])

    return c.json(
      {
        message: "Masyarakat berhasil dibuat",
        userId,
      },
      201
    )
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

masyarakatRoutes.put("/:id", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as JWTPayload

    if (user.roles !== "admin") {
      return c.json({ error: "Hanya admin yang dapat mengupdate masyarakat" }, 403)
    }

    const masyarakatId = c.req.param("id")
    const { nama_lengkap, nomor_telepon, alamat_rumah, password } = await c.req.json()

    if (!nama_lengkap || !nomor_telepon || !alamat_rumah) {
      return c.json({ error: "Nama lengkap, nomor telepon, dan alamat rumah harus diisi" }, 400)
    }

    const existingUser = await c.env.DB.prepare("SELECT id FROM pengguna WHERE LOWER(nama_lengkap) = ? AND id != ?").bind(nama_lengkap.toLowerCase(), masyarakatId).first()

    if (existingUser) {
      return c.json({ error: "Nama lengkap sudah digunakan" }, 400)
    }

    const updates = []
    const values = []

    updates.push("nama_lengkap = ?")
    values.push(nama_lengkap)

    if (password) {
      const hashedPassword = await hashPassword(password)
      updates.push("password = ?")
      values.push(hashedPassword)
    }

    updates.push('waktu_diperbarui = datetime("now")')
    values.push(masyarakatId)

    await c.env.DB.prepare(`UPDATE pengguna SET ${updates.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run()

    await c.env.DB.prepare('UPDATE masyarakat SET alamat_rumah = ?, nomor_telepon = ?, waktu_diperbarui = datetime("now") WHERE id = ?')
      .bind(alamat_rumah, nomor_telepon, masyarakatId)
      .run()

    return c.json({ message: "Masyarakat berhasil diperbarui" })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

masyarakatRoutes.put("/:id/ban", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as JWTPayload

    if (user.roles !== "admin") {
      return c.json({ error: "Hanya admin yang dapat mengubah status masyarakat" }, 403)
    }

    const masyarakatId = c.req.param("id")
    const currentMasyarakat = await c.env.DB.prepare("SELECT status FROM masyarakat WHERE id = ?").bind(masyarakatId).first()

    if (!currentMasyarakat) {
      return c.json({ error: "Masyarakat tidak ditemukan" }, 404)
    }

    const newStatus = currentMasyarakat.status === "active" ? "banned" : "active"

    await c.env.DB.prepare('UPDATE masyarakat SET status = ?, waktu_diperbarui = datetime("now") WHERE id = ?').bind(newStatus, masyarakatId).run()

    return c.json({
      message: `Masyarakat berhasil di${newStatus === "banned" ? "banned" : "unbanned"}`,
      status: newStatus,
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

masyarakatRoutes.delete("/:id", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as JWTPayload

    if (user.roles !== "admin") {
      return c.json({ error: "Hanya admin yang dapat menghapus masyarakat" }, 403)
    }

    const masyarakatId = c.req.param("id")

    const existingUser = await c.env.DB.prepare("SELECT id FROM pengguna WHERE id = ?").bind(masyarakatId).first()
    if (!existingUser) {
      return c.json({ error: "Masyarakat tidak ditemukan" }, 404)
    }

    // Hapus semua session user dari KV sebelum menghapus user
    const userSessionsKey = `user_sessions:${masyarakatId}`
    const userSessions = await c.env.KV.get(userSessionsKey)
    if (userSessions) {
      const sessionIds = JSON.parse(userSessions)
      const deletePromises = sessionIds.map((sessionId: string) => c.env.KV.delete(`session:${sessionId}`))
      await Promise.all(deletePromises)
      await c.env.KV.delete(userSessionsKey)
    }

    await c.env.DB.prepare("DELETE FROM aduan WHERE id_masyarakat = ?").bind(masyarakatId).run()
    await c.env.DB.prepare("DELETE FROM masyarakat WHERE id = ?").bind(masyarakatId).run()
    await c.env.DB.prepare("DELETE FROM pengguna WHERE id = ?").bind(masyarakatId).run()

    return c.json({ message: "Masyarakat berhasil dihapus" })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

export default masyarakatRoutes
