import { Hono } from "hono"
import { authMiddleware } from "../middleware/auth"
import { generateId } from "../utils/db"
import { JWTPayload, Variables } from "../types"

const suratPBBRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

suratPBBRoutes.use("/*", authMiddleware)

suratPBBRoutes.post("/", async (c) => {
  try {
    const user = c.get("user") as JWTPayload
    const {
      nomor_objek_pajak,
      nama_wajib_pajak,
      alamat_wajib_pajak,
      alamat_objek_pajak,
      luas_tanah,
      luas_bangunan,
      nilai_jual_objek_pajak,
      jumlah_pajak_terhutang,
      tahun_pajak,
      status_pembayaran,
      id_dusun,
    } = await c.req.json()

    if (
      !nomor_objek_pajak ||
      !nama_wajib_pajak ||
      !alamat_wajib_pajak ||
      !alamat_objek_pajak ||
      !luas_tanah ||
      !luas_bangunan ||
      !nilai_jual_objek_pajak ||
      !jumlah_pajak_terhutang ||
      !tahun_pajak ||
      !status_pembayaran ||
      !id_dusun
    ) {
      return c.json({ error: "Semua field harus diisi" }, 400)
    }

    const suratId = generateId()

    await c.env.DB.prepare(
      "INSERT INTO surat_pbb (id, nomor_objek_pajak, nama_wajib_pajak, alamat_wajib_pajak, alamat_objek_pajak, luas_tanah, luas_bangunan, nilai_jual_objek_pajak, jumlah_pajak_terhutang, tahun_pajak, status_pembayaran, id_dusun, id_perangkat_desa) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
      .bind(
        suratId,
        nomor_objek_pajak,
        nama_wajib_pajak,
        alamat_wajib_pajak,
        alamat_objek_pajak,
        luas_tanah,
        luas_bangunan,
        nilai_jual_objek_pajak,
        jumlah_pajak_terhutang,
        tahun_pajak,
        status_pembayaran,
        id_dusun,
        user.userId
      )
      .run()

    return c.json(
      {
        message: "Surat PBB berhasil ditambahkan",
        suratId,
      },
      201
    )
  } catch {
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

suratPBBRoutes.get("/", async (c) => {
  try {
    const user = c.get("user") as JWTPayload
    const id_dusun = c.req.query("id_dusun")
    const status_pembayaran = c.req.query("status_pembayaran")

    const activeYear = await c.env.KV.get("active_year")
    const currentYear = activeYear ? parseInt(activeYear) : new Date().getFullYear()

    let query =
      "SELECT s.*, d.nama_dusun, p.nama_lengkap as nama_perangkat FROM surat_pbb s JOIN dusun d ON s.id_dusun = d.id JOIN pengguna p ON s.id_perangkat_desa = p.id WHERE s.tahun_pajak = ?"
    const params: (string | number)[] = [currentYear]

    if (user.roles !== "superadmin") {
      const perangkat = await c.env.DB.prepare("SELECT jabatan FROM perangkat_desa WHERE id = ?").bind(user.userId).first()

      if (perangkat?.jabatan === "kepala_dusun") {
        const perangkatData = await c.env.DB.prepare("SELECT id_dusun FROM perangkat_desa WHERE id = ?").bind(user.userId).first()

        if (perangkatData && perangkatData.id_dusun) {
          query += " AND s.id_dusun = ?"
          params.push(perangkatData.id_dusun as string)
        }
      } else if (perangkat?.jabatan === "ketua_rt") {
        const dusunKetua = await c.env.DB.prepare("SELECT id_dusun FROM surat_pbb WHERE id_perangkat_desa = ? LIMIT 1").bind(user.userId).first()

        if (dusunKetua) {
          query += " AND s.id_dusun = ?"
          params.push(dusunKetua.id_dusun as string)
        }
      }
    } else {
      if (id_dusun) {
        query += " AND s.id_dusun = ?"
        params.push(id_dusun)
      }
    }

    if (status_pembayaran) {
      query += " AND s.status_pembayaran = ?"
      params.push(status_pembayaran)
    }

    query += " ORDER BY s.waktu_dibuat DESC"

    const result = await c.env.DB.prepare(query)
      .bind(...params)
      .all()

    return c.json({
      active_year: currentYear,
      surat_pbb: result.results,
    })
  } catch {
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

suratPBBRoutes.get("/:id", async (c) => {
  try {
    const suratId = c.req.param("id")

    const surat = await c.env.DB.prepare(
      "SELECT s.*, d.nama_dusun, p.nama_lengkap as nama_perangkat FROM surat_pbb s JOIN dusun d ON s.id_dusun = d.id JOIN pengguna p ON s.id_perangkat_desa = p.id WHERE s.id = ?"
    )
      .bind(suratId)
      .first()

    if (!surat) {
      return c.json({ error: "Surat PBB tidak ditemukan" }, 404)
    }

    return c.json(surat)
  } catch {
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

suratPBBRoutes.put("/:id", async (c) => {
  try {
    const user = c.get("user") as JWTPayload
    const suratId = c.req.param("id")
    const updates = await c.req.json()

    const allowedFields = [
      "nomor_objek_pajak",
      "nama_wajib_pajak",
      "alamat_wajib_pajak",
      "alamat_objek_pajak",
      "luas_tanah",
      "luas_bangunan",
      "nilai_jual_objek_pajak",
      "jumlah_pajak_terhutang",
      "tahun_pajak",
      "status_pembayaran",
    ]

    const updateFields: string[] = []
    const params: (string | number)[] = []

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`)
        params.push(value as string | number)
      }
    }

    if (updateFields.length === 0) {
      return c.json({ error: "Tidak ada field yang valid untuk diperbarui" }, 400)
    }

    updateFields.push('waktu_diperbarui = datetime("now", "+7 hours", "localtime")')
    updateFields.push("id_perangkat_desa = ?")
    params.push(user.userId)
    params.push(suratId)

    const query = `UPDATE surat_pbb SET ${updateFields.join(", ")} WHERE id = ?`
    await c.env.DB.prepare(query)
      .bind(...params)
      .run()

    return c.json({ message: "Surat PBB berhasil diperbarui" })
  } catch {
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

suratPBBRoutes.delete("/:id", async (c) => {
  try {
    const user = c.get("user") as JWTPayload

    if (user.roles !== "superadmin") {
      return c.json({ error: "Hanya superadmin yang dapat menghapus surat" }, 403)
    }

    const suratId = c.req.param("id")
    await c.env.DB.prepare("DELETE FROM surat_pbb WHERE id = ?").bind(suratId).run()

    return c.json({ message: "Surat PBB berhasil dihapus" })
  } catch {
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

export default suratPBBRoutes
