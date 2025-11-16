export interface Aduan {
  id: string
  judul: string
  isi: string
  isi_aduan?: string
  kategori: string
  status: "menunggu" | "diproses" | "selesai" | "ditolak"
  id_masyarakat: string
  waktu_dibuat: string
  waktu_diperbarui: string
  created_at?: string
  updated_at?: string
  nama_lengkap?: string
  alamat_rumah?: string
  nomor_telepon?: string
  tanggapan?: Tanggapan[] | string
  jumlah_tanggapan?: number
  is_read?: boolean
}

export interface Tanggapan {
  id: string
  isi_tanggapan: string
  id_aduan: string
  id_perangkat_desa?: string
  id_pengguna: string
  waktu_dibuat: string
  nama_lengkap: string
  roles?: string
}

export interface Masyarakat {
  id: string
  nama_lengkap: string
  username: string
  roles: string
  alamat_rumah: string
  nomor_telepon: string
  status: "active" | "banned"
  waktu_dibuat: string
  waktu_diperbarui: string
}

export interface Dusun {
  id: number
  nama_dusun: string
  id_kepala_dusun: string | null
  waktu_dibuat: string
  waktu_diperbarui: string
  nama_kepala_dusun?: string
  total_pajak_terhutang?: number
  total_pajak_dibayar?: number
  total_surat?: number
  total_perangkat_desa?: number
}

export interface SuratPBB {
  id: string
  nomor_objek_pajak: string
  nama_wajib_pajak: string
  alamat_wajib_pajak: string
  alamat_objek_pajak: string
  luas_tanah: number
  luas_bangunan: number
  jumlah_pajak_terhutang: number
  tahun_pajak: number
  status_pembayaran: "menunggu_dicek_oleh_admin" | "bayar_sendiri_di_bank" | "sudah_bayar" | "pindah_rumah" | "tidak_diketahui"
  id_dusun: number
  id_pengguna: string
  waktu_dibuat: string
  waktu_diperbarui: string
  nama_dusun?: string
  nama_perangkat?: string
}

export interface Laporan {
  statistik_per_dusun: DusunStatistik[]
  total_pajak_terhutang_keseluruhan: number
  total_pajak_dibayar_keseluruhan: number
  total_surat_keseluruhan: number
  total_surat_dibayar_keseluruhan: number
  total_surat_belum_bayar_keseluruhan: number
  persentase_pembayaran_keseluruhan: number
}

export interface DusunStatistik {
  id: number
  nama_dusun: string
  nama_kepala_dusun: string
  total_pajak_terhutang: number
  total_pajak_dibayar: number
  total_surat: number
  total_surat_dibayar: number
  total_surat_belum_bayar: number
  total_surat_tidak_diketahui: number
  persentase_pembayaran: number
}
