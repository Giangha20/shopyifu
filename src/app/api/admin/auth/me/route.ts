import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession(true);
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        userRoles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy thông tin' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: `${user.lastName} ${user.firstName}`.trim(),
        avatar: user.avatar,
        roles: user.userRoles.map((ur) => ur.role.name),
      },
    });
  } catch (error) {
    console.error('Session me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
