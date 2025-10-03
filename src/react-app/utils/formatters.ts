/**
 * Format role dari database ke display text
 */
export const formatRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    superadmin: "Superadmin",
    kepala_dusun: "Kepala Dusun",
    ketua_rt: "Ketua RT",
    masyarakat: "Masyarakat",
  }
  return roleMap[role] || role
}

/**
 * Format status pembayaran PBB
 */
export const formatStatusPembayaran = (status: string): string => {
  const statusMap: Record<string, string> = {
    belum_bayar: "Belum Bayar",
    bayar_sendiri_di_bank: "Bayar Sendiri di Bank",
    bayar_lewat_perangkat_desa: "Bayar Lewat Perangkat Desa",
    pindah_rumah: "Pindah Rumah",
    tidak_diketahui: "Tidak Diketahui",
    sudah_bayar: "Sudah Bayar",
    terlambat: "Terlambat",
  }
  return statusMap[status] || status
}

/**
 * Format status data PBB
 */
export const formatStatusDataPBB = (status: string): string => {
  const statusMap: Record<string, string> = {
    belum_lengkap: "Belum Lengkap",
    sudah_lengkap: "Sudah Lengkap",
  }
  return statusMap[status] || status
}

/**
 * Format status aduan
 */
export const formatStatusAduan = (status: string): string => {
  const statusMap: Record<string, string> = {
    menunggu: "Menunggu",
    diproses: "Diproses",
    selesai: "Selesai",
    ditolak: "Ditolak",
  }
  return statusMap[status] || status
}

/**
 * Format kategori aduan
 */
export const formatKategoriAduan = (kategori: string): string => {
  const kategoriMap: Record<string, string> = {
    infrastruktur: "Infrastruktur",
    kebersihan: "Kebersihan",
    keamanan: "Keamanan",
    pelayanan: "Pelayanan",
    lainnya: "Lainnya",
  }
  return kategoriMap[kategori] || kategori
}

/**
 * Get badge color for status pembayaran
 */
export const getStatusPembayaranColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    belum_bayar: "warning",
    bayar_sendiri_di_bank: "success",
    bayar_lewat_perangkat_desa: "success",
    pindah_rumah: "info",
    tidak_diketahui: "secondary",
    sudah_bayar: "success",
    terlambat: "danger",
  }
  return colorMap[status] || "secondary"
}

/**
 * Get badge color for status data PBB
 */
export const getStatusDataPBBColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    belum_lengkap: "warning",
    sudah_lengkap: "success",
  }
  return colorMap[status] || "secondary"
}

/**
 * Get badge color for status aduan
 */
export const getStatusAduanColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    menunggu: "warning",
    diproses: "info",
    selesai: "success",
    ditolak: "danger",
  }
  return colorMap[status] || "secondary"
}

/**
 * Get badge color for role
 */
export const getRoleColor = (role: string): string => {
  const colorMap: Record<string, string> = {
    superadmin: "danger",
    kepala_dusun: "primary",
    ketua_rt: "info",
    masyarakat: "secondary",
  }
  return colorMap[role] || "secondary"
}
