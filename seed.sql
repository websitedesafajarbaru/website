-- Seed data for database
-- Password hash for "password123" using SHA-256: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f

-- Insert dusun data
INSERT INTO dusun (id, nama_dusun, status_data_pbb) VALUES
(1, 'Dusun A', 'sudah_lengkap'),
(2, 'Dusun B', 'belum_lengkap'),
(3, 'Dusun C', 'sudah_lengkap');

-- Insert pengguna data
INSERT INTO pengguna (id, nama_lengkap, username, password, roles) VALUES
('user-superadmin', 'Admin Super', 'admin', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'superadmin'),
('user-kepala-dusun-1', 'Kepala Dusun A', 'kepala_dusun', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'kepala_dusun'),
('user-ketua-rt-1', 'Ketua RT A', 'ketua_rt', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'ketua_rt'),
('user-masyarakat-1', 'Masyarakat Satu', 'masyarakat1', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'masyarakat'),
('user-masyarakat-2', 'Masyarakat Dua', 'masyarakat2', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'masyarakat'),
('user-perangkat-2', 'Perangkat Dusun B', 'perangkat_b', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'kepala_dusun'),
('user-perangkat-3', 'Perangkat Dusun C', 'perangkat_c', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'kepala_dusun');

-- Insert perangkat_desa data
INSERT INTO perangkat_desa (id, jabatan, id_dusun) VALUES
('user-kepala-dusun-1', 'kepala_dusun', 1),
('user-ketua-rt-1', 'ketua_rt', 1),
('user-perangkat-2', 'kepala_dusun', 2),
('user-perangkat-3', 'kepala_dusun', 3);

-- Insert masyarakat data
INSERT INTO masyarakat (id, alamat_rumah, nomor_telepon) VALUES
('user-masyarakat-1', 'Jl. Raya No. 1, Dusun A', '081234567890'),
('user-masyarakat-2', 'Jl. Raya No. 2, Dusun A', '081234567891');

-- Insert surat_pbb data
INSERT INTO surat_pbb (id, nomor_objek_pajak, nama_wajib_pajak, alamat_wajib_pajak, alamat_objek_pajak, luas_tanah, luas_bangunan, nilai_jual_objek_pajak, jumlah_pajak_terhutang, tahun_pajak, status_pembayaran, id_dusun, id_perangkat_desa) VALUES
('pbb-1', 'NOP-001', 'Wajib Pajak 1', 'Jl. Pajak No. 1', 'Jl. Objek No. 1', 100.0, 50.0, 50000000.0, 250000.0, 2023, 'belum_bayar', 1, 'user-kepala-dusun-1'),
('pbb-2', 'NOP-002', 'Wajib Pajak 2', 'Jl. Pajak No. 2', 'Jl. Objek No. 2', 150.0, 75.0, 75000000.0, 375000.0, 2023, 'bayar_sendiri_di_bank', 1, 'user-kepala-dusun-1'),
('pbb-3', 'NOP-003', 'Wajib Pajak 3', 'Jl. Pajak No. 3', 'Jl. Objek No. 3', 200.0, 100.0, 100000000.0, 500000.0, 2023, 'bayar_lewat_perangkat_desa', 2, 'user-perangkat-2'),
('pbb-4', 'NOP-004', 'Wajib Pajak 4', 'Jl. Pajak No. 4', 'Jl. Objek No. 4', 120.0, 60.0, 60000000.0, 300000.0, 2023, 'belum_bayar', 3, 'user-perangkat-3');

-- Insert aduan data
INSERT INTO aduan (id, judul, isi, kategori, status, id_masyarakat) VALUES
('aduan-1', 'Jalan Rusak', 'Jalan di dusun A rusak parah, mohon diperbaiki.', 'Infrastruktur', 'baru', 'user-masyarakat-1'),
('aduan-2', 'Lampu Jalan Mati', 'Lampu jalan di depan rumah saya mati sejak seminggu lalu.', 'Fasilitas Umum', 'diproses', 'user-masyarakat-2'),
('aduan-3', 'Sampah Menumpuk', 'Sampah di sekitar dusun tidak diangkut.', 'Kebersihan', 'selesai', 'user-masyarakat-1');

-- Insert tanggapan_aduan data
INSERT INTO tanggapan_aduan (id, isi_tanggapan, id_aduan, id_perangkat_desa) VALUES
('tanggapan-1', 'Akan segera diperbaiki minggu depan.', 'aduan-1', 'user-kepala-dusun-1'),
('tanggapan-2', 'Tim teknis akan datang besok untuk memperbaiki.', 'aduan-2', 'user-ketua-rt-1'),
('tanggapan-3', 'Sudah diatasi, sampah telah diangkut.', 'aduan-3', 'user-kepala-dusun-1');