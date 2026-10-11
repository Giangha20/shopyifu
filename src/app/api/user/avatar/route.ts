import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, logAudit } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { saveUploadedFile, validateFile } from '@/lib/upload';

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

    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Định dạng tệp không hợp lệ' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to DB and disk with Sharp optimization
    const result = await saveUploadedFile(buffer, file.name, file.type);
    const publicUrl = result.url;

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
