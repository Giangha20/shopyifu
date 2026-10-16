@echo off
chcp 65001 >nul
title CÀI ĐẶT TỰ ĐỘNG - YIFU / LUXE SHOP
cls
echo ==============================================================================
echo        HỆ THỐNG WEBSITE THƯƠNG MẠI ĐIỆN TỬ CAO CẤP - YIFU SHOP
echo                     TRÌNH CÀI ĐẶT TỰ ĐỘNG (1-CLICK SETUP)
echo ==============================================================================
echo.

echo [1/4] Đang kiểm tra môi trường Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LỖI] Máy tính của bạn chưa cài đặt Node.js!
    echo Vui lòng tải và cài đặt Node.js LTS tại: https://nodejs.org
    echo Sau khi cài đặt xong, vui lòng chạy lại file này.
    echo.
    pause
    exit /b
)
node -v
echo [OK] Đã tìm thấy Node.js.
echo.

echo [2/4] Đang cài đặt các thư viện phụ thuộc (npm install)...
echo Quá trình này có thể mất 1-2 phút, vui lòng đợi...
call npm install
if %errorlevel% neq 0 (
    echo [LỖI] Quá trình npm install gặp lỗi. Vui lòng kiểm tra kết nối mạng.
    pause
    exit /b
)
echo [OK] Cài đặt thư viện thành công!
echo.

echo [3/4] Đang đồng bộ cấu trúc cơ sở dữ liệu (Prisma Generate & DB Push)...
call npx prisma generate
call npx prisma db push
echo [OK] Cơ sở dữ liệu đã sẵn sàng!
echo.

echo ==============================================================================
echo                     CHÚC MỪNG! CÀI ĐẶT HOÀN TẤT 100%!
echo ==============================================================================
echo.
echo Bước tiếp theo:
echo - Hãy nhấp đúp chuột vào file: "2-CHAY-THU-LOCAL.bat" để khởi động website!
echo - Trang web sẽ tự động mở tại: http://localhost:3000
echo - Trang quản trị Admin: http://localhost:3000/admin/login
echo   + Email: admin@shopquanao.vn
echo   + Mật khẩu: AdminPassword@2026!
echo.
pause
