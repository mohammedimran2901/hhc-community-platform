import Link from 'next/link';
import { ArrowRight, MessageSquare, Bell, Users, PlayCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HHC</span>
              </div>
              <span className="font-semibold text-gray-900">Costing Community</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/how-to-use"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                How to Use
              </Link>
              <Link
                href="/dashboard"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium transition-colors"
              >
                Enter Platform
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-4 min-h-[600px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        <div className="absolute inset-0 bg-white/30" />

        <div className="relative max-w-4xl mx-auto text-center z-10">
          <div className="inline-flex items-center gap-2 bg-blue-600/90 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Powered by Health Holding Company
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            HHC Clinical Costing Community
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto mb-10 font-medium">
            A platform for clinical costing professionals across Saudi Arabia's 20 health clusters
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-700 font-semibold text-lg transition-colors shadow-lg"
            >
              Enter the Platform
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/how-to-use"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 font-semibold text-lg transition-colors shadow-sm"
            >
              <PlayCircle className="w-5 h-5" />
              How to Use
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Link href="/dashboard" className="p-8 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">HHC Announcements & Guidance</h3>
              <p className="text-gray-600 leading-relaxed">
                Stay updated with the latest guidance and communications from the Health Holding Company.
              </p>
            </Link>

            <Link href="/forum" className="p-8 rounded-2xl border border-gray-100 hover:border-emerald-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community Forum</h3>
              <p className="text-gray-600 leading-relaxed">
                Ask questions, share knowledge, and collaborate with colleagues across all 20 clusters.
              </p>
            </Link>

            <Link href="/clusters" className="p-8 rounded-2xl border border-gray-100 hover:border-purple-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">20 Clusters Directory</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with costing leads and teams across all health clusters in Saudi Arabia.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* How to Use CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-50 to-emerald-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">New to the platform?</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Watch our quick walkthrough to learn how to use the community forum, announcements, polls, and more.
          </p>
          <Link
            href="/how-to-use"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 font-semibold transition-colors shadow-md"
          >
            <PlayCircle className="w-5 h-5" />
            Watch the Walkthrough
          </Link>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Explore the Platform</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium transition-colors">
              Dashboard
            </Link>
            <Link href="/announcements" className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 font-medium transition-colors">
              Announcements
            </Link>
            <Link href="/forum" className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 font-medium transition-colors">
              Forum
            </Link>
            <Link href="/clusters" className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 font-medium transition-colors">
              Clusters
            </Link>
            <Link href="/profile" className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 font-medium transition-colors">
              Profile
            </Link>
            <Link href="/admin" className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl border-2 border-red-200 hover:border-red-300 font-medium transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Health Holding Company. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}