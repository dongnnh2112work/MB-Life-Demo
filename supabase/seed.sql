-- Replace with your actual employee list before the event
-- code: mã số nhân viên | title: 'Anh' | 'Chị' | wish: câu chúc riêng của từng người
INSERT INTO employees (code, name, days, title, wish) VALUES
  ('001', 'Nguyễn Ngọc Hải Đông', 10, 'Anh', 'luôn vững bước, lan tỏa giá trị và cùng MB Life tiến bước rực rỡ, vạn dặm thăng hoa.'),
  ('002', 'Nguyễn Thùy Linh', 2, 'Chị', 'luôn giữ vững nhiệt huyết và tiếp tục tỏa sáng cùng MB Life.')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  days = EXCLUDED.days,
  title = EXCLUDED.title,
  wish = EXCLUDED.wish;
