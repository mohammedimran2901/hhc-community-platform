import { Users, MapPin } from 'lucide-react';
import Link from 'next/link';

const defaultClusters = [
  { id: 'c01', name_en: 'Riyadh First', name_ar: 'الرياض الأولى', region: 'Riyadh' },
  { id: 'c02', name_en: 'Riyadh Second', name_ar: 'الرياض الثانية', region: 'Riyadh' },
  { id: 'c03', name_en: 'Riyadh Third', name_ar: 'الرياض الثالثة', region: 'Riyadh' },
  { id: 'c04', name_en: 'Jeddah First', name_ar: 'جدة الأولى', region: 'Makkah' },
  { id: 'c05', name_en: 'Jeddah Second', name_ar: 'جدة الثانية', region: 'Makkah' },
  { id: 'c06', name_en: 'Makkah Al-Mukarramah', name_ar: 'مكة المكرمة', region: 'Makkah' },
  { id: 'c07', name_en: 'Al-Taif', name_ar: 'الطائف', region: 'Makkah' },
  { id: 'c08', name_en: 'Al-Madinah Al-Munawarah', name_ar: 'المدينة المنورة', region: 'Madinah' },
  { id: 'c09', name_en: 'Eastern', name_ar: 'الشرقية', region: 'Eastern Province' },
  { id: 'c10', name_en: 'Al-Ahsa', name_ar: 'الأحساء', region: 'Eastern Province' },
  { id: 'c11', name_en: 'Hafar Al-Batin', name_ar: 'حفر الباطن', region: 'Eastern Province' },
  { id: 'c12', name_en: 'Al-Qassim', name_ar: 'القصيم', region: 'Qassim' },
  { id: 'c13', name_en: 'Hail', name_ar: 'حائل', region: 'Hail' },
  { id: 'c14', name_en: 'Tabuk', name_ar: 'تبوك', region: 'Tabuk' },
  { id: 'c15', name_en: 'Al-Jouf', name_ar: 'الجوف', region: 'Jouf' },
  { id: 'c16', name_en: 'Northern Borders', name_ar: 'الحدود الشمالية', region: 'Northern Borders' },
  { id: 'c17', name_en: 'Aseer', name_ar: 'عسير', region: 'Aseer' },
  { id: 'c18', name_en: 'Najran', name_ar: 'نجران', region: 'Najran' },
  { id: 'c19', name_en: 'Al-Baha', name_ar: 'الباحة', region: 'Baha' },
  { id: 'c20', name_en: 'Jazan', name_ar: 'جازان', region: 'Jazan' },
];

export default async function ClustersPage() {
  let clusters = defaultClusters;

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data } = await supabase
      .from('clusters')
      .select('id, name_en, name_ar, region')
      .order('name_en');
    if (data && data.length > 0) clusters = data;
  } catch {
    // Use default cluster data
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Health Clusters Directory</h1>
        <p className="text-gray-500 mt-1">All 20 health clusters in Saudi Arabia</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clusters.map((c: any) => (
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
    </div>
  );
}