DROP TABLE IF EXISTS masyarakat;
DROP TABLE IF EXISTS perangkat_desa;
DROP TABLE IF EXISTS dusun;
DROP TABLE IF EXISTS tanggapan_aduan;
DROP TABLE IF EXISTS aduan;
DROP TABLE IF EXISTS surat_pbb;
DROP TABLE IF EXISTS pengguna;

CREATE TABLE pengguna (
    id TEXT PRIMARY KEY,
    nama_lengkap TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    roles TEXT NOT NULL CHECK (roles IN ('superadmin', 'kepala_dusun', 'ketua_rt', 'masyarakat')),
    waktu_dibuat TEXT DEFAULT (datetime('now', '+7 hours', 'localtime')),
    waktu_diperbarui TEXT DEFAULT (datetime('now', '+7 hours', 'localtime'))
);

CREATE TABLE masyarakat (
    id TEXT PRIMARY KEY,
    alamat_rumah TEXT NOT NULL,
    nomor_telepon TEXT NOT NULL,
    waktu_dibuat TEXT DEFAULT (datetime('now', '+7 hours', 'localtime')),
    waktu_diperbarui TEXT DEFAULT (datetime('now', '+7 hours', 'localtime')),
    FOREIGN KEY (id) REFERENCES pengguna(id) ON DELETE CASCADE
);

CREATE TABLE dusun (
    id INT PRIMARY KEY,
    nama_dusun TEXT NOT NULL,
    status_data_pbb TEXT NOT NULL CHECK (status_data_pbb IN ('belum_lengkap', 'sudah_lengkap')),
    waktu_dibuat TEXT DEFAULT (datetime('now', '+7 hours', 'localtime')),
    waktu_diperbarui TEXT DEFAULT (datetime('now', '+7 hours', 'localtime'))
);

CREATE TABLE perangkat_desa (
    id TEXT PRIMARY KEY,
    jabatan TEXT NOT NULL,
    id_dusun INT,
    waktu_dibuat TEXT DEFAULT (datetime('now', '+7 hours', 'localtime')),
    waktu_diperbarui TEXT DEFAULT (datetime('now', '+7 hours', 'localtime')),
    FOREIGN KEY (id) REFERENCES pengguna(id) ON DELETE CASCADE,
    FOREIGN KEY (id_dusun) REFERENCES dusun(id) ON DELETE SET NULL
);

CREATE TABLE surat_pbb (
    id TEXT PRIMARY KEY,
    nomor_objek_pajak TEXT NOT NULL,
    nama_wajib_pajak TEXT NOT NULL,
    alamat_wajib_pajak TEXT NOT NULL,
    alamat_objek_pajak TEXT NOT NULL,
    luas_tanah REAL NOT NULL,
    luas_bangunan REAL NOT NULL,
    nilai_jual_objek_pajak REAL NOT NULL,
    jumlah_pajak_terhutang REAL NOT NULL,
    tahun_pajak INT NOT NULL,
    status_pembayaran TEXT NOT NULL CHECK (status_pembayaran IN ('bayar_sendiri_di_bank', 'bayar_lewat_perangkat_desa', 'belum_bayar', 'pindah_rumah', 'tidak_diketahui')),
    id_dusun INT NOT NULL,
    id_perangkat_desa TEXT,
    waktu_dibuat TEXT DEFAULT (datetime('now', '+7 hours', 'localtime')),
    waktu_diperbarui TEXT DEFAULT (datetime('now', '+7 hours', 'localtime')),
    FOREIGN KEY (id_dusun) REFERENCES dusun(id) ON DELETE CASCADE,
    FOREIGN KEY (id_perangkat_desa) REFERENCES perangkat_desa(id) ON DELETE SET NULL
);

CREATE TABLE aduan (
    id TEXT PRIMARY KEY,
    judul TEXT NOT NULL,
    isi TEXT NOT NULL,
    kategori TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('baru', 'diproses', 'selesai')),
    id_masyarakat TEXT NOT NULL,
    waktu_dibuat TEXT DEFAULT (datetime('now', '+7 hours', 'localtime')),
    waktu_diperbarui TEXT DEFAULT (datetime('now', '+7 hours', 'localtime')),
    FOREIGN KEY (id_masyarakat) REFERENCES masyarakat(id) ON DELETE CASCADE
);

CREATE TABLE tanggapan_aduan (
    id TEXT PRIMARY KEY,
    isi_tanggapan TEXT NOT NULL,
    id_aduan TEXT NOT NULL,
    id_perangkat_desa TEXT NOT NULL,
    waktu_dibuat TEXT DEFAULT (datetime('now', '+7 hours', 'localtime')),
    waktu_diperbarui TEXT DEFAULT (datetime('now', '+7 hours', 'localtime')),
    FOREIGN KEY (id_aduan) REFERENCES aduan(id) ON DELETE CASCADE,
    FOREIGN KEY (id_perangkat_desa) REFERENCES perangkat_desa(id) ON DELETE CASCADE
);