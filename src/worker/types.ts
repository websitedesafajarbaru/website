export interface User {
  id: string
  nama_lengkap: string
  username: string
  roles: "admin" | "kepala_dusun" | "ketua_rt" | "masyarakat"
}

export interface JWTPayload {
  userId: string
  username: string
  roles: string
}

export type Variables = {
  user: JWTPayload
}
