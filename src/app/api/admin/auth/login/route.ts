import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateUser, createSession, logAudit } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const authResult = await authenticateUser(email, password);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Email hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    const { user } = authResult;

    // Verify user has admin/staff roles
    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id },
      include: { role: true },
    });

    const roleNames = userRoles.map((ur) => ur.role.name);
    const hasAdminRole = roleNames.some((r) =>
      ['super_admin', 'admin', 'manager', 'editor', 'support'].includes(r)
    );

    if (!hasAdminRole) {
      return NextResponse.json(
        { error: 'Bạn không có quyền truy cập vào bảng quản trị' },
        { status: 403 }
      );
    }

    // Create admin session
    await createSession(user.id, true);

    await logAudit(user.id, 'admin_login', 'user', user.id, undefined, request);

    return NextResponse.json({
      message: 'Đăng nhập trang quản trị thành công',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: roleNames,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra trong quá trình đăng nhập quản trị' },
      { status: 500 }
    );
  }
}
