DROP TABLE IF EXISTS masyarakat;
DROP TABLE IF EXISTS perangkat_desa;
DROP TABLE IF EXISTS dusun;
DROP TABLE IF EXISTS tanggapan_aduan;
DROP TABLE IF EXISTS aduan_dibaca;
DROP TABLE IF EXISTS aduan;
DROP TABLE IF EXISTS surat_pbb_tahun;
DROP TABLE IF EXISTS surat_pbb;
DROP TABLE IF EXISTS pengguna;
DROP TABLE IF EXISTS gambar_aduan;

CREATE TABLE pengguna (
    id TEXT PRIMARY KEY,
    nama_lengkap TEXT NOT NULL,
    password TEXT NOT NULL,
    roles TEXT NOT NULL CHECK (roles IN ('admin', 'kepala_dusun', 'ketua_rt', 'masyarakat')),
    waktu_dibuat TEXT DEFAULT (datetime('now')),
    waktu_diperbarui TEXT DEFAULT (datetime('now'))
);

CREATE TABLE masyarakat (
    id TEXT PRIMARY KEY,
    alamat_rumah TEXT NOT NULL,
    nomor_telepon TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'banned')),
    waktu_dibuat TEXT DEFAULT (datetime('now')),
    waktu_diperbarui TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id) REFERENCES pengguna(id) ON DELETE CASCADE
);

CREATE TABLE dusun (
    id INT PRIMARY KEY,
    nama_dusun TEXT NOT NULL,
    waktu_dibuat TEXT DEFAULT (datetime('now')),
    waktu_diperbarui TEXT DEFAULT (datetime('now'))
);

CREATE TABLE perangkat_desa (
    id TEXT PRIMARY KEY,
    jabatan TEXT NOT NULL,
    id_dusun INT,
    waktu_dibuat TEXT DEFAULT (datetime('now')),
    waktu_diperbarui TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id) REFERENCES pengguna(id) ON DELETE CASCADE,
    FOREIGN KEY (id_dusun) REFERENCES dusun(id) ON DELETE SET NULL
);

CREATE TABLE surat_pbb (
    id TEXT PRIMARY KEY,
    nomor_objek_pajak TEXT NOT NULL UNIQUE,
    nama_wajib_pajak TEXT NOT NULL,
    alamat_wajib_pajak TEXT NOT NULL,
    alamat_objek_pajak TEXT NOT NULL,
    luas_tanah REAL NOT NULL,
    luas_bangunan REAL NOT NULL,
    id_dusun INT NOT NULL,
    waktu_dibuat TEXT DEFAULT (datetime('now')),
    waktu_diperbarui TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_dusun) REFERENCES dusun(id) ON DELETE CASCADE
);

CREATE TABLE surat_pbb_tahun (
    id TEXT PRIMARY KEY,
    id_surat_pbb TEXT NOT NULL,
    tahun_pajak INT NOT NULL,
    jumlah_pajak_terhutang REAL NOT NULL,
    status_pembayaran TEXT NOT NULL DEFAULT 'belum_bayar' CHECK (status_pembayaran IN ('belum_bayar', 'bayar_sendiri_di_bank', 'sudah_bayar', 'sudah_lunas', 'pindah_rumah', 'tidak_diketahui')),
    id_pengguna TEXT NOT NULL,
    waktu_dibuat TEXT DEFAULT (datetime('now')),
    waktu_diperbarui TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_surat_pbb) REFERENCES surat_pbb(id) ON DELETE CASCADE,
    FOREIGN KEY (id_pengguna) REFERENCES pengguna(id) ON DELETE CASCADE,
    UNIQUE(id_surat_pbb, tahun_pajak)
);

CREATE TABLE aduan (
    id TEXT PRIMARY KEY,
    judul TEXT NOT NULL,
    isi TEXT NOT NULL,
    kategori TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('menunggu', 'diproses', 'selesai')),
    id_masyarakat TEXT NOT NULL,
    waktu_dibuat TEXT DEFAULT (datetime('now')),
    waktu_diperbarui TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_masyarakat) REFERENCES masyarakat(id) ON DELETE CASCADE
);

CREATE TABLE gambar_aduan (
    id TEXT PRIMARY KEY,
    nama_file TEXT NOT NULL,
    tipe_file TEXT NOT NULL,
    data TEXT NOT NULL,
    id_aduan TEXT,
    waktu_dibuat TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_aduan) REFERENCES aduan(id) ON DELETE CASCADE
);

CREATE TABLE tanggapan_aduan (
    id TEXT PRIMARY KEY,
    isi_tanggapan TEXT NOT NULL,
    id_aduan TEXT NOT NULL,
    id_perangkat_desa TEXT,
    id_pengguna TEXT NOT NULL,
    waktu_dibuat TEXT DEFAULT (datetime('now')),
    waktu_diperbarui TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_aduan) REFERENCES aduan(id) ON DELETE CASCADE,
    FOREIGN KEY (id_perangkat_desa) REFERENCES perangkat_desa(id) ON DELETE SET NULL,
    FOREIGN KEY (id_pengguna) REFERENCES pengguna(id) ON DELETE CASCADE
);

CREATE TABLE aduan_dibaca (
    id TEXT PRIMARY KEY,
    id_aduan TEXT NOT NULL,
    id_pengguna TEXT NOT NULL,
    waktu_dibaca TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_aduan) REFERENCES aduan(id) ON DELETE CASCADE,
    FOREIGN KEY (id_pengguna) REFERENCES pengguna(id) ON DELETE CASCADE,
    UNIQUE(id_aduan, id_pengguna)
);