import { Context, Next } from "hono"
import { verifyJWT } from "../utils/jwt"
import { JWTPayload } from "../types"

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const token = authHeader.substring(7)
  const payload = await verifyJWT(token)

  if (!payload) {
    return c.json({ error: "Invalid or expired token" }, 401)
  }

  const sessionKey = `session:${payload.userId}`
  const session = await c.env.KV.get(sessionKey)

  if (!session || session !== token) {
    return c.json({ error: "Session not found or invalid" }, 401)
  }

  c.set("user", payload)
  await next()
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
