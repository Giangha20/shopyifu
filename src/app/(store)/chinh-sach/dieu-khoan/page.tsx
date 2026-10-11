import React from 'react';
import { Metadata } from 'next';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Breadcrumbs } from '@/components/store/breadcrumbs';

export const metadata: Metadata = {
  title: 'Điều Khoản Dịch Vụ & Sử Dụng | LUXE SHOP',
  description: 'Các điều khoản và quy định giao dịch mua sắm chính thức tại hệ thống thời trang LUXE SHOP.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="container-narrow pt-4">
        <Breadcrumbs
          items={[
            { label: 'Chính sách', href: '/chinh-sach/bao-mat' },
            { label: 'Điều khoản dịch vụ' },
          ]}
        />

        <div className="mt-4 mb-8 bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-sm space-y-8">
          <div className="border-b border-gray-100 pb-6">
            <span className="text-2xs font-bold uppercase tracking-widest text-luxury-gold">
              ĐIỀU KHOẢN MUA SẮM
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black tracking-tight mt-1">
              Điều Khoản Dịch Vụ
            </h1>
            <p className="mt-2 text-xs text-slate-400">
              Có hiệu lực thi hành: Năm 2026 • LUXE SHOP Vietnam
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-luxury-gold" />
                1. Quy Định Đặt Hàng &amp; Giá Cả
              </h2>
              <p>
                Tất cả các mức giá niêm yết trên website LUXE SHOP đều là đơn vị Việt Nam Đồng (VND), đã bao gồm thuế Giá trị gia tăng (VAT). LUXE có quyền điều chỉnh giá theo chiến dịch khuyến mãi hoặc chương trình bộ sưu tập mà không cần thông báo trước cho các đơn hàng chưa xác nhận.
              </p>
              <p>
                Đơn hàng chỉ được xem là giao kết hợp đồng thành công khi quý khách nhận được thông báo xác nhận từ hệ thống qua tin nhắn SMS hoặc thư điện tử.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-luxury-gold" />
                2. Quyền Sở Hữu Trí Tuệ &amp; Thiết Kế
              </h2>
              <p>
                Mọi hình ảnh, kiểu dáng may đo, nhãn hiệu LUXE, logo Monogram và nội dung bài viết đều thuộc quyền sở hữu trí tuệ độc quyền của Công ty Cổ phần LUXE Việt Nam. Mọi hành vi sao chép thiết kế mẫu, làm giả tem mác thẻ bài sẽ bị truy cứu trách nhiệm trước pháp luật.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-luxury-gold" />
                3. Trách Nhiệm Của Người Dùng
              </h2>
              <p>
                Khách hàng có trách nhiệm cung cấp thông tin liên hệ và địa chỉ giao hàng chính xác để tránh chậm trễ trong quá trình vận chuyển hộp quà cao cấp. Khách hàng cam kết không sử dụng hệ thống để thực hiện các hành vi gian lận thanh toán hoặc đặt hàng ảo.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
