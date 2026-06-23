'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  PlayCircle,
  MessageSquare,
  Bell,
  Users,
  Vote,
  ShieldCheck,
  LayoutDashboard,
  Globe,
} from 'lucide-react';

interface WalkthroughStep {
  icon: React.ReactNode;
  videoKey: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  detailsEn: string[];
  detailsAr: string[];
}

const steps: WalkthroughStep[] = [
  {
    icon: <LayoutDashboard className="w-6 h-6" />,
    videoKey: 'dashboard',
    titleEn: 'Dashboard Overview',
    titleAr: 'نظرة عامة على لوحة التحكم',
    descEn: 'When you first enter the platform, you\'ll see the dashboard with key metrics, recent announcements, discussions, and community polls.',
    descAr: 'عند دخولك للمنصة لأول مرة، ستظهر لك لوحة التحكم مع المؤشرات الرئيسية وآخر الإعلانات والمناقشات واستطلاعات الرأي.',
    detailsEn: [
      'View platform-wide statistics at a glance',
      'See pinned announcements from HHC',
      'Browse recent forum discussions',
      'Vote in active community polls',
      'Quick-access buttons to all sections',
    ],
    detailsAr: [
      'عرض إحصائيات المنصة بنظرة سريعة',
      'مشاهدة الإعلانات المهمة من هيئة الصحة',
      'تصفح أحدث مناقشات المنتدى',
      'التصويت في استطلاعات الرأي النشطة',
      'أزرار وصول سريع لجميع الأقسام',
    ],
  },
  {
    icon: <Bell className="w-6 h-6" />,
    videoKey: 'announcements',
    titleEn: 'Announcements & Guidance',
    titleAr: 'الإعلانات والتوجيهات',
    descEn: 'HHC publishes official announcements, policy updates, and training opportunities here. Pinned items are always shown first.',
    descAr: 'تنشر هيئة الصحة الإعلانات الرسمية وتحديثات السياسات والفرص التدريبية هنا. تظهر العناصر المثبتة أولاً.',
    detailsEn: [
      'Official HHC communications and guidance',
      'Policy updates and mandatory notices',
      'Training workshop announcements',
      'Items sorted by date with pinned on top',
      'Click any announcement to read full details',
    ],
    detailsAr: [
      'اتصالات وتوجيهات رسمية من هيئة الصحة',
      'تحديثات السياسات والإشعارات الإلزامية',
      'إعلانات ورش العمل التدريبية',
      'ترتيب العناصر حسب التاريخ مع تثبيت المهم',
      'انقر على أي إعلان لقراءة التفاصيل الكاملة',
    ],
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    videoKey: 'forum',
    titleEn: 'Community Forum',
    titleAr: 'منتدى المجتمع',
    descEn: 'The forum is where you can ask questions, share knowledge, and collaborate with colleagues across all 20 health clusters.',
    descAr: 'المنتدى هو مكان لطرح الأسئلة وتبادل المعرفة والتعاون مع الزملاء عبر جميع التجمعات الصحية العشرين.',
    detailsEn: [
      'Start a new discussion thread',
      'Reply to existing threads with your insights',
      'Filter discussions by cluster or topic',
      'Mark threads as resolved when answered',
      'Tag threads with relevant categories',
    ],
    detailsAr: [
      'بدء موضوع نقاش جديد',
      'الرد على المواضيع الحالية بمشاركاتك',
      'تصفية المناقشات حسب التجمع أو الموضوع',
      'تحديد المواضيع كـ "تمت الإجابة"',
      'وسم المواضيع بالفئات المناسبة',
    ],
  },
  {
    icon: <Vote className="w-6 h-6" />,
    videoKey: 'polls',
    titleEn: 'Community Polls',
    titleAr: 'استطلاعات الرأي',
    descEn: 'Participate in community polls to share your insights on costing methodologies, challenges, and best practices.',
    descAr: 'شارك في استطلاعات الرأي المجتمعية لمشاركة رؤاك حول منهجيات التسعير والتحديات وأفضل الممارسات.',
    detailsEn: [
      'View active polls on the dashboard',
      'Cast your vote on methodology questions',
      'See real-time results after voting',
      'Change your vote if your opinion changes',
      'Polls help HHC understand cluster needs',
    ],
    detailsAr: [
      'عرض استطلاعات الرأي النشطة على لوحة التحكم',
      'الإدلاء بصوتك في أسئلة المنهجيات',
      'مشاهدة النتائج في الوقت الفعلي بعد التصويت',
      'تغيير صوتك إذا تغير رأيك',
      'تساعد الاستطلاعات هيئة الصحة في فهم احتياجات التجمعات',
    ],
  },
  {
    icon: <Users className="w-6 h-6" />,
    videoKey: 'clusters',
    titleEn: 'Clusters Directory',
    titleAr: 'دليل التجمعات الصحية',
    descEn: 'Browse the directory of all 20 health clusters in Saudi Arabia. Each cluster has its own profile with key contacts.',
    descAr: 'تصفح دليل جميع التجمعات الصحية العشرين في المملكة. لكل تجمع ملفه الخاص مع جهات الاتصال الرئيسية.',
    detailsEn: [
      'View all 20 health clusters',
      'See cluster-specific profiles and contacts',
      'Connect with costing leads from other clusters',
      'Filter clusters by region',
      'Collaborate across clusters on shared initiatives',
    ],
    detailsAr: [
      'عرض جميع التجمعات الصحية العشرين',
      'مشاهدة ملفات التجمعات وجهات الاتصال',
      'التواصل مع مسؤولي التسعير من التجمعات الأخرى',
      'تصفية التجمعات حسب المنطقة',
      'التعاون عبر التجمعات في المبادرات المشتركة',
    ],
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    videoKey: 'admin',
    titleEn: 'Admin Panel',
    titleAr: 'لوحة الإدارة',
    descEn: 'Platform administrators can manage users, create announcements, manage polls, and oversee the community.',
    descAr: 'يمكن لمسؤولي المنصة إدارة المستخدمين وإنشاء الإعلانات وإدارة استطلاعات الرأي والإشراف على المجتمع.',
    detailsEn: [
      'Manage platform users (add, edit roles, delete)',
      'Create and pin HHC announcements',
      'Create and manage community polls',
      'View platform statistics and activity',
      'Only accessible by HHC Admin role users',
    ],
    detailsAr: [
      'إدارة مستخدمي المنصة (إضافة، تعديل الأدوار، حذف)',
      'إنشاء وتثبيت إعلانات هيئة الصحة',
      'إنشاء وإدارة استطلاعات الرأي المجتمعية',
      'عرض إحصائيات المنصة والنشاط',
      'متاح فقط للمستخدمين بدور مسؤول هيئة الصحة',
    ],
  },
];

