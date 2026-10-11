import { NextRequest, NextResponse } from 'next/server';
import { destroySession, getSession, logAudit } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (session) {
      await logAudit(session.userId, 'logout', 'user', session.userId, undefined, request);
    }

    await destroySession(false);

    return NextResponse.json({ message: 'Đăng xuất thành công' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi đăng xuất' },
      { status: 500 }
    );
  }
}
