# Spesifikasi Kebutuhan Perangkat Lunak

Jadi saya ingin kamu membuat sebuah Desa Fajar Baru yang memiliki dua modul utama yaitu (pengelolaan pbb dan pengaduan masyarakat)

Untuk mudahnya kita bagi jadi dua path utama.

/ - Landing page. berisi informasi tentang web desa, ada beberapa nav link seperti menuju ke pengelolaaan pbb, cek pembayaran pbb pengaduan masyarakat.

/pengelolaan-pbb/(anything else) Untuk modul pengelolaan pbb dan fitur-fiturnya

/pengaduan-masyarakat/(anything else) Untuk modul pengaduan masyarakat.

Kemudian tech stack yang akan digunakan yaitu Cloudflare Workers + Vite + React + Hono ya.

Skema database nya udah saya buat dan saya masukkan ke Cloudflare D1 jadi kamu tidak perlu mengotak atik database. Kamu bisa menggunakan referensi `schema.sql` untuk mengetahui skema databasenya.

Kemudian untuk styling. Saya ingin kamu menggunakan Bootstrap 5.3 agar cepat dalam pengembangannya. Dan menggunakan CDN yang linknya udah saya tambahkan di index.html

Di modul-modul ini ada beberapa role.

Pengelolaan PBB:

- Superadmin
- Kepala dusun
- Ketua RT

Pengaduan masyarakat:

- Superadmin
- Masyarakat

Untuk alur dari websitenya itu seperti ini.

Pengaduan masyarakat:

1. Masyarakat melakukan registrasi dengan memasukkan nama_lengkap, username, nomor_telepon, email, alamat_rumah, password.
2. Masyarakat membuat sebuah aduan dengan memasukkan judul, isi, dan kategori
3. Superadmin menerima aduan masyarakat
4. Superadmin menanggapi aduan masyarakat

Pengelolaan PBB:

1. Superadmin membuat semua daftar dusun.
2. Di setiap dusun tersebut ada 2 token registrasi untuk digunakan oleh kepala dusun dan para ketua rt di dusun tersebut.
3. Kepala dusun melakukan registrasi
4. Ketua rt melakukan registrasi
5. Jadi di tahap ini para ketua rt, kepala dusun memasukkan seluruh data suratnya terlebih dahulu, Superadmin juga bisa membantu.
6. Superadmin melihat jumlah surat di suatu dusun dan mengubah status_data_pbb ke sudah_lengkap jika datanya sudah lengkap.
7. Nah jika data sudah lengkap, maka data warga bisa diperbarui untuk mengubah status_pembayarannya. Superadmin, kepala dusun, ketua rt bisa melakukan perubahan status pembayaran.
8. Kemudian Superadmin bisa memantau statistik setiap dusun, total pajak terhutang, total pajak yang sudah dibayar. Jadi nanti ada statistik dusun menggunakan tabel yang ketika dipencet nanti bisa digunakan untuk mencari detail setiap surat.
9. Masyarakat bisa mengakses halaman cek surat sudah dibayar belum, dan tidak perlu login, hanya perlu menggunakan nomor objek pajak.

Kemudian untuk path-pathnya mungkin seperti ini.

Pengaduan Masyarakat:

/pengaduan-masyarakat/registrasi - Untuk masyarakat melakukan registrasi

/pengaduan-masyarakat/login - Untuk masyarakat dan Superadmin melakukan login

/pengaduan-masyarakat/dashboard-masyrakat - Dashboard tempat masyarakat melihat daftar aduan mereka, dan tempat masyarakat membuat aduan mereka.

/pengaduan-masyarakat/dashboard-superadmin - Dashboard tempat superadmin melihat seluruh daftar aduan di desa dan tempat superadmin membalas aduan masraakat.

Pengelolaan PBB:

/pengelolaan-pbb/registrasi - Untuk perangkat desa melakukan registrasi menggunakan token yang sudah diberikan.

/pengelolaan-pbb/login - Untuk perangkat desa melakukan login.

/pengelolaan-pbb/dashboard-superadmin - Halaman dashboard khusus superadmin. Disini superadmin bisa CRUD data dusun, CRUD data perangkat desa, CRUD data surat_pbb. Melihat laporan

/pengelolaan-pbb/dashboard-kepala-dusun - Halaman dashboard khusus kepala dusun. Disini kepala dusun bisa melihat daftar ketua rt yang terdaftar, bisa melihat seluruh surat pbb warga di dusun. Bisa menambahkan dan memperbarui surat. Bisa melihat laporan.

/pengelolaan-pbb/dashboard-ketua-rt - Halaman dashboard khusus ketua rt. Disini ketua rt bisa melihat seluruh surat pbb warga di dusun. Bisa menambahkan dan memperbarui surat. Bisa melihat statistik surat yang mereka perbarui.

Untuk sessions akan disimpan menggunakan Cloudflare KV ya. Kemudian set 1 hari tidak login maka expire. Bisa menggunakan jwt atau something. Cek bindingnya ya.

Saya ingin semuanya menggunakan navbar jenis top. Buat tampilannya seefektif mungkin. Tetap fokus menggunakan styling Bootstrap 5.3 sebisa mungkin jangan custom css. Kemudian jangan menambahkan emoji. Jangan menambahkan komentar berlebihan.
