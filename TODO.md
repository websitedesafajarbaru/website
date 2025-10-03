# TODO List - Desa Fajar Baru

## 🔐 Credentials

### Superadmin Account

- **Username:** `admin`
- **Password:** `password123`
- **Role:** `superadmin`
- **ID:** `admin-001`

> ⚠️ **PENTING:** Password ini untuk development/testing saja. Ganti dengan password yang kuat saat production!

---

## Backend API (Tasks 1-10)

### ✅ Task 1: Setup Backend API Structure

**Status:** Not Started  
**Description:** Membuat struktur folder dan file untuk backend API menggunakan Hono. Buat routes untuk autentikasi, pengelolaan PBB, dan pengaduan masyarakat.  
**Files:**

- src/worker/index.ts
- src/worker/routes/
- src/worker/middleware/
- src/worker/utils/

### ✅ Task 2: Implementasi Sistem Autentikasi dengan JWT

**Status:** Not Started  
**Description:** Buat middleware autentikasi menggunakan JWT dan Cloudflare KV untuk session storage. Session expire 1 hari. Buat utility untuk hash password (bcrypt atau argon2).  
**Files:**

- src/worker/middleware/auth.ts
- src/worker/utils/jwt.ts
- src/worker/utils/hash.ts

### ✅ Task 3: API Endpoint: Registrasi & Login Masyarakat

**Status:** Not Started  
**Description:** Buat endpoint POST /api/pengaduan-masyarakat/registrasi (nama_lengkap, username, nomor_telepon, email, alamat_rumah, password) dan POST /api/pengaduan-masyarakat/login. Insert data ke tabel pengguna dan masyarakat.  
**Files:**

- src/worker/routes/pengaduan-masyarakat.ts

### ✅ Task 4: API Endpoint: CRUD Aduan Masyarakat

**Status:** Not Started  
**Description:** Buat endpoint untuk masyarakat membuat aduan (POST /api/aduan), melihat daftar aduan mereka (GET /api/aduan/saya), dan melihat detail aduan termasuk tanggapan (GET /api/aduan/:id).  
**Files:**

- src/worker/routes/aduan.ts

### ✅ Task 5: API Endpoint: Dashboard Superadmin Pengaduan

**Status:** Not Started  
**Description:** Buat endpoint untuk superadmin melihat semua aduan (GET /api/aduan), memperbarui status aduan, dan memberikan tanggapan (POST /api/aduan/:id/tanggapan).  
**Files:**

- src/worker/routes/aduan.ts

### ✅ Task 6: API Endpoint: CRUD Dusun oleh Superadmin

**Status:** Not Started  
**Description:** Buat endpoint untuk superadmin membuat dusun (POST /api/dusun), membaca daftar dusun (GET /api/dusun), update dusun termasuk status_data_pbb (PUT /api/dusun/:id), dan delete dusun (DELETE /api/dusun/:id). Generate 2 token registrasi per dusun.  
**Files:**

- src/worker/routes/dusun.ts

### ✅ Task 7: API Endpoint: Registrasi & Login Perangkat Desa

**Status:** Not Started  
**Description:** Buat endpoint POST /api/pengelolaan-pbb/registrasi (validasi token dusun, nama_lengkap, username, password, jabatan) dan POST /api/pengelolaan-pbb/login untuk superadmin, kepala dusun, dan ketua RT.  
**Files:**

- src/worker/routes/pengelolaan-pbb.ts

### ✅ Task 8: API Endpoint: CRUD Surat PBB

**Status:** Not Started  
**Description:** Buat endpoint untuk tambah surat PBB (POST /api/surat-pbb), lihat daftar surat berdasarkan role dan dusun (GET /api/surat-pbb), update surat termasuk status_pembayaran (PUT /api/surat-pbb/:id), dan delete surat (DELETE /api/surat-pbb/:id).  
**Files:**

- src/worker/routes/surat-pbb.ts

### ✅ Task 9: API Endpoint: Cek Pembayaran PBB Publik

