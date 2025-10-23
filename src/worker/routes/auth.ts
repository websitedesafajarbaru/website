import { Hono } from "hono"
import { authMiddleware } from "../middleware/auth"
import { verifyPassword, hashPassword } from "../utils/hash"
import { generateJWT } from "../utils/jwt"
import { Variables, JWTPayload } from "../types"

const authRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

authRoutes.post("/login", async (c) => {
  try {
    const { username, password } = await c.req.json()

    if (!username || !password) {
      return c.json({ error: "Username dan password harus diisi" }, 400)
    }

    const user = await c.env.DB.prepare("SELECT id, nama_lengkap, username, password, roles FROM pengguna WHERE LOWER(username) = ?").bind(username.toLowerCase()).first()

    if (!user) {
      return c.json({ error: "Username atau password salah" }, 401)
    }

    const isValidPassword = await verifyPassword(password, user.password as string)

    if (!isValidPassword) {
      return c.json({ error: "Username atau password salah" }, 401)
    }

    if (user.roles === "masyarakat") {
      const masyarakat = await c.env.DB.prepare("SELECT status FROM masyarakat WHERE id = ?").bind(user.id).first()
      if (masyarakat?.status === "banned") {
        return c.json({ error: "Akun sudah diblokir" }, 403)
      }
    }

    const token = await generateJWT({
      userId: user.id as string,
      username: user.username as string,
      roles: user.roles as string,
    })

    const sessionKey = `session:${user.id}`
    await c.env.KV.put(sessionKey, token, { expirationTtl: 86400 })

    return c.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        nama_lengkap: user.nama_lengkap,
        username: user.username,
        roles: user.roles,
      },
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

authRoutes.post("/logout", async (c) => {
  try {
    const authHeader = c.req.header("Authorization")

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      const payload = await c.env.KV.get(`session:${token}`)

      if (payload) {
        await c.env.KV.delete(`session:${token}`)
      }
    }

    return c.json({ message: "Logout berhasil" })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

authRoutes.put("/profile", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as JWTPayload
    const { nama_lengkap, username, password, alamat_rumah, nomor_telepon, email } = await c.req.json()

    if (!nama_lengkap || !username) {
      return c.json({ error: "Nama lengkap dan username harus diisi" }, 400)
    }

    const existingUser = await c.env.DB.prepare("SELECT id FROM pengguna WHERE LOWER(username) = ? AND id != ?").bind(username.toLowerCase(), user.userId).first()
    if (existingUser) {
      return c.json({ error: "Username sudah digunakan" }, 400)
    }

    const updates = []
    const values = []

    updates.push("nama_lengkap = ?")
    values.push(nama_lengkap)

    updates.push("username = ?")
    values.push(username.toLowerCase())

    if (password) {
      const hashedPassword = await hashPassword(password)
      updates.push("password = ?")
      values.push(hashedPassword)
    }

    updates.push('waktu_diperbarui = datetime("now")')
    values.push(user.userId)

    await c.env.DB.prepare(`UPDATE pengguna SET ${updates.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run()

    if (user.roles === "masyarakat") {
      if (!alamat_rumah || !nomor_telepon || !email) {
        return c.json({ error: "Alamat rumah, nomor telepon, dan email harus diisi untuk masyarakat" }, 400)
      }
      await c.env.DB.prepare('UPDATE masyarakat SET alamat_rumah = ?, nomor_telepon = ?, email = ?, waktu_diperbarui = datetime("now") WHERE id = ?')
        .bind(alamat_rumah, nomor_telepon, email, user.userId)
        .run()
    }

    return c.json({ message: "Profil berhasil diperbarui" })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

authRoutes.get("/profile", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as JWTPayload

    const pengguna = await c.env.DB.prepare("SELECT id, nama_lengkap, username, roles FROM pengguna WHERE id = ?").bind(user.userId).first()
    if (!pengguna) {
      return c.json({ error: "Pengguna tidak ditemukan" }, 404)
    }

    let profile = { ...pengguna }

    if (user.roles === "masyarakat") {
      const masyarakat = await c.env.DB.prepare("SELECT alamat_rumah, nomor_telepon, email FROM masyarakat WHERE id = ?").bind(user.userId).first()
      if (masyarakat) {
        profile = { ...profile, ...masyarakat }
      }
    }

    return c.json(profile)
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

export default authRoutes
