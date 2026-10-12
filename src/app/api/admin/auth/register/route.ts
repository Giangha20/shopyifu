import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, createSession, logAudit } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, secretKey } = body;

    if (!email || !password || !firstName) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp đầy đủ họ tên, email và mật khẩu' },
        { status: 400 }
      );
    }

    // Check if admin registration is allowed
    const allowSetting = await prisma.storeSetting.findUnique({
      where: { key: 'allow_admin_registration' },
    });
    if (allowSetting && allowSetting.value === 'false') {
      return NextResponse.json(
        { error: 'Chức năng đăng ký quản trị viên hiện đang tạm khóa. Vui lòng liên hệ Super Admin.' },
        { status: 403 }
      );
    }

    // Validate Secret Key
    const secretKeySetting = await prisma.storeSetting.findUnique({
      where: { key: 'admin_registration_secret_key' },
    });
    const validKey = secretKeySetting?.value || process.env.ADMIN_SECRET_KEY || 'YIFU@ADMIN2026';

    if (secretKey?.trim() !== validKey.trim()) {
      return NextResponse.json(
        { error: 'Mã bí mật xác thực quản trị viên (Admin Secret Key) không chính xác' },
        { status: 401 }
      );
    }

    const emailNormalized = email.toLowerCase().trim();

    // Check existing user
    const existing = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Địa chỉ email này đã tồn tại trong hệ thống' },
        { status: 409 }
      );
    }

    // Find or create admin role
    let adminRole = await prisma.role.findFirst({
      where: { name: { in: ['admin', 'super_admin'] } },
    });

    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          name: 'admin',
          displayName: 'Quản Trị Viên',
          description: 'Toàn quyền quản trị hệ thống',
        },
      });
    }

    const passwordHash = await hashPassword(password);

    // Create Admin User
    const newAdmin = await prisma.user.create({
      data: {
        email: emailNormalized,
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName ? lastName.trim() : '',
        phone: phone ? phone.trim() : null,
        isActive: true,
        userRoles: {
          create: {
            roleId: adminRole.id,
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    // Create admin session cookie
    await createSession(newAdmin.id, true);

    await logAudit(newAdmin.id, 'admin_register', 'user', newAdmin.id, { email: emailNormalized }, request);

    return NextResponse.json(
      {
        success: true,
        message: 'Đăng ký tài khoản Quản trị viên thành công!',
        user: newAdmin,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Admin register error:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi xử lý đăng ký quản trị viên' },
      { status: 500 }
    );
  }
}
