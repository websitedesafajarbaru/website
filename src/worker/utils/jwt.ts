import { JWTPayload } from "../types"

const JWT_SECRET = "your-secret-key-change-in-production"

async function base64UrlEncode(str: string): Promise<string> {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

async function base64UrlDecode(str: string): Promise<string> {
  str = str.replace(/-/g, "+").replace(/_/g, "/")
  while (str.length % 4) {
    str += "="
  }
  return atob(str)
}

export async function generateJWT(payload: JWTPayload): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" }
  const now = Math.floor(Date.now() / 1000)
  const exp = now + 24 * 60 * 60

  const jwtPayload = {
    ...payload,
    iat: now,
    exp: exp,
  }

  const headerEncoded = await base64UrlEncode(JSON.stringify(header))
  const payloadEncoded = await base64UrlEncode(JSON.stringify(jwtPayload))

  const signatureInput = `${headerEncoded}.${payloadEncoded}`
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey("raw", encoder.encode(JWT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signatureInput))

  const signatureEncoded = await base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)))

  return `${signatureInput}.${signatureEncoded}`
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const [headerEncoded, payloadEncoded, signatureEncoded] = parts

    const signatureInput = `${headerEncoded}.${payloadEncoded}`
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey("raw", encoder.encode(JWT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["verify"])

    const signatureDecoded = await base64UrlDecode(signatureEncoded)
    const signatureBytes = new Uint8Array(signatureDecoded.split("").map((c) => c.charCodeAt(0)))

    const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, encoder.encode(signatureInput))

    if (!isValid) return null

    const payloadDecoded = await base64UrlDecode(payloadEncoded)
    const payload = JSON.parse(payloadDecoded)

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
