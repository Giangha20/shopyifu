import React from 'react';
import { Metadata } from 'next';
import { RotateCcw, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { Breadcrumbs } from '@/components/store/breadcrumbs';

export const metadata: Metadata = {
  title: 'Chính Sách Đổi Trả & Hoàn Tiền 15 Ngày | LUXE SHOP',
  description: 'Chính sách đổi kích cỡ, đổi mẫu mã miễn phí tận nhà trong 15 ngày tại LUXE SHOP.',
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="container-narrow pt-4">
        <Breadcrumbs
          items={[
            { label: 'Chính sách', href: '/chinh-sach/bao-mat' },
            { label: 'Đổi trả & hoàn tiền' },
          ]}
        />

        <div className="mt-4 mb-8 bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-sm space-y-8">
          <div className="border-b border-gray-100 pb-6">
            <span className="text-2xs font-bold uppercase tracking-widest text-luxury-gold">
              ĐẢM BẢO QUYỀN LỢI
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black tracking-tight mt-1">
              Chính Sách Đổi Trả &amp; Hoàn Tiền
            </h1>
            <p className="mt-2 text-xs text-slate-400">
              Đổi hàng miễn phí tận nhà trong vòng 15 ngày kể từ ngày nhận hàng
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-luxury-gold" />
                1. Điều Kiện Áp Dụng Đổi Trả
              </h2>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Sản phẩm còn trong thời hạn 15 ngày tính từ thời điểm khách hàng nhận thành công.</li>
                <li>Sản phẩm còn nguyên tem mác vải, thẻ bài niêm phong nghệ nhân và chưa qua sử dụng, giặt tẩy hoặc có mùi lạ.</li>
                <li>Còn nguyên hộp quà LUXE, túi vải chống bụi và hóa đơn mua hàng đi kèm.</li>
                <li>Các sản phẩm thiết kế đặt may riêng theo số đo cá nhân chỉ hỗ trợ sửa phom miễn phí trọn đời, không hoàn tiền mặt.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-luxury-gold" />
                2. Quy Trình Đổi Trả Tận Nơi 3 Bước Đơn Giản
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="rounded-2xl border border-gray-200 bg-slate-50/50 p-4 space-y-1">
                  <span className="font-bold text-luxury-gold text-xs">Bước 1: Yêu cầu</span>
                  <p className="text-2xs text-slate-600">Gọi Hotline 1900 888 999 hoặc nhắn tin fanpage kèm mã đơn hàng.</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-slate-50/50 p-4 space-y-1">
                  <span className="font-bold text-luxury-gold text-xs">Bước 2: Thu hồi</span>
                  <p className="text-2xs text-slate-600">Shipper LUXE đến tận nhà nhận lại sản phẩm và gửi mẫu mới cùng lúc.</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-slate-50/50 p-4 space-y-1">
                  <span className="font-bold text-luxury-gold text-xs">Bước 3: Hoàn tất</span>
                  <p className="text-2xs text-slate-600">Hoàn tiền qua tài khoản ngân hàng trong vòng 24 giờ nếu khách chọn hoàn tiền.</p>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-luxury-gold" />
                3. Chi Phí Vận Chuyển Đổi Trả
              </h2>
              <p>
                Toàn bộ chi phí vận chuyển 2 chiều khi đổi kích cỡ hoặc đổi mẫu mã đều do <strong>LUXE SHOP tài trợ 100%</strong>. Quý khách không phải trả thêm bất kỳ khoản phí phát sinh nào.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
