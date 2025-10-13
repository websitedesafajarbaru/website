import { Hono } from "hono"
import { authMiddleware, requireRole } from "../middleware/auth"
import { hashPassword } from "../utils/hash"
import { JWTPayload, Variables } from "../types"

const perangkatDesaRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

perangkatDesaRoutes.use("/*", authMiddleware)

perangkatDesaRoutes.post("/", async (c) => {
  try {
    const user = c.get("user") as JWTPayload
    const { nama_lengkap, username, password, jabatan, id_dusun } = await c.req.json()

    if (!nama_lengkap || !username || !password || !jabatan || !id_dusun) {
      return c.json({ error: "Semua field harus diisi" }, 400)
    }

    if (user.roles !== "superadmin") {
      if (user.roles === "kepala_dusun") {
        if (jabatan !== "ketua_rt") {
          return c.json({ error: "Kepala dusun hanya dapat menambahkan ketua rt" }, 403)
        }

        const kepalaDusunData = await c.env.DB.prepare("SELECT id_dusun FROM perangkat_desa WHERE id = ? AND jabatan = 'kepala_dusun'").bind(user.userId).first()
        if (!kepalaDusunData || kepalaDusunData.id_dusun !== id_dusun) {
          return c.json({ error: "Anda hanya dapat menambahkan ketua rt untuk dusun yang Anda kelola" }, 403)
        }
      } else {
        return c.json({ error: "Anda tidak memiliki izin untuk menambahkan perangkat desa" }, 403)
      }
    }

    const existingUser = await c.env.DB.prepare("SELECT id FROM pengguna WHERE username = ?").bind(username).first()
    if (existingUser) {
      return c.json({ error: "Username sudah digunakan" }, 400)
    }

    const existingDusun = await c.env.DB.prepare("SELECT id FROM dusun WHERE id = ?").bind(id_dusun).first()
    if (!existingDusun) {
      return c.json({ error: "Dusun tidak ditemukan" }, 400)
    }

    if (jabatan === "kepala_dusun") {
      const existingKepalaDusun = await c.env.DB.prepare("SELECT id FROM perangkat_desa WHERE id_dusun = ? AND jabatan = 'kepala_dusun'").bind(id_dusun).first()
      if (existingKepalaDusun) {
        return c.json({ error: "Kepala dusun untuk dusun ini sudah ada. Setiap dusun hanya boleh memiliki satu kepala dusun." }, 400)
      }
    }

    const hashedPassword = await hashPassword(password)

    const newId = crypto.randomUUID()

    await c.env.DB.prepare(
      `INSERT INTO pengguna (id, nama_lengkap, username, password, roles, waktu_dibuat, waktu_diperbarui)
       VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))`
    )
      .bind(newId, nama_lengkap, username, hashedPassword, jabatan)
      .run()

    await c.env.DB.prepare(
      `INSERT INTO perangkat_desa (id, id_dusun, jabatan, waktu_dibuat, waktu_diperbarui)
       VALUES (?, ?, ?, datetime("now"), datetime("now"))`
    )
      .bind(newId, id_dusun, jabatan)
      .run()

    return c.json({ message: "Perangkat desa berhasil ditambahkan", id: newId })
  } catch (err) {
    console.error("Error creating perangkat desa:", err)
    return c.json({ error: "Terjadi kesalahan server", details: String(err) }, 500)
  }
})

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
  } catch (error) {
    console.error(error)
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

perangkatDesaRoutes.put("/:id", async (c) => {
  try {
    const user = c.get("user") as JWTPayload
    const id = c.req.param("id")
    const { nama_lengkap, username, password, id_dusun, jabatan } = await c.req.json()

    if (user.roles !== "superadmin") {
      if (user.roles === "kepala_dusun") {
        if (jabatan && jabatan !== "ketua_rt") {
          return c.json({ error: "Kepala dusun hanya dapat mengelola ketua rt" }, 403)
        }

        const perangkatData = await c.env.DB.prepare("SELECT id_dusun FROM perangkat_desa WHERE id = ?").bind(id).first()
        const kepalaDusunData = await c.env.DB.prepare("SELECT id_dusun FROM perangkat_desa WHERE id = ? AND jabatan = 'kepala_dusun'").bind(user.userId).first()

        if (!perangkatData || !kepalaDusunData || perangkatData.id_dusun !== kepalaDusunData.id_dusun) {
          return c.json({ error: "Anda hanya dapat mengelola perangkat desa di dusun yang Anda kelola" }, 403)
        }
      } else {
        return c.json({ error: "Anda tidak memiliki izin untuk mengupdate perangkat desa" }, 403)
      }
    }

    if (jabatan === "kepala_dusun") {
      const existingKepalaDusun = await c.env.DB.prepare("SELECT id FROM perangkat_desa WHERE id_dusun = ? AND jabatan = 'kepala_dusun' AND id != ?").bind(id_dusun, id).first()
      if (existingKepalaDusun) {
        return c.json({ error: "Kepala dusun untuk dusun ini sudah ada. Setiap dusun hanya boleh memiliki satu kepala dusun." }, 400)
      }
    }

    let penggunaQuery = 'UPDATE pengguna SET waktu_diperbarui = datetime("now")'
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

    let perangkatQuery = 'UPDATE perangkat_desa SET waktu_diperbarui = datetime("now")'
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
  } catch (error) {
    console.error(error)
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

    const existingUser = await c.env.DB.prepare("SELECT id FROM pengguna WHERE id = ?").bind(id).first()
    if (!existingUser) {
      return c.json({ error: "Perangkat desa tidak ditemukan" }, 404)
    }

    await c.env.DB.prepare("DELETE FROM tanggapan_aduan WHERE id_perangkat_desa = ?").bind(id).run()
    await c.env.DB.prepare("DELETE FROM surat_pbb WHERE id_perangkat_desa = ?").bind(id).run()
    await c.env.DB.prepare("DELETE FROM perangkat_desa WHERE id = ?").bind(id).run()
    await c.env.DB.prepare("DELETE FROM pengguna WHERE id = ?").bind(id).run()

    return c.json({ message: "Perangkat desa berhasil dihapus" })
  } catch (err) {
    console.error("Error deleting perangkat desa:", err)
    return c.json({ error: "Terjadi kesalahan server", details: String(err) }, 500)
  }
})

export default perangkatDesaRoutes
