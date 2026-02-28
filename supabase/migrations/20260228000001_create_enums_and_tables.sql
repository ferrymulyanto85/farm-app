-- ============================================================
-- Migration: Create Enums and Tables
-- Description: Core schema for farm management application
-- ============================================================

-- =========================
-- ENUM TYPES
-- =========================

CREATE TYPE user_role AS ENUM ('admin', 'mitra');

CREATE TYPE varietas_jagung AS ENUM ('NK212', 'Bisi-18', 'Pioneer P27');

CREATE TYPE status_siklus AS ENUM (
  'perencanaan',
  'persiapan_lahan',
  'penanaman',
  'perawatan',
  'panen',
  'selesai',
  'gagal'
);

CREATE TYPE status_irigasi AS ENUM (
  'dijadwalkan',
  'selesai',
  'dibatalkan',
  'terlewat'
);

CREATE TYPE kategori_biaya AS ENUM (
  'benih',
  'pupuk',
  'pestisida',
  'tenaga_kerja',
  'irigasi',
  'alat',
  'lainnya'
);

-- =========================
-- TABLES
-- =========================

-- 1. Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'mitra',
  no_telepon VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_role ON users(role);

-- 2. Lahan (Fields/Land)
CREATE TABLE lahan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nama VARCHAR(255) NOT NULL,
  lokasi TEXT,
  luas_hektar NUMERIC(10, 2) NOT NULL CHECK (luas_hektar > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lahan_user_id ON lahan(user_id);

-- 3. Siklus Tanam (Planting Cycle)
CREATE TABLE siklus_tanam (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lahan_id UUID NOT NULL REFERENCES lahan(id) ON DELETE CASCADE,
  varietas varietas_jagung NOT NULL,
  tanggal_tanam DATE NOT NULL,
  estimasi_panen DATE NOT NULL,
  tanggal_panen_aktual DATE,
  status status_siklus NOT NULL DEFAULT 'perencanaan',
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_tanggal_panen CHECK (estimasi_panen > tanggal_tanam)
);

CREATE INDEX idx_siklus_tanam_lahan_id ON siklus_tanam(lahan_id);
CREATE INDEX idx_siklus_tanam_status ON siklus_tanam(status);

-- 4. Hasil Panen (Harvest Results)
CREATE TABLE hasil_panen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siklus_tanam_id UUID NOT NULL REFERENCES siklus_tanam(id) ON DELETE CASCADE,
  tanggal_panen DATE NOT NULL,
  jumlah_kg NUMERIC(10, 2) NOT NULL CHECK (jumlah_kg >= 0),
  kualitas VARCHAR(50),
  harga_per_kg NUMERIC(12, 2) CHECK (harga_per_kg >= 0),
  total_pendapatan NUMERIC(15, 2) GENERATED ALWAYS AS (jumlah_kg * harga_per_kg) STORED,
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hasil_panen_siklus_id ON hasil_panen(siklus_tanam_id);

-- 5. Biaya Panen (Costs)
CREATE TABLE biaya_panen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siklus_tanam_id UUID NOT NULL REFERENCES siklus_tanam(id) ON DELETE CASCADE,
  kategori kategori_biaya NOT NULL,
  deskripsi TEXT,
  jumlah NUMERIC(15, 2) NOT NULL CHECK (jumlah >= 0),
  tanggal DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_biaya_panen_siklus_id ON biaya_panen(siklus_tanam_id);
CREATE INDEX idx_biaya_panen_kategori ON biaya_panen(kategori);

-- 6. Jadwal Irigasi (Irrigation Schedule)
CREATE TABLE jadwal_irigasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lahan_id UUID NOT NULL REFERENCES lahan(id) ON DELETE CASCADE,
  siklus_tanam_id UUID REFERENCES siklus_tanam(id) ON DELETE SET NULL,
  tanggal_waktu TIMESTAMPTZ NOT NULL,
  durasi_menit INT NOT NULL CHECK (durasi_menit > 0),
  volume_liter NUMERIC(10, 2) CHECK (volume_liter > 0),
  status status_irigasi NOT NULL DEFAULT 'dijadwalkan',
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_jadwal_irigasi_lahan_id ON jadwal_irigasi(lahan_id);
CREATE INDEX idx_jadwal_irigasi_siklus_id ON jadwal_irigasi(siklus_tanam_id);
CREATE INDEX idx_jadwal_irigasi_status ON jadwal_irigasi(status);
CREATE INDEX idx_jadwal_irigasi_tanggal ON jadwal_irigasi(tanggal_waktu);

-- =========================
-- UPDATED_AT TRIGGER
-- =========================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_lahan_updated_at
  BEFORE UPDATE ON lahan
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_siklus_tanam_updated_at
  BEFORE UPDATE ON siklus_tanam
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_jadwal_irigasi_updated_at
  BEFORE UPDATE ON jadwal_irigasi
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
