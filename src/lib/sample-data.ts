import { ProductItem, ProductCategory, ArticleItem } from '@/types/store';

export const SAMPLE_CATEGORIES: ProductCategory[] = [
  {
    id: 'cat-1',
    name: 'Đầm & Váy Thiết Kế',
    slug: 'dam-vay-thiet-ke',
    description: 'Bộ sưu tập đầm dạ hội, đầm lụa cao cấp tôn vinh vẻ đẹp quý phái của người phụ nữ.',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
  },
  {
    id: 'cat-2',
    name: 'Áo Khoác & Blazer',
    slug: 'ao-khoac-blazer',
    description: 'Áo vest dạ tweed, măng tô cashmere may đo chuẩn phong cách thanh lịch châu Âu.',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
  },
  {
    id: 'cat-3',
    name: 'Túi Xách Da Cao Cấp',
    slug: 'tui-xach-da',
    description: 'Chế tác từ da bê nguyên tấm nhập khẩu Ý, khóa đồng mạ vàng tinh xảo.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
  },
  {
    id: 'cat-4',
    name: 'Giày Cao Gót & Loafer',
    slug: 'giay-cao-got',
    description: 'Thiết kế êm ái, gót thanh thoát nâng niu từng bước chuyển động kiêu sa.',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
  },
  {
    id: 'cat-5',
    name: 'Phụ Kiện & Trang Sức',
    slug: 'phu-kien-trang-suc',
    description: 'Khăn lụa tơ tằm Bảo Lộc, thắt lưng da thủ công và trang sức ngọc trai nuôi nước ngọt.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
  },
];

