import { createClient } from '@/lib/supabase/server';
import { Users, MapPin } from 'lucide-react';
import Link from 'next/link';

export default async function ClustersPage() {
  const supabase = await createClient();
  const { data: clusters } = await supabase
    .from('clusters')
    .select('id, name_en, name_ar, region')
    .order('name_en');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Health Clusters Directory</h1>
        <p className="text-gray-500 mt-1">All 20 health clusters in Saudi Arabia</p>
      </div>

      {clusters && clusters.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clusters.map((c) => (
            <Link
              key={c.id}
              href={`/clusters/${c.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{c.name_en}</h3>
                  <p className="text-sm text-gray-500 truncate">{c.name_ar}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>{c.region || 'Saudi Arabia'}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No clusters loaded yet</p>
        </div>
      )}
    </div>
  );
}