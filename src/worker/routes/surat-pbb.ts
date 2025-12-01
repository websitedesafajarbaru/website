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
      !jumlah_pajak_terhutang ||
      !tahun_pajak ||
      !status_pembayaran ||
      !id_dusun
    ) {
      return c.json({ error: "Semua field harus diisi" }, 400)
    }

    // Validate status_pembayaran for perangkat desa
    if (user.roles !== "admin") {
      const perangkat = await c.env.DB.prepare("SELECT jabatan FROM perangkat_desa WHERE id = ?").bind(user.userId).first()
      
      if (perangkat?.jabatan === "kepala_dusun" || perangkat?.jabatan === "ketua_rt") {
        const allowedStatuses = ["belum_bayar", "bayar_sendiri_di_bank", "sudah_bayar", "pindah_rumah", "tidak_diketahui"]
        if (!allowedStatuses.includes(status_pembayaran)) {
          return c.json({ 
            error: "Sebagai perangkat desa, Anda hanya dapat membuat surat PBB dengan status: Belum Bayar, Bayar Sendiri di Bank, Sudah Bayar, Pindah Rumah, atau Tidak Diketahui" 
          }, 400)
        }
      }
    }

    if (user.roles !== "admin") {
      console.log("User roles:", user.roles, "userId:", user.userId)
      const role = user.roles.trim().toLowerCase()
      if (role === "kepala_dusun") {
        const kepalaDusunData = await c.env.DB.prepare("SELECT id_dusun FROM perangkat_desa WHERE id = ?").bind(user.userId).first()
        console.log("Kepala dusun data:", kepalaDusunData, "id_dusun from request:", id_dusun)
        if (!kepalaDusunData || kepalaDusunData.id_dusun !== id_dusun) {
          return c.json({ error: "Anda hanya dapat menambahkan surat PBB untuk dusun yang Anda kelola" }, 403)
        }
      } else if (role === "ketua_rt") {
        const ketuaRTData = await c.env.DB.prepare("SELECT id_dusun FROM perangkat_desa WHERE id = ?").bind(user.userId).first()
        console.log("Ketua RT data:", ketuaRTData, "id_dusun from request:", id_dusun)
        if (!ketuaRTData || ketuaRTData.id_dusun !== id_dusun) {
          return c.json({ error: "Anda hanya dapat menambahkan surat PBB untuk dusun yang Anda kelola" }, 403)
        }
      } else {
        console.log("Role not allowed:", user.roles)
        return c.json({ error: "Anda tidak memiliki izin untuk menambahkan surat PBB" }, 403)
      }
    }

    let idPengguna: string = user.userId
    if (user.roles === "admin") {
      const kepalaDusun = await c.env.DB.prepare("SELECT id FROM perangkat_desa WHERE jabatan = 'kepala_dusun' AND id_dusun = ?").bind(id_dusun).first()
      if (kepalaDusun) {
        idPengguna = kepalaDusun.id as string
      }
    }

    // Check if surat_pbb already exists for this nomor_objek_pajak
    let suratPBB = await c.env.DB.prepare("SELECT id FROM surat_pbb WHERE nomor_objek_pajak = ?")
      .bind(nomor_objek_pajak)
      .first()

    let suratPBBId: string

    if (suratPBB) {
      // Surat PBB already exists, use existing ID
      suratPBBId = suratPBB.id as string
    } else {
      // Create new surat_pbb master record
      suratPBBId = generateId()
      await c.env.DB.prepare(
        "INSERT INTO surat_pbb (id, nomor_objek_pajak, nama_wajib_pajak, alamat_wajib_pajak, alamat_objek_pajak, luas_tanah, luas_bangunan, id_dusun) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
        .bind(
          suratPBBId,
          nomor_objek_pajak,
          nama_wajib_pajak,
          alamat_wajib_pajak,
          alamat_objek_pajak,
          luas_tanah,
          luas_bangunan,
          id_dusun
        )
        .run()
    }

    // Check if surat_pbb_tahun already exists for this year
    const existingTahun = await c.env.DB.prepare(
      "SELECT id FROM surat_pbb_tahun WHERE id_surat_pbb = ? AND tahun_pajak = ?"
    )
      .bind(suratPBBId, tahun_pajak)
      .first()

    if (existingTahun) {
      return c.json({ error: `Surat PBB untuk tahun ${tahun_pajak} sudah ada` }, 400)
    }

    // Create surat_pbb_tahun record
    const suratPBBTahunId = generateId()
    await c.env.DB.prepare(
      "INSERT INTO surat_pbb_tahun (id, id_surat_pbb, tahun_pajak, jumlah_pajak_terhutang, status_pembayaran, id_pengguna) VALUES (?, ?, ?, ?, ?, ?)"
    )
      .bind(
        suratPBBTahunId,
        suratPBBId,
        tahun_pajak,
        jumlah_pajak_terhutang,
        status_pembayaran,
        idPengguna
      )
      .run()

    return c.json(
      {
        message: "Surat PBB berhasil ditambahkan",
        suratId: suratPBBId,
        suratTahunId: suratPBBTahunId,
      },
      201
    )
  } catch (error) {
    console.error("Error in POST /api/surat-pbb:", error)
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
      "SELECT s.*, st.id as surat_tahun_id, st.tahun_pajak, st.jumlah_pajak_terhutang, st.status_pembayaran, st.waktu_dibuat as tahun_waktu_dibuat, st.waktu_diperbarui as tahun_waktu_diperbarui, d.nama_dusun, p.nama_lengkap as nama_perangkat FROM surat_pbb s JOIN surat_pbb_tahun st ON s.id = st.id_surat_pbb JOIN dusun d ON s.id_dusun = d.id JOIN pengguna p ON st.id_pengguna = p.id WHERE st.tahun_pajak = ?"
    const params: (string | number)[] = [currentYear]

    if (user.roles !== "admin") {
      const perangkat = await c.env.DB.prepare("SELECT jabatan FROM perangkat_desa WHERE id = ?").bind(user.userId).first()

      if (perangkat?.jabatan === "kepala_dusun") {
        const perangkatData = await c.env.DB.prepare("SELECT id_dusun FROM perangkat_desa WHERE id = ?").bind(user.userId).first()

        if (perangkatData && perangkatData.id_dusun) {
          query += " AND s.id_dusun = ?"
          params.push(perangkatData.id_dusun as string)
        }
      } else if (perangkat?.jabatan === "ketua_rt") {
        const perangkatData = await c.env.DB.prepare("SELECT id_dusun FROM perangkat_desa WHERE id = ?").bind(user.userId).first()

        if (perangkatData && perangkatData.id_dusun) {
          query += " AND s.id_dusun = ?"
          params.push(perangkatData.id_dusun as string)
        }
      }
    } else {
      if (id_dusun) {
        query += " AND s.id_dusun = ?"
        params.push(id_dusun)
      }
    }

    if (status_pembayaran) {
      query += " AND st.status_pembayaran = ?"
      params.push(status_pembayaran)
    }

    query += " ORDER BY st.waktu_dibuat DESC"

    const result = await c.env.DB.prepare(query)
      .bind(...params)
      .all()

    return c.json({
      active_year: currentYear,
      surat_pbb: result.results,
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

suratPBBRoutes.get("/:id", async (c) => {
  try {
    const suratId = c.req.param("id")

    const surat = await c.env.DB.prepare(
      "SELECT s.*, st.id as surat_tahun_id, st.tahun_pajak, st.jumlah_pajak_terhutang, st.status_pembayaran, st.waktu_dibuat as tahun_waktu_dibuat, st.waktu_diperbarui as tahun_waktu_diperbarui, d.nama_dusun, p.nama_lengkap as nama_perangkat FROM surat_pbb s LEFT JOIN surat_pbb_tahun st ON s.id = st.id_surat_pbb JOIN dusun d ON s.id_dusun = d.id LEFT JOIN pengguna p ON st.id_pengguna = p.id WHERE s.id = ?"
    )
      .bind(suratId)
      .first()

    if (!surat) {
      return c.json({ error: "Surat PBB tidak ditemukan" }, 404)
    }

    // Get all years for this surat
    const allYears = await c.env.DB.prepare(
      "SELECT st.*, p.nama_lengkap as nama_perangkat FROM surat_pbb_tahun st JOIN pengguna p ON st.id_pengguna = p.id WHERE st.id_surat_pbb = ? ORDER BY st.tahun_pajak DESC"
    )
      .bind(suratId)
      .all()

    return c.json({
      ...surat,
      tahun_data: allYears.results,
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

suratPBBRoutes.put("/:id", async (c) => {
  try {
    const user = c.get("user") as JWTPayload
    const suratId = c.req.param("id")
    const updates = await c.req.json()

    // Determine if this is updating the master surat or a specific year
    if (updates.tahun_pajak && (updates.status_pembayaran !== undefined || updates.jumlah_pajak_terhutang !== undefined)) {
      // Update surat_pbb_tahun
      const originalSurat = await c.env.DB.prepare(
        "SELECT status_pembayaran FROM surat_pbb_tahun WHERE id_surat_pbb = ? AND tahun_pajak = ?"
      )
        .bind(suratId, updates.tahun_pajak)
        .first()

      if (!originalSurat) {
        return c.json({ error: "Data tahun tidak ditemukan" }, 404)
      }

      if (updates.status_pembayaran !== undefined && updates.status_pembayaran !== originalSurat?.status_pembayaran) {
        // Check user role and restrict status options for perangkat desa
        if (user.roles !== "admin") {
          const perangkat = await c.env.DB.prepare("SELECT jabatan FROM perangkat_desa WHERE id = ?").bind(user.userId).first()
          
          if (perangkat?.jabatan === "kepala_dusun" || perangkat?.jabatan === "ketua_rt") {
            const allowedStatuses = ["belum_bayar", "bayar_sendiri_di_bank", "sudah_bayar", "pindah_rumah", "tidak_diketahui"]
            if (!allowedStatuses.includes(updates.status_pembayaran)) {
              return c.json({ 
                error: "Sebagai perangkat desa, Anda hanya dapat mengubah status pembayaran ke: Belum Bayar, Bayar Sendiri di Bank, Sudah Bayar, Pindah Rumah, atau Tidak Diketahui" 
              }, 403)
            }
          }
        }
      }

      const allowedFields = ["jumlah_pajak_terhutang", "status_pembayaran"]
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

      updateFields.push('waktu_diperbarui = datetime("now")')
      updateFields.push("id_pengguna = ?")
      params.push(user.userId)
      params.push(suratId)
      params.push(updates.tahun_pajak)

      const query = `UPDATE surat_pbb_tahun SET ${updateFields.join(", ")} WHERE id_surat_pbb = ? AND tahun_pajak = ?`
      await c.env.DB.prepare(query)
        .bind(...params)
        .run()

      return c.json({ message: "Status PBB berhasil diperbarui" })
    } else {
      // Update master surat_pbb
      const allowedFields = [
        "nomor_objek_pajak",
        "nama_wajib_pajak",
        "alamat_wajib_pajak",
        "alamat_objek_pajak",
        "luas_tanah",
        "luas_bangunan",
        "id_dusun",
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

      updateFields.push('waktu_diperbarui = datetime("now")')
      params.push(suratId)

      const query = `UPDATE surat_pbb SET ${updateFields.join(", ")} WHERE id = ?`
      await c.env.DB.prepare(query)
        .bind(...params)
        .run()

      return c.json({ message: "Surat PBB berhasil diperbarui" })
    }
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

suratPBBRoutes.delete("/:id", async (c) => {
  try {
    const user = c.get("user") as JWTPayload
    const suratId = c.req.param("id")

    // Only admin can delete surat PBB
    if (user.roles !== "admin") {
      return c.json({ error: "Anda tidak memiliki izin untuk menghapus surat PBB" }, 403)
    }

    await c.env.DB.prepare("DELETE FROM surat_pbb WHERE id = ?").bind(suratId).run()

    return c.json({ message: "Surat PBB berhasil dihapus" })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Terjadi kesalahan server" }, 500)
  }
})

export default suratPBBRoutes
