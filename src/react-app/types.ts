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
  id_dusun: number
  waktu_dibuat: string
  waktu_diperbarui: string
  // Fields from surat_pbb_tahun (join)
  surat_tahun_id?: string
  jumlah_pajak_terhutang?: number
  tahun_pajak?: number
  status_pembayaran?: "belum_bayar" | "bayar_sendiri_di_bank" | "sudah_bayar" | "sudah_lunas" | "pindah_rumah" | "tidak_diketahui"
  tahun_waktu_dibuat?: string
  tahun_waktu_diperbarui?: string
  nama_dusun?: string
  nama_perangkat?: string
  id_pengguna?: string
  // For detailed view with all years
  tahun_data?: SuratPBBTahun[]
}

export interface SuratPBBTahun {
  id: string
  id_surat_pbb: string
  tahun_pajak: number
  jumlah_pajak_terhutang: number
  status_pembayaran: "belum_bayar" | "bayar_sendiri_di_bank" | "sudah_bayar" | "sudah_lunas" | "pindah_rumah" | "tidak_diketahui"
  id_pengguna: string
  waktu_dibuat: string
  waktu_diperbarui: string
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
