export const formatRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    superadmin: "Superadmin",
    kepala_dusun: "Kepala Dusun",
    ketua_rt: "Ketua RT",
    masyarakat: "Masyarakat",
  }
  return roleMap[role] || role
}

export const formatStatusPembayaran = (status: string): string => {
  const statusMap: Record<string, string> = {
    belum_bayar: "Belum Bayar",
    bayar_sendiri_di_bank: "Bayar Sendiri di Bank",
    bayar_lewat_perangkat_desa: "Bayar Lewat Perangkat Desa",
    pindah_rumah: "Pindah Rumah",
    tidak_diketahui: "Tidak Diketahui",
  }
  return statusMap[status] || status
}

export const formatStatusDataPBB = (status: string): string => {
  const statusMap: Record<string, string> = {
    belum_lengkap: "Belum Lengkap",
    sudah_lengkap: "Sudah Lengkap",
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
    belum_bayar: "warning",
    bayar_sendiri_di_bank: "success",
    bayar_lewat_perangkat_desa: "success",
    pindah_rumah: "info",
    tidak_diketahui: "secondary",
  }
  return colorMap[status] || "secondary"
}

export const getStatusDataPBBColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    belum_lengkap: "warning",
    sudah_lengkap: "success",
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
    superadmin: "danger",
    kepala_dusun: "primary",
    ketua_rt: "info",
    masyarakat: "secondary",
  }
  return colorMap[role] || "secondary"
}
