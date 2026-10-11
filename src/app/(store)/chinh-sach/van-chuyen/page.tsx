import React from 'react';
import { Metadata } from 'next';
import { Truck, Clock, ShieldCheck, Gift } from 'lucide-react';
import { Breadcrumbs } from '@/components/store/breadcrumbs';

export const metadata: Metadata = {
  title: 'Chính Sách Vận Chuyển & Giao Nhận Thượng Lưu | LUXE SHOP',
  description: 'Thông tin cước phí, thời gian giao hàng và quy chuẩn đóng gói hộp quà cao cấp tại LUXE SHOP.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="container-narrow pt-4">
        <Breadcrumbs
          items={[
            { label: 'Chính sách', href: '/chinh-sach/bao-mat' },
            { label: 'Vận chuyển & giao nhận' },
          ]}
        />

        <div className="mt-4 mb-8 bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-sm space-y-8">
          <div className="border-b border-gray-100 pb-6">
            <span className="text-2xs font-bold uppercase tracking-widest text-luxury-gold">
              DỊCH VỤ CONCIERGE
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black tracking-tight mt-1">
              Chính Sách Vận Chuyển &amp; Giao Nhận
            </h1>
            <p className="mt-2 text-xs text-slate-400">
              Quy chuẩn giao nhận găng tay trắng chuẩn phong cách thượng lưu
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <Truck className="h-4 w-4 text-luxury-gold" />
                1. Biểu Phí Vận Chuyển &amp; Hạn Mức Miễn Phí
              </h2>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-gray-200 font-bold text-slate-800">
                    <tr>
                      <th className="py-3 px-4 text-left">Loại Dịch Vụ</th>
                      <th className="py-3 px-4 text-left">Khu Vực Áp Dụng</th>
                      <th className="py-3 px-4 text-left">Thời Gian</th>
                      <th className="py-3 px-4 text-right">Chi Phí</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-900">Tiêu chuẩn</td>
                      <td className="py-3 px-4">Toàn quốc (Đơn từ 2.000.000₫)</td>
                      <td className="py-3 px-4">2 - 3 ngày</td>
                      <td className="py-3 px-4 text-right text-emerald-600 font-bold">MIỄN PHÍ</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-900">Tiêu chuẩn (Đơn dưới 2tr)</td>
                      <td className="py-3 px-4">Toàn quốc</td>
                      <td className="py-3 px-4">2 - 3 ngày</td>
                      <td className="py-3 px-4 text-right">40.000₫</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-900">Hỏa tốc Express</td>
                      <td className="py-3 px-4">Nội thành Hà Nội &amp; TP.HCM</td>
                      <td className="py-3 px-4">Trong 24 giờ</td>
                      <td className="py-3 px-4 text-right">50.000₫</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-900">VIP Concierge</td>
                      <td className="py-3 px-4">Trung tâm các thành phố lớn</td>
                      <td className="py-3 px-4">Giao hẹn giờ trong ngày</td>
                      <td className="py-3 px-4 text-right">150.000₫</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <Gift className="h-4 w-4 text-luxury-gold" />
                2. Quy Chuẩn Đóng Gói Hộp Quà Signature
              </h2>
              <p>
                Mọi đơn hàng từ LUXE SHOP bất kể giá trị đều được đặt trong:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Hộp cứng bồi giấy mỹ thuật màu đen tuyền ép kim logo vàng Gold 18K.</li>
                <li>Giấy nến lụa thơm chống ẩm và phong bì cảm ơn viết tay từ Giám đốc Sáng tạo.</li>
                <li>Ruy băng lụa satin buộc nơ kiểu Pháp và túi xách quai dù chắc chắn bên ngoài.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-luxury-gold" />
                3. Đồng Kiểm Khi Nhận Hàng
              </h2>
              <p>
                Quý khách có toàn quyền mở hộp kiểm tra màu sắc, đường may và thử độ êm trước khi ký nhận và thanh toán cho nhân viên chuyển phát. Nếu sản phẩm có bất kỳ lỗi nào do quá trình vận chuyển, quý khách có thể từ chối nhận hàng mà không tốn bất kỳ khoản phí nào.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