**Status:** Not Started  
**Description:** Buat endpoint GET /api/cek-pembayaran/:nomor_objek_pajak untuk masyarakat umum mengecek status pembayaran tanpa login. Return data surat PBB berdasarkan nomor objek pajak.  
**Files:**

- src/worker/routes/public.ts

### ✅ Task 10: API Endpoint: Statistik dan Laporan PBB

**Status:** Not Started  
**Description:** Buat endpoint untuk statistik dusun (GET /api/statistik/dusun/:id) dengan data total pajak terhutang, total dibayar, jumlah surat per status. Endpoint untuk laporan keseluruhan (GET /api/laporan).  
**Files:**

- src/worker/routes/statistik.ts

---

## Frontend React (Tasks 11-23)

### ✅ Task 11: Setup React Router & Layout Components

**Status:** Not Started  
**Description:** Install react-router-dom, setup routing untuk semua path yang disebutkan di SKPL. Buat komponen Layout dengan Bootstrap navbar.  
**Files:**

- src/react-app/App.tsx
- src/react-app/components/Layout.tsx
- src/react-app/components/Navbar.tsx

### ✅ Task 12: Frontend: Landing Page (/)

**Status:** Not Started  
**Description:** Buat halaman landing page dengan informasi tentang Desa Fajar Baru. Navbar dengan link ke Pengelolaan PBB, Cek Pembayaran PBB, dan Pengaduan Masyarakat. Gunakan Bootstrap 5.3 untuk styling.  
**Files:**

- src/react-app/pages/LandingPage.tsx

### ✅ Task 13: Frontend: Registrasi Masyarakat

**Status:** Not Started  
**Description:** Buat halaman /pengaduan-masyarakat/registrasi dengan form (nama_lengkap, username, nomor_telepon, email, alamat_rumah, password). Validasi input dan submit ke API.  
**Files:**

- src/react-app/pages/pengaduan-masyarakat/RegistrasiMasyarakat.tsx

### ✅ Task 14: Frontend: Login Pengaduan Masyarakat

**Status:** Not Started  
**Description:** Buat halaman /pengaduan-masyarakat/login dengan form login untuk masyarakat dan superadmin. Redirect ke dashboard sesuai role setelah login sukses.  
**Files:**

- src/react-app/pages/pengaduan-masyarakat/LoginPengaduan.tsx

### ✅ Task 15: Frontend: Dashboard Masyarakat

**Status:** Not Started  
**Description:** Buat halaman /pengaduan-masyarakat/dashboard-masyarakat untuk melihat daftar aduan masyarakat dan form membuat aduan baru (judul, isi, kategori). Tampilkan status dan tanggapan aduan.  
**Files:**

- src/react-app/pages/pengaduan-masyarakat/DashboardMasyarakat.tsx

### ✅ Task 16: Frontend: Dashboard Superadmin Pengaduan

**Status:** Not Started  
**Description:** Buat halaman /pengaduan-masyarakat/dashboard-superadmin untuk melihat semua aduan, update status aduan, dan memberikan tanggapan. Filter berdasarkan status.  
**Files:**

- src/react-app/pages/pengaduan-masyarakat/DashboardSuperadminPengaduan.tsx

### ✅ Task 17: Frontend: Registrasi Perangkat Desa

**Status:** Not Started  
**Description:** Buat halaman /pengelolaan-pbb/registrasi dengan form registrasi menggunakan token dusun (nama_lengkap, username, password, token, jabatan).  
**Files:**

- src/react-app/pages/pengelolaan-pbb/RegistrasiPerangkatDesa.tsx

### ✅ Task 18: Frontend: Login Pengelolaan PBB

**Status:** Not Started  
**Description:** Buat halaman /pengelolaan-pbb/login dengan form login untuk superadmin, kepala dusun, dan ketua RT. Redirect ke dashboard sesuai role.  
**Files:**

- src/react-app/pages/pengelolaan-pbb/LoginPBB.tsx

### ✅ Task 19: Frontend: Dashboard Superadmin PBB

