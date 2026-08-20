// Shared constants and helpers for file uploads/downloads
// (resources library + announcement attachments)

export const FILES_BUCKET = 'resources';

// 4 MB keeps uploads safely under Vercel's request body limits
export const MAX_FILE_SIZE = 4 * 1024 * 1024;

export const ALLOWED_EXTENSIONS = [
  // Documents
  'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'csv', 'txt',
  // Images
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg',
];

export const RESOURCE_CATEGORIES = ['template', 'guidance', 'policy', 'training', 'other'] as const;
export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

/** Returns the lowercase file extension, or '' if none */
export function getFileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

/** Checks whether a file name has an allowed extension */
export function isAllowedFileName(fileName: string): boolean {
  return ALLOWED_EXTENSIONS.includes(getFileExtension(fileName));
}

/** Strips unsafe characters so the name is safe as a storage object path segment */
export function sanitizeFileName(fileName: string): string {
  const cleaned = fileName
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');
  const truncated = cleaned.slice(0, 80);
  return truncated || 'file';
}

/** Builds a unique storage path: <timestamp>-<random>-<safe-name> */
export function buildStoragePath(fileName: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${Date.now()}-${rand}-${sanitizeFileName(fileName)}`;
}

/** Basic path validation to prevent traversal in the download route */
export function isValidStoragePath(path: string): boolean {
  return (
    path.length > 0 &&
    path.length <= 300 &&
    !path.includes('..') &&
    !path.startsWith('/') &&
    !path.includes('\\')
  );
}

/** Formats a byte count as a human-readable string */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null || Number.isNaN(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Returns the download URL for a stored file (signed via /api/files/download) */
export function fileDownloadUrl(filePath: string): string {
  return `/api/files/download?path=${encodeURIComponent(filePath)}`;
}
