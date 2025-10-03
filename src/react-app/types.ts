export interface Aduan {
  id: string
  judul: string
  isi: string
  isi_aduan?: string
  kategori: string
  status: "baru" | "diproses" | "selesai"
  id_masyarakat: string
  waktu_dibuat: string
  waktu_diperbarui: string
  created_at?: string
  updated_at?: string
  nama_lengkap?: string
  alamat_rumah?: string
  nomor_telepon?: string
  tanggapan?: Tanggapan[] | string
}

export interface Tanggapan {
  id: string
  isi_tanggapan: string
  id_aduan: string
  id_perangkat_desa: string
  waktu_dibuat: string
  nama_lengkap: string
}

export interface Dusun {
  id: number
  nama_dusun: string
  id_kepala_dusun: string | null
  status_data_pbb: "belum_lengkap" | "sudah_lengkap"
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
  nilai_jual_objek_pajak: number
  jumlah_pajak_terhutang: number
  tahun_pajak: number
  status_pembayaran: "belum_bayar" | "bayar_sendiri_di_bank" | "bayar_lewat_perangkat_desa" | "pindah_rumah" | "tidak_diketahui"
  id_dusun: number
  id_perangkat_desa: string
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
  status_data_pbb: string
  nama_kepala_dusun: string
  total_pajak_terhutang: number
  total_pajak_dibayar: number
  total_surat: number
  total_surat_dibayar: number
  total_surat_belum_bayar: number
  persentase_pembayaran: number
}
