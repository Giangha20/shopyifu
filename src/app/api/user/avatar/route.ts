import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, logAudit } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Vui lòng chọn hình ảnh đại diện' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Định dạng tệp không được hỗ trợ. Vui lòng chọn JPG, PNG, WEBP hoặc GIF.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Dung lượng ảnh đại diện vượt quá 5MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || `.${file.type.split('/')[1]}`;
    const filename = `avatar-${session.userId}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: { avatar: publicUrl },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        newsletterSubscribed: true,
      },
    });

    await logAudit(
      session.userId,
      'upload_avatar',
      'user_profile',
      session.userId,
      { avatar: publicUrl },
      request
    );

    return NextResponse.json(
      {
        message: 'Cập nhật ảnh đại diện thành công',
        url: publicUrl,
        user: updatedUser,
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }
    console.error('Customer avatar upload error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi tải ảnh đại diện lên' },
      { status: 500 }
    );
  }
}
