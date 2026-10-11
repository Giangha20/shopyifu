'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  currentUser?: {
    name?: string;
    email?: string;
  };
}

export function AdminLayoutClient({ children, currentUser }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // If user is accessing /admin/login, bypass the admin sidebar and header completely
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Derive page title from pathname
  const getPageTitle = (path: string) => {
    if (path === '/admin') return 'Tổng quan kinh doanh';
    if (path.startsWith('/admin/san-pham')) return 'Quản lý Sản phẩm';
    if (path.startsWith('/admin/danh-muc')) return 'Danh mục Sản phẩm';
    if (path.startsWith('/admin/don-hang')) return 'Quản lý Đơn hàng';
    if (path.startsWith('/admin/khach-hang')) return 'Quản lý Khách hàng';
    if (path.startsWith('/admin/kho-hang')) return 'Quản lý Tồn kho';
    if (path.startsWith('/admin/khuyen-mai')) return 'Chương trình Khuyến mãi';
    if (path.startsWith('/admin/bai-viet')) return 'Tin tức & Bài viết';
    if (path.startsWith('/admin/danh-gia')) return 'Quản lý Đánh giá';
    if (path.startsWith('/admin/ho-tro')) return 'Hỗ trợ khách hàng';
    if (path.startsWith('/admin/banner')) return 'Banner & Quảng cáo';
    if (path.startsWith('/admin/bao-cao')) return 'Báo cáo & Phân tích';
    if (path.startsWith('/admin/nhan-vien')) return 'Quản lý Nhân sự';
    if (path.startsWith('/admin/nhat-ky')) return 'Nhật ký kiểm toán';
    if (path.startsWith('/admin/cai-dat')) return 'Cài đặt hệ thống';
    return 'Quản trị LUXE SHOP';
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentUser={currentUser}
      />

      {/* Main Container */}
      <div className="flex flex-1 flex-col min-w-0">
        <AdminHeader
          onMenuToggle={() => setSidebarOpen(true)}
          currentUser={currentUser}
          title={getPageTitle(pathname)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
