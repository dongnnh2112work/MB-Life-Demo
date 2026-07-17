# MB Life — Key Moment

Ứng dụng realtime cho sự kiện: thành viên nhập tên trên iPad, màn LED hiển thị tên + số năm gắn bó.

## Tech stack

- **Next.js** (App Router)
- **Three.js** (`@react-three/fiber`) — hiệu ứng nền màn LED
- **Supabase** — danh sách nhân viên + sync realtime
- **Vercel** — deploy

## Hai trang chính

| Route | Mục đích |
|-------|----------|
| `/input` | iPad trước sân khấu — nhập/chọn tên |
| `/display` | Màn LED — hiển thị tên + số năm (fullscreen) |

## Setup Supabase

1. Tạo project tại [supabase.com](https://supabase.com)
2. Vào **SQL Editor**, chạy lần lượt:
   - `supabase/migrations/001_initial.sql`
   - `supabase/seed.sql` (sửa danh sách tên thật trước khi chạy)
3. Vào **Database → Replication**, bật Realtime cho bảng `live_state` (nếu migration chưa bật)
4. Copy **Project URL** và **anon key** từ Settings → API

## Setup local

```bash
cp .env.local.example .env.local
# Điền SUPABASE_URL và ANON_KEY

npm install
npm run dev
```

- iPad: `http://localhost:3000/input`
- LED: `http://localhost:3000/display` (mở fullscreen F11)

## Cập nhật danh sách nhân viên

Sửa file `supabase/seed.sql` hoặc import trực tiếp vào bảng `employees`:

```sql
INSERT INTO employees (name, years) VALUES
  ('Tên Nhân Viên', 10)
ON CONFLICT (name) DO UPDATE SET years = EXCLUDED.years;
```

Cột `years` = số năm làm việc / gắn bó.

## Deploy Vercel

1. Push repo lên GitHub
2. Import project trên [vercel.com](https://vercel.com)
3. Thêm Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

Sau deploy:
- iPad: `https://your-app.vercel.app/input`
- LED: `https://your-app.vercel.app/display`

## Luồng hoạt động

```
iPad (/input)  →  cập nhật live_state trên Supabase  →  LED (/display) nhận realtime
```

1. Thành viên nhập tên (có gợi ý từ danh sách)
2. Hệ thống khớp tên với bảng `employees`
3. Cập nhật bản ghi `live_state` (singleton)
4. Màn LED subscribe Realtime → hiện animation tên + số năm

## Gợi ý ngày event

- Mở `/display` trên máy LED trước, fullscreen
- Gắn iPad vào `/input`, thêm vào Home Screen (Safari → Add to Home Screen)
- Kiểm tra chấm xanh "Live" góc màn LED trước khi bắt đầu
