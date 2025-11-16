export const formatRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    admin: "Admin",
    kepala_dusun: "Kepala Dusun",
    ketua_rt: "Ketua RT",
    masyarakat: "Masyarakat",
  }
  return roleMap[role] || role
}

export const formatStatusPembayaran = (status: string): string => {
  const statusMap: Record<string, string> = {
    menunggu_dicek_oleh_admin: "Menunggu dicek oleh admin",
    bayar_sendiri_di_bank: "Bayar Sendiri di Bank",
    sudah_bayar: "Sudah Bayar",
    pindah_rumah: "Pindah Rumah",
    tidak_diketahui: "Tidak Diketahui",
  }
  return statusMap[status] || status
}

export const formatStatusAduan = (status: string): string => {
  const statusMap: Record<string, string> = {
    menunggu: "Menunggu",
    diproses: "Diproses",
    selesai: "Selesai",
    ditolak: "Ditolak",
  }
  return statusMap[status] || status
}

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

export const getStatusPembayaranColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    menunggu_dicek_oleh_admin: "warning",
    bayar_sendiri_di_bank: "success",
    sudah_bayar: "success",
    pindah_rumah: "info",
    tidak_diketahui: "secondary",
  }
  return colorMap[status] || "secondary"
}

export const getStatusAduanColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    menunggu: "warning",
    diproses: "info",
    selesai: "success",
    ditolak: "danger",
  }
  return colorMap[status] || "secondary"
}

export const getRoleColor = (role: string): string => {
  const colorMap: Record<string, string> = {
    admin: "danger",
    kepala_dusun: "primary",
    ketua_rt: "info",
    masyarakat: "secondary",
  }
  return colorMap[role] || "secondary"
}
