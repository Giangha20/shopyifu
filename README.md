# LUXE SHOP - Website Thương Mại Điện Tử Cao Cấp

<div align="center">
  <h3>✨ Thời Trang Cao Cấp & Phong Cách Sống ✨</h3>
  <p>Website thương mại điện tử hoàn chỉnh, sẵn sàng triển khai thực tế</p>
</div>

---

## 📋 Tổng Quan

LUXE SHOP là một website thương mại điện tử cao cấp được xây dựng với công nghệ hiện đại, thiết kế sang trọng và đầy đủ chức năng để vận hành kinh doanh thực tế.

### Tính Năng Chính

#### 🛍️ Giao Diện Khách Hàng
- Trang chủ với hero banner, danh mục nổi bật, sản phẩm bán chạy
- Danh sách sản phẩm với bộ lọc, tìm kiếm, sắp xếp
- Chi tiết sản phẩm với gallery ảnh, biến thể, đánh giá
- Giỏ hàng thông minh với kiểm tra tồn kho
- Quy trình thanh toán chuyên nghiệp
- Tài khoản khách hàng (đăng ký, đăng nhập, hồ sơ, địa chỉ, đơn hàng)
- Danh sách yêu thích
- Đánh giá sản phẩm
- Blog/Bài viết
- Tra cứu đơn hàng
- Responsive hoàn hảo trên mọi thiết bị

#### 🔧 Trang Quản Trị
- Dashboard thống kê doanh thu
- Quản lý sản phẩm (CRUD, ảnh, biến thể, thuộc tính)
- Quản lý danh mục (cây danh mục nhiều cấp)
- Quản lý đơn hàng (trạng thái, lịch sử, ghi chú)
- Quản lý khách hàng
- Quản lý kho hàng
- Quản lý mã giảm giá
- Quản lý banner
- Quản lý bài viết
- Quản lý đánh giá
- Quản lý yêu cầu hỗ trợ
- Cấu hình cửa hàng
- Phân quyền nhân viên
- Nhật ký hoạt động
- Báo cáo doanh thu

#### 🔒 Bảo Mật
- Mật khẩu được băm bằng bcrypt
- JWT token với httpOnly cookie
- Phân quyền theo vai trò (RBAC)
- Kiểm tra quyền trên mọi API
- Rate limiting
- Giới hạn lần đăng nhập thất bại
- Validation dữ liệu đầu vào
- CSRF protection
- Security headers
- Upload file an toàn

---

## 🛠️ Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| UI Components | Radix UI, Lucide Icons |
| State Management | Zustand |
| Forms | React Hook Form + Zod |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT (jose) + bcrypt |
| Charts | Recharts |
| Image Gallery | Swiper |
| File Upload | Local / S3-compatible |
| Email | SMTP / Resend |
| Payment | VNPay / MoMo (sẵn sàng tích hợp) |

---

## 🚀 Hướng Dẫn Cài Đặt

### Yêu Cầu Hệ Thống
- Node.js 18.17 trở lên
- PostgreSQL 14 trở lên
- npm hoặc yarn

### Bước 1: Clone và Cài Đặt Dependencies

```bash
git clone <repository-url>
cd luxe-shop
npm install
```

### Bước 2: Cấu Hình Biến Môi Trường

```bash
cp .env.example .env
```

Mở file `.env` và cấu hình:

```env
# DATABASE - Thay đổi thông tin kết nối PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/luxe_shop"

# AUTHENTICATION - Tạo secret key mới
# Chạy: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"

# ADMIN - Thông tin tài khoản Super Admin ban đầu
ADMIN_EMAIL="admin@your-domain.com"
ADMIN_PASSWORD="YourStrongPassword123!"
```

### Bước 3: Tạo Database

```bash
# Tạo database PostgreSQL
createdb luxe_shop

# Chạy migration
npx prisma migrate dev

# Hoặc push schema (development)
npx prisma db push

# Tạo dữ liệu mẫu
npm run db:seed
```

### Bước 4: Chạy Development Server

```bash
npm run dev
```

Truy cập:
- **Cửa hàng**: http://localhost:3000
- **Quản trị**: http://localhost:3000/admin
- **Prisma Studio**: `npx prisma studio` (port 5555)

---

## 📁 Cấu Trúc Dự Án

```
luxe-shop/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Dữ liệu mẫu
├── public/
│   └── images/                # Static images
├── uploads/                   # Uploaded files
├── src/
│   ├── app/
│   │   ├── (store)/           # Giao diện khách hàng
│   │   │   ├── page.tsx       # Trang chủ
│   │   │   ├── san-pham/      # Sản phẩm
│   │   │   ├── danh-muc/      # Danh mục
│   │   │   ├── gio-hang/      # Giỏ hàng
│   │   │   ├── thanh-toan/    # Thanh toán
│   │   │   ├── tai-khoan/     # Tài khoản
│   │   │   └── ...
│   │   ├── (auth)/            # Đăng nhập/Đăng ký
│   │   ├── admin/             # Trang quản trị
│   │   │   ├── login/         # Đăng nhập admin
│   │   │   └── (dashboard)/   # Dashboard & quản lý
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Auth APIs
│   │   │   ├── products/      # Product APIs
│   │   │   ├── orders/        # Order APIs
│   │   │   ├── admin/         # Admin APIs
│   │   │   └── ...
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   └── not-found.tsx      # 404 page
│   ├── components/
│   │   ├── ui/                # Design system components
│   │   ├── store/             # Store components
│   │   └── admin/             # Admin components
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   ├── auth.ts            # Authentication
│   │   ├── utils.ts           # Utilities
│   │   ├── validations.ts     # Zod schemas
│   │   ├── upload.ts          # File upload
│   │   ├── email.ts           # Email service
│   │   ├── payment.ts         # Payment gateways
│   │   └── rate-limit.ts      # Rate limiting
│   ├── hooks/                 # React hooks
│   └── types/                 # TypeScript types
├── .env.example               # Environment template
├── package.json
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```