**Status:** Not Started  
**Description:** Buat halaman /pengelolaan-pbb/dashboard-superadmin dengan fitur: CRUD dusun, CRUD perangkat desa, CRUD surat PBB, lihat laporan dan statistik lengkap. Gunakan tabs atau sections untuk organize.  
**Files:**

- src/react-app/pages/pengelolaan-pbb/DashboardSuperadminPBB.tsx

### ✅ Task 20: Frontend: Dashboard Kepala Dusun

**Status:** Not Started  
**Description:** Buat halaman /pengelolaan-pbb/dashboard-kepala-dusun untuk melihat daftar ketua RT, CRUD surat PBB di dusunnya, dan lihat laporan dusun.  
**Files:**

- src/react-app/pages/pengelolaan-pbb/DashboardKepalaDusun.tsx

### ✅ Task 21: Frontend: Dashboard Ketua RT

**Status:** Not Started  
**Description:** Buat halaman /pengelolaan-pbb/dashboard-ketua-rt untuk CRUD surat PBB di dusunnya dan lihat statistik surat yang mereka perbarui.  
**Files:**

- src/react-app/pages/pengelolaan-pbb/DashboardKetuaRT.tsx

### ✅ Task 22: Frontend: Halaman Cek Pembayaran PBB

**Status:** Not Started  
**Description:** Buat halaman publik untuk cek status pembayaran PBB berdasarkan nomor objek pajak. Tidak perlu login. Bisa diakses dari landing page.  
**Files:**

- src/react-app/pages/CekPembayaran.tsx

### ✅ Task 23: Implementasi Protected Routes & Auth Context

**Status:** Not Started  
**Description:** Buat AuthContext untuk manage state user login. Buat ProtectedRoute component untuk proteksi halaman berdasarkan role. Store JWT token di localStorage.  
**Files:**

- src/react-app/contexts/AuthContext.tsx
- src/react-app/components/ProtectedRoute.tsx

---

## Testing & Polish (Tasks 24-30)

### ✅ Task 24: Testing: Pengaduan Masyarakat Flow

**Status:** Not Started  
**Description:** Test dengan Playwright: registrasi masyarakat, login, membuat aduan, login superadmin, membuka dashboard superadmin, memberikan tanggapan aduan. Verifikasi data tersimpan dengan benar di database.

### ✅ Task 25: Testing: Pengelolaan PBB Flow (Superadmin)

**Status:** Not Started  
**Description:** Test dengan Playwright: login superadmin, buat dusun baru, generate token, lihat daftar dusun, tambah surat PBB, update status_pembayaran, update status_data_pbb dusun, lihat statistik.

### ✅ Task 26: Testing: Pengelolaan PBB Flow (Perangkat Desa)

**Status:** Not Started  
**Description:** Test dengan Playwright: registrasi kepala dusun dengan token, registrasi ketua RT dengan token, login kepala dusun, tambah surat PBB, login ketua RT, update surat PBB, lihat statistik masing-masing.

### ✅ Task 27: Testing: Cek Pembayaran Publik

**Status:** Not Started  
**Description:** Test dengan Playwright: akses halaman cek pembayaran, input nomor objek pajak yang valid, verifikasi data ditampilkan. Test dengan nomor objek pajak yang tidak ada, verifikasi error handling.

### ✅ Task 28: Refinement: Error Handling & Validation

**Status:** Not Started  
**Description:** Implementasi comprehensive error handling di backend API. Validasi input di frontend dan backend. Tampilkan error messages yang user-friendly menggunakan Bootstrap alerts.

### ✅ Task 29: Refinement: UI/UX Improvements

**Status:** Not Started  
**Description:** Polish UI menggunakan Bootstrap 5.3 components (tables, cards, forms, modals, alerts). Ensure responsive design. Add loading states dan feedback untuk user actions.

### ✅ Task 30: Final Testing & Documentation

**Status:** Not Started  
**Description:** Comprehensive testing semua fitur dengan Playwright. Test edge cases. Update README.md dengan dokumentasi lengkap cara setup, run, dan deploy aplikasi. Document API endpoints.

