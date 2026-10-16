# 📖 CẨM NANG HƯỚNG DẪN CÀI ĐẶT & VẬN HÀNH WEBSITE YIFU SHOP
### *(DÀNH CHO NGƯỜI MỚI BẮT ĐẦU - TỪ A ĐẾN Z - CÓ HƯỚNG DẪN GẮN TÊN MIỀN RIÊNG)*

> **CAM KẾT DÀNH CHO KHÁCH HÀNG:**  
> Bộ tài liệu này được biên soạn theo phương pháp **"Cầm tay chỉ việc - Từng cú click chuột"**.  
> Dù bạn **hoàn toàn chưa từng học lập trình hay quản trị web**, bạn vẫn có thể tự mình cài đặt, đưa website lên Internet 24/7 và gắn tên miền riêng thương hiệu của bạn thành công 100%!

---

## 📑 MỤC LỤC CHI TIẾT
1. [Giới thiệu các tính năng cao cấp bạn đang sở hữu](#1-tổng-quan-các-tính-năng-cao-cấp)
2. [Cách 1: Khởi chạy trên máy tính cá nhân trong 2 Click (Dành cho người mới)](#2-cách-1-chạy-thử-trên-máy-tính-trong-2-click)
3. [Cách 2: Đưa Website lên mạng Internet 24/7 Hoàn Toàn Miễn Phí (Vercel + Neon)](#3-cách-2-đưa-website-lên-mạng-internet-247-miễn-phí)
4. [HƯỚNG DẪN MUA TÊN MIỀN & GẮN TÊN MIỀN RIÊNG VÀO WEBSITE (RẤT QUAN TRỌNG)](#4-hướng-dẫn-mua-tên-miền--gắn-tên-miền-riêng-từ-a-đến-z)
5. [Hướng dẫn cài đặt gửi Email Gmail tự động khi có đơn hàng](#5-hướng-dẫn-cấu-hình-gửi-email-tự-động)
6. [Hướng dẫn Quản trị Website từ A đến Z (Dành cho Chủ Shop)](#6-hướng-dẫn-quản-trị-website-từ-a-đến-z)
   * 6.1. [Đăng nhập & Đổi mật khẩu Quản trị](#61-đăng-nhập--quản-lý-tài-khoản)
   * 6.2. [Trang Đăng ký Quản trị viên nội bộ (Bảo mật đặc biệt)](#62-trang-đăng-ký-quản-trị-viên-nội-bộ)
   * 6.3. [Thay đổi Logo, Favicon, Tên Shop & Thông tin liên hệ](#63-thay-đổi-logo-favicon-tên-shop)
   * 6.4. [Bật / Tắt chuông báo đơn hàng Ting-Ting](#64-bật--tắt-chuông-báo-đơn-hàng-ting-ting)
   * 6.5. [Quản lý Kho Hàng & Nhập kho qua file Excel/CSV](#65-quản-lý-kho-hàng--nhập-kho-qua-file-excelcsv)
   * 6.6. [Quản lý Cho Thuê Đồ (Mô-đun Độc Quyền)](#66-quản-lý-cho-thuê-đồ-mô-đun-độc-quyền)
   * 6.7. [Quản lý Sản phẩm, Đơn hàng, Mã giảm giá, Banner](#67-quản-lý-bán-hàng-toàn-diện)
7. [Bảng tra cứu sự cố & Câu hỏi thường gặp (FAQ)](#7-bảng-tra-cứu-sự-cố--câu-hỏi-thường-gặp)

---

## 1. TỔNG QUAN CÁC TÍNH NĂNG CAO CẤP
Website **YIFU SHOP** là phiên bản Thương mại điện tử toàn diện chuẩn quốc tế được xây dựng trên công nghệ **Next.js 14, React 18, TailwindCSS và PostgreSQL**:
* **Giao diện Luxury**: Thiết kế tông màu đen vàng sang trọng, chuẩn Responsive xem đẹp trên cả Điện thoại (Mobile App UI) và Máy tính.
* **Mô-đun Cho Thuê Đồ**: Cho phép khách chọn ngày nhận - ngày trả, tính tiền cọc, tải ảnh CCCD/CMND, hỗ trợ duyệt đơn và hoàn cọc tự động.
* **Kho Hàng & Upload Excel**: Theo dõi tồn kho thực tế, nhập kho hàng loạt bằng file CSV/Excel, tải file mẫu, chỉnh sửa trực tiếp không cần mở từng trang.
* **Chuông báo đơn hàng thực**: Tự động phát chuông "Ting-Ting" và hiện thông báo đẩy ngay khi khách đặt đơn mới.
* **Email tự động**: Gửi email chúc mừng khi đăng ký và thông báo chi tiết hóa đơn qua Gmail khi có đơn mới.
* **Thanh toán đa kênh**: Hỗ trợ COD (Thu hộ), Chuyển khoản ngân hàng hiển thị mã QR, ví MoMo, cổng VNPAY.

---

## 2. CÁCH 1: CHẠY THỬ TRÊN MÁY TÍNH TRONG 2 CLICK

Nếu bạn muốn chạy thử nghiệm trên máy tính của bạn trước khi đưa lên mạng:

### Bước 1: Cài đặt phần mềm Node.js (Chỉ làm 1 lần duy nhất)
1. Mở trình duyệt web, vào trang chủ: **https://nodejs.org**
2. Bấm vào nút màu xanh **LTS (Recommended for Most Users)** để tải về máy.
3. Mở file vừa tải về, bấm **Next** -> **Next** -> **Install** cho đến khi hoàn tất.

### Bước 2: Chạy cài đặt tự động
1. Giải nén thư mục mã nguồn ra máy tính (Ví dụ: ổ `D:\YIFU_SHOP`).
2. Nhấp đúp chuột trái vào file:  
   👉 **`1-CAI-DAT-TU-DONG.bat`**
3. Màn hình màu đen sẽ hiện ra và tự động tải các thành phần cần thiết. Bạn chỉ cần ngồi chờ khoảng 1 - 2 phút cho đến khi có chữ **`CÀI ĐẶT HOÀN TẤT 100%!`**.

### Bước 3: Mở website
1. Nhấp đúp chuột vào file:  
   👉 **`2-CHAY-THU-LOCAL.bat`**
2. Mở trình duyệt web (Chrome, Cốc Cốc, Edge) và truy cập:
   * **Trang bán hàng**: `http://localhost:3000`
   * **Trang quản trị Admin**: `http://localhost:3000/admin/login`

---

## 3. CÁCH 2: ĐƯA WEBSITE LÊN MẠNG INTERNET 24/7 MIỄN PHÍ

Phương pháp này giúp website chạy trên mạng toàn cầu cả ngày lẫn đêm, khách hàng khắp nơi đều truy cập được mà **bạn không cần bật máy tính**.

### Bước 1: Tạo cơ sở dữ liệu PostgreSQL miễn phí trọn đời tại Neon.tech
1. Truy cập trang: **https://neon.tech**
2. Bấm **Sign Up** -> Chọn đăng ký nhanh bằng tài khoản Google (Gmail) của bạn.
3. Bấm nút **Create Project** -> Đặt tên dự án (ví dụ: `yifu-shop-db`) -> Bấm **Create**.
4. Tại màn hình Dashboard, bạn sẽ thấy ô có chữ **Connection string**.
5. Nhấp vào nút **Copy** (biểu tượng sao chép). Bạn sẽ nhận được 1 đoạn link có dạng:
   ```env
   postgresql://neondb_owner:nbfv8xxxxxxxx@ep-flat-unit-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   *(Hãy lưu lại đoạn link này để dùng ở Bước 3 bên dưới).*

### Bước 2: Tải mã nguồn lên GitHub (Miễn phí)
1. Đăng ký tài khoản tại: **https://github.com**
2. Bấm vào dấu `+` ở góc trên bên phải màn hình -> Chọn **New repository**.
3. Đặt tên (ví dụ: `shopyifu`) -> Chọn chế độ **Private** (Riêng tư) hoặc **Public** -> Bấm **Create repository**.
4. Trong thư mục mã nguồn trên máy tính của bạn, nhấp đúp file:  
   👉 **`PUSH_LEN_GITHUB.bat`**  
   *(Nếu hệ thống hỏi đăng nhập, bạn chọn "Sign in with browser" để xác nhận một lần).*

### Bước 3: Triển khai Website lên Vercel (Miễn phí 100%)
1. Truy cập trang: **https://vercel.com** -> Bấm **Sign Up** -> Chọn đăng nhập bằng tài khoản **GitHub**.
2. Trên màn hình Dashboard của Vercel, bấm nút **Add New...** -> chọn **Project**.
3. Bạn sẽ nhìn thấy repository `shopyifu` vừa tạo ở Bước 2 -> Bấm nút **Import**.
4. Kéo xuống mục **Environment Variables** (Biến môi trường) và thêm các dòng sau:

| Tên biến (Key) | Giá trị mẫu (Value) | Giải thích |
| :--- | :--- | :--- |
| `DATABASE_URL` | *(Dán đoạn link Neon bạn đã copy ở Bước 1)* | Kết nối cơ sở dữ liệu |
| `NEXTAUTH_SECRET` | `YIFU_SHOP_SECRET_SECURITY_KEY_2026` | Mã bảo mật phiên đăng nhập |
| `NEXTAUTH_URL` | `https://ten-shop-cua-ban.vercel.app` | Đường dẫn trang web của bạn |
| `ADMIN_EMAIL` | `admin@shopquanao.vn` | Email đăng nhập Admin mẫu |
| `ADMIN_PASSWORD` | `AdminPassword@2026!` | Mật khẩu đăng nhập Admin mẫu |

5. Bấm nút màu xanh **Deploy**.
6. Chờ khoảng 1–2 phút. Khi màn hình hiện pháo hoa chúc mừng, bạn đã có ngay một đường link website chính thức (ví dụ: `https://ten-shop-cua-ban.vercel.app`) hoạt động 24/7!

---

## 4. HƯỚNG DẪN MUA TÊN MIỀN & GẮN TÊN MIỀN RIÊNG TỪ A ĐẾN Z

Đây là bước giúp bạn biến website thành thương hiệu chuyên nghiệp có tên miền riêng của bạn (Ví dụ: `yifushop.com`, `thoitrangcaocap.vn`, `tiemquanao.net`...).

### 4.1. Mua tên miền ở đâu?
Bạn có thể mua tên miền tại bất kỳ nhà cung cấp nào. Các nhà cung cấp uy tín nhất hiện nay gồm:
* **Nhà cung cấp Việt Nam**:
  * **Tenten.vn** (Hỗ trợ tiếng Việt nhanh, thanh toán chuyển khoản tiện lợi)
  * **Matbao.net** (Mắt Bão)
  * **PA Vietnam** (pavietnam.vn)
* **Nhà cung cấp Quốc tế**:
  * **Namecheap.com** (Giá rẻ, bảo mật thông tin miễn phí)
  * **GoDaddy.com**
  * **Cloudflare.com** (Tên miền giá gốc)

> 💡 **Chi phí tham khảo**: Tên miền quốc tế đuôi `.com`, `.net` chỉ khoảng 200.000đ – 280.000đ/năm.

---

### 4.2. Thêm tên miền vào hệ thống Vercel
Sau khi bạn đã mua xong tên miền:
1. Đăng nhập vào tài khoản **https://vercel.com**.
2. Bấm vào dự án website của bạn.
3. Nhấp vào tab **Settings** ở thanh menu trên cùng.
4. Ở danh mục bên trái, chọn mục **Domains**.
5. Trong ô **Add Domain**, nhập tên miền bạn vừa mua (Ví dụ: `yifushop.com`) -> Bấm nút **Add**.
6. Hệ thống sẽ hỏi bạn muốn thêm dạng nào, bạn chọn mục khuyên dùng:
   👉 **`Add yifushop.com and redirect www.yifushop.com to it`** (Khách gõ có `www` hay không có `www` đều tự chuyển về web).
7. Lúc này, Vercel sẽ hiển thị cho bạn một bảng thông số bản ghi DNS màu xanh/vàng cần cài đặt.

---

### 4.3. Cài đặt bản ghi DNS tại nơi bạn mua tên miền
Bạn đăng nhập vào trang quản lý nơi bạn đã mua tên miền (Tenten, Mắt Bão, PA Việt Nam, Namecheap...) và tìm đến mục: **Quản lý DNS** (hoặc **Cấu hình bản ghi DNS**).

Bạn chỉ cần thêm **2 bản ghi cực kỳ đơn giản** như sau:

#### 🔹 Bản ghi 1: Trỏ tên miền chính
* **Loại bản ghi (Record Type)**: `A`
* **Tên / Host**: `@` *(Nếu nhà cung cấp không cho điền `@`, bạn để trống ô này)*
* **Giá trị / Điểm đến (Value / Points to)**: `76.76.21.21`
* **TTL**: Để `Auto` (hoặc `3600`)

#### 🔹 Bản ghi 2: Trỏ tên miền phụ www
* **Loại bản ghi (Record Type)**: `CNAME`
* **Tên / Host**: `www`
* **Giá trị / Điểm đến (Value / Points to)**: `cname.vercel-dns.com`
* **TTL**: Để `Auto` (hoặc `3600`)

> 📸 **Minh họa bảng cài đặt DNS trực quan:**
> ```text
> [Loại]   | [Tên / Host] | [Giá trị / Điểm đến]      | [TTL]
> -----------------------------------------------------------
> A        | @            | 76.76.21.21               | 3600
> CNAME    | www          | cname.vercel-dns.com      | 3600
> ```

---

### 4.4. Kích hoạt & Hoàn tất (Có sẵn ổ khóa SSL HTTPS Miễn Phí)
1. Sau khi lưu 2 bản ghi trên, quay lại trang Vercel mục **Domains**.
2. Bấm nút **Refresh** (Làm mới).
3. Thông thường chỉ mất từ **2 đến 15 phút**, biểu tượng chuyển sang **TÍCH XANH (Valid Configuration)**.
4. **Vercel sẽ tự động cấp chứng chỉ bảo mật SSL (ổ khóa xanh `https://`) miễn phí trọn đời**.
5. 🎉 **Xong!** Giờ đây khách hàng gõ `https://yifushop.com` là sẽ vào thẳng website bán hàng của bạn!

---

## 5. HƯỚNG DẪN CẤU HÌNH GỬI EMAIL TỰ ĐỘNG

Website có sẵn tính năng tự động gửi email xác nhận cho khách khi đăng ký và gửi thông báo đơn hàng mới.

### Cách lấy "Mật khẩu ứng dụng Gmail" (App Password)
1. Đăng nhập vào tài khoản Gmail bạn muốn dùng để gửi thư cho khách.
2. Truy cập: **https://myaccount.google.com/security**
3. Bật tính năng **Xác minh 2 bước** (2-Step Verification) nếu chưa bật.
4. Truy cập trực tiếp đường link: **https://myaccount.google.com/apppasswords**
5. Ở ô **Tên ứng dụng**, điền chữ: `YIFU SHOP` -> Bấm nút **Tạo**.
6. Google sẽ hiện ra một **mã gồm 16 ký tự chữ cái** (Ví dụ: `abcd efgh ijkl mnop`). Hãy sao chép 16 chữ này.

### Nhập vào trang Quản trị Admin:
1. Đăng nhập trang Admin -> Vào mục **Cài đặt** (`/admin/cai-dat`).
2. Chọn tab **Email & SMTP**.
3. Điền các ô như sau:
   * **Máy chủ SMTP (Host)**: `smtp.gmail.com`
   * **Cổng SMTP (Port)**: `587`
   * **Bảo mật**: `STARTTLS`
   * **Email gửi**: *(Email Gmail của bạn, ví dụ: `cskh.yifu@gmail.com`)*
   * **Mật khẩu SMTP**: *(Dán 16 ký tự chữ cái vừa lấy ở trên)*
   * **Tên hiển thị người gửi**: `YIFU SHOP - Thời Trang Cao Cấp`
4. Bấm nút **Lưu cấu hình Email**.
5. Bấm nút **"Gửi thư thử nghiệm"** để kiểm tra ngay lập tức. Thư gửi thành công 100%!

---

## 6. HƯỚNG DẪN QUẢN TRỊ WEBSITE TỪ A ĐẾN Z

### 6.1. Đăng nhập & Quản lý tài khoản
* **Link đăng nhập**: `https://ten-mien-cua-ban.com/admin/login`
* **Tài khoản mặc định ban đầu**:
  * **Email**: `admin@shopquanao.vn`
  * **Mật khẩu**: `AdminPassword@2026!`

👉 **Cách đổi mật khẩu quản trị**:
Vào mục **Nhân viên** (`/admin/nhan-vien`) -> Nhấp vào biểu tượng cây bút ở tài khoản của bạn -> Nhập mật khẩu mới -> Bấm **Lưu**.

---

### 6.2. Trang Đăng ký Quản trị viên nội bộ
Website có trang đăng ký riêng biệt tại:
👉 **`/admin/dang-ky`**
* Trang này dùng cho chủ shop tạo thêm tài khoản quản lý cho nhân viên, quản kho, kế toán.
* **Yêu cầu mã khóa bảo mật bí mật**: `YIFU@ADMIN2026` *(Người lạ không thể tự ý đăng ký làm Admin)*.

---

### 6.3. Thay đổi Logo, Favicon, Tên Shop
1. Vào mục **Cài đặt** (`/admin/cai-dat`) -> Tab **Cài đặt chung**.
2. **Tải lên Logo mới**: Bấm nút chọn ảnh logo của shop bạn (hệ thống tự hiển thị trực tiếp lên thanh điều hướng).
3. **Tải lên Favicon**: Biểu tượng nhỏ hiển thị trên tab trình duyệt web.
4. **Tên cửa hàng, Hotline, Địa chỉ**: Thay đổi trực tiếp tại các ô nhập liệu và bấm **Lưu thay đổi**.

---

### 6.4. Bật / Tắt chuông báo đơn hàng Ting-Ting
* Trên thanh tiêu đề Admin (Header), ở góc trên bên phải có biểu tượng **Quả chuông vàng**.
* Bấm vào nút gạt để **BẬT** chuông báo.
* Bấm nút **"Thử chuông"** để nghe âm thanh ting-ting cao cấp được tạo tự động bằng Web Audio (không phụ thuộc file ngoài, không bao giờ lỗi âm thanh).
* Khi khách hàng đặt đơn mới trên web, chuông sẽ tự động reo báo cho bạn biết ngay lập tức!

---

### 6.5. Quản lý Kho Hàng & Nhập kho qua file Excel/CSV
Tại mục **Kho hàng** (`/admin/kho-hang`), bạn có toàn quyền kiểm soát hàng hóa:
1. **Theo dõi tồn kho**: Xem số lượng thực tế, cảnh báo sắp hết hàng (màu cam), hết hàng (màu đỏ).
2. **Sửa nhanh trực tiếp**: Bấm nút `+` / `-` hoặc nhấp vào chữ **Sửa** ngay trên bảng để thay đổi số lượng lập tức.
3. **Nhập kho bằng file Excel/CSV**:
   * Bấm nút **`+ Nhập kho qua file Excel/CSV`**.
   * Bấm nút **Tải file mẫu CSV** để xem định dạng mẫu: `Mã SKU, Số lượng, Lý do`.
   * Bạn có thể kéo thả file hoặc dán trực tiếp danh sách vào ô.
   * Chọn hình thức: *Cộng thêm vào kho (+)* hoặc *Đặt số lượng mới (=)*.
   * Bấm **Xác nhận nạp vào kho** -> Hệ thống cập nhật hàng trăm sản phẩm chỉ trong 1 giây!
4. **Xuất báo cáo tồn kho**: Bấm nút **"Xuất file tồn kho (CSV)"** để tải về máy bảng tính kiểm kê.

---

### 6.6. Quản lý Cho Thuê Đồ (Mô-đun Độc Quyền)
Tại mục **Thuê đồ** (`/admin/thue-do`):
* **Tab 1: Đơn thuê đồ**:
  * Xem thông tin khách hàng, số điện thoại, ảnh CCCD/CMND.
  * Xem ngày bắt đầu thuê và ngày hẹn trả đồ.
  * Cập nhật trạng thái: Đã cọc -> Đang giao đồ -> Đang thuê -> Đã trả đồ -> Hoàn tiền cọc.
* **Tab 2: Danh mục đồ cho thuê**:
  * Bấm nút gạt **BẬT/TẮT THUÊ**: Bật cho thuê thì sản phẩm mới xuất hiện trên trang `/thue-do`. Tắt đi thì sản phẩm sẽ lập tức biến mất khỏi trang thuê đồ.
  * Nhập trực tiếp **Giá thuê / ngày** và **Tiền cọc đảm bảo**.
  * Bấm **`+ Đăng Đồ Cho Thuê Mới`** để tải ảnh đồ thuê lên trực tiếp từ máy tính.
* **Tab 3: Chính sách thuê**:
  * Tự chỉnh sửa quy định bảo quản đồ, mức phạt nếu làm rách hỏng và chính sách hoàn cọc.

---

### 6.7. Quản lý Bán hàng toàn diện
* **Sản phẩm (`/admin/san-pham`)**: Thêm mới sản phẩm, tải nhiều ảnh, tạo phiên bản size/màu (S, M, L, Đen, Trắng...), chỉnh giá niêm yết, giá khuyến mãi.
* **Đơn hàng (`/admin/don-hang`)**: Cập nhật trạng thái đơn (Chờ xử lý, Đang giao, Đã giao, Đã hủy), in hóa đơn bán lẻ chuyên nghiệp.
* **Khuyến mãi (`/admin/khuyen-mai`)**: Tạo mã giảm giá (ví dụ: `GIAM50K`, `FREESHIP`), cài đặt số lần sử dụng tối đa, ngày hết hạn.
* **Banner (`/admin/banner`)**: Đổi banner hình ảnh quảng cáo lướt sóng ở trang chủ.

---

## 7. BẢNG TRA CỨU SỰ CỐ & CÂU HỎI THƯỜNG GẶP

### ❓ Câu 1: Ảnh tải lên sau này có bị mất không?
* **Trả lời: KHÔNG BAO GIỜ BỊ MẤT.** Hệ thống sử dụng công nghệ lưu trữ dữ liệu nhị phân trực tiếp và liên kết database Neon PostgreSQL kết hợp bộ nén ảnh Sharp chuẩn WebP. Ảnh của bạn sẽ tồn tại vĩnh viễn và tải siêu nhanh.

### ❓ Câu 2: Sau khi thêm tên miền, bao lâu thì vào được?
* **Trả lời**: Thông thường các nhà cung cấp như Tenten, Cloudflare, Namecheap cập nhật DNS trong **5 – 15 phút**. Một số nhà mạng có thể mất tối đa 1–2 tiếng để đồng bộ hoàn toàn.

### ❓ Câu 3: Khách hàng mua hàng thì tiền về đâu?
* **Trả lời**:
  * Nếu chọn **COD**: Tiền do shipper của các đơn vị vận chuyển (GHTK, Viettel Post, GHN...) thu hộ và đối soát trả vào tài khoản ngân hàng của bạn.
  * Nếu chọn **Chuyển khoản**: Khách quét mã QR chuyển khoản trực tiếp vào số tài khoản ngân hàng của bạn (cấu hình trong Admin -> Cài đặt -> Phương thức thanh toán).
  * Nếu tích hợp **VNPAY / MoMo**: Tiền về thẳng tài khoản cổng thanh toán của bạn.

### ❓ Câu 4: Tôi muốn sao lưu dữ liệu đề phòng rủi ro thì làm thế nào?
* **Trả lời**: Bạn chỉ cần đăng nhập vào trang Neon.tech, vào mục **Backups / Snapshots**. Neon tự động sao lưu dữ liệu hàng ngày miễn phí cho bạn, khôi phục chỉ với 1 cú click chuột.

---

**CHÚC BẠN VẬN HÀNH THÀNH CÔNG VÀ ĐẠT DOANH THU ĐỘT PHÁ CÙNG YIFU SHOP! 🚀**
