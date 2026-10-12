@echo off
chcp 65001 > nul
title Đang tải mã nguồn lên GitHub...
cd /d "%~dp0"

echo ====================================================================
echo         ĐANG ĐẨY MÃ NGUỒN LÊN GITHUB
echo ====================================================================
echo.
echo [1/2] Đang kiểm tra và gom tất cả file mã nguồn...
git add .
git commit -m "feat: cap nhat toan bo ma nguon YIFU SHOP" 2>nul

echo [2/2] Đang đẩy (Push) lên GitHub...
echo (Lưu ý: Nếu xuất hiện cửa sổ hỏi đăng nhập GitHub, bạn chỉ cần bấm "Sign in with your browser" hoặc "Authorize")
echo.
git push -u origin main

echo.
echo ====================================================================
echo   HOÀN TẤT! Bạn có thể vào https://github.com/Giangha20/shopyifu để xem!
echo ====================================================================
echo.
pause