---

## Progress Summary

- Total Tasks: 30
- Completed: 0
- In Progress: 0
- Not Started: 30

---

---

# 📋 RECENT SESSION SUMMARY (Oct 19, 2025)

## ✅ COMPLETED: Dashboard Kepala Dusun Redesign & Formatting

### 1. Formatter Utility Creation ✅

**File**: `src/react-app/utils/formatters.ts` (NEW)

Dibuat utility functions untuk formatting display values:

- `formatRole()`: `ketua_rt` → "Ketua RT", `kepala_dusun` → "Kepala Dusun"
- `formatStatusPembayaran()`: `belum_bayar` → "Belum Bayar", `sudah_bayar` → "Sudah Bayar"
- `formatStatusDataPBB()`: `lengkap` → "Lengkap", `belum_lengkap` → "Belum Lengkap"
- `formatStatusAduan()`, `formatKategoriAduan()`
- Badge colors: `getRoleColor()`, `getStatusPembayaranColor()`, etc.

**Status**: ✅ Complete & Working

---

### 2. Dashboard Kepala Dusun Redesign ✅

**File**: `src/react-app/pages/pengelolaan-pbb/DashboardKepalaDusun.tsx`

**Implemented Features**:

- ✅ Two-tab navigation: "Daftar Ketua RT" (primary) + "Surat PBB"
- ✅ Tab 1: Ketua RT List (No, Nama, Username, Jabatan badge)
- ✅ Tab 2: Surat PBB List (existing functionality)
- ✅ Header dengan dusun name + geo-alt icon
- ✅ Empty states untuk kedua tabs dengan inbox icon
- ✅ Bootstrap nav-tabs styling
- ✅ Fixed useEffect dependency array warnings

**Data Flow**:

```
1. Fetch /api/perangkat-desa/:userId → Get user's dusun assignment
2. Fetch /api/dusun/:dusunId → Get dusun info for header display
3. Fetch /api/perangkat-desa?dusun_id=${dusunId} → Get perangkat in dusun
4. Filter jabatan === 'ketua_rt' → Display Ketua RT list
```

**Status**: ✅ Frontend Complete, ⚠️ Backend Issue (see below)

---

### 3. Applied Formatters Across Application ✅

**Navbar** (`src/react-app/components/Navbar.tsx`):

- ✅ Shows "Kepala Dusun" instead of "kepala_dusun"
- ✅ Verified working in dropdown

**Dashboard Superadmin PBB**:

- ✅ Role badges use formatters
- ✅ Status badges use formatters
- ✅ Consistent in modal & table views

**Dashboard Kepala Dusun**:

- ✅ Payment status formatted

**Status**: ✅ All formatters working

---

## ⚠️ KNOWN ISSUE: Backend Authorization Error

### Problem: 500 Internal Server Error

**Endpoint**: `GET /api/perangkat-desa/:id`

**Symptoms**:

- Frontend calls `/api/perangkat-desa/${user.id}` to fetch kepala_dusun's dusun assignment
- Backend returns 500 Internal Server Error
- Dashboard cannot fetch dusun info
- Ketua RT list remains empty (shows empty state)

**Root Cause**:

1. Initially: 403 Forbidden (route protected with `requireRole('superadmin')`)
2. Removed blanket authorization
3. Attempted role-based filtering (non-superadmin = same dusun only)
4. Type casting issue: `c.get('user')` returns unknown, cast to `{ userId: string; roles: string }`
5. Complex authorization logic has bugs → 500 error
6. Vite server stuck during restart (cannot see detailed logs)

**Backend Changes Made** (`src/worker/routes/perangkat-desa.ts`):

```typescript
// Before: All routes protected
perangkatDesaRoutes.use('/*', requireRole('superadmin'));

// After: Only write operations protected
perangkatDesaRoutes.use('/*', authMiddleware);
perangkatDesaRoutes.put('/:id', requireRole('superadmin'), ...);
perangkatDesaRoutes.delete('/:id', requireRole('superadmin'), ...);

// GET routes: Simplified, removed complex auth checks
// Added detailed console.log for debugging
```

