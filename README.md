# Website Desa Fajar Baru

Sebuah website yang bertujuan untuk memudahkan perangkat desa dalam meningkatkan akuntabilitas pelaporan pembayaran PBB yang ada di desa. Serta memudahkan masyarakat untuk melaporkan masalah dan keluhan yang ada di desa.

## Struktur Folder

```
public/
├── src/
│   ├── react-app/
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── types.ts
│   │   ├── vite-env.d.ts
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── pengaduan-masyarakat/
│   │   │   │   ├── AduanDetail.tsx
│   │   │   │   ├── AduanTable.tsx
│   │   │   │   ├── DashboardHeader.tsx
│   │   │   │   ├── DashboardAdmin/
│   │   │   │   │   ├── FilterSection.tsx
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── MasyarakatForm.tsx
│   │   │   │   │   ├── MasyarakatTable.tsx
│   │   │   │   │   ├── StatsCards.tsx
│   │   │   │   │   └── StatsCardsMasyarakat.tsx
│   │   │   │   └── DashboardMasyarakat/
│   │   │   │       ├── CreateAduanForm.tsx
│   │   │   │       └── index.tsx
│   │   │   └── pengelolaan-pbb/
│   │   │       ├── DaftarKetuaRT.tsx
│   │   │       ├── DetailDusunLaporan.tsx
│   │   │       ├── DetailSuratPBB.tsx
│   │   │       ├── FormTambahKetuaRT.tsx
│   │   │       ├── FormTambahSuratPBB.tsx
│   │   │       ├── StatistikCards.tsx
│   │   │       └── TabelSuratPBB.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── CekPembayaran.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── TrackingData.tsx
│   │   │   ├── pengaduan-masyarakat/
│   │   │   │   ├── DashboardAdminPengaduan.tsx
│   │   │   │   ├── DashboardMasyarakat.tsx
│   │   │   │   ├── LoginPengaduan.tsx
│   │   │   │   └── RegistrasiMasyarakat.tsx
│   │   │   └── pengelolaan-pbb/
│   │   │       ├── DashboardAdminPBB.tsx
│   │   │       ├── DashboardKepalaDusun.tsx
│   │   │       ├── DashboardKetuaRT.tsx
│   │   │       ├── LoginPBB.tsx
│   │   │       └── RegistrasiPerangkatDesa.tsx
│   │   └── utils/
│   │       ├── api.ts
│   │       ├── formatters.ts
│   │       └── time.ts
│   └── worker/
│       ├── index.ts
│       ├── types.ts
│       ├── middleware/
│       │   └── auth.ts
│       ├── routes/
│       │   ├── aduan.ts
│       │   ├── auth.ts
│       │   ├── dusun.ts
│       │   ├── masyarakat.ts
│       │   ├── pengaduan-masyarakat.ts
│       │   ├── pengelolaan-pbb.ts
│       │   ├── perangkat-desa.ts
│       │   ├── public.ts
│       │   ├── statistik.ts
│       │   ├── surat-pbb.ts
│       │   └── tracking.ts
│       └── utils/
│           ├── db.ts
│           ├── hash.ts
│           └── jwt.ts
├── drop_all.sql
├── eslint.config.js
├── index.html
├── package.json
├── README.md
├── rebuild_db_local.sh
├── rebuild_db_remote.sh
├── schema.sql
├── seed.sql
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.worker.json
├── vite.config.ts
├── worker-configuration.d.ts
└── wrangler.json
```

## Fitur Berdasarkan Role

### Masyarakat

- **Registrasi dan Login**: Masyarakat dapat mendaftar akun baru dan masuk ke sistem pengaduan menggunakan kredensial mereka.
- **Dashboard Masyarakat**:
  - Membuat aduan baru melalui formulir yang mencakup judul, kategori (Infrastruktur, Pelayanan Publik, Lingkungan, Sosial Kemasyarakatan, Ekonomi), dan deskripsi aduan dengan editor teks kaya yang mendukung upload gambar.
  - Melihat daftar aduan yang telah dibuat.
- **Tracking Aduan**: Melihat status dan perkembangan aduan yang telah dibuat, termasuk detail lengkap dan riwayat pembaruan.
- **Cek Pembayaran**: Memeriksa status pembayaran PBB berdasarkan data yang tersedia.

### Admin

- **Dashboard Admin Pengaduan**:
  - Melihat statistik aduan (jumlah aduan, status, dll.) melalui kartu statistik.
  - Mengelola tabel aduan: melihat daftar aduan, filter berdasarkan status atau kategori, melihat detail aduan lengkap dengan gambar yang diupload, dan mengubah status aduan.
  - Mengelola masyarakat: melihat tabel masyarakat, menambah/edit data masyarakat melalui formulir, dan melihat statistik masyarakat.
- **Dashboard Admin PBB**:
  - Mengelola surat PBB: melihat tabel surat PBB, detail surat, menambah surat baru melalui formulir, dan melihat laporan dusun.
  - Melihat statistik pengelolaan PBB melalui kartu statistik.

### Kepala Dusun

- **Registrasi Perangkat Desa**: Mendaftar sebagai perangkat desa dengan data pribadi.
- **Login PBB**: Masuk ke sistem pengelolaan PBB menggunakan akun perangkat desa.
- **Dashboard Kepala Dusun**:
  - Mengelola laporan dusun: melihat detail laporan dusun terkait pengelolaan PBB.
- **Settings**: Mengatur pengaturan akun seperti profil dan preferensi.
- **Forgot Password**: Mereset password jika lupa melalui proses verifikasi.

### Ketua RT

- **Registrasi Perangkat Desa**: Mendaftar sebagai perangkat desa dengan data pribadi.
- **Login PBB**: Masuk ke sistem pengelolaan PBB menggunakan akun perangkat desa.
- **Dashboard Ketua RT**:
  - Mengelola daftar ketua RT: melihat daftar ketua RT, menambah ketua RT baru melalui formulir.
- **Settings**: Mengatur pengaturan akun seperti profil dan preferensi.
- **Forgot Password**: Mereset password jika lupa melalui proses verifikasi.

## Anggota Kelompok

| Nama                          | NIM             | Fitur yang dikerjakan                             |
| ----------------------------- | --------------- | ------------------------------------------------- |
| Andika Dinata                 | 123140096       | Backend Development (API, Database, Authentication) |
| Ribka Hana Josephine Situmorang | -             | UI Otentikasi Pengguna dan Konteks               |
| Ardiansyah Fernando           | -               | Komponen UI Pengaduan Masyarakat               |
| Ibrahim Budi Satria           | -               | Komponen UI Pengelolaan PBB                    |
| Ahmad Aufamahdi Salam         | -               | Dashboard Admin untuk PBB                          |
| Ariq Ramadhinov Ronny         | -               | Dashboard Admin untuk Pengaduan                    |
| Aditya Ronal Maruli           | -               | Fitur Pelacakan dan Pemeriksaan Pembayaran           |
| Nabila Yuliana                | -               | Landing Page and General UI Enhancements         |
