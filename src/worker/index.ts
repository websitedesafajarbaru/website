import { Hono } from "hono"
import { cors } from "hono/cors"
import authRoutes from "./routes/auth"
import pengaduanMasyarakatRoutes from "./routes/pengaduan-masyarakat"
import aduanRoutes from "./routes/aduan"
import dusunRoutes from "./routes/dusun"
import pengelolaanPBBRoutes from "./routes/pengelolaan-pbb"
import perangkatDesaRoutes from "./routes/perangkat-desa"
import suratPBBRoutes from "./routes/surat-pbb"
import publicRoutes from "./routes/public"
import statistikRoutes from "./routes/statistik"
import masyarakatRoutes from "./routes/masyarakat"
import trackingRoutes from "./routes/tracking"

const app = new Hono<{ Bindings: Env }>()

app.use("/*", cors())
app.get("/api/", (c) => c.json({ message: "Desa Fajar Baru API" }))
app.route("/api/auth", authRoutes)
app.route("/api/pengaduan-masyarakat", pengaduanMasyarakatRoutes)
app.route("/api/aduan", aduanRoutes)
app.route("/api/dusun", dusunRoutes)
app.route("/api/pengelolaan-pbb", pengelolaanPBBRoutes)
app.route("/api/perangkat-desa", perangkatDesaRoutes)
app.route("/api/surat-pbb", suratPBBRoutes)
app.route("/api/masyarakat", masyarakatRoutes)
app.route("/api/tracking", trackingRoutes)
app.route("/api", publicRoutes)
app.route("/api/statistik", statistikRoutes)

// Scheduled event handler for deleting old images (60 days)
export const scheduled: ExportedHandlerScheduledHandler<Env> = async (_event, env) => {
  try {
    console.log("Running scheduled cleanup of old images...")
    
    // Delete images older than 60 days
    const result = await env.DB.prepare(
      "DELETE FROM gambar_aduan WHERE julianday('now') - julianday(waktu_dibuat) > 60"
    ).run()
    
    console.log(`Deleted ${result.meta.changes} old images`)
  } catch (error) {
    console.error("Error in scheduled cleanup:", error)
  }
}

export default app
