import { Hono } from "hono"
import { hashPassword } from "../utils/hash"
import { generateId } from "../utils/db"

const pengaduanMasyarakatRoutes = new Hono<{ Bindings: Env }>()

pengaduanMasyarakatRoutes.post("/registrasi", async (c) => {
  try {
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
        message: "Registrasi berhasil",
        userId,
      },
      201
    )
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

export default pengaduanMasyarakatRoutes
