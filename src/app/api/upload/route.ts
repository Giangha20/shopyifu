import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAudit } from '@/lib/auth';
import { saveUploadedFile, validateFile } from '@/lib/upload';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Vui lòng chọn tệp hình ảnh để tải lên' },
        { status: 400 }
      );
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Tệp tải lên không hợp lệ' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Persist to NeonDB + local disk with auto Sharp optimization
    const result = await saveUploadedFile(buffer, file.name, file.type);

    await logAudit(
      session.userId,
      'upload_file',
      'media',
      result.filename,
      { originalName: file.name, size: result.size, mimeType: result.mimeType },
      request
    );

    return NextResponse.json(
      {
        message: 'Tải lên hình ảnh thành công',
        url: result.url,
        filename: result.filename,
        size: result.size,
        type: result.mimeType,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Đã có lỗi xảy ra khi tải lên tệp',
      },
      { status: 500 }
    );
  }
}
