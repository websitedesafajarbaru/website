import { Hono } from "hono"
import { authMiddleware, requireRole } from "../middleware/auth"
import { hashPassword } from "../utils/hash"

const perangkatDesaRoutes = new Hono<{ Bindings: Env }>()

perangkatDesaRoutes.use("/*", authMiddleware)

perangkatDesaRoutes.get("/", async (c) => {
  try {
    const dusunId = c.req.query("dusun_id")

    let query = `
      SELECT pd.*, p.nama_lengkap, p.username, d.nama_dusun
      FROM perangkat_desa pd
      INNER JOIN pengguna p ON pd.id = p.id
      LEFT JOIN dusun d ON pd.id_dusun = d.id
      WHERE p.roles != 'superadmin'
    `

    const params: (string | number)[] = []

    if (dusunId) {
      query += " AND pd.id_dusun = ?"
      params.push(dusunId)
    }

    query += " ORDER BY pd.jabatan, p.nama_lengkap"

    const result = await c.env.DB.prepare(query)
      .bind(...params)
      .all()

    return c.json(result.results)
  } catch {
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

perangkatDesaRoutes.get("/:id", async (c) => {
  try {
    const id = c.req.param("id")
    console.log("[DEBUG] GET /:id called with id:", id)
    console.log("[DEBUG] DB available:", !!c.env.DB)

    const result = await c.env.DB.prepare(
      `
      SELECT pd.*, p.nama_lengkap, p.username, d.nama_dusun
      FROM perangkat_desa pd
      INNER JOIN pengguna p ON pd.id = p.id
      LEFT JOIN dusun d ON pd.id_dusun = d.id
      WHERE pd.id = ?
    `
    )
      .bind(id)
      .first()

    console.log("[DEBUG] Query result:", result)

    if (!result) {
      console.log("[DEBUG] Result not found for id:", id)
      return c.json({ error: "Perangkat desa tidak ditemukan" }, 404)
    }

    console.log("[DEBUG] Returning success result")
    return c.json(result)
  } catch (err) {
    console.error("[ERROR] Exception in GET /:id:", err)
    console.error("[ERROR] Stack:", err instanceof Error ? err.stack : "No stack")
    console.error("[ERROR] Message:", err instanceof Error ? err.message : String(err))
    return c.json({ error: "Terjadi kesalahan server", details: String(err) }, 500)
  }
})

perangkatDesaRoutes.put("/:id", requireRole("superadmin"), async (c) => {
  try {
    const id = c.req.param("id")
    const { nama_lengkap, username, password, id_dusun, jabatan } = await c.req.json()

    let penggunaQuery = 'UPDATE pengguna SET waktu_diperbarui = datetime("now", "+7 hours", "localtime")'
    const penggunaParams: (string | number)[] = []

    if (nama_lengkap) {
      penggunaQuery += ", nama_lengkap = ?"
      penggunaParams.push(nama_lengkap)
    }

    if (username) {
      penggunaQuery += ", username = ?"
      penggunaParams.push(username)
    }

    if (password) {
      const hashedPassword = await hashPassword(password)
      penggunaQuery += ", password = ?"
      penggunaParams.push(hashedPassword)
    }

    if (jabatan) {
      penggunaQuery += ", roles = ?"
      penggunaParams.push(jabatan)
    }

    penggunaQuery += " WHERE id = ?"
    penggunaParams.push(id)

    let perangkatQuery = 'UPDATE perangkat_desa SET waktu_diperbarui = datetime("now", "+7 hours", "localtime")'
    const perangkatParams: (string | number | null)[] = []

    if (id_dusun !== undefined) {
      perangkatQuery += ", id_dusun = ?"
      perangkatParams.push(id_dusun || null)
    }

    if (jabatan) {
      perangkatQuery += ", jabatan = ?"
      perangkatParams.push(jabatan)
    }

    perangkatQuery += " WHERE id = ?"
    perangkatParams.push(id)

    await c.env.DB.batch([c.env.DB.prepare(penggunaQuery).bind(...penggunaParams), c.env.DB.prepare(perangkatQuery).bind(...perangkatParams)])

    return c.json({ message: "Data perangkat desa berhasil diperbarui" })
  } catch {
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

perangkatDesaRoutes.delete("/:id", requireRole("superadmin"), async (c) => {
  try {
    const id = c.req.param("id")

    const user = await c.env.DB.prepare("SELECT roles FROM pengguna WHERE id = ?").bind(id).first()

    if (user && user.roles === "superadmin") {
      return c.json({ error: "Tidak dapat menghapus akun superadmin" }, 400)
    }

    await c.env.DB.batch([c.env.DB.prepare("DELETE FROM perangkat_desa WHERE id = ?").bind(id), c.env.DB.prepare("DELETE FROM pengguna WHERE id = ?").bind(id)])

    return c.json({ message: "Perangkat desa berhasil dihapus" })
  } catch {
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

export default perangkatDesaRoutes
