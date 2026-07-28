import Link from 'next/link';
import {
  ArrowRight,
  MessageSquare,
  Bell,
  Users,
  PlayCircle,
  Vote,
  ShieldCheck,
  MapPin,
  Sparkles,
  CheckCircle,
  BarChart3,
  Lock,
} from 'lucide-react';

const features = [
  {
    href: '/announcements',
    icon: Bell,
    color: 'bg-blue-500/10 text-blue-600',
    ring: 'group-hover:ring-blue-200',
    title: 'Official Announcements',
    description:
      'Guidance, policy updates, and training communications from the Health Holding Company — pinned, categorised, and always up to date.',
  },
  {
    href: '/forum',
    icon: MessageSquare,
    color: 'bg-emerald-500/10 text-emerald-600',
    ring: 'group-hover:ring-emerald-200',
    title: 'Community Forum',
    description:
      'Ask questions, share costing methodologies, and resolve challenges together with peers across all 20 health clusters.',
  },
  {
    href: '/dashboard',
    icon: Vote,
    color: 'bg-amber-500/10 text-amber-600',
    ring: 'group-hover:ring-amber-200',
    title: 'Community Polls',
    description:
      'Shape national costing practice. Vote on approaches, benchmark your cluster, and see results in real time.',
  },
  {
    href: '/clusters',
    icon: MapPin,
    color: 'bg-purple-500/10 text-purple-600',
    ring: 'group-hover:ring-purple-200',
    title: 'Cluster Directory',
    description:
      'A complete directory of all 20 health clusters — find and connect with costing leads and teams across the Kingdom.',
  },
  {
    href: '/dashboard',
    icon: BarChart3,
    color: 'bg-indigo-500/10 text-indigo-600',
    ring: 'group-hover:ring-indigo-200',
    title: 'Personal Dashboard',
    description:
      'Your central hub — recent discussions, latest announcements, active polls, and your community activity at a glance.',
  },
  {
    href: '/dashboard',
    icon: ShieldCheck,
    color: 'bg-rose-500/10 text-rose-600',
    ring: 'group-hover:ring-rose-200',
    title: 'Secure & Managed',
    description:
      'Accounts are provisioned by HHC administrators. Role-based access keeps the community professional and secure.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Receive Your Account',
    description:
      'Your platform administrator creates your account using your official email. Credentials are shared with you securely.',
  },
  {
    number: '02',
    title: 'Sign In Securely',
    description:
      'Log in with your email and password, then set your own password from your profile page.',
  },
  {
    number: '03',
    title: 'Engage & Collaborate',
    description:
      'Start discussions, reply to colleagues, vote in polls, and stay current with HHC guidance.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-950 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm tracking-tight">HHC</span>
              </div>
              <div className="leading-tight">
                <span className="font-semibold text-gray-900 block text-sm">Clinical Costing</span>
                <span className="text-xs text-gray-500">Community Platform</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/how-to-use"
                className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors hidden sm:inline-block"
              >
                How to Use
              </Link>
              <Link
                href="/auth/login"
                className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 font-medium text-sm transition-all shadow-sm hover:shadow-md"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Premium gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-br from-blue-100/60 via-emerald-50/40 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-amber-100/40 to-transparent rounded-full blur-3xl opacity-60" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-slate-900 text-white pl-2 pr-4 py-1.5 rounded-full text-sm font-medium mb-8 shadow-lg">
            <span className="flex items-center justify-center w-6 h-6 bg-emerald-500 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </span>
            Powered by Health Holding Company
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
            The National Community for
            <span className="block bg-gradient-to-r from-blue-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Clinical Costing Excellence
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connecting costing professionals across Saudi Arabia's 20 health clusters —
            share knowledge, align methodologies, and shape the future of healthcare costing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-slate-800 font-semibold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
            >
              Sign In to the Platform
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/how-to-use"
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-2xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-semibold text-lg transition-all shadow-sm"
            >
              <PlayCircle className="w-5 h-5 text-emerald-600" />
              Watch the Walkthrough
            </Link>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 max-w-2xl mx-auto divide-x divide-gray-200 bg-white/60 backdrop-blur rounded-2xl border border-gray-100 shadow-sm py-6">
            <div className="px-4">
              <p className="text-3xl font-bold text-gray-900">20</p>
              <p className="text-sm text-gray-500 mt-1">Health Clusters</p>
            </div>
            <div className="px-4">
              <p className="text-3xl font-bold text-gray-900">1</p>
              <p className="text-sm text-gray-500 mt-1">Unified Community</p>
            </div>
            <div className="px-4">
              <p className="text-3xl font-bold text-gray-900">24/7</p>
              <p className="text-sm text-gray-500 mt-1">Collaboration</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-3">
              Everything in one place
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Built for costing professionals
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto text-lg">
              Every tool your cluster needs to collaborate, learn, and stay aligned with national guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className={`group p-8 rounded-3xl bg-white border border-gray-100 ring-1 ring-transparent ${feature.ring} hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
              >
                <div className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center mb-5`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  {feature.title}
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-gray-400" />
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-3">
              Getting started
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-slate-700 to-transparent -translate-x-4" />
                )}
                <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition-colors">
                  <span className="text-5xl font-bold bg-gradient-to-br from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                    {step.number}
                  </span>
                  <h3 className="text-lg font-semibold text-white mt-4 mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-400">
            <span className="inline-flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" /> Admin-provisioned accounts
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Role-based access
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> All 20 clusters represented
            </span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-50 to-transparent rounded-full blur-2xl" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                New to the platform?
              </h2>
              <p className="text-gray-600 mb-8 max-w-xl mx-auto text-lg">
                Watch our guided walkthrough covering the forum, announcements, polls,
                cluster directory, and everything else the community offers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/how-to-use"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-2xl hover:bg-emerald-700 font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  <PlayCircle className="w-5 h-5" />
                  Watch the Walkthrough
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 text-slate-700 px-8 py-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 font-semibold transition-all"
                >
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center border border-slate-700">
                <span className="text-white font-bold text-sm">HHC</span>
              </div>
              <div className="leading-tight">
                <span className="font-semibold text-white block">Clinical Costing Community</span>
                <span className="text-xs text-slate-500">Health Holding Company</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/how-to-use" className="hover:text-white transition-colors">How to Use</Link>
              <Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link>
            </div>
          </div>
          <p className="text-sm text-center pt-8 text-slate-500">
            &copy; {new Date().getFullYear()} Health Holding Company. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
