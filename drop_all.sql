-- Drop all tables forcefully
PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS tanggapan_aduan;
DROP TABLE IF EXISTS gambar_aduan;
DROP TABLE IF EXISTS aduan;
DROP TABLE IF EXISTS surat_pbb;
DROP TABLE IF EXISTS perangkat_desa;
DROP TABLE IF EXISTS masyarakat;
DROP TABLE IF EXISTS dusun;
DROP TABLE IF EXISTS pengguna;

PRAGMA foreign_keys = ON;