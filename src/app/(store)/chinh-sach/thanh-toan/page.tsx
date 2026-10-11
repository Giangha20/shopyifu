import React from 'react';
import { Metadata } from 'next';
import { CreditCard, Banknote, QrCode, ShieldCheck, Lock } from 'lucide-react';
import { Breadcrumbs } from '@/components/store/breadcrumbs';

export const metadata: Metadata = {
  title: 'Chính Sách Thanh Toán & Bảo Mật Giao Dịch | LUXE SHOP',
  description: 'Các hình thức thanh toán được hỗ trợ và cam kết an toàn giao dịch tại LUXE SHOP.',
};

export default function PaymentPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="container-narrow pt-4">
        <Breadcrumbs
          items={[
            { label: 'Chính sách', href: '/chinh-sach/bao-mat' },
            { label: 'Phương thức thanh toán' },
          ]}
        />

        <div className="mt-4 mb-8 bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-sm space-y-8">
          <div className="border-b border-gray-100 pb-6">
            <span className="text-2xs font-bold uppercase tracking-widest text-luxury-gold">
              TIỆN ÍCH MUA SẮM
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black tracking-tight mt-1">
              Chính Sách Thanh Toán
            </h1>
            <p className="mt-2 text-xs text-slate-400">
              Đa dạng các cổng thanh toán an toàn, bảo mật tuyệt đối
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-luxury-gold" />
                1. Các Hình Thức Thanh Toán Được Chấp Nhận
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-5 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <Banknote className="h-4 w-4 text-luxury-gold" />
                    Thanh toán COD
                  </div>
                  <p className="text-2xs text-slate-500 leading-relaxed">
                    Khách hàng kiểm tra hàng và thanh toán tiền mặt trực tiếp cho nhân viên khi nhận gói quà tại nhà.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-5 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <QrCode className="h-4 w-4 text-luxury-gold" />
                    Chuyển khoản VietQR
                  </div>
                  <p className="text-2xs text-slate-500 leading-relaxed">
                    Hệ thống tạo mã QR động tự điền số tiền và nội dung, xác nhận đơn hàng tự động trong 30 giây.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-5 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <CreditCard className="h-4 w-4 text-luxury-gold" />
                    VNPay / Visa / Master
                  </div>
                  <p className="text-2xs text-slate-500 leading-relaxed">
                    Thanh toán bảo mật qua cổng VNPay, hỗ trợ thẻ quốc tế Visa, MasterCard, JCB và ví MoMo.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <Lock className="h-4 w-4 text-luxury-gold" />
                2. Cam Kết An Toàn &amp; Chống Gian Lận
              </h2>
              <p>
                Hệ thống thanh toán của LUXE SHOP tuân thủ tiêu chuẩn bảo mật dữ liệu thẻ thanh toán PCI DSS (Payment Card Industry Data Security Standard) cấp độ cao nhất. Mọi giao dịch qua thẻ đều yêu cầu xác thực 2 bước 3D-Secure từ ngân hàng phát hành.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-luxury-gold" />
                3. Xuất Hóa Đơn Giá Trị Gia Tăng (VAT)
              </h2>
              <p>
                Quý khách có nhu cầu xuất hóa đơn điện tử cho doanh nghiệp vui lòng điền thông tin Mã số thuế và Tên công ty trong mục Ghi chú khi đặt hàng. Hóa đơn điện tử hợp lệ sẽ được gửi về email của quý khách trong vòng 48 giờ sau khi đơn hàng được giao thành công.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