export default function HowToUsePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  const step = steps[currentStep];
  const isEn = lang === 'en';
  const videoSrc = `/videos/${step.videoKey}-${lang}.mp4`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50" dir={isEn ? 'ltr' : 'rtl'}>
      {/* Top Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">{isEn ? 'Back' : 'رجوع'}</span>
              </Link>
              <div className="w-px h-6 bg-gray-200" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">HHC</span>
                </div>
                <span className="font-semibold text-gray-900 text-sm">{isEn ? 'Walkthrough' : 'شرح المنصة'}</span>
              </div>
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Globe className="w-4 h-4" />
              {isEn ? 'العربية' : 'English'}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <PlayCircle className="w-4 h-4" />
            {isEn ? 'Video Guide' : 'دليل مرئي'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            {isEn ? 'How to use the platform?' : 'كيفية استخدام المنصة؟'}
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {isEn
              ? 'Watch narrated walkthrough videos for each section of the platform.'
              : 'شاهد فيديوهات شرح مسموعة لكل قسم من أقسام المنصة.'}
          </p>
        </div>

        {/* Step Counter */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === currentStep
                  ? 'bg-blue-600 scale-125'
                  : i < currentStep
                  ? 'bg-blue-400'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={isEn ? `Go to step ${i + 1}` : `الانتقال إلى الخطوة ${i + 1}`}
            />
          ))}
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Step Indicator */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 sm:px-8 py-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-100 text-sm font-medium">
                {isEn ? `Step ${currentStep + 1} of ${steps.length}` : `الخطوة ${currentStep + 1} من ${steps.length}`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={currentStep === steps.length - 1}
                  className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-white">
                {step.icon}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {isEn ? step.titleEn : step.titleAr}
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Video Player */}
            <div className="mb-8 bg-black rounded-xl overflow-hidden shadow-lg">
              <video
                key={videoSrc}
                controls
                className="w-full aspect-video"
                poster={`/videos/${step.videoKey}-en.mp4`}
                preload="metadata"
              >
                <source src={videoSrc} type="video/mp4" />
                {isEn ? (
                  <track
                    kind="subtitles"
                    srcLang="en"
                    label="English"
                    default
                  />
                ) : (
                  <track
                    kind="subtitles"
                    srcLang="ar"
                    label="العربية"
                    default
                  />
                )}
                Your browser does not support the video tag.
              </video>
            </div>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8">
              {isEn ? step.descEn : step.descAr}
            </p>

            <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider text-gray-500">
              {isEn ? 'Key Features' : 'الميزات الرئيسية'}
            </h3>
            <ul className="space-y-3">
              {(isEn ? step.detailsEn : step.detailsAr).map((detail, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">{i + 1}</span>
                  </div>
                  <span className="text-gray-700">{detail}</span>
                </li>
              ))}
            </ul>

            {/* Navigation Buttons */}
            <div className={`mt-10 flex items-center gap-4 ${isEn ? '' : 'flex-row-reverse'}`}>
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {isEn ? 'Previous' : 'السابق'}
                </button>
              )}
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm transition-colors"
                >
                  {isEn ? 'Next' : 'التالي'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium text-sm transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {isEn ? 'Enter the Platform' : 'الدخول إلى المنصة'}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 mb-3">
            {isEn ? 'Already know your way around?' : 'هل تعرف طريقك بالفعل؟'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 text-sm font-medium transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              {isEn ? 'Dashboard' : 'لوحة التحكم'}
            </Link>
            <Link href="/auth/login" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 text-sm font-medium transition-colors">
              {isEn ? 'Sign In' : 'تسجيل الدخول'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}