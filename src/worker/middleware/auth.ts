import { Context, Next } from "hono"
import { getCookie } from "hono/cookie"
import { JWTPayload } from "../types"

export async function authMiddleware(c: Context, next: Next) {
  const sessionId = getCookie(c, "session_id")
  console.log("Auth middleware called for path:", c.req.path, "sessionId:", sessionId)

  if (!sessionId) {
    console.log("No session ID found")
    return c.json({ error: "Unauthorized" }, 401)
  }

  try {
    const sessionData = await c.env.KV.get(`session:${sessionId}`)
    console.log("Session data:", sessionData)

    if (!sessionData) {
      console.log("Session not found in KV")
      return c.json({ error: "Session not found" }, 401)
    }

    const session = JSON.parse(sessionData)
    const now = Date.now()
    console.log("Session expiresAt:", session.expiresAt, "now:", now)

    if (session.expiresAt < now) {
      // Hapus session expired dari KV
      await c.env.KV.delete(`session:${sessionId}`)
      console.log("Session expired")
      return c.json({ error: "Session expired" }, 401)
    }

    // Ambil data user
    const user = await c.env.DB.prepare("SELECT id, nama_lengkap, roles FROM pengguna WHERE id = ?").bind(session.userId).first()
    console.log("Query executed, user result:", user)

    if (!user) {
      console.log("User not found in DB")
      return c.json({ error: "User not found" }, 401)
    }

    const payload: JWTPayload = {
      userId: user.id as string,
      roles: user.roles as string,
    }

    console.log("Setting user payload:", payload)
    c.set("user", payload)
    console.log("Calling next()")
    await next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    return c.json({ error: "Authentication error" }, 500)
  }
}

export function requireRole(...allowedRoles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get("user") as JWTPayload

    if (!user || !allowedRoles.includes(user.roles)) {
      return c.json({ error: "Forbidden" }, 403)
    }

    await next()
  }
}
