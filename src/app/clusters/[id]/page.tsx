import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Users,
  MapPin,
  MessageSquare,
  ArrowLeft,
  User,
  ShieldCheck,
  Shield,
  Crown,
} from 'lucide-react';

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

function RoleBadge({ role }: { role: string }) {
  if (role === 'hhc_admin') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
        <Crown className="w-3 h-3" /> Admin
      </span>
    );
  }
  if (role === 'cluster_lead') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
        <Shield className="w-3 h-3" /> Cluster Lead
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
      <ShieldCheck className="w-3 h-3" /> Member
    </span>
  );
}

export default async function ClusterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let cluster = defaultClusters.find((c) => c.id === id) || null;
  let members: any[] = [];
  let threads: any[] = [];

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // Fetch cluster from DB (overrides default if found)
    const { data: clusterData } = await supabase
      .from('clusters')
      .select('id, name_en, name_ar, region')
      .eq('id', id)
      .single();
    if (clusterData) cluster = clusterData;

    // Fetch members of this cluster
    const { data: memberData } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, created_at')
      .eq('cluster_id', id)
      .order('full_name');
    if (memberData) members = memberData;

    // Fetch threads for this cluster
    const { data: threadData } = await supabase
      .from('forum_threads')
      .select('id, title, is_resolved, created_at, author_id')
      .eq('cluster_id', id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (threadData) threads = threadData;
  } catch {
    // Fall back to defaults / empty lists
  }

  if (!cluster) {
    notFound();
  }

  const leads = members.filter((m) => m.role === 'cluster_lead' || m.role === 'hhc_admin');

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/clusters"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all clusters
      </Link>

      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-10 sm:px-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-16 h-16 bg-white/10 backdrop-blur border border-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Users className="w-8 h-8 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {cluster.name_en}
            </h1>
            <p className="text-slate-400 mt-1 text-lg">{cluster.name_ar}</p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {cluster.region || 'Saudi Arabia'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                {members.length} member{members.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Members */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Cluster Members</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {members.length}
            </span>
          </div>

          {members.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {members.map((m) => (
                <li key={m.id} className="flex items-center gap-4 py-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {m.full_name || 'Unnamed'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{m.email}</p>
                  </div>
                  <RoleBadge role={m.role} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No members assigned to this cluster yet.</p>
            </div>
          )}
        </div>

        {/* Sidebar: Leads + Discussions */}
        <div className="space-y-6">
          {/* Cluster Leads */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <Crown className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="font-semibold text-gray-900">Cluster Leads</h2>
            </div>
            {leads.length > 0 ? (
              <ul className="space-y-3">
                {leads.map((m) => (
                  <li key={m.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {m.full_name || 'Unnamed'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{m.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No leads assigned yet.</p>
            )}
          </div>

          {/* Discussions */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="font-semibold text-gray-900">Discussions</h2>
            </div>
            {threads.length > 0 ? (
              <ul className="space-y-2">
                {threads.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/forum/${t.id}`}
                      className="block p-3 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{t.title}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(t.created_at).toLocaleDateString()}
                        {t.is_resolved && (
                          <span className="ml-2 text-emerald-600 font-medium">Resolved</span>
                        )}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-4">No discussions from this cluster yet.</p>
                <Link
                  href="/forum/new"
                  className="inline-flex items-center gap-2 text-sm bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 font-medium transition-all"
                >
                  Start a Discussion
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