export const SAMPLE_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    name: 'Đầm Lụa Tơ Tằm Thắt Eo Hoàng Gia',
    slug: 'dam-lua-to-tam-that-eo-hoang-gia',
    sku: 'LXS-DRS-001',
    shortDescription: 'Đầm lụa tơ tằm dệt thủ công 100% tự nhiên, đường cắt may ôm dáng tôn vòng eo quyến rũ.',
    description: `Chiếc đầm lụa Hoàng Gia là biểu tượng của phong cách thượng lưu hiện đại. Được dệt từ 100% sợi tơ tằm nguyên chất với độ bóng sang trọng và bề mặt mịn như làn da thứ hai.

Đặc điểm nổi bật:
- Chất liệu: 100% Lụa tơ tằm Mulberry thượng hạng
- Thiết kế cổ đổ nhẹ nhàng, dây thắt eo tinh xảo đính ngọc trai
- Lớp lót cotton silk thoáng mát, ngăn tĩnh điện
- Phù hợp cho các buổi dạ tiệc, sự kiện sang trọng hoặc hẹn hò tinh tế
- May đo thủ công bởi các nghệ nhân lành nghề tại xưởng LUXE Atelier`,
    price: 3850000,
    compareAtPrice: 4800000,
    quantity: 24,
    brand: 'LUXE Atelier',
    tags: ['Lụa tơ tằm', 'Dạ hội', 'Bestseller', 'Mùa lễ hội'],
    avgRating: 4.9,
    reviewCount: 48,
    soldCount: 162,
    isActive: true,
    isFeatured: true,
    isNew: true,
    isBestseller: true,
    images: [
      { id: 'img-1-1', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=85', isPrimary: true, alt: 'Đầm lụa tơ tằm mặt trước' },
      { id: 'img-1-2', url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1200&q=85', isPrimary: false, alt: 'Đầm lụa chi tiết thắt lưng' },
      { id: 'img-1-3', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1200&q=85', isPrimary: false, alt: 'Đầm lụa dáng dài góc nghiêng' },
      { id: 'img-1-4', url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1200&q=85', isPrimary: false, alt: 'Đầm lụa góc chụp mẫu' },
    ],
    variants: [
      { id: 'var-1-1', productId: 'prod-1', name: 'Champagne / S', sku: 'LXS-DRS-001-CH-S', price: 3850000, quantity: 8, color: 'Champagne', size: 'S', isActive: true },
      { id: 'var-1-2', productId: 'prod-1', name: 'Champagne / M', sku: 'LXS-DRS-001-CH-M', price: 3850000, quantity: 10, color: 'Champagne', size: 'M', isActive: true },
      { id: 'var-1-3', productId: 'prod-1', name: 'Champagne / L', sku: 'LXS-DRS-001-CH-L', price: 3850000, quantity: 6, color: 'Champagne', size: 'L', isActive: true },
      { id: 'var-1-4', productId: 'prod-1', name: 'Đen Huyền Bí / S', sku: 'LXS-DRS-001-BK-S', price: 3850000, quantity: 5, color: 'Đen', size: 'S', isActive: true },
      { id: 'var-1-5', productId: 'prod-1', name: 'Đen Huyền Bí / M', sku: 'LXS-DRS-001-BK-M', price: 3850000, quantity: 7, color: 'Đen', size: 'M', isActive: true },
    ],
    attributes: [
      { id: 'att-1-1', name: 'Chất liệu', value: '100% Lụa tơ tằm Mulberry' },
      { id: 'att-1-2', name: 'Xuất xứ', value: 'Thiết kế & Sản xuất tại Việt Nam' },
      { id: 'att-1-3', name: 'Bảo quản', value: 'Giặt khô hoặc giặt tay bằng sữa tắm gội nhẹ, là hơi nhiệt độ thấp' },
      { id: 'att-1-4', name: 'Độ dài', value: '125cm (Dáng Midi sang trọng)' },
    ],
    categories: [{ category: SAMPLE_CATEGORIES[0] }],
    reviews: [
      {
        id: 'rev-1',
        userName: 'Nguyễn Bích Ngọc',
        rating: 5,
        title: 'Chất vải lụa đỉnh cao, đóng gói cực kỳ sang!',
        content: 'Mặc đi sự kiện ra mắt ai cũng khen. Lụa mát rượi, rũ phom cực đẹp, đường kim mũi chỉ tỉ mỉ từng chi tiết. Hộp quà bọc nơ lụa rất chỉn chu.',
        isVerified: true,
        createdAt: '15/09/2026',
      },
      {
        id: 'rev-2',
        userName: 'Trần Thảo Ly',
        rating: 5,
        title: 'Xứng đáng từng đồng tiền bát gạo',
        content: 'Màu Champagne ở ngoài sang hơn trên ảnh nhiều, lên da cực sáng da.',
        isVerified: true,
        createdAt: '28/09/2026',
      },
    ],
  },
  {
    id: 'prod-2',
    name: 'Áo Khoác Dạ Tweed Dệt Kim Tuyến Kim Sa',
    slug: 'ao-khoac-da-tweed-det-kim-tuyen-kim-sa',
    sku: 'LXS-JKT-002',
    shortDescription: 'Tweed cao cấp dệt sợi vàng gold tinh tế, cúc kim loại mạ vàng chạm khắc logo độc quyền.',
    description: `Biểu tượng thanh lịch kinh điển mang hơi thở Parisienne. Áo tweed LUXE được dệt công phu với các sợi len tự nhiên xen kẽ kim sa lấp lánh nhẹ nhàng dưới ánh đèn.

Đặc điểm sản phẩm:
- Vải dạ Tweed đanh mịn, không xù lông
- Cúc hợp kim mạ vàng 18K chạm khắc monogram
- Phom áo cropped hiện đại giúp kéo dài đôi chân`,
    price: 4200000,
    compareAtPrice: 5250000,
    quantity: 18,
    brand: 'LUXE Atelier',
    tags: ['Tweed', 'Áo vest', 'Mùa đông', 'Luxury'],
    avgRating: 4.8,
    reviewCount: 32,
    soldCount: 95,
    isActive: true,
    isFeatured: true,
    isNew: true,
    images: [
      { id: 'img-2-1', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=85', isPrimary: true, alt: 'Áo khoác Tweed mặt trước' },
      { id: 'img-2-2', url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=1200&q=85', isPrimary: false, alt: 'Cúc mạ vàng chi tiết áo tweed' },
    ],
    variants: [
      { id: 'var-2-1', productId: 'prod-2', name: 'Trắng Ngà / S', sku: 'LXS-JKT-002-IV-S', price: 4200000, quantity: 6, color: 'Trắng Ngà', size: 'S', isActive: true },
      { id: 'var-2-2', productId: 'prod-2', name: 'Trắng Ngà / M', sku: 'LXS-JKT-002-IV-M', price: 4200000, quantity: 8, color: 'Trắng Ngà', size: 'M', isActive: true },
    ],
    attributes: [
      { id: 'att-2-1', name: 'Chất liệu', value: '70% Wool, 20% Silk, 10% Metallic' },
      { id: 'att-2-2', name: 'Cúc áo', value: 'Hợp kim mạ vàng kháng rỉ' },
    ],
    categories: [{ category: SAMPLE_CATEGORIES[1] }],
  },
  {
    id: 'prod-3',
    name: 'Túi Xách Da Bê Monaco Khóa Chữ L Mạ Vàng',
    slug: 'tui-xach-da-be-monaco-khoa-chu-l-ma-vang',
    sku: 'LXS-BAG-003',
    shortDescription: 'Da bê Box Calf Ý đanh mịn, khoang chứa tiện lợi, quai đeo điều chỉnh linh hoạt.',
    description: `Chiếc túi xách hoàn mỹ dành cho quý cô hiện đại. Từng góc cạnh được bọc viền thủ công, da bê Box Calf giữ phom chuẩn xác sau nhiều năm sử dụng.`,
    price: 6890000,
    compareAtPrice: 8500000,
    quantity: 12,
    brand: 'LUXE Leathercraft',
    tags: ['Túi da', 'Ý', 'Limited Edition'],
    avgRating: 5.0,
    reviewCount: 27,
    soldCount: 88,
    isActive: true,
    isFeatured: true,
    isBestseller: true,
    images: [
      { id: 'img-3-1', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=85', isPrimary: true, alt: 'Túi xách Monaco da bê' },
      { id: 'img-3-2', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=85', isPrimary: false, alt: 'Góc nghiêng túi xách' },
    ],
    variants: [
      { id: 'var-3-1', productId: 'prod-3', name: 'Đen Noir', sku: 'LXS-BAG-003-BK', price: 6890000, quantity: 6, color: 'Đen Noir', size: 'One Size', isActive: true },
      { id: 'var-3-2', productId: 'prod-3', name: 'Nâu Caramel', sku: 'LXS-BAG-003-CR', price: 6890000, quantity: 6, color: 'Nâu Caramel', size: 'One Size', isActive: true },
    ],
    attributes: [
      { id: 'att-3-1', name: 'Chất liệu', value: '100% Da bê Calfskin Ý' },
      { id: 'att-3-2', name: 'Kích thước', value: '24cm x 16cm x 7cm' },
    ],
    categories: [{ category: SAMPLE_CATEGORIES[2] }],
  },
  {
    id: 'prod-4',
    name: 'Giày Cao Gót Mũi Nhọn Da Bóng Satin Gót Pha Lê',
    slug: 'giay-cao-got-mui-nhon-da-bong-satin-got-pha-le',
    sku: 'LXS-SHO-004',
    shortDescription: 'Gót trụ pha lê cắt đa giác 8.5cm, lót đệm memory foam êm chân suốt cả ngày dài.',
    description: `Thiết kế giày cao gót hoàn hảo kết hợp giữa satin lụa bóng bẩy và gót pha lê trong suốt tán sắc lộng lẫy.`,
    price: 2950000,
    compareAtPrice: 3500000,
    quantity: 30,
    brand: 'LUXE Atelier',
    tags: ['Giày cao gót', 'Dạ hội', 'Tiệc cưới'],
    avgRating: 4.7,
    reviewCount: 19,
    soldCount: 74,
    isActive: true,
    isFeatured: false,
    isNew: true,
    images: [
      { id: 'img-4-1', url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200&q=85', isPrimary: true, alt: 'Giày cao gót mũi nhọn' },
    ],
    variants: [
      { id: 'var-4-1', productId: 'prod-4', name: 'Đen / 36', sku: 'LXS-SHO-004-36', price: 2950000, quantity: 8, color: 'Đen', size: '36', isActive: true },
      { id: 'var-4-2', productId: 'prod-4', name: 'Đen / 37', sku: 'LXS-SHO-004-37', price: 2950000, quantity: 10, color: 'Đen', size: '37', isActive: true },
      { id: 'var-4-3', productId: 'prod-4', name: 'Đen / 38', sku: 'LXS-SHO-004-38', price: 2950000, quantity: 12, color: 'Đen', size: '38', isActive: true },
    ],
    attributes: [
      { id: 'att-4-1', name: 'Độ cao gót', value: '8.5 cm' },
      { id: 'att-4-2', name: 'Lót đế', value: 'Memory Foam da dê êm ái' },
    ],
    categories: [{ category: SAMPLE_CATEGORIES[3] }],
  },
  {
    id: 'prod-5',
    name: 'Khăn Choàng Lụa Tơ Tằm Họa Tiết Cung Đình',
    slug: 'khan-choang-lua-to-tam-hoa-tiet-cung-dinh',
    sku: 'LXS-ACC-005',
    shortDescription: 'In kỹ thuật số sắc nét trên lụa Habotai 16mm, viền cuộn thủ công tinh xảo bằng tay.',
    description: `Khăn choàng lụa là bản giao hưởng giữa nghệ thuật tranh khắc truyền thống và công nghệ dệt hiện đại.`,
    price: 1650000,
    compareAtPrice: 1950000,
    quantity: 45,
    brand: 'LUXE Atelier',
    tags: ['Khăn lụa', 'Quà tặng', 'Phụ kiện'],
    avgRating: 4.9,
    reviewCount: 41,
    soldCount: 210,
    isActive: true,
    isFeatured: true,
    isBestseller: true,
    images: [
      { id: 'img-5-1', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&q=85', isPrimary: true, alt: 'Khăn lụa cao cấp' },
    ],
    variants: [
      { id: 'var-5-1', productId: 'prod-5', name: 'Vàng Cung Đình', sku: 'LXS-ACC-005-GLD', price: 1650000, quantity: 20, color: 'Vàng Hoàng Gia', size: '90x90cm', isActive: true },
    ],
    attributes: [
      { id: 'att-5-1', name: 'Kích thước', value: '90 x 90 cm' },
      { id: 'att-5-2', name: 'Chất liệu', value: '100% Lụa Habotai cao cấp' },
    ],
    categories: [{ category: SAMPLE_CATEGORIES[4] }],
  },
  {
    id: 'prod-6',
    name: 'Áo Sơ Mi Lụa Cát Phom Rộng Cổ Tàu Khuy Xà Cừ',
    slug: 'ao-so-mi-lua-cat-phom-rong-co-tau',
    sku: 'LXS-SHT-006',
    shortDescription: 'Lụa cát Crepe de Chine dập mềm rủ, khuy xà cừ tự nhiên óng ánh sắc cầu vồng.',
    description: `Thiết kế sơ mi thanh tao phù hợp cho cả môi trường công sở lẫn dạo phố cuối tuần sang trọng.`,
    price: 2450000,
    compareAtPrice: 2850000,
    quantity: 22,
    brand: 'LUXE Atelier',
    tags: ['Sơ mi', 'Lụa cát', 'Office Chic'],
    avgRating: 4.8,
    reviewCount: 15,
    soldCount: 63,
    isActive: true,
    isFeatured: false,
    isNew: false,
    images: [
      { id: 'img-6-1', url: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=1200&q=85', isPrimary: true, alt: 'Áo sơ mi lụa cát' },
    ],
    variants: [
      { id: 'var-6-1', productId: 'prod-6', name: 'Trắng Kem / S', sku: 'LXS-SHT-006-CR-S', price: 2450000, quantity: 8, color: 'Trắng Kem', size: 'S', isActive: true },
      { id: 'var-6-2', productId: 'prod-6', name: 'Trắng Kem / M', sku: 'LXS-SHT-006-CR-M', price: 2450000, quantity: 10, color: 'Trắng Kem', size: 'M', isActive: true },
    ],
    attributes: [
      { id: 'att-6-1', name: 'Chất liệu', value: '100% Silk Crepe de Chine' },
    ],
    categories: [{ category: SAMPLE_CATEGORIES[0] }],
  },
];

export const SAMPLE_ARTICLES: ArticleItem[] = [
  {
    id: 'art-1',
    title: 'Nghệ Thuật Chọn Lụa Tơ Tằm Tự Nhiên Và Bí Quyết Bảo Quản Thượng Hạng',
    slug: 'nghe-thuat-chon-lua-to-tam-va-bi-quyet-bao-quan',
    excerpt: 'Khám phá thế giới của những sợi tơ óng ả, cách phân biệt lụa thật và quy trình giặt ủi giữ phom chuẩn mực cho trang phục đắt giá.',
    content: `Lụa tơ tằm từ lâu đã được coi là "nữ hoàng của các loại vải". Với nguồn gốc hoàn toàn tự nhiên từ loài tằm ăn lá dâu, từng mét vải lụa tơ tằm mang trong mình linh hồn của đất trời và sự tài hoa của người thợ dệt.

### 1. Cách nhận biết lụa tơ tằm thượng hạng
Lụa tự nhiên có độ ánh xà cừ dịu dàng, khi thay đổi góc chiếu sáng sẽ tạo nên các dải sắc thái ấm áp khác nhau, không bị bóng gắt như sợi tổng hợp polyester. Khi sờ vào, lụa cho cảm giác mướt mát, mịn màng và ấm dần lên theo nhiệt độ cơ thể.

### 2. Quy tắc vàng khi giặt và là lụa
- Tuyệt đối không giặt bằng nước nóng hoặc chất tẩy rửa mạnh.
- Khuyên dùng dầu gội đầu dịu nhẹ hoặc nước giặt chuyên dụng cho tơ lụa.
- Vắt nhẹ nhàng, không vắt xoắn làm gãy cấu trúc sợi.
- Phơi trong bóng râm, tránh ánh nắng mặt trời trực tiếp.
- Là ủi ở mặt trái khi vải còn hơi ẩm với chế độ lụa (Silk).`,
    featuredImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=80',
    categoryName: 'Xu Hướng & Phong Cách',
    authorName: 'Trần Gia Hân - Giám đốc Sáng tạo',
    publishedAt: '05/10/2026',
    readingTime: '5 phút đọc',
    viewCount: 1420,
    tags: ['Lụa tơ tằm', 'Chăm sóc trang phục', 'Thời trang bền vững'],
  },
  {
    id: 'art-2',
    title: 'Xu Hướng Màu Sắc Thu Đông 2026: Sắc Vàng Gold & Tông Nâu Caramel Chiếm Lĩnh Sàn Diễn',
    slug: 'xu-huong-mau-sac-thu-dong-2026',
    excerpt: 'Điểm qua những bản phối màu thịnh hành nhất mùa mốt cuối năm, mang lại phong thái vương giả và ấm áp cho quý cô sang trọng.',
    content: `Mùa thu đông 2026 chứng kiến sự trở lại ngoạn mục của các gam màu ấm trầm giàu năng lượng như vàng cát champagne, nâu caramel đằm thắm và đen tuyền huyền bí.

Sự kết hợp giữa chất liệu vải dạ tweed dệt chỉ kim tuyến cùng tông vàng kim sa mang đến diện mạo đài các, thích hợp cho các buổi dạ tiệc cuối năm.`,
    featuredImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80',
    categoryName: 'Bản Tin Thời Trang',
    authorName: 'Lê Minh Quân - Fashion Editor',
    publishedAt: '01/10/2026',
    readingTime: '4 phút đọc',
    viewCount: 2180,
    tags: ['Thu Đông 2026', 'Màu sắc', 'Phối đồ'],
  },
  {
    id: 'art-3',
    title: 'Hành Trình Chế Tác Thủ Công Túi Da Thượng Lưu Tại LUXE Atelier',
    slug: 'hanh-trinh-che-tac-thu-cong-tui-da',
    excerpt: 'Mỗi chiếc túi xách LUXE là thành quả của hơn 48 giờ lao động miệt mài với từng mũi chỉ khâu tay Saddle Stitch kinh điển.',
    content: `Để tạo nên một tác phẩm túi da hoàn chỉnh, các nghệ nhân tại xưởng LUXE phải trải qua hơn 12 công đoạn nghiêm ngặt: từ tuyển chọn da bê nguyên tấm không tì vết, thuộc thảo mộc an toàn cho sức khỏe, đến định hình phom và đánh bóng viền mép thủ công bằng sáp ong tự nhiên.`,
    featuredImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80',
    categoryName: 'Di Sản & Nghệ Nhân',
    authorName: 'Hoàng Kim - Master Artisan',
    publishedAt: '24/09/2026',
    readingTime: '6 phút đọc',
    viewCount: 3490,
    tags: ['Chế tác thủ công', 'Túi da', 'Artisan'],
  },
];