---

## 🏗️ Triển Khai Production

### Option 1: VPS / Dedicated Server

```bash
# 1. Cài đặt Node.js, PostgreSQL, Nginx
# 2. Clone repository
git clone <repo> /var/www/luxe-shop
cd /var/www/luxe-shop

# 3. Cài đặt dependencies
npm ci --production

# 4. Cấu hình .env với thông tin production
cp .env.example .env
nano .env

# 5. Build
npm run build

# 6. Chạy migration
npx prisma migrate deploy

# 7. Seed dữ liệu ban đầu (chỉ lần đầu)
npm run db:seed

# 8. Chạy với PM2
pm2 start npm --name "luxe-shop" -- start

# 9. Cấu hình Nginx reverse proxy
```

### Cấu Hình Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /var/www/luxe-shop/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### HTTPS với Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 2: Vercel (Frontend) + Supabase (Database)

1. Push code lên GitHub
2. Import project vào Vercel
3. Tạo PostgreSQL trên Supabase
4. Cấu hình biến môi trường trên Vercel
5. Deploy

---

## 💳 Cấu Hình Thanh Toán

### VNPay
1. Đăng ký tài khoản tại [VNPay](https://vnpay.vn)
2. Lấy TMN Code và Hash Secret từ trang quản trị VNPay
3. Cấu hình trong `.env`:
```env
VNPAY_TMN_CODE="your_tmn_code"
VNPAY_HASH_SECRET="your_hash_secret"
VNPAY_URL="https://pay.vnpay.vn/vpcpay.html"
VNPAY_RETURN_URL="https://your-domain.com/api/payment/vnpay/return"
```

### MoMo
1. Đăng ký đối tác tại [MoMo Business](https://business.momo.vn)
2. Lấy thông tin API từ MoMo
3. Cấu hình trong `.env`

### Chuyển Khoản Ngân Hàng
- Cấu hình thông tin ngân hàng trong trang quản trị → Cài đặt → Thanh toán

---

## 📧 Cấu Hình Email

### SMTP (Gmail)
```env
EMAIL_PROVIDER="smtp"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="LUXE SHOP <noreply@luxeshop.vn>"
```

### Resend (Khuyến nghị)
```env
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="LUXE SHOP <noreply@luxeshop.vn>"
```

---

## 💾 Backup & Khôi Phục

### Backup Database
```bash
# Backup
pg_dump -U postgres luxe_shop > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup tự động (cron)
# Thêm vào crontab:
0 2 * * * pg_dump -U postgres luxe_shop > /backups/luxe_shop_$(date +\%Y\%m\%d).sql
```

### Khôi Phục Database
```bash
psql -U postgres luxe_shop < backup_file.sql
```

### Backup Files
```bash
# Backup uploads
tar -czf uploads_backup.tar.gz uploads/
```

---

## 🔐 Bảo Mật Quan Trọng

- ⚠️ **THAY ĐỔI** mật khẩu admin sau lần đăng nhập đầu tiên
- ⚠️ **KHÔNG** commit file `.env` lên repository
- ⚠️ **TẠO** `NEXTAUTH_SECRET` mới cho production
- ⚠️ **BẬT** HTTPS cho production
- ⚠️ **CẤU HÌNH** firewall cho database server
- ⚠️ **THIẾT LẬP** backup tự động

---

## 📊 Dịch Vụ Bên Ngoài Cần Cấu Hình

| Dịch vụ | Bắt buộc | Chi phí | Mục đích |
|---|---|---|---|
| PostgreSQL | ✅ | Miễn phí (self-host) | Database |
| SMTP / Resend | ❌ | Miễn phí (giới hạn) | Gửi email |
| VNPay | ❌ | Theo giao dịch | Thanh toán trực tuyến |
| MoMo | ❌ | Theo giao dịch | Ví điện tử |
| S3 Storage | ❌ | Theo dung lượng | Lưu trữ ảnh |
| Domain + SSL | ✅ (production) | ~300K/năm | Tên miền & HTTPS |
| VPS/Hosting | ✅ (production) | ~100-500K/tháng | Máy chủ |

---

## 📝 License

Dự án này được xây dựng theo yêu cầu riêng. Mọi quyền được bảo lưu.

---

## 🆘 Hỗ Trợ

Nếu cần hỗ trợ kỹ thuật, vui lòng tạo issue trên repository hoặc liên hệ qua email.
