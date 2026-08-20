'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, FileImage, FileSpreadsheet, FileText, FolderOpen, Loader2, Search } from 'lucide-react';
import { fileDownloadUrl, formatFileSize, getFileExtension } from '@/lib/files';

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

function FileIcon({ fileName }: { fileName: string }) {
  const ext = getFileExtension(fileName);
  if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return <FileImage className="w-5 h-5 text-purple-600" />;
  return <FileText className="w-5 h-5 text-blue-600" />;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    async function fetchResources() {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data } = await supabase
          .from('resources')
          .select('*')
          .order('created_at', { ascending: false });
        if (data) setResources(data);
      } catch {
        // Supabase not configured or table not created yet — show empty state
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, []);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchesSearch =
        !search.trim() ||
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase()) ||
        r.file_name?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [resources, search, categoryFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources & Documents</h1>
          <p className="text-gray-500 mt-1">Templates, guidance documents, and shared files from HHC</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
        >
          <option value="all">All categories</option>
          <option value="template">Templates</option>
          <option value="guidance">Guidance</option>
          <option value="policy">Policy</option>
          <option value="training">Training</option>
          <option value="other">Other</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading resources...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((r: any) => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileIcon fileName={r.file_name} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-gray-900">{r.name}</h2>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[r.category] || categoryColors.other}`}>
                      {categoryLabels[r.category] || 'Other'}
                    </span>
                  </div>
                  {r.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{r.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                    <span>{formatFileSize(r.file_size)}</span>
                    <span>·</span>
                    <span>{new Date(r.created_at).toLocaleDateString()}</span>
                    {r.uploader?.full_name && (
                      <>
                        <span>·</span>
                        <span>By {r.uploader.full_name}</span>
                      </>
                    )}
                  </div>
                </div>
                <a
                  href={fileDownloadUrl(r.file_path)}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-3.5 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors flex-shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {resources.length === 0 ? 'No resources have been shared yet' : 'No resources match your search'}
          </p>
        </div>
      )}
    </div>
  );
}
