-- ============================================================
-- Migration: Row Level Security Policies
-- Description: RLS policies for mitra (own data) and admin (all data)
-- ============================================================

-- =========================
-- ENABLE RLS ON ALL TABLES
-- =========================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lahan ENABLE ROW LEVEL SECURITY;
ALTER TABLE siklus_tanam ENABLE ROW LEVEL SECURITY;
ALTER TABLE hasil_panen ENABLE ROW LEVEL SECURITY;
ALTER TABLE biaya_panen ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal_irigasi ENABLE ROW LEVEL SECURITY;

-- =========================
-- HELPER FUNCTION
-- =========================

-- Get the app user_id from the authenticated Supabase auth.uid()
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS UUID AS $$
  SELECT id FROM users WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =========================
-- USERS TABLE POLICIES
-- =========================

-- Admin: full access to all users
CREATE POLICY "admin_select_users" ON users
  FOR SELECT USING (is_admin());

CREATE POLICY "admin_insert_users" ON users
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "admin_update_users" ON users
  FOR UPDATE USING (is_admin());

CREATE POLICY "admin_delete_users" ON users
  FOR DELETE USING (is_admin());

-- Mitra: can only see and update own profile
CREATE POLICY "mitra_select_own_user" ON users
  FOR SELECT USING (auth_id = auth.uid());

CREATE POLICY "mitra_update_own_user" ON users
  FOR UPDATE USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- =========================
-- LAHAN TABLE POLICIES
-- =========================

-- Admin: full access
CREATE POLICY "admin_all_lahan" ON lahan
  FOR ALL USING (is_admin());

-- Mitra: own data only
CREATE POLICY "mitra_select_own_lahan" ON lahan
  FOR SELECT USING (user_id = get_user_id());

CREATE POLICY "mitra_insert_own_lahan" ON lahan
  FOR INSERT WITH CHECK (user_id = get_user_id());

CREATE POLICY "mitra_update_own_lahan" ON lahan
  FOR UPDATE USING (user_id = get_user_id())
  WITH CHECK (user_id = get_user_id());

CREATE POLICY "mitra_delete_own_lahan" ON lahan
  FOR DELETE USING (user_id = get_user_id());

-- =========================
-- SIKLUS TANAM TABLE POLICIES
-- =========================

-- Admin: full access
CREATE POLICY "admin_all_siklus_tanam" ON siklus_tanam
  FOR ALL USING (is_admin());

-- Mitra: own data via lahan ownership
CREATE POLICY "mitra_select_own_siklus" ON siklus_tanam
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lahan
      WHERE lahan.id = siklus_tanam.lahan_id
        AND lahan.user_id = get_user_id()
    )
  );

CREATE POLICY "mitra_insert_own_siklus" ON siklus_tanam
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lahan
      WHERE lahan.id = siklus_tanam.lahan_id
        AND lahan.user_id = get_user_id()
    )
  );

CREATE POLICY "mitra_update_own_siklus" ON siklus_tanam
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lahan
      WHERE lahan.id = siklus_tanam.lahan_id
        AND lahan.user_id = get_user_id()
    )
  );

CREATE POLICY "mitra_delete_own_siklus" ON siklus_tanam
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lahan
      WHERE lahan.id = siklus_tanam.lahan_id
        AND lahan.user_id = get_user_id()
    )
  );

-- =========================
-- HASIL PANEN TABLE POLICIES
-- =========================

-- Admin: full access
CREATE POLICY "admin_all_hasil_panen" ON hasil_panen
  FOR ALL USING (is_admin());

-- Mitra: own data via siklus_tanam -> lahan ownership
CREATE POLICY "mitra_select_own_hasil" ON hasil_panen
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM siklus_tanam
      JOIN lahan ON lahan.id = siklus_tanam.lahan_id
      WHERE siklus_tanam.id = hasil_panen.siklus_tanam_id
        AND lahan.user_id = get_user_id()
    )
  );

CREATE POLICY "mitra_insert_own_hasil" ON hasil_panen
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM siklus_tanam
      JOIN lahan ON lahan.id = siklus_tanam.lahan_id
      WHERE siklus_tanam.id = hasil_panen.siklus_tanam_id
        AND lahan.user_id = get_user_id()
    )
  );

CREATE POLICY "mitra_update_own_hasil" ON hasil_panen
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM siklus_tanam
      JOIN lahan ON lahan.id = siklus_tanam.lahan_id
      WHERE siklus_tanam.id = hasil_panen.siklus_tanam_id
        AND lahan.user_id = get_user_id()
    )
  );

CREATE POLICY "mitra_delete_own_hasil" ON hasil_panen
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM siklus_tanam
      JOIN lahan ON lahan.id = siklus_tanam.lahan_id
      WHERE siklus_tanam.id = hasil_panen.siklus_tanam_id
        AND lahan.user_id = get_user_id()
    )
  );

-- =========================
-- BIAYA PANEN TABLE POLICIES
-- =========================

-- Admin: full access
CREATE POLICY "admin_all_biaya_panen" ON biaya_panen
  FOR ALL USING (is_admin());

-- Mitra: own data via siklus_tanam -> lahan ownership
CREATE POLICY "mitra_select_own_biaya" ON biaya_panen
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM siklus_tanam
      JOIN lahan ON lahan.id = siklus_tanam.lahan_id
      WHERE siklus_tanam.id = biaya_panen.siklus_tanam_id
        AND lahan.user_id = get_user_id()
    )
  );

CREATE POLICY "mitra_insert_own_biaya" ON biaya_panen
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM siklus_tanam
      JOIN lahan ON lahan.id = siklus_tanam.lahan_id
      WHERE siklus_tanam.id = biaya_panen.siklus_tanam_id
        AND lahan.user_id = get_user_id()
    )
  );

CREATE POLICY "mitra_update_own_biaya" ON biaya_panen
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM siklus_tanam
      JOIN lahan ON lahan.id = siklus_tanam.lahan_id
      WHERE siklus_tanam.id = biaya_panen.siklus_tanam_id
        AND lahan.user_id = get_user_id()
    )
  );

CREATE POLICY "mitra_delete_own_biaya" ON biaya_panen
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM siklus_tanam
      JOIN lahan ON lahan.id = siklus_tanam.lahan_id
      WHERE siklus_tanam.id = biaya_panen.siklus_tanam_id
        AND lahan.user_id = get_user_id()
    )
  );

-- =========================
-- JADWAL IRIGASI TABLE POLICIES
-- =========================

-- Admin: full access
CREATE POLICY "admin_all_jadwal_irigasi" ON jadwal_irigasi
  FOR ALL USING (is_admin());

-- Mitra: own data via lahan ownership
CREATE POLICY "mitra_select_own_irigasi" ON jadwal_irigasi
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lahan
      WHERE lahan.id = jadwal_irigasi.lahan_id
        AND lahan.user_id = get_user_id()
    )
  );

CREATE POLICY "mitra_insert_own_irigasi" ON jadwal_irigasi
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lahan
      WHERE lahan.id = jadwal_irigasi.lahan_id
        AND lahan.user_id = get_user_id()
    )
  );

CREATE POLICY "mitra_update_own_irigasi" ON jadwal_irigasi
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lahan
      WHERE lahan.id = jadwal_irigasi.lahan_id
        AND lahan.user_id = get_user_id()
    )
  );

CREATE POLICY "mitra_delete_own_irigasi" ON jadwal_irigasi
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lahan
      WHERE lahan.id = jadwal_irigasi.lahan_id
        AND lahan.user_id = get_user_id()
    )
  );
