'use client';

import { useRef, useState } from 'react';
import { Paperclip, X } from 'lucide-react';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE, formatFileSize, isAllowedFileName } from '@/lib/files';

interface AttachmentPickerProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

/**
 * Reusable file picker used by announcement forms and the admin resources page.
 * Validates file type (allowlist) and size (4 MB) before accepting files.
 */
export function AttachmentPicker({ files, onChange, maxFiles = 5, disabled = false }: AttachmentPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickError, setPickError] = useState<string | null>(null);

  const handleFilesSelected = (selected: FileList | null) => {
    if (!selected) return;
    setPickError(null);

    const rejected: string[] = [];
    const accepted: File[] = [...files];

    for (const file of Array.from(selected)) {
      if (!isAllowedFileName(file.name)) {
        rejected.push(`${file.name}: type not allowed`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        rejected.push(`${file.name}: larger than ${formatFileSize(MAX_FILE_SIZE)}`);
        continue;
      }
      if (accepted.length >= maxFiles) {
        rejected.push(`${file.name}: maximum ${maxFiles} file(s)`);
        continue;
      }
      // Skip exact duplicates (same name + size)
      if (accepted.some((f) => f.name === file.name && f.size === file.size)) continue;
      accepted.push(file);
    }

    if (rejected.length > 0) {
      setPickError(rejected.join(' · '));
    }
    onChange(accepted);

    // Reset the input so the same file can be picked again later
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setPickError(null);
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        multiple={maxFiles > 1}
        disabled={disabled}
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files)}
        accept={ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
      />
      <button
        type="button"
        disabled={disabled || files.length >= maxFiles}
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Paperclip className="w-4 h-4" />
        {files.length >= maxFiles
          ? `Maximum ${maxFiles} file(s) reached`
          : maxFiles === 1
            ? 'Choose a file (PDF, Excel, Word, PowerPoint, CSV, or image — max 4 MB)'
            : `Choose files (PDF, Excel, Word, PowerPoint, CSV, or image — max 4 MB each, up to ${maxFiles})`}
      </button>

      {pickError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">{pickError}</div>
      )}

      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
