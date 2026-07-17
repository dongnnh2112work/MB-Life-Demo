-- Replace with your actual employee list before the event
-- code: mã số nhân viên | title: 'Anh' | 'Chị'
INSERT INTO employees (code, name, years, title) VALUES
  ('001', 'Nguyễn Ngọc Hải Đông', 10, 'Anh'),
  ('002', 'Nguyễn Thùy Linh', 2, 'Chị')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  years = EXCLUDED.years,
  title = EXCLUDED.title;
