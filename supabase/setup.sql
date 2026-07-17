-- =============================================================================
-- MB Life Demo — setup đầy đủ cho Supabase
-- Chạy 1 lần trong: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================

-- 1) Bảng employees (danh sách nhân viên)
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  years INTEGER NOT NULL CHECK (years >= 0),
  title TEXT NOT NULL CHECK (title IN ('Anh', 'Chị')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Bảng live_state (singleton — sync realtime iPad → LED)
CREATE TABLE IF NOT EXISTS live_state (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  employee_name TEXT,
  years INTEGER,
  title TEXT CHECK (title IS NULL OR title IN ('Anh', 'Chị')),
  triggered_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO live_state (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- 3) Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "employees_select" ON employees;
CREATE POLICY "employees_select" ON employees
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "live_state_select" ON live_state;
CREATE POLICY "live_state_select" ON live_state
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "live_state_update" ON live_state;
CREATE POLICY "live_state_update" ON live_state
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (id = 1);

-- 4) Bật Realtime cho live_state (LED nhận cập nhật tức thì)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'live_state'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE live_state;
  END IF;
END $$;

-- 5) Seed dữ liệu demo
-- code = mã số nhân viên nhập trên iPad
-- title = 'Anh' | 'Chị' (dùng cho "Cảm ơn …" / "Chúc …")
INSERT INTO employees (code, name, years, title) VALUES
  ('001', 'Nguyễn Ngọc Hải Đông', 10, 'Anh'),
  ('002', 'Nguyễn Thùy Linh', 2, 'Chị')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  years = EXCLUDED.years,
  title = EXCLUDED.title;

-- Thêm nhân viên mới (ví dụ):
-- INSERT INTO employees (code, name, years, title) VALUES
--   ('003', 'Tên Nhân Viên', 5, 'Chị')
-- ON CONFLICT (code) DO UPDATE SET
--   name = EXCLUDED.name,
--   years = EXCLUDED.years,
--   title = EXCLUDED.title;
