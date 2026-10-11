'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, HelpCircle, MessageSquare, Phone, ArrowRight } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Breadcrumbs } from '@/components/store/breadcrumbs';

const FAQ_DATA = [
  {
    category: 'Đặt Hàng & Thanh Toán',
    items: [
      {
        q: 'Tôi có thể đặt may đo theo số đo cơ thể riêng không?',
        a: 'Hoàn toàn có thể. LUXE SHOP cung cấp dịch vụ may đo Haute Couture riêng biệt. Quý khách có thể đến trực tiếp Showroom Tràng Tiền Plaza hoặc đặt lịch hẹn chuyên viên tới tận nhà đo đạc theo Hotline: 1900 888 999.',
      },
      {
        q: 'LUXE hỗ trợ những hình thức thanh toán nào?',
        a: 'Chúng tôi hỗ trợ 3 hình thức tiện lợi: Thanh toán tiền mặt khi nhận hàng (COD), Chuyển khoản nhanh VietQR quét mã xác nhận tự động, và Cổng thanh toán quốc tế VNPay (Visa, MasterCard, JCB, MoMo).',
      },
      {
        q: 'Làm thế nào để áp dụng mã giảm giá voucher?',
        a: 'Tại trang Giỏ Hàng hoặc bước Thanh Toán, quý khách chỉ cần nhập mã ưu đãi vào ô "Mã ưu đãi / Voucher" và nhấn "Áp dụng". Hệ thống sẽ tự động trừ số tiền giảm giá tương ứng vào tổng thanh toán.',
      },
    ],
  },
  {
    category: 'Vận Chuyển & Giao Hàng',
    items: [
      {
        q: 'Thời gian giao hàng là bao lâu?',
        a: 'Đối với khu vực nội thành Hà Nội & TP. Hồ Chí Minh, đơn hàng tiêu chuẩn giao trong 24-48 giờ. Tuyến tỉnh từ 2-3 ngày làm việc. Quý khách cũng có thể chọn gói "Hỏa tốc Express" hoặc "VIP Concierge" để nhận hàng ngay trong ngày.',
      },
      {
        q: 'Đơn hàng được đóng gói như thế nào?',
        a: 'Tất cả đơn hàng của LUXE đều được đóng gói trong hộp cứng mỹ thuật đen tuyền ép nhũ vàng 18K, bọc giấy nến lụa thơm, thắt ruy băng satin thủ công và túi xách lịch thiệp, hoàn hảo để làm quà tặng ngay lập tức.',
      },
      {
        q: 'Tôi có được xem và thử đồ trước khi thanh toán không?',
        a: 'Chắc chắn có. LUXE áp dụng chính sách đồng kiểm tận mắt. Quý khách hoàn toàn có quyền mở hộp kiểm tra màu sắc, chất vải trước khi ký nhận.',
      },
    ],
  },
  {
    category: 'Đổi Trả & Bảo Hành',
    items: [
      {
        q: 'Chính sách đổi kích cỡ hoặc đổi mẫu mã như thế nào?',
        a: 'Quý khách được đổi mẫu hoặc đổi cỡ miễn phí tận nhà trong vòng 15 ngày kể từ ngày nhận hàng. Nhân viên giao nhận của LUXE sẽ mang sản phẩm mới đến và nhận lại sản phẩm cũ cùng lúc.',
      },
      {
        q: 'Sản phẩm có được bảo hành đường may, cúc khóa không?',
        a: 'Mọi sản phẩm trang phục và túi xách LUXE đều được bảo hành kỹ thuật đường may, thay thế cúc mạ vàng và bảo dưỡng bề mặt da miễn phí trọn đời tại tất cả các cơ sở của chúng tôi.',
      },
    ],
  },
  {
    category: 'Chất Liệu & Cách Bảo Quản',
    items: [
      {
        q: 'Lụa tơ tằm LUXE có bị nhăn hoặc co rút không?',
        a: 'Lụa tơ tằm Mulberry 100% tự nhiên có độ rũ đặc trưng và thoáng khí tuyệt đối. Vải đã qua xử lý nhiệt chống co rút cao cấp, quý khách chỉ cần giặt nhẹ bằng tay hoặc giặt khô, là ủi hơi nước ở nhiệt độ thấp để giữ phom dáng luôn hoàn mỹ.',
      },
      {
        q: 'Cách phân biệt da thật Box Calf của LUXE và da nhân tạo?',
        a: 'Da bê Box Calf nhập khẩu Ý của LUXE có vân tự nhiên siêu nhỏ, khi ấn tay có độ đàn hồi tức thì, thơm nhẹ mùi sáp thảo mộc tự nhiên và càng dùng lâu bề mặt da càng bóng mướt sang trọng.',
      },
    ],
  },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = FAQ_DATA.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.a.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="container-narrow pt-4">
        <Breadcrumbs items={[{ label: 'Câu hỏi thường gặp' }]} />

        {/* Header */}
        <div className="mt-2 mb-10 text-center space-y-4">
          <span className="text-2xs font-bold uppercase tracking-widest text-luxury-gold">
            TRỢ GIÚP &amp; HỎI ĐÁP
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-luxury-black tracking-tight">
            Câu Hỏi Thường Gặp (FAQ)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Giải đáp nhanh chóng những thắc mắc phổ biến nhất về trải nghiệm mua sắm thượng lưu tại LUXE.
          </p>

          {/* Search bar inside FAQs */}
          <div className="relative max-w-md mx-auto pt-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm câu hỏi (đổi trả, lụa, ship...)"
              className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-xs shadow-sm focus:border-luxury-gold focus:outline-none focus:ring-1 focus:ring-luxury-gold"
            />
            <Search className="absolute left-4 top-5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* FAQs Accordion Groups */}
        <div className="space-y-8">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((group, groupIdx) => (
              <div
                key={groupIdx}
                className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm"
              >
                <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900 border-b border-gray-100 pb-3 mb-4">
                  {group.category}
                </h2>

                <Accordion type="multiple" className="w-full">
                  {group.items.map((item, itemIdx) => (
                    <AccordionItem key={itemIdx} value={`faq-${groupIdx}-${itemIdx}`}>
                      <AccordionTrigger className="text-xs sm:text-sm font-semibold text-slate-800 text-left py-4 hover:text-luxury-gold">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans pb-4">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-slate-500">
              <HelpCircle className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">Không tìm thấy câu hỏi phù hợp với từ khóa &quot;{searchTerm}&quot;.</p>
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-3 text-xs font-semibold text-luxury-gold hover:underline"
              >
                Hiển thị lại tất cả câu hỏi
              </button>
            </div>
          )}
        </div>

        {/* Still need help CTA */}
        <div className="mt-14 rounded-3xl bg-luxury-black p-8 sm:p-10 text-white text-center shadow-luxury-xl">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2">
            Bạn Vẫn Cần Hỗ Trợ Riêng Biệt?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-6">
            Đội ngũ tư vấn viên cao cấp của LUXE SHOP luôn sẵn lòng phục vụ quý khách 24/7.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/lien-he"
              className="inline-flex items-center gap-2 rounded-xl bg-luxury-gold px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-glow hover:bg-luxury-gold-dark transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Gửi tin nhắn liên hệ</span>
            </Link>
            <a
              href="tel:1900888999"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-white/10 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-all"
            >
              <Phone className="h-4 w-4" />
              <span>Hotline 1900 888 999</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
