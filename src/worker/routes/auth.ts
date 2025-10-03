import { Hono } from "hono"
import { verifyPassword } from "../utils/hash"
import { generateJWT } from "../utils/jwt"

const authRoutes = new Hono<{ Bindings: Env }>()

authRoutes.post("/login", async (c) => {
  try {
    const { username, password } = await c.req.json()

    if (!username || !password) {
      return c.json({ error: "Username dan password harus diisi" }, 400)
    }

    const user = await c.env.DB.prepare("SELECT id, nama_lengkap, username, password, roles FROM pengguna WHERE username = ?").bind(username).first()

    if (!user) {
      return c.json({ error: "Username atau password salah" }, 401)
    }

    const isValidPassword = await verifyPassword(password, user.password as string)

    if (!isValidPassword) {
      return c.json({ error: "Username atau password salah" }, 401)
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
  } catch {
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
  } catch {
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

export default authRoutes
