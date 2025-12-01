export function generateId(): string {
  return crypto.randomUUID()
}

export function generateIntId(lastId?: number): number {
  return lastId ? lastId + 1 : 1
}

export function generateToken(nama_dusun: string): string {
  const cleanName = nama_dusun.toLowerCase().replace(/\s+/g, '')
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  let random4 = ''
  for (let i = 0; i < 4; i++) {
    random4 += letters[Math.floor(Math.random() * letters.length)]
  }
  return cleanName + '-' + random4
}
