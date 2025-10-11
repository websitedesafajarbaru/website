export function generateId(): string {
  return crypto.randomUUID()
}

export function generateIntId(lastId?: number): number {
  return lastId ? lastId + 1 : 1
}

export function generateToken(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}
