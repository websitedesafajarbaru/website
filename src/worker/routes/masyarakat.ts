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
      "SELECT p.id, p.nama_lengkap, p.username, p.roles, p.waktu_dibuat, p.waktu_diperbarui, m.alamat_rumah, m.nomor_telepon FROM pengguna p JOIN masyarakat m ON p.id = m.id ORDER BY p.waktu_dibuat DESC"
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

    const { nama_lengkap, username, nomor_telepon, email, alamat_rumah, password } = await c.req.json()

    if (!nama_lengkap || !username || !nomor_telepon || !email || !alamat_rumah || !password) {
      return c.json({ error: "Semua field harus diisi" }, 400)
    }

    const existingUser = await c.env.DB.prepare("SELECT id FROM pengguna WHERE username = ?").bind(username).first()

    if (existingUser) {
      return c.json({ error: "Username sudah digunakan" }, 400)
    }

    const userId = generateId()
    const hashedPassword = await hashPassword(password)

    await c.env.DB.batch([
      c.env.DB.prepare("INSERT INTO pengguna (id, nama_lengkap, username, password, roles) VALUES (?, ?, ?, ?, ?)").bind(
        userId,
        nama_lengkap,
        username,
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
    const { nama_lengkap, username, nomor_telepon, alamat_rumah, password } = await c.req.json()

    if (!nama_lengkap || !username || !nomor_telepon || !alamat_rumah) {
      return c.json({ error: "Nama lengkap, username, nomor telepon, dan alamat rumah harus diisi" }, 400)
    }

    // Check if username is taken by another user
    const existingUser = await c.env.DB.prepare("SELECT id FROM pengguna WHERE username = ? AND id != ?").bind(username, masyarakatId).first()

    if (existingUser) {
      return c.json({ error: "Username sudah digunakan" }, 400)
    }

    const updates = []
    const values = []

    updates.push("nama_lengkap = ?")
    values.push(nama_lengkap)

    updates.push("username = ?")
    values.push(username)

    if (password) {
      const hashedPassword = await hashPassword(password)
      updates.push("password = ?")
      values.push(hashedPassword)
    }

    updates.push('waktu_diperbarui = datetime("now")')
    values.push(masyarakatId)

    await c.env.DB.prepare(`UPDATE pengguna SET ${updates.join(", ")} WHERE id = ?`).bind(...values).run()

    await c.env.DB.prepare('UPDATE masyarakat SET alamat_rumah = ?, nomor_telepon = ?, waktu_diperbarui = datetime("now") WHERE id = ?')
      .bind(alamat_rumah, nomor_telepon, masyarakatId)
      .run()

    return c.json({ message: "Masyarakat berhasil diperbarui" })
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

    // Check if masyarakat exists
    const existingMasyarakat = await c.env.DB.prepare("SELECT id FROM masyarakat WHERE id = ?").bind(masyarakatId).first()

    if (!existingMasyarakat) {
      return c.json({ error: "Masyarakat tidak ditemukan" }, 404)
    }

    // Delete from masyarakat first (due to foreign key)
    await c.env.DB.prepare("DELETE FROM masyarakat WHERE id = ?").bind(masyarakatId).run()
    await c.env.DB.prepare("DELETE FROM pengguna WHERE id = ?").bind(masyarakatId).run()

    return c.json({ message: "Masyarakat berhasil dihapus" })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

export default masyarakatRoutes