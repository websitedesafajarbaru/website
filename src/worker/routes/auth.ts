import { Hono } from "hono"
import { authMiddleware } from "../middleware/auth"
import { verifyPassword, hashPassword } from "../utils/hash"
import { setCookie, getCookie } from "hono/cookie"
import { Variables, JWTPayload } from "../types"

const authRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

authRoutes.post("/login", async (c) => {
  try {
    const { nama_lengkap, password } = await c.req.json()

    if (!nama_lengkap || !password) {
      return c.json({ error: "Nama lengkap dan password harus diisi" }, 400)
    }

    const user = await c.env.DB.prepare("SELECT id, nama_lengkap, password, roles FROM pengguna WHERE LOWER(nama_lengkap) = ?").bind(nama_lengkap.toLowerCase()).first()

    if (!user) {
      return c.json({ error: "Nama lengkap atau password salah" }, 401)
    }

    const isValidPassword = await verifyPassword(password, user.password as string)

    if (!isValidPassword) {
      return c.json({ error: "Nama lengkap atau password salah" }, 401)
    }

    if (user.roles === "masyarakat") {
      const masyarakat = await c.env.DB.prepare("SELECT status FROM masyarakat WHERE id = ?").bind(user.id).first()
      if (masyarakat?.status === "banned") {
        return c.json({ error: "Akun sudah diblokir" }, 403)
      }
    }

    // Buat session ID unik
    const sessionId = crypto.randomUUID()
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 hari dalam milliseconds

    // Simpan session ke KV dengan TTL
    await c.env.KV.put(`session:${sessionId}`, JSON.stringify({
      userId: user.id,
      expiresAt
    }), {
      expirationTtl: 30 * 24 * 60 * 60 // 30 hari dalam detik
    })

    // Simpan mapping user ke sessions untuk cleanup saat user dihapus
    const userSessionsKey = `user_sessions:${user.id}`
    const existingSessions = await c.env.KV.get(userSessionsKey)
    const sessionList = existingSessions ? JSON.parse(existingSessions) : []
    sessionList.push(sessionId)

    await c.env.KV.put(userSessionsKey, JSON.stringify(sessionList), {
      expirationTtl: 30 * 24 * 60 * 60 // 30 hari dalam detik
    })

    // Set cookie
    setCookie(c, "session_id", sessionId, {
      httpOnly: true,
      secure: c.req.url.startsWith("https://"), // Hanya secure di production
      sameSite: "lax", // Lebih permissive untuk development
      maxAge: 30 * 24 * 60 * 60, // 30 hari dalam detik
      path: "/",
    })

    return c.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        nama_lengkap: user.nama_lengkap,
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
    const sessionId = getCookie(c, "session_id")

    if (sessionId) {
      // Hapus session dari KV
      const sessionData = await c.env.KV.get(`session:${sessionId}`)
      if (sessionData) {
        const session = JSON.parse(sessionData)
        const userSessionsKey = `user_sessions:${session.userId}`

        // Hapus session ID dari list user sessions
        const existingSessions = await c.env.KV.get(userSessionsKey)
        if (existingSessions) {
          const sessionList = JSON.parse(existingSessions).filter((id: string) => id !== sessionId)
          if (sessionList.length > 0) {
            await c.env.KV.put(userSessionsKey, JSON.stringify(sessionList), {
              expirationTtl: 30 * 24 * 60 * 60
            })
          } else {
            await c.env.KV.delete(userSessionsKey)
          }
        }
      }

      await c.env.KV.delete(`session:${sessionId}`)
    }

    // Clear cookie
    setCookie(c, "session_id", "", {
      httpOnly: true,
      secure: c.req.url.startsWith("https://"), // Hanya secure di production
      sameSite: "lax", // Lebih permissive untuk development
      maxAge: 0,
      path: "/",
    })

    return c.json({ message: "Logout berhasil" })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

authRoutes.put("/profile", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as JWTPayload
    const { nama_lengkap, password, alamat_rumah, nomor_telepon } = await c.req.json()

    if (!nama_lengkap) {
      return c.json({ error: "Nama lengkap harus diisi" }, 400)
    }

    const existingUser = await c.env.DB.prepare("SELECT id FROM pengguna WHERE LOWER(nama_lengkap) = ? AND id != ?").bind(nama_lengkap.toLowerCase(), user.userId).first()
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
    values.push(user.userId)

    await c.env.DB.prepare(`UPDATE pengguna SET ${updates.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run()

    if (user.roles === "masyarakat") {
      if (!alamat_rumah || !nomor_telepon) {
        return c.json({ error: "Alamat rumah dan nomor telepon harus diisi untuk masyarakat" }, 400)
      }
      await c.env.DB.prepare('UPDATE masyarakat SET alamat_rumah = ?, nomor_telepon = ?, waktu_diperbarui = datetime("now") WHERE id = ?')
        .bind(alamat_rumah, nomor_telepon, user.userId)
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

    const pengguna = await c.env.DB.prepare("SELECT id, nama_lengkap, roles FROM pengguna WHERE id = ?").bind(user.userId).first()
    if (!pengguna) {
      return c.json({ error: "Pengguna tidak ditemukan" }, 404)
    }

    let profile = { ...pengguna }

    if (user.roles === "masyarakat") {
      const masyarakat = await c.env.DB.prepare("SELECT alamat_rumah, nomor_telepon FROM masyarakat WHERE id = ?").bind(user.userId).first()
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
