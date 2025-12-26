export const formatRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    admin: "Admin",
    kepala_dusun: "Kepala Dusun",
    ketua_rt: "Ketua RT",
  }
  return roleMap[role] || role
}

export const formatStatusPembayaran = (status: string): string => {
  const statusMap: Record<string, string> = {
    belum_bayar: "Belum Bayar",
    bayar_sendiri_di_bank: "Bayar Sendiri di Bank",
    sudah_bayar: "Sudah Bayar",
    sudah_lunas: "Sudah Lunas",
    pindah_rumah: "Pindah Rumah",
    tidak_diketahui: "Tidak Diketahui",
  }
  return statusMap[status] || status
}

export const getStatusPembayaranColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    belum_bayar: "warning",
    bayar_sendiri_di_bank: "success",
    sudah_bayar: "success",
    sudah_lunas: "success",
    pindah_rumah: "info",
    tidak_diketahui: "secondary",
  }
  return colorMap[status] || "secondary"
}

export const getRoleColor = (role: string): string => {
  const colorMap: Record<string, string> = {
    admin: "danger",
    kepala_dusun: "primary",
    ketua_rt: "info",
  }
  return colorMap[role] || "secondary"
}