**Current State**:

- ⚠️ Vite server stuck/not responding
- ⚠️ 500 error persists
- ⚠️ Cannot see error logs

---

## 🔧 RECOMMENDED FIX (Next Session)

### Option A: Debug Backend Properly

1. **Kill stuck server**:

   ```bash
   pkill -9 -f vite && pkill -9 -f wrangler && pkill -9 node
   ```

2. **Restart and check logs**:

   ```bash
   npm run dev
   ```

   Look for `[DEBUG]` and `[ERROR]` console output

3. **Test endpoint manually**:

   ```bash
   # Get token from browser localStorage
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:5173/api/perangkat-desa/42760ba3-8138-4c7a-97a2-3873245d2a78
   ```

4. **Check database directly**:
   ```bash
   sqlite3 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite
   SELECT pd.*, p.nama_lengkap FROM perangkat_desa pd
   INNER JOIN pengguna p ON pd.id = p.id
   WHERE pd.id = '42760ba3-8138-4c7a-97a2-3873245d2a78';
   ```

### Option B: Alternative Approach (Simpler)

**Modify JWT to include id_dusun** (recommended):

In `src/worker/routes/auth.ts` - login endpoint:

```typescript
// Fetch perangkat info
const perangkat = await c.env.DB.prepare("SELECT id_dusun FROM perangkat_desa WHERE id = ?").bind(user.id).first()

// Include in JWT
const token = await signJWT({
  userId: user.id,
  username: user.username,
  roles: user.roles,
  id_dusun: perangkat?.id_dusun || null, // ← Add this
})
```

Then frontend uses `user.id_dusun` directly, no extra API call needed.

### Option C: Temporary Workaround

Comment out dusun info fetch, hardcode for testing:

```typescript
// In DashboardKepalaDusun.tsx
useEffect(() => {
  // Temporary: Skip API call
  setDusunId(1) // Hardcode Dusun Melati
  setDusunInfo({
    id: 1,
    nama_dusun: "Dusun Melati",
    status_data_pbb: "lengkap",
  })
}, [])
```

This will at least show Ketua RT list while debugging backend.

---

## 📊 Testing Status

### ✅ Tested & Working

- [x] Navbar displays "Kepala Dusun" (formatted)
- [x] Dashboard tabs render
- [x] Empty state displays
- [x] Tab switching works
- [x] Login successful
- [x] Formatters work in all components

### ⚠️ Partially Working

- [~] Dashboard loads but empty (backend blocked)
- [~] Dusun header not showing (API blocked)

### ❌ Not Working

- [ ] Ketua RT list (blocked by 500 error)
- [ ] `/api/perangkat-desa/:id` endpoint fails
- [ ] `/api/perangkat-desa?dusun_id=X` not tested

---

## 📝 Modified Files

```
✅ NEW:     src/react-app/utils/formatters.ts
✅ UPDATED: src/react-app/components/Navbar.tsx
✅ UPDATED: src/react-app/pages/pengelolaan-pbb/DashboardKepalaDusun.tsx
✅ UPDATED: src/react-app/pages/pengelolaan-pbb/DashboardSuperadminPBB.tsx
⚠️ UPDATED: src/worker/routes/perangkat-desa.ts (has 500 error)
```

---

## 💡 Key Learnings

1. **React Hook Dependencies**: Use stable object references, avoid optional chaining in deps
2. **Type Casting in Hono**: Context `c.get('user')` returns unknown, needs explicit cast
3. **JWT Payload Structure**: Has `userId` not `id` (important difference!)
4. **Vite HMR**: Backend changes sometimes need full restart to apply
5. **Debugging Strategy**: Add detailed console.log BEFORE deployment to production

---

**Session Date**: October 19, 2025  
**Status**: Frontend Complete ✅ | Backend Debugging Needed ⚠️  
**Blocker**: 500 error on `/api/perangkat-desa/:id` + Vite server stuck
