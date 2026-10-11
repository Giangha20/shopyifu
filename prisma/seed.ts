import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting LUXE SHOP database seeding...');

  // ==========================================
  // 1. ROLES & PERMISSIONS
  // ==========================================
  console.log('📦 Seeding permissions and roles...');

  const modules = [
    { key: 'products', name: 'Sản phẩm' },
    { key: 'orders', name: 'Đơn hàng' },
    { key: 'customers', name: 'Khách hàng' },
    { key: 'inventory', name: 'Kho hàng' },
    { key: 'coupons', name: 'Mã giảm giá' },
    { key: 'reviews', name: 'Đánh giá' },
    { key: 'articles', name: 'Bài viết' },
    { key: 'banners', name: 'Banner & Quảng cáo' },
    { key: 'settings', name: 'Cài đặt hệ thống' },
    { key: 'staff', name: 'Nhân viên & Phân quyền' },
    { key: 'audit_logs', name: 'Nhật ký hoạt động' },
    { key: 'reports', name: 'Báo cáo & Thống kê' },
  ];

  const actions = [
    { key: 'view', name: 'Xem' },
    { key: 'create', name: 'Thêm mới' },
    { key: 'update', name: 'Chỉnh sửa' },
    { key: 'delete', name: 'Xóa' },
  ];

  const allPermissionIds: string[] = [];

  for (const mod of modules) {
    for (const act of actions) {
      const permKey = `${mod.key}:${act.key}`;
      const permName = `${act.name} ${mod.name.toLowerCase()}`;
      const permission = await prisma.permission.upsert({
        where: { name: permKey },
        update: {
          displayName: permName,
          group: mod.name,
          description: `Quyền ${permName.toLowerCase()} trong hệ thống`,
        },
        create: {
          name: permKey,
          displayName: permName,
          group: mod.name,
          description: `Quyền ${permName.toLowerCase()} trong hệ thống`,
        },
      });
      allPermissionIds.push(permission.id);
    }
  }

  const roleDefinitions = [
    {
      name: 'super_admin',
      displayName: 'Super Administrator',
      description: 'Toàn quyền quản trị hệ thống cao nhất',
      isSystem: true,
      permissionMatcher: () => true,
    },
    {
      name: 'admin',
      displayName: 'Administrator',
      description: 'Quản trị viên vận hành hệ thống',
      isSystem: true,
      permissionMatcher: () => true,
    },
    {
      name: 'order_manager',
      displayName: 'Quản lý đơn hàng',
      description: 'Xử lý và theo dõi quy trình đơn hàng, khách hàng',
      isSystem: false,
      permissionMatcher: (name: string) =>
        name.startsWith('orders:') || name.startsWith('customers:view') || name.startsWith('reports:view'),
    },
    {
      name: 'product_manager',
      displayName: 'Quản lý sản phẩm',
      description: 'Quản lý danh mục, sản phẩm, đánh giá và khuyến mãi',
      isSystem: false,
      permissionMatcher: (name: string) =>
        name.startsWith('products:') || name.startsWith('coupons:') || name.startsWith('reviews:'),
    },
    {
      name: 'inventory_manager',
      displayName: 'Quản lý kho hàng',
      description: 'Kiểm soát xuất nhập tồn kho và luân chuyển hàng',
      isSystem: false,
      permissionMatcher: (name: string) =>
        name.startsWith('inventory:') || name.startsWith('products:view'),
    },
    {
      name: 'customer_support',
      displayName: 'Chăm sóc khách hàng',
      description: 'Hỗ trợ khách hàng, xem đơn hàng và phản hồi đánh giá',
      isSystem: false,
      permissionMatcher: (name: string) =>
        name.startsWith('customers:view') || name.startsWith('orders:view') || name.startsWith('reviews:'),
    },
    {
      name: 'reporter',
      displayName: 'Chuyên viên phân tích & báo cáo',
      description: 'Xem các báo cáo số liệu và thống kê doanh thu',
      isSystem: false,
      permissionMatcher: (name: string) =>
        name.startsWith('reports:view') || name.endsWith(':view'),
    },
  ];

  const dbPermissions = await prisma.permission.findMany();

  for (const rDef of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: { name: rDef.name },
      update: {
        displayName: rDef.displayName,
        description: rDef.description,
        isSystem: rDef.isSystem,
      },
      create: {
        name: rDef.name,
        displayName: rDef.displayName,
        description: rDef.description,
        isSystem: rDef.isSystem,
      },
    });

    // Assign appropriate permissions
    const matchingPermissions = dbPermissions.filter((p) => rDef.permissionMatcher(p.name));
    for (const perm of matchingPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // ==========================================
  // 2. INITIAL SUPER ADMIN USER
  // ==========================================
  console.log('👤 Seeding Super Admin user...');
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@luxeshop.vn').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMeImmediately!2024';
  const passwordHash = await hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      isActive: true,
      isEmailVerified: true,
      firstName: 'Admin',
      lastName: 'LUXE',
    },
    create: {
      email: adminEmail,
      passwordHash,
      firstName: 'Admin',
      lastName: 'LUXE',
      phone: '0901234567',
      isActive: true,
      isEmailVerified: true,
      emailVerified: new Date(),
    },
  });

  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'super_admin' },
  });

  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: superAdminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    });
  }

  // ==========================================
  // 3. CATEGORIES TREE
  // ==========================================
  console.log('📂 Seeding product categories...');

  interface CategoryItem {
    name: string;
    slug: string;
    description: string;
    image: string;
    children?: { name: string; slug: string; description: string; image: string }[];
  }

  const categoryTree: CategoryItem[] = [
    {
      name: 'Áo',
      slug: 'ao',
      description: 'Bộ sưu tập áo thời trang nam nữ cao cấp, thanh lịch và thời thượng.',
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
      children: [
        {
          name: 'Áo sơ mi',
          slug: 'ao-so-mi',
          description: 'Áo sơ mi lụa, cotton Ai Cập tinh tế cho công sở và tiệc sang trọng.',
          image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
        },
        {
          name: 'Áo thun',
          slug: 'ao-thun',
          description: 'Áo thun cotton Supima mềm mại, thoáng khí với phom dáng chuẩn.',
          image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        },
        {
          name: 'Áo khoác',
          slug: 'ao-khoac',
          description: 'Áo blazer, trench coat và áo dạ phong cách thượng lưu.',
          image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
        },
        {
          name: 'Áo len',
          slug: 'ao-len',
          description: 'Áo len cashmere và len lông cừu ấm áp, cao cấp.',
          image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    {
      name: 'Quần',
      slug: 'quan',
      description: 'Các mẫu quần thiết kế tôn dáng, đường may chuẩn xác từng milimet.',
      image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80',
      children: [
        {
          name: 'Quần jean',
          slug: 'quan-jean',
          description: 'Quần jeans denim dệt thủ công với độ co giãn thoải mái.',
          image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
        },
        {
          name: 'Quần tây',
          slug: 'quan-tay',
          description: 'Quần âu may đo phong cách Sartorial cổ điển và hiện đại.',
          image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
        },
        {
          name: 'Quần short',
          slug: 'quan-short',
          description: 'Quần short linen và khaki sành điệu cho mùa hè.',
          image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    {
      name: 'Váy & Đầm',
      slug: 'vay-dam',
      description: 'Trang phục dạ hội, đầm dự tiệc và váy dạo phố quyến rũ quý phái.',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
      children: [
        {
          name: 'Váy',
          slug: 'chan-vay',
          description: 'Chân váy chữ A, chân váy xếp ly và chân váy bút chì thanh lịch.',
          image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80',
        },
        {
          name: 'Đầm',
          slug: 'dam',
          description: 'Đầm dạ hội lụa tơ tằm, đầm maxi quyến rũ cho mọi sự kiện.',
          image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    {
      name: 'Phụ kiện',
      slug: 'phu-kien',
      description: 'Phụ kiện cao cấp hoàn thiện phong cách sống thượng lưu.',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      children: [
        {
          name: 'Túi xách',
          slug: 'tui-xach',
          description: 'Túi da bò thuộc thảo mộc thủ công tinh xảo.',
          image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
        },
        {
          name: 'Mũ',
          slug: 'mu',
          description: 'Mũ fedora, nón cói panama và beret cổ điển phong cách châu Âu.',
          image: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&w=800&q=80',
        },
        {
          name: 'Khăn',
          slug: 'khan',
          description: 'Khăn lụa tơ tằm in họa tiết độc bản và khăn choàng cashmere.',
          image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80',
        },
        {
          name: 'Trang sức',
          slug: 'trang-suc',
          description: 'Trang sức mạ vàng 18K và ngọc trai nước ngọt quý giá.',
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    {
      name: 'Giày dép',
      slug: 'giay-dep',
      description: 'Bộ sưu tập giày da thủ công, cao gót quyến rũ và sandal sang trọng.',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
      children: [
        {
          name: 'Giày',
          slug: 'giay',
          description: 'Giày Oxford, Derby da bóng và giày cao gót mũi nhọn quý phái.',
          image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
        },
        {
          name: 'Dép',
          slug: 'dep',
          description: 'Dép da thời trang cao cấp êm ái cho kỳ nghỉ dưỡng.',
          image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80',
        },
        {
          name: 'Sandal',
          slug: 'sandal',
          description: 'Sandal quai mảnh thanh thoát, tôn lên nét duyên dáng.',
          image: 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
  ];

  const categoryMap = new Map<string, string>(); // slug -> id

  for (let i = 0; i < categoryTree.length; i++) {
    const parentDef = categoryTree[i];
    const parent = await prisma.category.upsert({
      where: { slug: parentDef.slug },
      update: {
        name: parentDef.name,
        description: parentDef.description,
        image: parentDef.image,
        sortOrder: i,
        isFeatured: true,
      },
      create: {
        name: parentDef.name,
        slug: parentDef.slug,
        description: parentDef.description,
        image: parentDef.image,
        sortOrder: i,
        isFeatured: true,
      },
    });
    categoryMap.set(parentDef.slug, parent.id);

    if (parentDef.children) {
      for (let j = 0; j < parentDef.children.length; j++) {
        const childDef = parentDef.children[j];
        const child = await prisma.category.upsert({
          where: { slug: childDef.slug },
          update: {
            name: childDef.name,
            description: childDef.description,
            image: childDef.image,
            parentId: parent.id,
            sortOrder: j,
            isFeatured: true,
          },
          create: {
            name: childDef.name,
            slug: childDef.slug,
            description: childDef.description,
            image: childDef.image,
            parentId: parent.id,
            sortOrder: j,
            isFeatured: true,
          },
        });
        categoryMap.set(childDef.slug, child.id);
      }
    }
  }

  // ==========================================
  // 4. PRODUCTS (20+ LUXURY FASHION ITEMS)
  // ==========================================
  console.log('👗 Seeding 22 luxury products with images, variants, and attributes...');

  interface SampleProduct {
    name: string;
    slug: string;
    sku: string;
    categorySlug: string;
    price: number;
    compareAtPrice?: number;
    shortDescription: string;
    description: string;
    isFeatured?: boolean;
    isNew?: boolean;
    isBestseller?: boolean;
    brand: string;
    tags: string[];
    images: { url: string; alt: string; isPrimary?: boolean }[];
    variants?: { name: string; sku: string; color: string; size: string; price?: number; quantity: number }[];
    attributes: { name: string; value: string }[];
    quantity: number;
  }

  const sampleProducts: SampleProduct[] = [
    {
      name: 'Áo Sơ Mi Lụa Mulberry Tinh Khôi',
      slug: 'ao-so-mi-lua-mulberry-tinh-khoi',
      sku: 'LUXE-SHIRT-001',
      categorySlug: 'ao-so-mi',
      price: 1850000,
      compareAtPrice: 2200000,
      shortDescription: 'Áo sơ mi chế tác từ 100% lụa Mulberry tự nhiên bóng mượt, mang lại cảm giác nhẹ tênh và sang trọng.',
      description: `Áo sơ mi lụa Mulberry của LUXE SHOP là bản hòa ca giữa nét đẹp cổ điển và hơi thở đương đại.
      
Chất liệu lụa Mulberry thượng hạng dệt từ tơ tằm tuyển chọn sở hữu bề mặt óng ả tự nhiên, thoáng khí vào mùa hè và giữ ấm êm dịu vào mùa đông. Đường may giấu chỉ tinh xảo, cúc xà cừ khắc logo tinh tế tạo điểm nhấn quyền quý cho tổng thể trang phục.

Thích hợp mặc đi tiệc sang trọng, hội nghị ngoại giao hoặc kết hợp cùng chân váy bút chì cho phong thái nữ chủ tịch thanh lịch.`,
      isFeatured: true,
      isBestseller: true,
      brand: 'LUXE Atelier',
      tags: ['lụa', 'sơ mi cao cấp', 'công sở', 'mulberry'],
      quantity: 45,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
          alt: 'Áo Sơ Mi Lụa Mulberry mặt trước',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=1000&q=80',
          alt: 'Chi tiết chất liệu lụa Mulberry',
        },
        {
          url: 'https://images.unsplash.com/photo-1589902860314-e910697dea18?auto=format&fit=crop&w=1000&q=80',
          alt: 'Phối đồ áo sơ mi phong cách công sở',
        },
      ],
      variants: [
        { name: 'Trắng Ngà - S', sku: 'LUXE-SHIRT-001-WHT-S', color: 'Trắng Ngà', size: 'S', quantity: 15 },
        { name: 'Trắng Ngà - M', sku: 'LUXE-SHIRT-001-WHT-M', color: 'Trắng Ngà', size: 'M', quantity: 20 },
        { name: 'Xanh Champagne - M', sku: 'LUXE-SHIRT-001-CHP-M', color: 'Champagne', size: 'M', quantity: 10 },
      ],
      attributes: [
        { name: 'Chất liệu', value: '100% Lụa Mulberry' },
        { name: 'Xuất xứ', value: 'Việt Nam (Thủ công cao cấp)' },
        { name: 'Kiểu dáng', value: 'Regular Fit thoải mái' },
        { name: 'Hướng dẫn giặt', value: 'Giặt khô hoặc giặt tay bằng dầu gội nhẹ' },
      ],
    },
    {
      name: 'Áo Khoác Blazer Dạ Cashmere Sartorial',
      slug: 'ao-khoac-blazer-da-cashmere-sartorial',
      sku: 'LUXE-BLAZER-002',
      categorySlug: 'ao-khoac',
      price: 4950000,
      compareAtPrice: 5800000,
      shortDescription: 'Blazer dáng cấu trúc may đo chuẩn bespoke từ sợi cashmere lông cừu tự nhiên mềm mại.',
      description: `Thiết kế Blazer Cashmere đại diện cho đẳng cấp thời trang may đo xa xỉ. Sử dụng chất liệu len cashmere dệt kép cao cấp, form áo đứng dáng tôn trọn đường nét cơ thể nhưng vẫn tạo sự thoải mái tối đa khi cử động.
      
Lót trong lụa Bemberg mềm mát chống tích điện, ve áo peak lapel sắc nét và khuy sừng bò tự nhiên được nhập khẩu nguyên chiếc từ Ý.`,
      isFeatured: true,
      isNew: true,
      brand: 'LUXE Sartoria',
      tags: ['blazer', 'cashmere', 'dạ cao cấp', 'áo khoác nam nữ'],
      quantity: 25,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=80',
          alt: 'Blazer Dạ Cashmere phom dáng chuẩn',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
          alt: 'Cận cảnh đường may ve áo',
        },
      ],
      variants: [
        { name: 'Đen Tuyển - M', sku: 'LUXE-BLAZER-002-BLK-M', color: 'Đen Tuyển', size: 'M', quantity: 8 },
        { name: 'Đen Tuyển - L', sku: 'LUXE-BLAZER-002-BLK-L', color: 'Đen Tuyển', size: 'L', quantity: 10 },
        { name: 'Xám Than - L', sku: 'LUXE-BLAZER-002-GRY-L', color: 'Xám Than', size: 'L', quantity: 7 },
      ],
      attributes: [
        { name: 'Chất liệu', value: '70% Wool, 30% Cashmere' },
        { name: 'Lót trong', value: 'Lụa Bemberg 100%' },
        { name: 'Phong cách', value: 'Bespoke Tailoring' },
        { name: 'Xuất xứ', value: 'Ý gia công tại Việt Nam' },
      ],
    },
    {
      name: 'Áo Thun Cotton Supima Essential Classic',
      slug: 'ao-thun-cotton-supima-essential-classic',
      sku: 'LUXE-TEE-003',
      categorySlug: 'ao-thun',
      price: 650000,
      shortDescription: 'Áo thun cơ bản chế tác từ sợi bông Supima dệt mịn màng bền bỉ, không bai nhão qua thời gian.',
      description: `Mỗi quý ông và quý cô hiện đại đều cần một chiếc áo thun hoàn hảo. Sợi cotton Supima với cấu trúc sợi dài gấp đôi sợi thông thường mang đến bề mặt mềm mướt không đổ lông và màu sắc bền bỉ sau hàng trăm lần giặt.`,
      isBestseller: true,
      brand: 'LUXE Basics',
      tags: ['áo thun', 'supima', 'basic', 'tối giản'],
      quantity: 120,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
          alt: 'Áo Thun Supima màu trắng',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80',
          alt: 'Áo thun Supima đen',
        },
      ],
      variants: [
        { name: 'Trắng - S', sku: 'LUXE-TEE-003-WHT-S', color: 'Trắng', size: 'S', quantity: 30 },
        { name: 'Trắng - M', sku: 'LUXE-TEE-003-WHT-M', color: 'Trắng', size: 'M', quantity: 40 },
        { name: 'Đen - M', sku: 'LUXE-TEE-003-BLK-M', color: 'Đen', size: 'M', quantity: 30 },
        { name: 'Đen - L', sku: 'LUXE-TEE-003-BLK-L', color: 'Đen', size: 'L', quantity: 20 },
      ],
      attributes: [
        { name: 'Chất liệu', value: '100% Supima Cotton Mỹ' },
        { name: 'Định lượng', value: '240 GSM dày dặn tôn dáng' },
        { name: 'Xuất xứ', value: 'Việt Nam' },
      ],
    },
    {
      name: 'Áo Len Dệt Cashmere Cổ Lọ Haute',
      slug: 'ao-len-det-cashmere-co-lo-haute',
      sku: 'LUXE-KNIT-004',
      categorySlug: 'ao-len',
      price: 2650000,
      compareAtPrice: 3100000,
      shortDescription: 'Áo len cổ lọ dệt kim nguyên khối từ len Cashmere Mông Cổ siêu nhẹ và ấm áp tuyệt đối.',
      description: `Thiết kế len cổ lọ thanh lịch ôm khéo vòng cổ, giữ ấm trọn vẹn trong những ngày giao mùa. Công nghệ dệt kim 3D không đường may mang lại cảm giác thoải mái tự nhiên như làn da thứ hai.`,
      isFeatured: false,
      isNew: true,
      brand: 'LUXE Warmth',
      tags: ['áo len', 'cashmere', 'cổ lọ', 'mùa đông'],
      quantity: 35,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80',
          alt: 'Áo Len Dệt Cashmere Cổ Lọ',
          isPrimary: true,
        },
      ],
      variants: [
        { name: 'Be Nude - S', sku: 'LUXE-KNIT-004-BEI-S', color: 'Be Nude', size: 'S', quantity: 15 },
        { name: 'Be Nude - M', sku: 'LUXE-KNIT-004-BEI-M', color: 'Be Nude', size: 'M', quantity: 20 },
      ],
      attributes: [
        { name: 'Chất liệu', value: '100% Cashmere Mông Cổ' },
        { name: 'Kiểu cổ', value: 'Turtleneck (Cổ lọ)' },
        { name: 'Độ dày', value: '12 gauge dệt kim mịn' },
      ],
    },
    {
      name: 'Quần Tây May Đo Sartorial Wool Pleated',
      slug: 'quan-tay-may-do-sartorial-wool-pleated',
      sku: 'LUXE-PANT-005',
      categorySlug: 'quan-tay',
      price: 2150000,
      compareAtPrice: 2600000,
      shortDescription: 'Quần tây xếp ly đôi cổ điển với đai tăng giảm side-adjuster không cần thắt lưng.',
      description: `Dành cho những người am hiểu ngôn ngữ âu phục cổ điển. Quần tây Sartorial với 2 ly trước mềm mại, cạp cao tôn dáng và phần chỉnh đai sườn kim loại bóng mạ nickel sang trọng.`,
      isFeatured: true,
      isBestseller: true,
      brand: 'LUXE Sartoria',
      tags: ['quần tây', 'sartorial', 'wool', 'âu phục'],
      quantity: 50,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80',
          alt: 'Quần Tây May Đo Sartorial',
          isPrimary: true,
        },
      ],
      variants: [
        { name: 'Xám Khói - 30', sku: 'LUXE-PANT-005-GRY-30', color: 'Xám Khói', size: '30', quantity: 15 },
        { name: 'Xám Khói - 31', sku: 'LUXE-PANT-005-GRY-31', color: 'Xám Khói', size: '31', quantity: 20 },
        { name: 'Xám Khói - 32', sku: 'LUXE-PANT-005-GRY-32', color: 'Xám Khói', size: '32', quantity: 15 },
      ],
      attributes: [
        { name: 'Chất liệu', value: 'Len Lông Cừu Úc (Super 130s Wool)' },
        { name: 'Cạp quần', value: 'Cạp cao với Side-Adjusters' },
        { name: 'Lai quần', value: 'Xắn gấu lơ-vê 4.5cm' },
      ],
    },
    {
      name: 'Quần Jean Selvedge Denim Indigo Nhật Bản',
      slug: 'quan-jean-selvedge-denim-indigo-nhat-ban',
      sku: 'LUXE-JEAN-006',
      categorySlug: 'quan-jean',
      price: 2450000,
      shortDescription: 'Denim biên đỏ dệt bằng máy thoi con thoi cổ điển từ vùng Okayama Nhật Bản.',
      description: `Mỗi chiếc quần jeans Selvedge là một tác phẩm nghệ thuật có tuổi đời song hành cùng năm tháng. Chất vải raw denim 14oz đậm màu chàm tự nhiên sẽ fade màu theo phong cách riêng của người mặc.`,
      isFeatured: false,
      isNew: true,
      brand: 'LUXE Denim Lab',
      tags: ['jeans', 'selvedge', 'denim', 'okayama'],
      quantity: 40,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1000&q=80',
          alt: 'Quần Jean Selvedge Denim',
          isPrimary: true,
        },
      ],
      variants: [
        { name: 'Raw Indigo - 29', sku: 'LUXE-JEAN-006-IND-29', color: 'Indigo', size: '29', quantity: 10 },
        { name: 'Raw Indigo - 30', sku: 'LUXE-JEAN-006-IND-30', color: 'Indigo', size: '30', quantity: 15 },
        { name: 'Raw Indigo - 31', sku: 'LUXE-JEAN-006-IND-31', color: 'Indigo', size: '31', quantity: 15 },
      ],
      attributes: [
        { name: 'Chất liệu', value: '100% Cotton Selvedge Denim 14oz' },
        { name: 'Chi tiết', value: 'Biên đỏ (Red Selvedge Line)' },
        { name: 'Nguồn gốc vải', value: 'Kojima, Okayama, Nhật Bản' },
      ],
    },
    {
      name: 'Quần Short Linen Thoáng Mát Riviera',
      slug: 'quan-short-linen-thoang-mat-riviera',
      sku: 'LUXE-SHORT-007',
      categorySlug: 'quan-short',
      price: 950000,
      compareAtPrice: 1200000,
      shortDescription: 'Quần short vải lanh châu Âu mềm mại, thấm hút hoàn hảo cho những chuyến du ngoạn du thuyền.',
      description: `Được lấy cảm hứng từ lối sống nghỉ dưỡng tại bờ biển Địa Trung Hải French Riviera. Quần short linen mang lại sự thoải mái, nhẹ nhàng mà vẫn giữ được sự lịch thiệp tinh tế.`,
      brand: 'LUXE Resort',
      tags: ['short', 'linen', 'mùa hè', 'resort'],
      quantity: 60,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1000&q=80',
          alt: 'Quần Short Linen Riviera',
          isPrimary: true,
        },
      ],
      variants: [
        { name: 'Trắng Sữa - M', sku: 'LUXE-SHORT-007-CRM-M', color: 'Trắng Sữa', size: 'M', quantity: 30 },
        { name: 'Xanh Navy - L', sku: 'LUXE-SHORT-007-NVY-L', color: 'Xanh Navy', size: 'L', quantity: 30 },
      ],
      attributes: [
        { name: 'Chất liệu', value: '100% Pure European Linen' },
        { name: 'Thiết kế', value: 'Lưng chun co giãn có dây rút tinh xảo' },
      ],
    },
    {
      name: 'Đầm Lụa Dạ Hội Hoàng Gia Empress Gown',
      slug: 'dam-lua-da-hoi-hoang-gia-empress-gown',
      sku: 'LUXE-DRESS-008',
      categorySlug: 'dam',
      price: 6800000,
      compareAtPrice: 8500000,
      shortDescription: 'Tuyệt tác đầm dạ hội lụa satin tơ tằm óng ả, cúp ngực tôn đường cong kiêu sa trong đêm tiệc.',
      description: `Đầm dạ hội Empress Gown là đỉnh cao thời trang haute couture dạ hội. Từng đường cắt rập chuẩn xác ôm sát eo thon và buông rủ thướt tha chạm gót. Khi ánh đèn dạ tiệc chiếu vào, lớp lụa phát sáng huyền ảo đưa nàng thành tâm điểm rực rỡ nhất.`,
      isFeatured: true,
      isBestseller: true,
      brand: 'LUXE Haute Couture',
      tags: ['đầm dạ hội', 'satin', 'lụa tơ tằm', 'tiệc tối'],
      quantity: 18,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80',
          alt: 'Đầm Lụa Dạ Hội Hoàng Gia',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80',
          alt: 'Chi tiết phía sau đầm dạ hội',
        },
      ],
      variants: [
        { name: 'Đỏ Bordeaux - S', sku: 'LUXE-DRESS-008-RED-S', color: 'Đỏ Bordeaux', size: 'S', quantity: 8 },
        { name: 'Đỏ Bordeaux - M', sku: 'LUXE-DRESS-008-RED-M', color: 'Đỏ Bordeaux', size: 'M', quantity: 10 },
      ],
      attributes: [
        { name: 'Chất liệu', value: 'Heavy Silk Satin 100%' },
        { name: 'Khóa kéo', value: 'Khóa giấu YKK mạ vàng êm ái' },
        { name: 'Phong cách', value: 'Haute Gala Glamour' },
      ],
    },
    {
      name: 'Chân Váy Xếp Ly Ánh Kim Metallic Pleated',
      slug: 'chan-vay-xep-ly-anh-kim-metallic-pleated',
      sku: 'LUXE-SKIRT-009',
      categorySlug: 'chan-vay',
      price: 1650000,
      compareAtPrice: 1950000,
      shortDescription: 'Chân váy dập ly vĩnh viễn với hiệu ứng ánh kim lấp lánh nhẹ nhàng theo từng bước chuyển động.',
      description: `Thiết kế chân váy midi xếp ly là bản giao hưởng của sự chuyển động. Chất vải nhập khẩu từ Hàn Quốc xử lý công nghệ dập ly nhiệt định hình sắc nét, bay bổng nhẹ nhàng theo từng nhịp bước.`,
      isNew: true,
      brand: 'LUXE Femme',
      tags: ['chân váy', 'xếp ly', 'midi', 'nữ tính'],
      quantity: 40,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=1000&q=80',
          alt: 'Chân Váy Xếp Ly Ánh Kim',
          isPrimary: true,
        },
      ],
      variants: [
        { name: 'Vàng Champagne - S', sku: 'LUXE-SKIRT-009-GLD-S', color: 'Vàng Champagne', size: 'S', quantity: 20 },
        { name: 'Vàng Champagne - M', sku: 'LUXE-SKIRT-009-GLD-M', color: 'Vàng Champagne', size: 'M', quantity: 20 },
      ],
      attributes: [
        { name: 'Chất liệu', value: 'Polyester dệt sợi tơ ánh kim cao cấp' },
        { name: 'Độ dài', value: 'Dáng lửng Midi qua gối' },
      ],
    },
    {
      name: 'Đầm Maxi Họa Tiết Hoa Vườn Địa Đàng Floral',
      slug: 'dam-maxi-hoa-tiet-hoa-vuon-dia-dang-floral',
      sku: 'LUXE-DRESS-010',
      categorySlug: 'dam',
      price: 3200000,
      shortDescription: 'Đầm maxi bay bổng in họa tiết hoa vườn địa đàng độc quyền trên nền voan tơ cao cấp.',
      description: `Mang cả khu vườn thơ mộng của miền Nam nước Pháp vào chiếc đầm maxi. Chất liệu voan tơ nhiều lớp bồng bềnh mang lại nét đẹp kiêu sa lãng mạn cho các kỳ nghỉ dưỡng biển hay tiệc trà chiều ngoài trời.`,
      isFeatured: true,
      brand: 'LUXE Resort',
      tags: ['maxi', 'hoa', 'nghỉ dưỡng', 'nữ tính'],
      quantity: 30,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80',
          alt: 'Đầm Maxi Họa Tiết Hoa',
          isPrimary: true,
        },
      ],
      variants: [
        { name: 'Họa Tiết Hoa - Free Size', sku: 'LUXE-DRESS-010-FLR-FS', color: 'Floral Pastel', size: 'Free Size', quantity: 30 },
      ],
      attributes: [
        { name: 'Chất liệu', value: 'Chiffon Tơ Tằm In Chuyển Nhiệt' },
        { name: 'Lót trong', value: 'Vải lót habutai lụa kháng khuẩn' },
      ],
    },
    {
      name: 'Túi Xách Da Bò Thuộc Thảo Mộc Heritage Tote',
      slug: 'tui-xach-da-bo-thuoc-thao-moc-heritage-tote',
      sku: 'LUXE-BAG-011',
      categorySlug: 'tui-xach',
      price: 7500000,
      compareAtPrice: 8900000,
      shortDescription: 'Túi tote da bò Vachetta thủ công Tuscany bền bỉ, càng dùng lâu da càng bóng đẹp patina.',
      description: `Chế tác thủ công bởi các nghệ nhân với hơn 20 năm tuổi nghề. Từng đường kim mũi chỉ may tay yên ngựa (saddle stitch) bằng chỉ sáp Pháp. Da thuộc thảo mộc tự nhiên thơm ngát hương gỗ sồi và an toàn cho sức khỏe.`,
      isFeatured: true,
      isBestseller: true,
      brand: 'LUXE Cuir',
      tags: ['túi xách', 'da bò', 'thủ công', 'tote', 'heritage'],
      quantity: 15,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
          alt: 'Túi Xách Da Bò Heritage Tote',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80',
          alt: 'Chi tiết tay cầm da may thủ công',
        },
      ],
      variants: [
        { name: 'Nâu Cognac', sku: 'LUXE-BAG-011-BRN', color: 'Nâu Cognac', size: 'One Size', quantity: 15 },
      ],
      attributes: [
        { name: 'Chất liệu', value: 'Da bò thuộc thảo mộc Tuscany (Ý)' },
        { name: 'Kích thước', value: '38 x 28 x 14 cm (Vừa laptop 15 inch)' },
        { name: 'Phụ kiện', value: 'Đồng thau nguyên khối đúc tay' },
      ],
    },
    {
      name: 'Túi Kẹp Nách Da Cá Sấu Dập Nổi Croco Baguette',
      slug: 'tui-kep-nach-da-ca-sau-dap-noi-croco-baguette',
      sku: 'LUXE-BAG-012',
      categorySlug: 'tui-xach',
      price: 4200000,
      compareAtPrice: 4800000,
      shortDescription: 'Túi baguette biểu tượng thập niên 90 với chất liệu da dập vân cá sấu thời thượng sang chảnh.',
      description: `Phụ kiện không thể thiếu của các quý cô sành điệu. Chiếc túi baguette kẹp nách nhỏ gọn nhưng chứa trọn những vật dụng thiết yếu như điện thoại, son môi và ví tiền nhỏ. Khóa bấm kim loại mạ vàng 24K chải xước cực kỳ bắt mắt.`,
      isNew: true,
      brand: 'LUXE Cuir',
      tags: ['túi baguette', 'da dập vân', 'thời trang nữ'],
      quantity: 25,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
          alt: 'Túi Kẹp Nách Da Cá Sấu Croco Baguette',
          isPrimary: true,
        },
      ],
      variants: [
        { name: 'Đen Bóng', sku: 'LUXE-BAG-012-BLK', color: 'Đen Bóng', size: 'One Size', quantity: 15 },
        { name: 'Xanh Emerald', sku: 'LUXE-BAG-012-EMR', color: 'Xanh Emerald', size: 'One Size', quantity: 10 },
      ],
      attributes: [
        { name: 'Chất liệu', value: 'Da thật dập nổi da cá sấu' },
        { name: 'Kích thước', value: '26 x 13 x 6 cm' },
      ],
    },
    {
      name: 'Mũ Cói Panama Dệt Tay Ecuadore Fedora',
      slug: 'mu-coi-panama-det-tay-ecuadore-fedora',
      sku: 'LUXE-HAT-013',
      categorySlug: 'mu',
      price: 1850000,
      shortDescription: 'Mũ cói Panama chính gốc Montecristi dệt từ sợi lá cọ Toquilla siêu nhẹ và thoáng mát.',
      description: `Một biểu tượng vĩnh cửu của giới quý tộc châu Âu mỗi độ vào hè. Chiếc nón cói Panama dệt tay kỳ công hàng tuần lễ, đai ruy băng lụa đen tạo điểm nhấn tương phản lịch thiệp.`,
      brand: 'LUXE Heritage',
      tags: ['mũ cói', 'panama', 'fedora', 'mùa hè'],
      quantity: 30,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&w=1000&q=80',
          alt: 'Mũ Cói Panama Ecuadore',
          isPrimary: true,
        },
      ],
      variants: [
        { name: 'Màu Cói Tự Nhiên - M (57cm)', sku: 'LUXE-HAT-013-NAT-M', color: 'Tự nhiên', size: 'M (57cm)', quantity: 15 },
        { name: 'Màu Cói Tự Nhiên - L (59cm)', sku: 'LUXE-HAT-013-NAT-L', color: 'Tự nhiên', size: 'L (59cm)', quantity: 15 },
      ],
      attributes: [
        { name: 'Chất liệu', value: '100% Sợi cọ Toquilla Ecuador' },
        { name: 'Độ rộng vành', value: '6.5 cm cản nắng hoàn hảo' },
      ],
    },
    {
      name: 'Khăn Lụa Tơ Tằm Họa Tiết Hoàng Gia Silk Twill',
      slug: 'khan-lua-to-tam-hoa-tiet-hoang-gia-silk-twill',
      sku: 'LUXE-SCARF-014',
      categorySlug: 'khan',
      price: 1450000,
      compareAtPrice: 1750000,
      shortDescription: 'Khăn vuông 90x90cm lụa dệt chéo twill dày dặn, viền cuốn tay thủ công tinh xảo.',
      description: `Tác phẩm nghệ thuật trên nền lụa thượng hạng. Họa tiết hoa văn baroque hoàng gia vẽ tay độc quyền, viền khăn cuộn tròn và khâu tay hoàn toàn bởi thợ thủ công lành nghề. Khăn có thể thắt cổ, buộc tóc hoặc trang trí quai túi sang chảnh.`,
      isFeatured: true,
      brand: 'LUXE Atelier',
      tags: ['khăn lụa', 'silk twill', 'phụ kiện', 'quà tặng'],
      quantity: 50,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=80',
          alt: 'Khăn Lụa Tơ Tằm Hoàng Gia',
          isPrimary: true,
        },
      ],
      variants: [
        { name: 'Họa Tiết Baroque - 90x90', sku: 'LUXE-SCARF-014-BRQ', color: 'Vàng & Xanh Navy', size: '90x90cm', quantity: 50 },
      ],
      attributes: [
        { name: 'Chất liệu', value: '100% Silk Twill 16 momme' },
        { name: 'Kích thước', value: '90 cm x 90 cm' },
        { name: 'Viền khăn', value: 'Hand-rolled hem (Cuốn tay thủ công)' },
      ],
    },
    {
      name: 'Vòng Cổ Ngọc Trai Nuôi Nước Ngọt Quý Phái',
      slug: 'vong-co-ngoc-trai-nuoi-nuoc-nghot-quy-phai',
      sku: 'LUXE-JEWEL-015',
      categorySlug: 'trang-suc',
      price: 3800000,
      compareAtPrice: 4500000,
      shortDescription: 'Chuỗi vòng ngọc trai ánh xà cừ tự nhiên chọn lọc kích thước 8-9mm kết hợp khóa vàng 18K.',
      description: `Ngọc trai là viên ngọc của đại dương biểu trưng cho vẻ đẹp thuần khiết và thanh quý. Từng viên ngọc trai tròn đều, ánh xà cừ óng ả dày dặn phản chiếu ánh sáng lung linh khi đeo lên cổ.`,
      isFeatured: true,
      isBestseller: true,
      brand: 'LUXE Jewelry',
      tags: ['trang sức', 'ngọc trai', 'vòng cổ', 'quà tặng quý phái'],
      quantity: 20,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
          alt: 'Vòng Cổ Ngọc Trai Quý Phái',
          isPrimary: true,
        },
      ],
      variants: [
        { name: 'Trắng Ánh Hồng - 42cm', sku: 'LUXE-JEWEL-015-WHT-42', color: 'Trắng Ánh Hồng', size: '42cm', quantity: 20 },
      ],
      attributes: [
        { name: 'Loại ngọc', value: 'Ngọc trai nước ngọt tự nhiên loại AAA' },
        { name: 'Khóa dây', value: 'Vàng 18K Yellow Gold đính đá sapphire' },
      ],
    },
    {
      name: 'Giày Tây Oxford Da Bê Pháp Goodyear Welted',
      slug: 'giay-tay-oxford-da-be-phap-goodyear-welted',
      sku: 'LUXE-SHOE-016',
      categorySlug: 'giay',
      price: 5900000,
      compareAtPrice: 6900000,
      shortDescription: 'Giày Oxford đóng đế Goodyear gù cong eo fiddleback chuẩn thủ công đỉnh cao thế giới.',
      description: `Chuẩn mực giày da nam dành cho doanh nhân thành đạt. Da bê Pháp box calf mịn màng như lụa, kỹ thuật khâu Goodyear gầm đế cho phép thay đế dùng trọn đời. Lót trong da bò hút ẩm tự nhiên đem lại sự êm ái cả ngày dài.`,
      isFeatured: true,
      isBestseller: true,
      brand: 'LUXE Calzolaio',
      tags: ['giày tây', 'oxford', 'goodyear welted', 'da bê'],
      quantity: 25,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=80',
          alt: 'Giày Tây Oxford Da Bê Goodyear',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=80',
          alt: 'Chi tiết đế da thuộc thảo mộc',
        },
      ],
      variants: [
        { name: 'Đen Bóng - 40', sku: 'LUXE-SHOE-016-BLK-40', color: 'Đen Bóng', size: '40', quantity: 7 },
        { name: 'Đen Bóng - 41', sku: 'LUXE-SHOE-016-BLK-41', color: 'Đen Bóng', size: '41', quantity: 10 },
        { name: 'Đen Bóng - 42', sku: 'LUXE-SHOE-016-BLK-42', color: 'Đen Bóng', size: '42', quantity: 8 },
      ],
      attributes: [
        { name: 'Chất liệu da', value: 'Da bê Box Calf thuộc tại Tannery d’Annonay (Pháp)' },
        { name: 'Cấu trúc đế', value: 'Goodyear Welted 360 độ' },
        { name: 'Đế ngoài', value: 'Đế da thuộc J. Rendenbach (Đức)' },
      ],
    },
    {
      name: 'Giày Cao Gót Stiletto Lụa Đính Đá Pha Lê Cổ Tích',
      slug: 'giay-cao-got-stiletto-lua-dinh-da-pha-le-co-tich',
      sku: 'LUXE-SHOE-017',
      categorySlug: 'giay',
      price: 4500000,
      compareAtPrice: 5200000,
      shortDescription: 'Giày cao gót 9cm bọc lụa satin đính vương miện pha lê Swarovski lấp lánh như nàng Lọ Lem.',
      description: `Đôi giày ước mơ của mọi cô dâu và quý cô trong những đêm dạ tiệc quan trọng. Mũi nhọn thanh tú tôn dáng đôi chân, gót mảnh mạ vàng vững chãi và đệm lót êm ái chống mỏi vượt trội.`,
      isFeatured: true,
      brand: 'LUXE Scarpe',
      tags: ['giày cao gót', 'stiletto', 'pha lê', 'tiệc cưới'],
      quantity: 30,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=80',
          alt: 'Giày Cao Gót Stiletto Pha Lê',
          isPrimary: true,
        },
      ],
      variants: [
        { name: 'Bạc Ánh Kim - 36', sku: 'LUXE-SHOE-017-SLV-36', color: 'Bạc Ánh Kim', size: '36', quantity: 10 },
        { name: 'Bạc Ánh Kim - 37', sku: 'LUXE-SHOE-017-SLV-37', color: 'Bạc Ánh Kim', size: '37', quantity: 12 },
        { name: 'Bạc Ánh Kim - 38', sku: 'LUXE-SHOE-017-SLV-38', color: 'Bạc Ánh Kim', size: '38', quantity: 8 },
      ],
      attributes: [
        { name: 'Chất liệu ngoài', value: 'Satin lụa dệt kim tuyến' },
        { name: 'Độ cao gót', value: '9 cm (3.5 inches)' },
        { name: 'Trang trí', value: 'Pha lê Swarovski nhập khẩu Áo' },
      ],
    },
    {
      name: 'Sandal Quai Mảnh Quý Phái Strappy Heeled Sandal',
      slug: 'sandal-quai-manh-quy-phai-strappy-heeled-sandal',
      sku: 'LUXE-SANDAL-018',
      categorySlug: 'sandal',
      price: 2850000,
      shortDescription: 'Sandal quai mảnh da bóng màu vàng champagne tôn đôi bàn chân thanh mảnh kiêu kỳ.',
      description: `Thiết kế tối giản vượt thời gian. Từng sợi quai mảnh ôm khéo cổ chân và mu bàn chân, gót trụ vừa vặn 6cm giúp bạn sải bước tự tin suốt cả ngày tiệc tùng.`,
      isNew: true,
      brand: 'LUXE Scarpe',
      tags: ['sandal', 'quai mảnh', 'cao gót', 'nữ tính'],
      quantity: 35,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=1000&q=80',
          alt: 'Sandal Quai Mảnh Strappy',
          isPrimary: true,
        },
      ],
      variants: [
        { name: 'Champagne Gold - 36', sku: 'LUXE-SANDAL-018-GLD-36', color: 'Champagne Gold', size: '36', quantity: 10 },
        { name: 'Champagne Gold - 37', sku: 'LUXE-SANDAL-018-GLD-37', color: 'Champagne Gold', size: '37', quantity: 15 },
        { name: 'Champagne Gold - 38', sku: 'LUXE-SANDAL-018-GLD-38', color: 'Champagne Gold', size: '38', quantity: 10 },
      ],
      attributes: [
        { name: 'Chất liệu', value: 'Da cừu Metallic Nappa mềm' },
        { name: 'Độ cao', value: '6 cm' },
      ],
    },
    {
      name: 'Dép Da Bò Thảo Mộc Đúc Liền Mules Slides',
      slug: 'dep-da-bo-thao-moc-duc-lien-mules-slides',
      sku: 'LUXE-SLIDE-019',
      categorySlug: 'dep',
      price: 1550000,
      compareAtPrice: 1800000,
      shortDescription: 'Dép mule da bò nguyên tấm êm ái, đế lót lòng thuyền theo khuôn bàn chân chỉnh hình.',
      description: `Sự kết hợp hoàn hảo giữa tính thư giãn nghỉ dưỡng và thời trang cao cấp. Phần quai dép bản rộng bằng da bò sáp tự nhiên tạo cảm giác ôm chân êm ái tuyệt đối.`,
      brand: 'LUXE Resort',
      tags: ['dép da', 'mule', 'slides', 'nghỉ dưỡng'],
      quantity: 40,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1000&q=80',
          alt: 'Dép Da Bò Mules Slides',
          isPrimary: true,
        },
      ],
      variants: [
        { name: 'Nâu Bò - 40', sku: 'LUXE-SLIDE-019-BRN-40', color: 'Nâu Bò', size: '40', quantity: 12 },
        { name: 'Nâu Bò - 41', sku: 'LUXE-SLIDE-019-BRN-41', color: 'Nâu Bò', size: '41', quantity: 15 },
        { name: 'Nâu Bò - 42', sku: 'LUXE-SLIDE-019-BRN-42', color: 'Nâu Bò', size: '42', quantity: 13 },
      ],
      attributes: [
        { name: 'Chất liệu quai', value: 'Da bò Crazy Horse tự nhiên' },
        { name: 'Đế lót', value: 'Bần gỗ ép tự nhiên chống ẩm mốc' },
      ],
    },
    {
      name: 'Áo Khoác Măng Tô Dạ Dáng Dài Trench Coat',
      slug: 'ao-khoac-mang-to-da-dang-dai-trench-coat',
      sku: 'LUXE-COAT-020',
      categorySlug: 'ao-khoac',
      price: 5600000,
      compareAtPrice: 6500000,
      shortDescription: 'Măng tô 2 hàng cúc phom dài thướt tha, chất liệu gabardine chống thấm nước cao cấp.',
      description: `Mẫu áo măng tô trường tồn cùng thời gian. Được thiết kế với đầy đủ các chi tiết kinh điển: đai eo thắt khóa sừng, cầu vai phong trần và vạt áo chống bão sau lưng. Giữ ấm hoàn hảo trong những ngày gió mùa se lạnh.`,
      isFeatured: true,
      isBestseller: true,
      brand: 'LUXE Heritage',
      tags: ['măng tô', 'trench coat', 'áo khoác dáng dài', 'áo dạ'],
      quantity: 25,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80',
          alt: 'Áo Khoác Măng Tô Trench Coat',
          isPrimary: true,
        },
      ],
      variants: [
        { name: 'Vàng Khaki - M', sku: 'LUXE-COAT-020-KHK-M', color: 'Vàng Khaki', size: 'M', quantity: 12 },
        { name: 'Vàng Khaki - L', sku: 'LUXE-COAT-020-KHK-L', color: 'Vàng Khaki', size: 'L', quantity: 13 },
      ],
      attributes: [
        { name: 'Chất liệu ngoài', value: '100% Cotton Gabardine dệt mật độ cao' },
        { name: 'Khả năng chống thấm', value: 'Chống bám nước và cản gió tuyệt đối' },
        { name: 'Lót áo', value: 'Kẻ sọc tartan sang trọng' },
      ],
    },
    {
      name: 'Áo Sơ Mi Cổ Trụ Linen Ý Thư Thái',
      slug: 'ao-so-mi-co-tru-linen-y-thu-thai',
      sku: 'LUXE-SHIRT-021',
      categorySlug: 'ao-so-mi',
      price: 1350000,
      shortDescription: 'Áo sơ mi cổ tàu Mandarin từ sợi linen dệt thưa thoáng khí, mang lại phong thái phong trần lãng tử.',
      description: `Trang phục lý tưởng cho những ngày nghỉ cuối tuần thảnh thơi hay những buổi dạo phố chiều hè. Cổ trụ hiện đại, vạt áo bo tròn vừa vặn để mặc thả tự nhiên cùng quần short hoặc quần âu cạp cao.`,
      isNew: true,
      brand: 'LUXE Resort',
      tags: ['sơ mi', 'linen', 'cổ tàu', 'nam nữ'],
      quantity: 50,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1000&q=80',
          alt: 'Áo Sơ Mi Cổ Trụ Linen Ý',
          isPrimary: true,
        },
      ],
      variants: [
        { name: 'Trắng Sữa - M', sku: 'LUXE-SHIRT-021-WHT-M', color: 'Trắng Sữa', size: 'M', quantity: 25 },
        { name: 'Xanh Da Trời - L', sku: 'LUXE-SHIRT-021-BLU-L', color: 'Xanh Da Trời', size: 'L', quantity: 25 },
      ],
      attributes: [
        { name: 'Chất liệu', value: '100% Italian Linen' },
        { name: 'Kiểu cổ', value: 'Mandarin Collar (Cổ tàu)' },
      ],
    },
    {
      name: 'Đầm Lụa Slip Dress Cut-out Lưng Quyến Rũ',
      slug: 'dam-lua-slip-dress-cut-out-lung-quyen-ru',
      sku: 'LUXE-DRESS-022',
      categorySlug: 'dam',
      price: 2450000,
      compareAtPrice: 2900000,
      shortDescription: 'Đầm hai dây lụa satin bóng mềm ôm lượn theo dáng vóc với khoảng hở lưng chữ V quyến rũ kiêu kỳ.',
      description: `Biểu tượng của nét gợi cảm tinh tế không phô trương. Kỹ thuật cắt vải xéo bias-cut giúp chiếc váy ôm sát đường cong cơ thể một cách tự nhiên mà không hề bó thít, tạo sự uyển chuyển tựa dòng nước khi di chuyển.`,
      isFeatured: true,
      isBestseller: true,
      brand: 'LUXE Femme',
      tags: ['slip dress', 'hai dây', 'lụa', 'dạ tiệc'],
      quantity: 35,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80',
          alt: 'Đầm Lụa Slip Dress Cut-out Lưng',
          isPrimary: true,
        },
      ],
      variants: [
        { name: 'Đen Huyền Bí - S', sku: 'LUXE-DRESS-022-BLK-S', color: 'Đen Huyền Bí', size: 'S', quantity: 15 },
        { name: 'Đen Huyền Bí - M', sku: 'LUXE-DRESS-022-BLK-M', color: 'Đen Huyền Bí', size: 'M', quantity: 20 },
      ],
      attributes: [
        { name: 'Chất liệu', value: '95% Lụa Silk, 5% Spandex co giãn' },
        { name: 'Kỹ thuật may', value: 'Bias-cut ôm phom chuẩn mực' },
      ],
    },
  ];

  for (const prod of sampleProducts) {
    const categoryId = categoryMap.get(prod.categorySlug);

    const product = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        sku: prod.sku,
        shortDescription: prod.shortDescription,
        description: prod.description,
        price: prod.price,
        compareAtPrice: prod.compareAtPrice ?? null,
        quantity: prod.quantity,
        isFeatured: prod.isFeatured ?? false,
        isNew: prod.isNew ?? false,
        isBestseller: prod.isBestseller ?? false,
        brand: prod.brand,
        tags: prod.tags,
        metaTitle: `${prod.name} | LUXE SHOP`,
        metaDescription: prod.shortDescription,
      },
      create: {
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        shortDescription: prod.shortDescription,
        description: prod.description,
        price: prod.price,
        compareAtPrice: prod.compareAtPrice ?? null,
        quantity: prod.quantity,
        isFeatured: prod.isFeatured ?? false,
        isNew: prod.isNew ?? false,
        isBestseller: prod.isBestseller ?? false,
        brand: prod.brand,
        tags: prod.tags,
        metaTitle: `${prod.name} | LUXE SHOP`,
        metaDescription: prod.shortDescription,
      },
    });

    // Link category
    if (categoryId) {
      await prisma.productCategory.upsert({
        where: {
          productId_categoryId: {
            productId: product.id,
            categoryId,
          },
        },
        update: {},
        create: {
          productId: product.id,
          categoryId,
        },
      });
    }

    // Images
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    for (let idx = 0; idx < prod.images.length; idx++) {
      const img = prod.images[idx];
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: img.url,
          alt: img.alt,
          sortOrder: idx,
          isPrimary: img.isPrimary ?? idx === 0,
        },
      });
    }

    // Variants
    if (prod.variants) {
      for (let vIdx = 0; vIdx < prod.variants.length; vIdx++) {
        const v = prod.variants[vIdx];
        await prisma.productVariant.upsert({
          where: { sku: v.sku },
          update: {
            name: v.name,
            color: v.color,
            size: v.size,
            price: v.price ?? null,
            quantity: v.quantity,
            sortOrder: vIdx,
          },
          create: {
            productId: product.id,
            name: v.name,
            sku: v.sku,
            color: v.color,
            size: v.size,
            price: v.price ?? null,
            quantity: v.quantity,
            sortOrder: vIdx,
          },
        });
      }
    }

    // Attributes
    await prisma.productAttribute.deleteMany({ where: { productId: product.id } });
    for (let aIdx = 0; aIdx < prod.attributes.length; aIdx++) {
      const attr = prod.attributes[aIdx];
      await prisma.productAttribute.create({
        data: {
          productId: product.id,
          name: attr.name,
          value: attr.value,
          sortOrder: aIdx,
        },
      });
    }
  }

  // ==========================================
  // 5. HERO BANNERS
  // ==========================================
  console.log('🖼️ Seeding hero banners...');

  const sampleBanners = [
    {
      title: 'BỘ SƯU TẬP THU ĐÔNG 2024',
      subtitle: 'Đẳng cấp xa hoa định hình phong cách thượng lưu',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80',
      mobileImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=750&q=80',
      link: '/bo-suu-tap/thu-dong',
      buttonText: 'Khám Phá Ngay',
      position: 'hero',
      sortOrder: 0,
      isActive: true,
    },
    {
      title: 'NGHỆ THUẬT MAY ĐO BESPOKE',
      subtitle: 'Tỉ mỉ trong từng đường kim mũi chỉ từ bàn tay nghệ nhân',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80',
      mobileImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=750&q=80',
      link: '/danh-muc/ao-khoac',
      buttonText: 'Xem Bộ Sưu Tập',
      position: 'hero',
      sortOrder: 1,
      isActive: true,
    },
    {
      title: 'PHỤ KIỆN DA THỦ CÔNG TUSCANY',
      subtitle: 'Chế tác từ chất liệu da thuộc tự nhiên cao cấp bậc nhất thế giới',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1920&q=80',
      mobileImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=750&q=80',
      link: '/danh-muc/phu-kien',
      buttonText: 'Mua Ngay',
      position: 'hero',
      sortOrder: 2,
      isActive: true,
    },
  ];

  await prisma.banner.deleteMany({ where: { position: 'hero' } });
  for (const b of sampleBanners) {
    await prisma.banner.create({
      data: b,
    });
  }

  // ==========================================
  // 6. STORE SETTINGS
  // ==========================================
  console.log('⚙️ Seeding store settings...');

  const settings = [
    { key: 'store_name', value: 'LUXE SHOP', group: 'general', label: 'Tên cửa hàng', type: 'string' },
    { key: 'store_description', value: 'Thời trang cao cấp & phong cách sống', group: 'general', label: 'Mô tả cửa hàng', type: 'string' },
    { key: 'store_email', value: 'contact@luxeshop.vn', group: 'general', label: 'Email liên hệ', type: 'string' },
    { key: 'store_phone', value: '1900 8888', group: 'general', label: 'Hotline hỗ trợ', type: 'string' },
    { key: 'store_address', value: '88 Đồng Khởi, Bến Nghé, Quận 1, TP. Hồ Chí Minh', group: 'general', label: 'Địa chỉ cửa hàng', type: 'string' },
    { key: 'social_facebook', value: 'https://facebook.com/luxeshop.vn', group: 'social', label: 'Trang Facebook', type: 'string' },
    { key: 'social_instagram', value: 'https://instagram.com/luxeshop.vn', group: 'social', label: 'Trang Instagram', type: 'string' },
    { key: 'announcement_text', value: '✨ Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500,000₫ | Giao hàng hoả tốc 2H tại TP.HCM', group: 'announcement', label: 'Thanh thông báo đầu trang', type: 'string' },
    { key: 'shipping_free_above', value: '500000', group: 'shipping', label: 'Mức miễn phí vận chuyển', type: 'number' },
    { key: 'currency', value: 'VND', group: 'general', label: 'Đơn vị tiền tệ', type: 'string' },
  ];

  for (const s of settings) {
    await prisma.storeSetting.upsert({
      where: { key: s.key },
      update: {
        value: s.value,
        group: s.group,
        label: s.label,
        type: s.type,
      },
      create: s,
    });
  }

  // ==========================================
  // 7. SHIPPING METHODS
  // ==========================================
  console.log('🚚 Seeding shipping methods...');

  const shippingMethods = [
    {
      name: 'Giao hàng tiêu chuẩn',
      description: 'Giao hàng an toàn và tiết kiệm trên toàn quốc',
      baseFee: 30000,
      freeAbove: 500000,
      estimatedDays: '3 - 5 ngày làm việc',
      sortOrder: 0,
      isActive: true,
    },
    {
      name: 'Giao hàng nhanh',
      description: 'Giao nhanh hỏa tốc đảm bảo đúng hẹn',
      baseFee: 50000,
      freeAbove: 1000000,
      estimatedDays: '1 - 2 ngày làm việc',
      sortOrder: 1,
      isActive: true,
    },
  ];

  for (const sm of shippingMethods) {
    const existing = await prisma.shippingMethod.findFirst({
      where: { name: sm.name },
    });
    if (existing) {
      await prisma.shippingMethod.update({
        where: { id: existing.id },
        data: sm,
      });
    } else {
      await prisma.shippingMethod.create({
        data: sm,
      });
    }
  }

  // ==========================================
  // 8. COUPONS / PROMOTIONS
  // ==========================================
  console.log('🎟️ Seeding promotional coupons...');

  const now = new Date();
  const futureYear = new Date(now.getFullYear() + 1, 11, 31);

  const coupons = [
    {
      code: 'WELCOME10',
      name: 'Ưu đãi chào mừng thành viên mới',
      description: 'Giảm 10% tối đa 100,000₫ cho đơn hàng đầu tiên từ 200,000₫',
      type: 'percentage',
      value: 10,
      minOrderAmount: 200000,
      maxDiscount: 100000,
      usageLimit: 10000,
      usageLimitPerUser: 1,
      startDate: now,
      endDate: futureYear,
      isActive: true,
    },
    {
      code: 'FREESHIP',
      name: 'Miễn phí giao hàng toàn quốc',
      description: 'Miễn 100% phí giao hàng cho đơn hàng từ 300,000₫',
      type: 'free_shipping',
      value: 0,
      minOrderAmount: 300000,
      maxDiscount: 50000,
      usageLimit: 5000,
      usageLimitPerUser: 3,
      startDate: now,
      endDate: futureYear,
      isActive: true,
    },
    {
      code: 'LUXE50K',
      name: 'Tri ân khách hàng thân thiết 50K',
      description: 'Giảm ngay 50,000₫ trực tiếp cho đơn hàng từ 500,000₫',
      type: 'fixed_amount',
      value: 50000,
      minOrderAmount: 500000,
      maxDiscount: 50000,
      usageLimit: 2000,
      usageLimitPerUser: 2,
      startDate: now,
      endDate: futureYear,
      isActive: true,
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }

  // ==========================================
  // 9. BLOG / ARTICLES & CATEGORIES
  // ==========================================
  console.log('📰 Seeding blog articles and categories...');

  const articleCategories = [
    {
      name: 'Xu hướng thời trang',
      slug: 'xu-huong-thoi-trang',
      description: 'Cập nhật những xu hướng thời trang thịnh hành nhất trên sàn diễn quốc tế.',
      sortOrder: 0,
    },
    {
      name: 'Phong cách sống',
      slug: 'phong-cach-song',
      description: 'Nghệ thuật sống thượng lưu, trải nghiệm tinh hoa và gu thẩm mỹ thanh lịch.',
      sortOrder: 1,
    },
    {
      name: 'Cẩm nang phối đồ',
      slug: 'cam-nang-phoi-do',
      description: 'Bí quyết mix & match trang phục tôn vinh phong thái cá nhân.',
      sortOrder: 2,
    },
  ];

  const artCatMap = new Map<string, string>();
  for (const ac of articleCategories) {
    const artCat = await prisma.articleCategory.upsert({
      where: { slug: ac.slug },
      update: ac,
      create: ac,
    });
    artCatMap.set(ac.slug, artCat.id);
  }

  const articles = [
    {
      title: 'Bí Quyết Lựa Chọn Trang Phục Lụa Tơ Tằm Tự Nhiên Thượng Hạng',
      slug: 'bi-quyet-lua-chon-trang-phuc-lua-to-tam-thuong-hang',
      excerpt: 'Lụa tơ tằm luôn là biểu tượng của sự vương giả. Cùng LUXE SHOP khám phá cách phân biệt lụa Mulberry nguyên chất và cách gìn giữ vẻ óng ả theo năm tháng.',
      content: `Lụa tơ tằm từ ngàn đời nay đã luôn giữ vững vị trí nữ hoàng của các loại vải dệt. Được kết tinh từ những sợi tơ kén tằm tự nhiên, lụa sở hữu đặc tính điều hòa thân nhiệt kỳ diệu: mát rượi vào ngày hè oi bức và giữ ấm êm ái khi tiết trời chuyển lạnh.

### 1. Nhận biết lụa Mulberry chính gốc qua thị giác và xúc giác
Một thớ lụa Mulberry chuẩn mực sẽ có độ rủ mềm mại tự nhiên và độ bóng xà cừ óng ánh thay đổi sắc thái tùy thuộc vào góc chiếu của ánh sáng mặt trời. Khi áp nhẹ lên làn da, bạn sẽ cảm nhận được sự dịu dàng như làn sương sớm mà không có bất kỳ cảm giác thô ráp nào.

### 2. Cách bảo quản trang phục lụa để bền đẹp suốt đời
- Tuyệt đối không giặt bằng bột giặt có chất tẩy mạnh, ưu tiên sử dụng dầu gội dịu nhẹ hoặc nước giặt chuyên dụng cho lụa.
- Phơi trong bóng râm thoáng mát, tránh ánh nắng gắt trực tiếp làm giòn sợi tơ.
- Ủi ở nhiệt độ thấp khi mặt vải còn hơi ẩm nhẹ, và luôn ủi ở mặt trái.`,
      featuredImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80',
      categorySlug: 'cam-nang-phoi-do',
      status: 'published',
      publishedAt: new Date(),
    },
    {
      title: 'Xu Hướng Thời Trang May Đo Sartorial Trở Lại Đầy Quyền Lực',
      slug: 'xu-huong-thoi-trang-may-do-sartorial-tro-lai-day-quyen-luc',
      excerpt: 'Làn sóng may đo cổ điển Ý đang quay trở lại mạnh mẽ, tái định nghĩa lại sự thanh lịch của những quý ông và quý cô thời hiện đại.',
      content: `Trong kỷ nguyên của thời trang nhanh (fast fashion), giới mộ điệu ngày càng tìm về những giá trị nguyên bản và bền vững: đó chính là nghệ thuật may đo thủ công Sartorial.

Không đơn thuần là một chiếc áo blazer hay một chiếc quần âu, phong cách Sartorial là sự tôn vinh tay nghề thủ công, tính độc bản và sự vừa vặn hoàn hảo theo từng tỷ lệ cơ thể.`,
      featuredImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
      categorySlug: 'xu-huong-thoi-trang',
      status: 'published',
      publishedAt: new Date(),
    },
    {
      title: 'Nghệ Thuật Xây Dựng Tủ Đồ Capsule Wardrobe Tối Giản Nhưng Đẳng Cấp',
      slug: 'nghe-thuat-xay-dung-tu-do-capsule-wardrobe-toi-gian',
      excerpt: 'Chỉ với 10 món đồ thời trang tinh tế, bạn có thể biến hóa thành hơn 30 bộ trang phục thanh lịch cho mọi hoàn cảnh từ công sở đến dạ tiệc.',
      content: `Triết lý "Less is More" (Ít hơn là Nhiều hơn) chưa bao giờ lỗi thời trong thế giới thời trang cao cấp. Một tủ đồ con nhộng (Capsule Wardrobe) tập trung vào chất lượng hơn số lượng sẽ giải phóng tâm trí bạn mỗi sớm mai khi đứng trước gương.

Hãy đầu tư vào những món đồ có phom dáng vượt thời gian: một chiếc sơ mi lụa trắng, một blazer dạ cashmere đen, quần tây xếp ly may đo và đôi giày oxford da bóng.`,
      featuredImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
      categorySlug: 'phong-cach-song',
      status: 'published',
      publishedAt: new Date(),
    },
  ];

  for (const art of articles) {
    const catId = artCatMap.get(art.categorySlug);
    await prisma.article.upsert({
      where: { slug: art.slug },
      update: {
        title: art.title,
        excerpt: art.excerpt,
        content: art.content,
        featuredImage: art.featuredImage,
        categoryId: catId ?? null,
        status: art.status,
        publishedAt: art.publishedAt,
        authorId: adminUser.id,
      },
      create: {
        title: art.title,
        slug: art.slug,
        excerpt: art.excerpt,
        content: art.content,
        featuredImage: art.featuredImage,
        categoryId: catId ?? null,
        status: art.status,
        publishedAt: art.publishedAt,
        authorId: adminUser.id,
      },
    });
  }

  console.log('✅ Database seeding finished successfully!');
  console.log(`🔑 Super Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
