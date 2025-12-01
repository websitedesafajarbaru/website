-- Seed data untuk tabel pengguna
INSERT INTO pengguna (id, nama_lengkap, password, roles, waktu_dibuat, waktu_diperbarui) VALUES ('1', 'Pak Solihin', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'admin', datetime('now'), datetime('now'));

INSERT INTO dusun (id, nama_dusun, waktu_dibuat, waktu_diperbarui) VALUES 
('1', 'Dusun 1', datetime('now'), datetime('now')),
('2', 'Dusun 2A', datetime('now'), datetime('now')),
('3', 'Dusun 2B', datetime('now'), datetime('now')),
('4', 'Dusun 3A', datetime('now'), datetime('now')),
('5', 'Dusun 3B', datetime('now'), datetime('now')),
('6', 'Dusun 4', datetime('now'), datetime('now')),
('7', 'Dusun 5', datetime('now'), datetime('now'));

INSERT INTO pengguna (id, nama_lengkap, password, roles, waktu_dibuat, waktu_diperbarui) VALUES
('f27bb5a8-0fd4-4434-bbdf-623d93274984', 'Suryadi', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'kepala_dusun', datetime('now'), datetime('now')),
('15571f28-1055-4547-8ecb-eb0111f744b3', 'Suroso Waris', '416c63d10d27fa7c853ace64a1d78e6a4c084ebe13170a01505133dc7061d2e2', 'kepala_dusun', datetime('now'), datetime('now')),
('b656fd83-f99c-4b36-bfb9-b36c09cc2dc5', 'Apriyanto', 'ae73693522d1458659af562b08a30beb91ab5e95742b428d1086caa5b04ea54a', 'kepala_dusun', datetime('now'), datetime('now')),
('57258670-21c8-47e8-b903-b554a307fdc0', 'Hamzah', '9dcb2d0d3bcde9b4e92bec414789d93def510aa09e79291e70d5a54ba82408a9', 'ketua_rt', datetime('now'), datetime('now')),
('3f720774-07d8-49f7-90c2-1b2bef5b5d2b', 'Hermin Susiloningsih', 'f36723532af267fa2ae41a40b80b83a8b38629fbb21da105f521ac0747ad85c6', 'ketua_rt', datetime('now'), datetime('now')),
('1fa1462d-00e5-418d-be34-97a0925bbb12', 'Mujiyo', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'kepala_dusun', datetime('now'), datetime('now')),
('c5eb7044-b67c-4e61-8421-2a146fb071d6', 'Ahmad Isnadi', 'd1814914080613efeea0adefe83247294d4a406aba61b0738a42fa237ba90f41', 'kepala_dusun', datetime('now'), datetime('now')),
('e0c76a5d-ae1a-4d7d-9f8a-42b76617cc9a', 'Junaidi', '3a9ef7110c42ef7fb6d990598ac59cf7723e2b796b2478e800d85c16d4946c98', 'kepala_dusun', datetime('now'), datetime('now'));

INSERT INTO perangkat_desa (id, jabatan, id_dusun, waktu_dibuat, waktu_diperbarui) VALUES
('f27bb5a8-0fd4-4434-bbdf-623d93274984', 'kepala_dusun', 1, datetime('now'), datetime('now')),
('15571f28-1055-4547-8ecb-eb0111f744b3', 'kepala_dusun', 4, datetime('now'), datetime('now')),
('b656fd83-f99c-4b36-bfb9-b36c09cc2dc5', 'kepala_dusun', 7, datetime('now'), datetime('now')),
('57258670-21c8-47e8-b903-b554a307fdc0', 'ketua_rt', 2, datetime('now'), datetime('now')),
('3f720774-07d8-49f7-90c2-1b2bef5b5d2b', 'ketua_rt', 1, datetime('now'), datetime('now')),
('1fa1462d-00e5-418d-be34-97a0925bbb12', 'kepala_dusun', 6, datetime('now'), datetime('now')),
('c5eb7044-b67c-4e61-8421-2a146fb071d6', 'kepala_dusun', 3, datetime('now'), datetime('now')),
('e0c76a5d-ae1a-4d7d-9f8a-42b76617cc9a', 'kepala_dusun', 2, datetime('now'), datetime('now'));