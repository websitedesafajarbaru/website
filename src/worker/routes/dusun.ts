import { Hono } from "hono"
import { authMiddleware, requireRole } from "../middleware/auth"
import { generateToken, generateIntId } from "../utils/db"

const dusunRoutes = new Hono<{ Bindings: Env }>()

dusunRoutes.use("/*", authMiddleware)
dusunRoutes.use("/*", requireRole("superadmin"))

dusunRoutes.post("/", async (c) => {
  try {
    const { nama_dusun } = await c.req.json()

    if (!nama_dusun) {
      return c.json({ error: "Nama dusun harus diisi" }, 400)
    }

    const tokenKepalaDusun = generateToken()
    const tokenKetuaRT = generateToken()

    const lastDusun = await c.env.DB.prepare("SELECT id FROM dusun ORDER BY id DESC LIMIT 1").first()

    const newId = generateIntId(lastDusun?.id as number)

    await c.env.DB.prepare("INSERT INTO dusun (id, nama_dusun, status_data_pbb) VALUES (?, ?, ?)").bind(newId, nama_dusun, "belum_lengkap").run()

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
  } catch {
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
  } catch {
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
      `SELECT pd.*, p.nama_lengkap, p.username
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
  } catch {
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

dusunRoutes.put("/:id", async (c) => {
  try {
    const dusunId = c.req.param("id")
    const { nama_dusun, status_data_pbb } = await c.req.json()

    let query = 'UPDATE dusun SET waktu_diperbarui = datetime("now", "+7 hours", "localtime")'
    const params: (string | number)[] = []

    if (nama_dusun) {
      query += ", nama_dusun = ?"
      params.push(nama_dusun)
    }

    if (status_data_pbb) {
      if (!["belum_lengkap", "sudah_lengkap"].includes(status_data_pbb)) {
        return c.json({ error: "Status data PBB tidak valid" }, 400)
      }
      query += ", status_data_pbb = ?"
      params.push(status_data_pbb)
    }

    query += " WHERE id = ?"
    params.push(dusunId)

    await c.env.DB.prepare(query)
      .bind(...params)
      .run()

    return c.json({ message: "Dusun berhasil diperbarui" })
  } catch {
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

dusunRoutes.delete("/:id", async (c) => {
  try {
    const dusunId = c.req.param("id")

    await c.env.DB.prepare("DELETE FROM dusun WHERE id = ?").bind(dusunId).run()

    return c.json({ message: "Dusun berhasil dihapus" })
  } catch {
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

dusunRoutes.get("/:id/tokens", async (c) => {
  try {
    const dusunId = c.req.param("id")

    const tokenKepalaDusun = await c.env.KV.get(`token:kepala_dusun:${dusunId}`)
    const tokenKetuaRT = await c.env.KV.get(`token:ketua_rt:${dusunId}`)

    return c.json({
      tokenKepalaDusun,
      tokenKetuaRT,
    })
  } catch {
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

export default dusunRoutes
