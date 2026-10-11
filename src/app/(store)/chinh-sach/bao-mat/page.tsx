import React from 'react';
import { Metadata } from 'next';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';
import { Breadcrumbs } from '@/components/store/breadcrumbs';

export const metadata: Metadata = {
  title: 'Chính Sách Bảo Mật Thông Tin | LUXE SHOP',
  description: 'Cam kết bảo mật dữ liệu khách hàng tuyệt đối tại LUXE SHOP theo tiêu chuẩn quốc tế.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="container-narrow pt-4">
        <Breadcrumbs
          items={[
            { label: 'Chính sách', href: '/chinh-sach/bao-mat' },
            { label: 'Bảo mật thông tin' },
          ]}
        />

        <div className="mt-4 mb-8 bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-sm space-y-8">
          <div className="border-b border-gray-100 pb-6">
            <span className="text-2xs font-bold uppercase tracking-widest text-luxury-gold">
              QUY ĐỊNH BẢO MẬT
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black tracking-tight mt-1">
              Chính Sách Bảo Mật Thông Tin Khách Hàng
            </h1>
            <p className="mt-2 text-xs text-slate-400">
              Cập nhật lần cuối: Tháng 10/2026 • Áp dụng cho toàn bộ nền tảng LUXE SHOP
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <Lock className="h-4 w-4 text-luxury-gold" />
                1. Mục Đích Thu Thập Thông Tin
              </h2>
              <p>
                LUXE SHOP thu thập thông tin cá nhân của quý khách (Họ tên, số điện thoại, địa chỉ giao hàng, email) nhằm phục vụ các mục đích độc quyền sau:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Xử lý và chuyển giao đơn hàng qua dịch vụ chuyển phát LUXE Concierge.</li>
                <li>Xác nhận thanh toán, phát hành hóa đơn điện tử giá trị gia tăng.</li>
                <li>Gửi thông báo cập nhật lộ trình giao hàng và chứng nhận thẻ bảo hành nghệ nhân.</li>
                <li>Cung cấp quyền lợi chăm sóc khách hàng VIP và ưu đãi cá nhân hóa sinh nhật.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-luxury-gold" />
                2. Cam Kết Bảo Mật Tuyệt Đối
              </h2>
              <p>
                Toàn bộ dữ liệu thanh toán thẻ ngân hàng, tài khoản ví điện tử đều được mã hóa theo chuẩn bảo mật cấp ngân hàng 256-bit SSL (Secure Sockets Layer). LUXE SHOP tuyệt đối không lưu trữ thông tin thẻ tín dụng/CVV của quý khách trên hệ thống máy chủ.
              </p>
              <p>
                Chúng tôi cam kết không bán, chia sẻ hoặc thương mại hóa thông tin khách hàng cho bất kỳ bên thứ ba nào vì mục đích quảng cáo hoặc tiếp thị trái phép.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <Eye className="h-4 w-4 text-luxury-gold" />
                3. Quyền Của Khách Hàng Đối Với Dữ Liệu
              </h2>
              <p>
                Quý khách có toàn quyền yêu cầu LUXE SHOP kiểm tra, cập nhật hoặc xóa vĩnh viễn thông tin cá nhân của mình khỏi cơ sở dữ liệu bất kỳ lúc nào bằng cách liên hệ bộ phận hỗ trợ khách hàng qua email: <strong>privacy@luxeshop.vn</strong> hoặc hotline: <strong>1900 888 999</strong>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
