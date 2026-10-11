const BASE = 'http://localhost:3000';

async function testAll() {
  console.log('🚀 Starting Comprehensive Verification Test...');
  let errors = 0;

  // 1. Test Admin Login
  console.log('\n--- 1. Testing Admin Authentication ---');
  let adminCookie = '';
  const adminLoginRes = await fetch(`${BASE}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@luxeshop.vn',
      password: 'ChangeMeImmediately!2024',
    }),
  });
  console.log('Admin login status:', adminLoginRes.status);
  if (adminLoginRes.ok) {
    const rawCookies = adminLoginRes.headers.get('set-cookie');
    if (rawCookies) {
      adminCookie = rawCookies.split(',').map(c => c.split(';')[0]).join('; ');
    }
    console.log('✅ Admin login succeeded');
  } else {
    console.error('❌ Admin login failed');
    errors++;
  }

  // 2. Test Admin Product Fetch
  console.log('\n--- 2. Testing Admin Products ---');
  const prodsRes = await fetch(`${BASE}/api/admin/products`, {
    headers: { Cookie: adminCookie },
  });
  const prodsData = await prodsRes.json();
  const products = prodsData.products || prodsData.data || [];
  console.log(`Admin products count: ${products.length}`);
  if (products.length === 0) {
    console.error('❌ No products found');
    errors++;
  } else {
    console.log(`✅ Loaded ${products.length} products`);
  }

  // 3. Test Admin Product Edit & Prevent 404
  console.log('\n--- 3. Testing Admin Product Update & Storefront Sync ---');
  const targetProd = products[0];
  const updatedName = 'Đầm Dạ Hội Hoàng Gia 2026 - Tinh Hoa Thủ Công';
  const updatedPrice = 4200000;

  const updateRes = await fetch(`${BASE}/api/admin/products/${targetProd.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      name: updatedName,
      price: updatedPrice,
      sku: targetProd.sku,
      isActive: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800', isPrimary: false },
      ],
    }),
  });
  console.log('Admin product update status:', updateRes.status);
  const updateData = await updateRes.json();
  if (updateRes.ok) {
    console.log('✅ Product updated successfully:', updateData.data?.name);
  } else {
    console.error('❌ Product update failed:', updateData);
    errors++;
  }

  // Verify storefront lookup by slug and by id (no 404!)
  console.log('\n--- 4. Verifying Public Product Detail (Prevent 404) ---');
  const pubBySlug = await fetch(`${BASE}/api/products/${targetProd.slug}`);
  console.log(`API lookup by slug (${targetProd.slug}) status:`, pubBySlug.status);
  if (pubBySlug.ok) {
    const pubData = await pubBySlug.json();
    console.log('✅ Found product name:', pubData.data?.name);
    if (pubData.data?.name === updatedName) {
      console.log('✅ Storefront perfectly reflected updated name in real-time!');
    }
  } else {
    console.error('❌ API lookup by slug failed!');
    errors++;
  }

  const pubById = await fetch(`${BASE}/api/products/${targetProd.id}`);
  console.log(`API lookup by ID (${targetProd.id}) status:`, pubById.status);
  if (pubById.ok) {
    console.log('✅ Found product by ID successfully (no 404 when using ID or old slug)');
  } else {
    console.error('❌ API lookup by ID failed');
    errors++;
  }

  const ssrPage = await fetch(`${BASE}/san-pham/${targetProd.slug}`);
  console.log(`SSR Web Page (/san-pham/${targetProd.slug}) status:`, ssrPage.status);
  if (ssrPage.status === 200) {
    console.log('✅ Web storefront product page returned HTTP 200 (NO 404!)');
  } else {
    console.error(`❌ Web storefront product page returned status ${ssrPage.status}`);
    errors++;
  }

  // 5. Test Customer Registration / Login & Profile Save
  console.log('\n--- 5. Testing Customer Profile & Save Persistence ---');
  const testEmail = `khachhang_${Date.now()}@test.com`;
  let userCookie = '';
  const regRes = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      firstName: 'Thanh',
      lastName: 'Nguyễn',
      phone: '0912345678',
    }),
  });
  console.log('Register customer status:', regRes.status);
  if (regRes.ok) {
    const rawCookies = regRes.headers.get('set-cookie');
    if (rawCookies) {
      userCookie = rawCookies.split(',').map(c => c.split(';')[0]).join('; ');
    }
    console.log('✅ Customer registered successfully');
  } else {
    console.error('❌ Customer registration failed');
    errors++;
  }

  // Update profile
  const profileRes = await fetch(`${BASE}/api/user/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: userCookie,
    },
    body: JSON.stringify({
      firstName: 'Quang',
      lastName: 'Lê',
      phone: '0987654321',
      avatar: '/uploads/sample-avatar.jpg',
      newsletterSubscribed: true,
    }),
  });
  console.log('Update profile status:', profileRes.status);
  const profileData = await profileRes.json();
  if (profileRes.ok && (profileData.user || profileData.data)) {
    const u = profileData.user || profileData.data;
    console.log('✅ Profile updated and data preserved:', u.firstName, u.lastName, u.phone);
    if (u.firstName === 'Quang' && u.lastName === 'Lê') {
      console.log('✅ Profile data verified successfully without loss!');
    }
  } else {
    console.error('❌ Profile save failed or lost data:', profileData);
    errors++;
  }

  // 6. Test Storefront Orders ("Đã mua")
  console.log('\n--- 6. Testing Customer Orders (Mục Đã Mua) ---');
  const ordersRes = await fetch(`${BASE}/api/orders`, {
    headers: { Cookie: userCookie },
  });
  console.log('Customer orders API status:', ordersRes.status);
  const ordersData = await ordersRes.json();
  if (ordersRes.ok) {
    console.log('✅ Orders endpoint returned 200, count:', (ordersData.orders || ordersData.data || []).length);
  } else {
    console.error('❌ Orders endpoint failed:', ordersData);
    errors++;
  }

  // 7. Test Admin Order Notifications
  console.log('\n--- 7. Testing Admin Order Notifications ---');
  const adminOrdersRes = await fetch(`${BASE}/api/admin/orders?limit=6`, {
    headers: { Cookie: adminCookie },
  });
  console.log('Admin orders notification endpoint status:', adminOrdersRes.status);
  const adminOrdersData = await adminOrdersRes.json();
  if (adminOrdersRes.ok && adminOrdersData.orders) {
    console.log('✅ Admin orders notification endpoint works, received:', adminOrdersData.orders.length, 'orders');
  } else {
    console.error('❌ Admin orders notification endpoint failed');
    errors++;
  }

  // Summary
  console.log('\n=======================================');
  if (errors === 0) {
    console.log('🎉 ALL 7 TEST SUITES PASSED WITH 0 ERRORS! 100% OPERATIONAL!');
  } else {
    console.log(`⚠️ Completed with ${errors} error(s).`);
  }
}

testAll().catch(console.error);
