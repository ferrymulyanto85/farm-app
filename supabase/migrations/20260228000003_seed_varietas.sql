-- ============================================================
-- Migration: Seed Varietas Reference Data
-- Description: Reference table for corn varieties with growth duration
-- ============================================================

-- Reference table for variety details (hari_panen = days to harvest)
CREATE TABLE varietas_ref (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama varietas_jagung UNIQUE NOT NULL,
  hari_panen INT NOT NULL CHECK (hari_panen > 0),
  deskripsi TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE varietas_ref ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read variety reference data
CREATE POLICY "authenticated_read_varietas" ON varietas_ref
  FOR SELECT TO authenticated USING (true);

-- Only admin can manage variety data
CREATE POLICY "admin_all_varietas" ON varietas_ref
  FOR ALL USING (is_admin());

-- Seed the corn varieties
INSERT INTO varietas_ref (nama, hari_panen, deskripsi) VALUES
  ('NK212',       98,  'Varietas jagung hibrida NK212, masa panen 98 hari'),
  ('Bisi-18',     95,  'Varietas jagung hibrida Bisi-18, masa panen 95 hari'),
  ('Pioneer P27', 100, 'Varietas jagung hibrida Pioneer P27, masa panen 100 hari');
