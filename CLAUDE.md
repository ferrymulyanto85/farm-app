# Farm App - Konteks Project

## Deskripsi

Aplikasi manajemen pertanian jagung berbasis **Supabase**. Sistem ini dirancang untuk mengelola siklus tanam, lahan, hasil panen, biaya, dan jadwal irigasi dengan dua peran pengguna: **admin** dan **mitra** (petani).

## Tech Stack

- **Database & Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Bahasa**: SQL (migrasi database)

## Struktur Project

```
farm-app/
└── supabase/
    └── migrations/
        ├── 20260228000001_create_enums_and_tables.sql  -- Enum, tabel, trigger
        ├── 20260228000002_create_rls_policies.sql      -- RLS policies & helper functions
        └── 20260228000003_seed_varietas.sql            -- Data referensi varietas jagung
```

## Skema Database

### Enum

| Nama               | Nilai                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------- |
| `user_role`         | admin, mitra                                                                           |
| `varietas_jagung`   | NK212, Bisi-18, Pioneer P27                                                            |
| `status_siklus`     | perencanaan, persiapan_lahan, penanaman, perawatan, panen, selesai, gagal               |
| `status_irigasi`    | dijadwalkan, selesai, dibatalkan, terlewat                                              |
| `kategori_biaya`    | benih, pupuk, pestisida, tenaga_kerja, irigasi, alat, lainnya                           |

### Tabel Utama

- **users** -- Pengguna (terhubung ke `auth.users` Supabase)
- **lahan** -- Data lahan/kebun milik user
- **siklus_tanam** -- Siklus penanaman per lahan
- **hasil_panen** -- Hasil panen per siklus (termasuk `total_pendapatan` kolom generated)
- **biaya_panen** -- Pencatatan biaya per siklus
- **jadwal_irigasi** -- Jadwal irigasi per lahan/siklus
- **varietas_ref** -- Referensi varietas jagung (NK212: 98 hari, Bisi-18: 95 hari, Pioneer P27: 100 hari)

### Relasi

```
users 1──* lahan 1──* siklus_tanam 1──* hasil_panen
                  │                  └──* biaya_panen
                  └──* jadwal_irigasi
```

### Row Level Security (RLS)

- **Admin**: akses penuh ke semua tabel
- **Mitra**: hanya bisa mengakses data milik sendiri (berdasarkan `user_id` dan relasi FK)
- Helper: `get_user_id()` dan `is_admin()` digunakan dalam policy

## Konvensi

- Penamaan tabel dan kolom menggunakan **bahasa Indonesia** (snake_case)
- Semua tabel memiliki kolom `created_at` (auto-set) dan `updated_at` (dikelola trigger)
- Foreign key menggunakan `ON DELETE CASCADE`
- Migrasi bernomor urut: `YYYYMMDD000NNN_deskripsi.sql`

## Perintah

Belum ada perintah build/test karena project masih tahap database schema. Akan ditambahkan setelah application code dibuat.
