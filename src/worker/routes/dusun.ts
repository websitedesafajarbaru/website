import { Hono } from "hono"
import { authMiddleware, requireRole } from "../middleware/auth"
import { generateToken, generateIntId } from "../utils/db"
import { JWTPayload, Variables } from "../types"

const dusunRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

dusunRoutes.use("/*", authMiddleware)

// Admin routes - these require admin role
dusunRoutes.post("/", requireRole("admin"), async (c) => {
  try {
    const { nama_dusun } = await c.req.json()

    if (!nama_dusun) {
      return c.json({ error: "Nama dusun harus diisi" }, 400)
    }

    const tokenKepalaDusun = generateToken(nama_dusun)
    const tokenKetuaRT = generateToken(nama_dusun)

    const lastDusun = await c.env.DB.prepare("SELECT id FROM dusun ORDER BY id DESC LIMIT 1").first()

    const newId = generateIntId(lastDusun?.id as number)

    await c.env.DB.prepare("INSERT INTO dusun (id, nama_dusun) VALUES (?, ?)").bind(newId, nama_dusun).run()

    await c.env.KV.put(`token:kepala_dusun:${newId}`, tokenKepalaDusun)
    await c.env.KV.put(`token:ketua_rt:${newId}`, tokenKetuaRT)

    return c.json(
      {
        message: "Dusun berhasil dibuat",
        dusunId: newId,
        tokenKepalaDusun,
        tokenKetuaRT,
      },
      201
    )
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

// Routes accessible to kepala_dusun and admin (must be before ANY /:id routes)
dusunRoutes.get("/my/tokens", async (c) => {
  console.log("=== ENTERING /my/tokens ENDPOINT ===")
  try {
    const user = c.get("user") as JWTPayload
    console.log("User accessing /my/tokens:", user)

    if (user.roles !== "kepala_dusun" && user.roles !== "admin") {
      console.log("Forbidden: user role is", user.roles)
      return c.json({ error: "Forbidden" }, 403)
    }

    console.log("User role check passed:", user.roles)

    let dusunId: number

    if (user.roles === "kepala_dusun") {
      const perangkatData = await c.env.DB.prepare("SELECT id_dusun FROM perangkat_desa WHERE id = ? AND jabatan = 'kepala_dusun'").bind(user.userId).first()

      if (!perangkatData) {
        return c.json({ error: "Dusun tidak ditemukan" }, 404)
      }

      dusunId = perangkatData.id_dusun as number
    } else if (user.roles === "admin") {
      // Allow admin to access for testing purposes
      // In production, admin should use /api/dusun/:id/tokens
      const dusunIdParam = c.req.query("dusun_id") || "1" // Default to dusun 1 for testing
      dusunId = parseInt(dusunIdParam)
    } else {
      return c.json({ error: "Forbidden" }, 403)
    }

    const tokenKetuaRT = await c.env.KV.get(`token:ketua_rt:${dusunId}`)

    // For testing, if no token exists, generate one
    let finalToken = tokenKetuaRT
    if (!finalToken) {
      const dusun = await c.env.DB.prepare("SELECT nama_dusun FROM dusun WHERE id = ?").bind(dusunId).first()
      if (dusun) {
        finalToken = generateToken(dusun.nama_dusun as string)
        console.log("Generated new token:", finalToken)
      }
    }

    return c.json({
      tokenKetuaRT: finalToken,
      dusunId,
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

dusunRoutes.put("/:id", requireRole("admin"), async (c) => {
  try {
    const dusunId = c.req.param("id")
    const { nama_dusun } = await c.req.json()

    let query = 'UPDATE dusun SET waktu_diperbarui = datetime("now")'
    const params: (string | number)[] = []

    if (nama_dusun) {
      query += ", nama_dusun = ?"
      params.push(nama_dusun)
    }

    query += " WHERE id = ?"
    params.push(dusunId)

    await c.env.DB.prepare(query)
      .bind(...params)
      .run()

    return c.json({ message: "Dusun berhasil diperbarui" })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

dusunRoutes.delete("/:id", requireRole("admin"), async (c) => {
  try {
    const dusunId = c.req.param("id")

    await c.env.DB.prepare("DELETE FROM dusun WHERE id = ?").bind(dusunId).run()

    return c.json({ message: "Dusun berhasil dihapus" })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

dusunRoutes.get("/:id/tokens", requireRole("admin"), async (c) => {
  try {
    const dusunId = c.req.param("id")

    const tokenKepalaDusun = await c.env.KV.get(`token:kepala_dusun:${dusunId}`)
    const tokenKetuaRT = await c.env.KV.get(`token:ketua_rt:${dusunId}`)

    return c.json({
      tokenKepalaDusun,
      tokenKetuaRT,
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

dusunRoutes.post("/:id/regenerate-tokens", requireRole("admin"), async (c) => {
  try {
    const dusunId = c.req.param("id")

    const dusun = await c.env.DB.prepare("SELECT nama_dusun FROM dusun WHERE id = ?").bind(dusunId).first()
    if (!dusun) {
      return c.json({ error: "Dusun tidak ditemukan" }, 404)
    }

    const newTokenKepalaDusun = generateToken(dusun.nama_dusun as string)
    const newTokenKetuaRT = generateToken(dusun.nama_dusun as string)

    await c.env.KV.put(`token:kepala_dusun:${dusunId}`, newTokenKepalaDusun)
    await c.env.KV.put(`token:ketua_rt:${dusunId}`, newTokenKetuaRT)

    return c.json({
      message: "Token berhasil diregenerate",
      tokenKepalaDusun: newTokenKepalaDusun,
      tokenKetuaRT: newTokenKetuaRT,
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

// Routes accessible to kepala_dusun and admin
dusunRoutes.get("/my/tokens", async (c) => {
  try {
    const user = c.get("user") as JWTPayload
    console.log("User accessing /my/tokens:", user)

    if (user.roles !== "kepala_dusun" && user.roles !== "admin") {
      console.log("Forbidden: user role is", user.roles)
      return c.json({ error: "Forbidden" }, 403)
    }

    let dusunId: number

    if (user.roles === "kepala_dusun") {
      const perangkatData = await c.env.DB.prepare("SELECT id_dusun FROM perangkat_desa WHERE id = ? AND jabatan = 'kepala_dusun'").bind(user.userId).first()

      if (!perangkatData) {
        return c.json({ error: "Dusun tidak ditemukan" }, 404)
      }

      dusunId = perangkatData.id_dusun as number
    } else if (user.roles === "admin") {
      // Allow admin to access for testing purposes
      // In production, admin should use /api/dusun/:id/tokens
      const dusunIdParam = c.req.query("dusun_id") || "1" // Default to dusun 1 for testing
      dusunId = parseInt(dusunIdParam)
    } else {
      return c.json({ error: "Forbidden" }, 403)
    }

    const tokenKetuaRT = await c.env.KV.get(`token:ketua_rt:${dusunId}`)

    // For testing, if no token exists, generate one
    let finalToken = tokenKetuaRT
    if (!finalToken) {
      const dusun = await c.env.DB.prepare("SELECT nama_dusun FROM dusun WHERE id = ?").bind(dusunId).first()
      if (dusun) {
        finalToken = generateToken(dusun.nama_dusun as string)
        console.log("Generated new token:", finalToken)
      }
    }

    return c.json({
      tokenKetuaRT: finalToken,
      dusunId,
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

// Routes accessible to kepala_dusun and admin (must be before /:id route)
dusunRoutes.get("/my/tokens", async (c) => {
  console.log("=== ENTERING /my/tokens ENDPOINT ===")
  try {
    const user = c.get("user") as JWTPayload
    console.log("User accessing /my/tokens:", user)

    if (user.roles !== "kepala_dusun" && user.roles !== "admin") {
      console.log("Forbidden: user role is", user.roles)
      return c.json({ error: "Forbidden" }, 403)
    }

    console.log("User role check passed:", user.roles)

    let dusunId: number

    if (user.roles === "kepala_dusun") {
      const perangkatData = await c.env.DB.prepare("SELECT id_dusun FROM perangkat_desa WHERE id = ? AND jabatan = 'kepala_dusun'").bind(user.userId).first()

      if (!perangkatData) {
        return c.json({ error: "Dusun tidak ditemukan" }, 404)
      }

      dusunId = perangkatData.id_dusun as number
    } else if (user.roles === "admin") {
      // Allow admin to access for testing purposes
      // In production, admin should use /api/dusun/:id/tokens
      const dusunIdParam = c.req.query("dusun_id") || "1" // Default to dusun 1 for testing
      dusunId = parseInt(dusunIdParam)
    } else {
      return c.json({ error: "Forbidden" }, 403)
    }

    const tokenKetuaRT = await c.env.KV.get(`token:ketua_rt:${dusunId}`)

    // For testing, if no token exists, generate one
    let finalToken = tokenKetuaRT
    if (!finalToken) {
      const dusun = await c.env.DB.prepare("SELECT nama_dusun FROM dusun WHERE id = ?").bind(dusunId).first()
      if (dusun) {
        finalToken = generateToken(dusun.nama_dusun as string)
        console.log("Generated new token:", finalToken)
      }
    }

    return c.json({
      tokenKetuaRT: finalToken,
      dusunId,
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

dusunRoutes.get("/", async (c) => {
  try {
    const dusunList = await c.env.DB.prepare(
      `SELECT d.*, p.nama_lengkap as nama_kepala_dusun 
       FROM dusun d 
       LEFT JOIN perangkat_desa pd ON pd.id_dusun = d.id AND pd.jabatan = 'kepala_dusun'
       LEFT JOIN pengguna p ON pd.id = p.id 
       ORDER BY d.id`
    ).all()

    const dusunWithCounts = []
    for (const dusun of dusunList.results) {
      const totalPerangkatDesa = await c.env.DB.prepare("SELECT COUNT(*) as total FROM perangkat_desa WHERE id_dusun = ?").bind(dusun.id).first()

      dusunWithCounts.push({
        ...dusun,
        total_perangkat_desa: Number(totalPerangkatDesa?.total || 0),
      })
    }

    return c.json(dusunWithCounts)
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

dusunRoutes.get("/:id", async (c) => {
  try {
    const dusunId = c.req.param("id")

    const dusun = await c.env.DB.prepare(
      `SELECT d.*, p.nama_lengkap as nama_kepala_dusun 
       FROM dusun d 
       LEFT JOIN perangkat_desa pd ON pd.id_dusun = d.id AND pd.jabatan = 'kepala_dusun'
       LEFT JOIN pengguna p ON pd.id = p.id 
       WHERE d.id = ?`
    )
      .bind(dusunId)
      .first()

    if (!dusun) {
      return c.json({ error: "Dusun tidak ditemukan" }, 404)
    }

    const perangkatDesa = await c.env.DB.prepare(
      `SELECT pd.*, p.nama_lengkap
       FROM perangkat_desa pd
       JOIN pengguna p ON pd.id = p.id
       WHERE pd.id_dusun = ?
       ORDER BY pd.jabatan DESC`
    )
      .bind(dusunId)
      .all()

    const totalPerangkatDesa = await c.env.DB.prepare("SELECT COUNT(*) as total FROM perangkat_desa WHERE id_dusun = ?").bind(dusunId).first()

    return c.json({
      ...dusun,
      perangkat_desa: perangkatDesa.results,
      total_perangkat_desa: Number(totalPerangkatDesa?.total || 0),
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

export default dusunRoutes
