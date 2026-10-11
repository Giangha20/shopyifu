@echo off
chcp 65001 > nul
title Đang tải mã nguồn lên GitHub...
cd /d "C:\Users\giang\.gemini\antigravity\scratch\luxe-shop"

echo ====================================================================
echo         ĐANG ĐẨY MÃ NGUỒN LÊN GITHUB (Giangha20/shopyifu)
echo ====================================================================
echo.
echo [1/2] Đang kiểm tra và gom tất cả file mã nguồn...
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "feat: cap nhat toan bo ma nguon LUXE SHOP" 2>nul

echo [2/2] Đang đẩy (Push) lên GitHub...
echo (Lưu ý: Nếu xuất hiện cửa sổ hỏi đăng nhập GitHub, bạn chỉ cần bấm "Sign in with your browser" hoặc "Authorize")
echo.
"C:\Program Files\Git\cmd\git.exe" push -u origin main --force

echo.
echo ====================================================================
echo   HOÀN TẤT! Bạn có thể vào https://github.com/Giangha20/shopyifu để xem!
echo ====================================================================
echo.
pause
