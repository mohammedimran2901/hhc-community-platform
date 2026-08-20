'use client';

import { useCallback, useEffect, useState } from 'react';
import { Download, FileText, FolderOpen, Loader2, Plus, Trash2, Upload, X } from 'lucide-react';
import { AttachmentPicker } from '@/components/AttachmentPicker';
import { fileDownloadUrl, formatFileSize } from '@/lib/files';

const categoryLabels: Record<string, string> = {
  template: 'Template',
  guidance: 'Guidance',
  policy: 'Policy',
  training: 'Training',
  other: 'Other',
};

const categoryColors: Record<string, string> = {
  template: 'bg-blue-100 text-blue-700',
  guidance: 'bg-purple-100 text-purple-700',
  policy: 'bg-red-100 text-red-700',
  training: 'bg-green-100 text-green-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('template');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadResources = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/resources');
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
      }
    } catch {
      // API unavailable — leave list empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadResources(); }, [loadResources]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('template');
    setFiles([]);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError('Please provide a display name'); return; }
    if (files.length === 0) { setError('Please choose a file to upload'); return; }

    setUploading(true);
    try {
      const file = files[0];

      // Step 1: upload the file to storage
      setUploadProgress('Uploading file...');
      const form = new FormData();
      form.append('file', file);
      const uploadRes = await fetch('/api/admin/files', { method: 'POST', body: form });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setError(uploadData.error || 'Upload failed');
        setUploading(false);
        setUploadProgress('');
        return;
      }

      // Step 2: create the resource record
      setUploadProgress('Saving resource...');
      const createRes = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          category,
          file_path: uploadData.file.path,
          file_name: uploadData.file.file_name,
          file_size: uploadData.file.file_size,
          mime_type: uploadData.file.mime_type,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        setError(createData.error || 'Failed to save resource');
        setUploading(false);
        setUploadProgress('');
        return;
      }

      resetForm();
      setSuccessMsg('Resource uploaded successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadResources();
    } catch {
      setError('Something went wrong while uploading');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleDelete = async (resource: any) => {
    if (!confirm(`Delete "${resource.name}"? This will remove the file for everyone.`)) return;
    try {
      const res = await fetch(`/api/admin/resources/${resource.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccessMsg('Resource deleted');
        setTimeout(() => setSuccessMsg(null), 3000);
        loadResources();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete resource');
      }
    } catch {
      setError('Failed to delete resource');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Resources</h1>
          <p className="text-gray-500 mt-1">Upload and manage shared documents for the community</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Upload File'}
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">{successMsg}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Upload a Resource</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
              <AttachmentPicker files={files} onChange={setFiles} maxFiles={1} disabled={uploading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} disabled={uploading}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. Costing Template v2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} disabled={uploading}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white">
                <option value="template">Template</option>
                <option value="guidance">Guidance</option>
                <option value="policy">Policy</option>
                <option value="training">Training</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} disabled={uploading} rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
                placeholder="Short description of what this file is for..." />
            </div>
            <button type="submit" disabled={uploading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {uploading ? (<><Loader2 className="w-5 h-5 animate-spin" /> {uploadProgress || 'Uploading...'}</>) : (<><Plus className="w-4 h-4" /> Upload Resource</>)}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" /></div>
      ) : resources.length > 0 ? (
        <div className="space-y-3">
          {resources.map((r: any) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <h3 className="font-semibold text-gray-900">{r.name}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[r.category] || categoryColors.other}`}>
                      {categoryLabels[r.category] || 'Other'}
                    </span>
                  </div>
                  {r.description && <p className="text-sm text-gray-600 line-clamp-2">{r.description}</p>}
                  <p className="text-xs text-gray-400 mt-2">
                    {r.file_name} · {formatFileSize(r.file_size)} · {r.uploader?.full_name || 'Unknown'} · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a href={fileDownloadUrl(r.file_path)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download">
                    <Download className="w-4 h-4" />
                  </a>
                  <button onClick={() => handleDelete(r)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No resources yet. Upload the first one!</p>
        </div>
      )}
    </div>
  );
}

