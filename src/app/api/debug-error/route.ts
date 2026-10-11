import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.error('=================== CLIENT ERROR REPORTED ===================');
    console.error('URL:', req.headers.get('referer'));
    console.error('NAME:', data.name);
    console.error('MESSAGE:', data.message);
    console.error('DIGEST:', data.digest);
    console.error('STACK:', data.stack);
    console.error('==============================================================');
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
