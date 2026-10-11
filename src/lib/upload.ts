import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const MAX_SIZE_MB = parseInt(process.env.UPLOAD_MAX_SIZE_MB || '10', 10);
const MAX_FILE_SIZE = MAX_SIZE_MB * 1024 * 1024; // in bytes

// Uploads directory is located in public/uploads so Next.js can serve them directly
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
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Định dạng tệp không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP, GIF.`,
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
export function generateUniqueFileName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const randomSuffix = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${randomSuffix}${ext}`;
}

/**
 * Handles uploading a single file
 */
export async function handleUpload(file: File): Promise<string> {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Tệp tải lên không hợp lệ');
  }

  const storageProvider = process.env.STORAGE_PROVIDER || 'local';

  // S3 storage provider support if configured
  if (storageProvider === 's3' && process.env.S3_BUCKET && process.env.S3_ENDPOINT) {
    return handleS3Upload(file);
  }

  // Local storage provider (default)
  return handleLocalUpload(file);
}

/**
 * Local file system upload handler
 */
async function handleLocalUpload(file: File): Promise<string> {
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true });
  }

  const fileName = generateUniqueFileName(file.name);
  const filePath = path.join(UPLOADS_DIR, fileName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await writeFile(filePath, buffer);

  // Return public URL accessible via web browser
  return `/uploads/${fileName}`;
}

/**
 * S3 compatible storage provider upload
 */
async function handleS3Upload(file: File): Promise<string> {
  const endpoint = process.env.S3_ENDPOINT;
  const bucket = process.env.S3_BUCKET;
  const publicUrl = process.env.S3_PUBLIC_URL || `${endpoint}/${bucket}`;
  const fileName = generateUniqueFileName(file.name);

  // Fallback to local if credentials are incomplete
  if (!endpoint || !bucket) {
    return handleLocalUpload(file);
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // If AWS SDK is not installed, use standard PUT request if presigned or public endpoint
    const uploadUrl = `${endpoint}/${bucket}/${fileName}`;
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: buffer,
    });

    if (!response.ok) {
      console.warn('S3 upload responded with error, falling back to local upload');
      return handleLocalUpload(file);
    }

    return `${publicUrl}/${fileName}`;
  } catch (error) {
    console.error('S3 upload error, falling back to local storage:', error);
    return handleLocalUpload(file);
  }
}

/**
 * Extract physical file path from a URL
 */
export function getFilePathFromUrl(fileUrl: string): string | null {
  if (!fileUrl) return null;

  if (fileUrl.startsWith('/uploads/')) {
    const fileName = fileUrl.replace('/uploads/', '');
    return path.join(UPLOADS_DIR, fileName);
  }

  return null;
}

/**
 * Deletes an uploaded file by its URL
 */
export async function deleteFile(fileUrl: string): Promise<boolean> {
  try {
    const filePath = getFilePathFromUrl(fileUrl);
    if (!filePath) return false;

    if (existsSync(filePath)) {
      await unlink(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting file ${fileUrl}:`, error);
    return false;
  }
}
