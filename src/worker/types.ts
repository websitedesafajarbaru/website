export interface User {
  id: string
  nama_lengkap: string
  roles: "admin" | "kepala_dusun" | "ketua_rt"
}

export interface JWTPayload {
  userId: string
  roles: string
}

export type Variables = {
  user: JWTPayload
}
