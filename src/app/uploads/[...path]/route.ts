import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { getUploadedFile } from '@/lib/upload';

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
};

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const pathSegments = params?.path;
    const rawPath = Array.isArray(pathSegments)
      ? pathSegments.join('/')
      : typeof pathSegments === 'string'
      ? pathSegments
      : '';

    // Prevent directory traversal
    if (!rawPath || rawPath.includes('..')) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // 1. Try serving from local disk (if file exists locally)
    try {
      const filePath = path.join(process.cwd(), 'public', 'uploads', rawPath);
      if (existsSync(filePath)) {
        const buffer = await readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_MAP[ext] || 'application/octet-stream';

        return new NextResponse(new Uint8Array(buffer) as unknown as BodyInit, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    } catch {
      // Disk read failed, fallback to database
    }

    // 2. Fetch from NeonDB PostgreSQL database (for Vercel / serverless deployments)
    const file = await getUploadedFile(rawPath);
    if (file) {
      return new NextResponse(new Uint8Array(file.data) as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': file.mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    return new NextResponse('File Not Found', { status: 404 });
  } catch (error) {
    console.error('Error serving uploaded file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
