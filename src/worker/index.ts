import { Hono } from "hono"
import { cors } from "hono/cors"
import authRoutes from "./routes/auth"
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
app.route("/api/dusun", dusunRoutes)
app.route("/api/pengelolaan-pbb", pengelolaanPBBRoutes)
app.route("/api/perangkat-desa", perangkatDesaRoutes)
app.route("/api/surat-pbb", suratPBBRoutes)
app.route("/api", publicRoutes)
app.route("/api/statistik", statistikRoutes)

// Serve React app for all non-API routes
app.get("*", async (c) => {
  try {
    // Try to fetch the asset from Cloudflare Workers Assets
    const response = await c.env.ASSETS.fetch(c.req.raw)
    
    // If asset not found (404), serve index.html for client-side routing
    if (response.status === 404) {
      const indexRequest = new Request(new URL("/index.html", c.req.url), c.req.raw)
      return c.env.ASSETS.fetch(indexRequest)
    }
    
    return response
  } catch {
    // Fallback to index.html if there's any error
    const indexRequest = new Request(new URL("/index.html", c.req.url), c.req.raw)
    return c.env.ASSETS.fetch(indexRequest)
  }
})

export default app
