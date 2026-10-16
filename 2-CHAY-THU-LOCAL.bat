@echo off
chcp 65001 >nul
title KHỞI CHẠY WEBSITE - YIFU / LUXE SHOP
cls
echo ==============================================================================
echo        HỆ THỐNG WEBSITE THƯƠNG MẠI ĐIỆN TỬ CAO CẤP - YIFU SHOP
echo                     KHỞI ĐỘNG MÁY CHỦ PHÁT TRIỂN CỤC BỘ
echo ==============================================================================
echo.
echo Đang mở trình duyệt tại: http://localhost:3000...
start "" http://localhost:3000
echo.
echo Đang chạy máy chủ Next.js (npm run dev)...
echo Nhấn Ctrl + C để dừng máy chủ bất cứ lúc nào.
echo.
call npm run dev
pause
