import { Hono } from "hono"
import { hashPassword } from "../utils/hash"
import { generateId } from "../utils/db"

const pengelolaanPBBRoutes = new Hono<{ Bindings: Env }>()

pengelolaanPBBRoutes.post("/registrasi", async (c) => {
  try {
    const { nama_lengkap, password, token } = await c.req.json()

    if (!nama_lengkap || !password || !token) {
      return c.json({ error: "Semua field harus diisi" }, 400)
    }

    const lowerNamaLengkap = nama_lengkap.toLowerCase()
    const existingUser = await c.env.DB.prepare("SELECT id FROM pengguna WHERE LOWER(nama_lengkap) = ?").bind(lowerNamaLengkap).first()

    if (existingUser) {
      return c.json({ error: "Nama lengkap sudah digunakan" }, 400)
    }

    let dusunId: number | null = null
    let jabatan: string | null = null
    const allDusun = await c.env.DB.prepare("SELECT id FROM dusun").all()

    for (const dusun of allDusun.results) {
      const storedToken = await c.env.KV.get(`token:kepala_dusun:${dusun.id}`)
      if (storedToken === token) {
        dusunId = dusun.id as number
        jabatan = "kepala_dusun"
        break
      }
    }

    if (!dusunId) {
      for (const dusun of allDusun.results) {
        const storedToken = await c.env.KV.get(`token:ketua_rt:${dusun.id}`)
        if (storedToken === token) {
          dusunId = dusun.id as number
          jabatan = "ketua_rt"
          break
        }
      }
    }

    if (!dusunId || !jabatan) {
      return c.json({ error: "Token tidak valid" }, 400)
    }

    if (jabatan === "kepala_dusun") {
      const currentToken = await c.env.KV.get(`token:kepala_dusun:${dusunId}`)
      if (!currentToken) {
        return c.json({ error: "Token pendaftaran sudah digunakan" }, 400)
      }
    }

    if (jabatan === "kepala_dusun") {
      const existingKepalaDusun = await c.env.DB.prepare("SELECT id FROM perangkat_desa WHERE id_dusun = ? AND jabatan = 'kepala_dusun'").bind(dusunId).first()
      if (existingKepalaDusun) {
        await c.env.DB.batch([
          c.env.DB.prepare("UPDATE pengguna SET roles = 'ketua_rt', waktu_diperbarui = datetime('now') WHERE id = ?").bind(existingKepalaDusun.id),
          c.env.DB.prepare("UPDATE perangkat_desa SET jabatan = 'ketua_rt', waktu_diperbarui = datetime('now') WHERE id = ?").bind(existingKepalaDusun.id),
        ])
      }
    }

    const userId = generateId()
    const hashedPassword = await hashPassword(password)

    await c.env.DB.batch([
      c.env.DB.prepare("INSERT INTO pengguna (id, nama_lengkap, password, roles) VALUES (?, ?, ?, ?)").bind(
        userId,
        nama_lengkap,
        hashedPassword,
        jabatan
      ),
      c.env.DB.prepare("INSERT INTO perangkat_desa (id, jabatan, id_dusun) VALUES (?, ?, ?)").bind(userId, jabatan, dusunId),
    ])

    if (jabatan === "kepala_dusun") {
      await c.env.KV.delete(`token:kepala_dusun:${dusunId}`)
    }

    return c.json(
      {
        message: "Registrasi berhasil",
        userId,
        dusunId,
        jabatan,
      },
      201
    )
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

export default pengelolaanPBBRoutes
