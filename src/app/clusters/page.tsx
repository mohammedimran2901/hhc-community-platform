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
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-10 sm:px-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Health Clusters Directory
          </h1>
          <p className="text-slate-400 mt-2 max-w-xl">
            Connect with costing leads and teams across all 20 health clusters in Saudi Arabia.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clusters.map((c: any) => (
          <Link
            key={c.id}
            href={`/clusters/${c.id}`}
            className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-purple-600" />
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
