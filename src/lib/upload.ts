import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import sharp from 'sharp';
import { prisma } from '@/lib/db';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const MAX_SIZE_MB = parseInt(process.env.UPLOAD_MAX_SIZE_MB || '10', 10);
const MAX_FILE_SIZE = MAX_SIZE_MB * 1024 * 1024; // in bytes

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

/**
 * Validates the file mime type and size
 */
export function validateFile(file: { type: string; size: number }): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Định dạng tệp không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP, GIF, SVG.`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Dung lượng tệp vượt quá giới hạn cho phép (${MAX_SIZE_MB}MB).`,
    };
  }

  return { valid: true };
}

/**
 * Generates a unique, collision-resistant filename
 */
export function generateUniqueFileName(originalName: string, extOverride?: string): string {
  const ext = extOverride || path.extname(originalName).toLowerCase() || '.webp';
  const randomSuffix = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${randomSuffix}${ext}`;
}

/**
 * Optimizes an image buffer using Sharp if applicable
 */
export async function optimizeImageBuffer(
  inputBuffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; mimeType: string; ext: string }> {
  // If SVG or GIF, don't recompress
  if (mimeType === 'image/svg+xml' || mimeType === 'image/gif') {
    const ext = mimeType === 'image/svg+xml' ? '.svg' : '.gif';
    return { buffer: inputBuffer, mimeType, ext };
  }

  try {
    const optimizedBuffer = await sharp(inputBuffer)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 85, effort: 4 })
      .toBuffer();

    return {
      buffer: optimizedBuffer,
      mimeType: 'image/webp',
      ext: '.webp',
    };
  } catch (err) {
    console.warn('Sharp optimization skipped or failed, using raw buffer:', err);
    let ext = '.jpg';
    if (mimeType === 'image/png') ext = '.png';
    else if (mimeType === 'image/webp') ext = '.webp';
    return { buffer: inputBuffer, mimeType, ext };
  }
}

/**
 * Core function to save an uploaded file buffer:
 * 1. Optimizes image with Sharp
 * 2. Saves to NeonDB PostgreSQL (UploadedFile) for 100% Vercel / serverless compatibility
 * 3. Saves to local public/uploads directory if the filesystem is writable
 */
export async function saveUploadedFile(
  rawBuffer: Buffer,
  originalName: string,
  rawMimeType: string
): Promise<UploadResult> {
  const { buffer, mimeType, ext } = await optimizeImageBuffer(rawBuffer, rawMimeType);
  const filename = generateUniqueFileName(originalName, ext);

  // 1. Try writing to local disk (succeeds locally, silently ignored on read-only Vercel)
  try {
    if (!existsSync(UPLOADS_DIR)) {
      await mkdir(UPLOADS_DIR, { recursive: true });
    }
    const filePath = path.join(UPLOADS_DIR, filename);
    await writeFile(filePath, buffer);
  } catch (diskErr) {
    // Read-only filesystem on Vercel is expected - the DB storage below handles it!
    console.log('Local disk write skipped (read-only environment)');
  }

  // 2. Persist to NeonDB PostgreSQL database
  try {
    await prisma.uploadedFile.upsert({
      where: { filename },
      create: {
        filename,
        mimeType,
        size: buffer.length,
        data: buffer,
      },
      update: {
        mimeType,
        size: buffer.length,
        data: buffer,
      },
    });
  } catch (dbErr) {
    console.error('Failed to store file in database:', dbErr);
    throw new Error('Không thể lưu trữ tệp vào cơ sở dữ liệu');
  }

  const url = `/uploads/${filename}`;

  return {
    url,
    filename,
    size: buffer.length,
    mimeType,
  };
}

/**
 * Retrieves an uploaded file from disk or database
 */
export async function getUploadedFile(filename: string): Promise<{ data: Buffer; mimeType: string } | null> {
  // 1. Check disk first (fastest for local dev)
  try {
    const filePath = path.join(UPLOADS_DIR, filename);
    if (existsSync(filePath)) {
      const { readFile } = await import('fs/promises');
      const data = await readFile(filePath);
      const ext = path.extname(filename).toLowerCase();
      const mimeMap: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
      };
      return { data, mimeType: mimeMap[ext] || 'application/octet-stream' };
    }
  } catch {
    // Ignore and fallback to DB
  }

  // 2. Retrieve from NeonDB database
  try {
    const file = await prisma.uploadedFile.findUnique({
      where: { filename },
    });

    if (file) {
      return {
        data: Buffer.from(file.data),
        mimeType: file.mimeType,
      };
    }
  } catch (err) {
    console.error('Error querying UploadedFile from database:', err);
  }

  return null;
}

/**
 * Handles uploading a File object from FormData
 */
export async function handleUpload(file: File): Promise<string> {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Tệp tải lên không hợp lệ');
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const result = await saveUploadedFile(buffer, file.name, file.type);
  return result.url;
}

/**
 * Deletes an uploaded file by its URL from both disk and DB
 */
export async function deleteFile(fileUrl: string): Promise<boolean> {
  try {
    if (!fileUrl.startsWith('/uploads/')) return false;
    const filename = fileUrl.replace('/uploads/', '');

    // Delete from disk if exists
    const filePath = path.join(UPLOADS_DIR, filename);
    if (existsSync(filePath)) {
      await unlink(filePath).catch(() => {});
    }

    // Delete from DB
    await prisma.uploadedFile.delete({
      where: { filename },
    }).catch(() => {});

    return true;
  } catch (error) {
    console.error(`Error deleting file ${fileUrl}:`, error);
    return false;
  }
}
