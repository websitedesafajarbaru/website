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
app.route("/api", publicRoutes)
app.route("/api/statistik", statistikRoutes)

// Catch all route for SPA
app.get("*", async (c) => {
  const url = new URL(c.req.url)
  // If it's an API route, skip (but since API routes are handled above, this shouldn't happen)
  if (url.pathname.startsWith("/api/")) {
    return c.text("Not Found", 404)
  }
  // For SPA routes, serve index.html
  const indexRequest = new Request(`${url.origin}/index.html`, c.req)
  const page = await c.env.ASSETS.fetch(indexRequest)
  return page
})

export default app
