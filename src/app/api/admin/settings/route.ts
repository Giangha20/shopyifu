import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const settings = await prisma.storeSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi lấy cài đặt' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();

    const payload: Record<string, any> = { ...body };
    if (payload.store_name) payload.site_name = payload.store_name;
    if (payload.contact_email) payload.store_email = payload.contact_email;
    if (payload.contact_phone) payload.store_phone = payload.contact_phone;
    if (payload.contact_address) payload.store_address = payload.contact_address;
    if (payload.store_slogan) payload.site_description = payload.store_slogan;

    // Upsert each setting key
    const updates = Object.entries(payload).map(([key, value]) =>
      prisma.storeSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: {
          key,
          value: String(value),
          group: 'general',
        },
      })
    );

    await Promise.all(updates);
    await logAudit(session.userId, 'update_settings', 'system', undefined, body, request);

    return NextResponse.json({ message: 'Lưu cài đặt thành công' });
  } catch (error) {
    console.error('Save settings error:', error);
    return NextResponse.json({ error: 'Lỗi lưu cài đặt' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  return POST(request);
}
