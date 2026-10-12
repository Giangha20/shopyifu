import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- ĐANG KHỞI TẠO & KÍCH HOẠT SẢN PHẨM CHO THUÊ ---');

  // 1. Kích hoạt các sản phẩm hiện có phù hợp cho thuê (áo khoác, đầm, váy, suit)
  const existingProducts = await prisma.product.findMany({
    where: { isActive: true },
    include: { images: true },
    take: 30,
  });

  let updatedCount = 0;
  for (const prod of existingProducts) {
    const nameLower = prod.name.toLowerCase();
    if (
      nameLower.includes('đầm') ||
      nameLower.includes('váy') ||
      nameLower.includes('khoác') ||
      nameLower.includes('suit') ||
      nameLower.includes('blazer') ||
      nameLower.includes('áo dài') ||
      nameLower.includes('dạ') ||
      updatedCount < 6
    ) {
      const priceNum = Number(prod.price);
      const rentalPerDay = Math.round(priceNum * 0.12) || 280000;
      const depositFee = Math.round(priceNum * 0.65) || 1200000;

      await prisma.product.update({
        where: { id: prod.id },
        data: {
          isRentable: true,
          rentalPricePerDay: rentalPerDay,
          rentalDepositFee: depositFee,
          rentalTerms:
            'Trang phục cao cấp bảo quản tiêu chuẩn luxury. Khách hàng vui lòng giữ gìn sạch sẽ, không tự giặt tẩy nhiệt độ cao. Hoàn trả 100% cọc sau khi shop kiểm tra tình trạng đồ.',
        },
      });
      console.log(`✓ Đã bật cho thuê: [${prod.sku}] ${prod.name} - Giá thuê: ${rentalPerDay.toLocaleString()}đ/ngày`);
      updatedCount++;
    }
  }

  // 2. Kiểm tra nếu tổng số đồ cho thuê còn ít, thêm thêm 4 sản phẩm đồ dạ hội & lễ phục cao cấp
  const totalRentable = await prisma.product.count({ where: { isRentable: true } });
  console.log(`Tổng sản phẩm cho thuê hiện tại: ${totalRentable}`);

  if (totalRentable < 8) {
    const specialRentals = [
      {
        name: 'Đầm Dạ Hội Kim Sa Hoàng Gia YIFU Haute Couture',
        slug: 'dam-da-hoi-kim-sa-hoang-gia-yifu',
        sku: 'THUE-DH-ROYAL',
        price: 8500000,
        rentalPricePerDay: 550000,
        rentalDepositFee: 3000000,
        quantity: 5,
        description:
          'Đầm dạ hội đính kết kim sa thủ công tinh xảo, phong cách hoàng gia sang trọng và quý phái. Thích hợp cho dạ tiệc, sự kiện thảm đỏ, gala dinner.',
        images: [
          'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
        ],
        sizes: ['S', 'M', 'L'],
      },
      {
        name: 'Set Tuxedo Nam May Đo Cao Cấp Black Velvet',
        slug: 'set-tuxedo-nam-may-do-black-velvet',
        sku: 'THUE-TX-VELVET',
        price: 6800000,
        rentalPricePerDay: 480000,
        rentalDepositFee: 2500000,
        quantity: 4,
        description:
          'Bộ Tuxedo nam nhung đen cao cấp phong cách quý ông cổ điển, phom dáng chuẩn chỉ, ve cổ satin bóng bẩy.',
        images: [
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
          'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80',
        ],
        sizes: ['M', 'L', 'XL'],
      },
      {
        name: 'Váy Cưới Chữ A Lụa Satin Tối Giản Minimalist',
        slug: 'vay-cuoi-chu-a-lua-satin-minimalist',
        sku: 'THUE-VC-SATIN',
        price: 9200000,
        rentalPricePerDay: 650000,
        rentalDepositFee: 3500000,
        quantity: 3,
        description:
          'Thiết kế váy cưới lụa satin tơ tằm thanh lịch, dáng chữ A tôn dáng với đường cắt cúp tinh tế, mang lại vẻ đẹp thuần khiết cho cô dâu.',
        images: [
          'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
          'https://images.unsplash.com/photo-1546804784-896d0dca3805?w=800&q=80',
        ],
        sizes: ['S', 'M'],
      },
      {
        name: 'Áo Dài Truyền Thống Gấm Tơ Tằm Thêu Tay Sen Vàng',
        slug: 'ao-dai-gam-to-tam-theu-tay-sen-vang',
        sku: 'THUE-AD-GOLDLOTUS',
        price: 5200000,
        rentalPricePerDay: 350000,
        rentalDepositFee: 2000000,
        quantity: 6,
        description:
          'Áo dài lụa tơ tằm dệt hoa văn chìm, họa tiết đóa sen thêu chỉ vàng thủ công bởi nghệ nhân. Tôn vinh nét đẹp duyên dáng người phụ nữ Việt.',
        images: [
          'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80',
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
        ],
        sizes: ['S', 'M', 'L'],
      },
    ];

    for (const r of specialRentals) {
      const p = await prisma.product.upsert({
        where: { slug: r.slug },
        update: {
          isRentable: true,
          rentalPricePerDay: r.rentalPricePerDay,
          rentalDepositFee: r.rentalDepositFee,
        },
        create: {
          name: r.name,
          slug: r.slug,
          sku: r.sku,
          price: r.price,
          quantity: r.quantity,
          isRentable: true,
          rentalPricePerDay: r.rentalPricePerDay,
          rentalDepositFee: r.rentalDepositFee,
          rentalTerms:
            'Khách hàng bảo quản nguyên vẹn. Đã giặt hấp vô trùng trước khi bàn giao. Hoàn lại 100% tiền cọc ngay khi nhận lại sản phẩm.',
          description: r.description,
          isActive: true,
          isFeatured: true,
          images: {
            create: r.images.map((url, idx) => ({
              url,
              alt: r.name,
              isPrimary: idx === 0,
              sortOrder: idx,
            })),
          },
          variants: {
            create: r.sizes.map((sz) => ({
              name: `${r.name} - Size ${sz}`,
              sku: `${r.sku}-${sz}`,
              size: sz,
              quantity: 2,
              isActive: true,
            })),
          },
        },
      });
      console.log(`+ Đã tạo thêm trang phục cho thuê đặc biệt: [${p.sku}] ${p.name}`);
    }
  }

  const finalCount = await prisma.product.count({ where: { isRentable: true } });
  console.log(`===> HOÀN TẤT: Hiện có ${finalCount} sản phẩm sẵn sàng cho thuê.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
