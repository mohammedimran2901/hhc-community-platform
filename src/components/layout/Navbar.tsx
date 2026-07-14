'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getClient } from '@/lib/supabase/client-lazy';
import { LayoutDashboard, Bell, MessageSquare, Users, User, LogOut, Menu, X, Shield, Home, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/announcements', label: 'Announcements', icon: Bell },
  { href: '/forum', label: 'Forum', icon: MessageSquare },
  { href: '/clusters', label: 'Clusters', icon: Users },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setUsername('Demo User');
    getClient().then((supabase) => {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          setIsLoggedIn(true);
          if (data.user.user_metadata?.full_name) {
            setUsername(data.user.user_metadata.full_name as string);
          } else if (data.user.email) {
            setUsername(data.user.email);
          }
        }
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = await getClient();
      await supabase.auth.signOut();
    } catch {}
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-3">
            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Back</span>
            </button>
            <div className="w-px h-6 bg-gray-200" />
            <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors" title="Home">
              <Home className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Home</span>
            </Link>
            <div className="w-px h-6 bg-gray-200" />
            <Link href="/dashboard" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors" title="Dashboard">
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Dashboard</span>
            </Link>
            <div className="w-px h-6 bg-gray-200" />
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HHC</span>
              </div>
              <span className="font-semibold text-gray-900 hidden sm:block">Costing Community</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            {/* Admin Link */}
            <Link
              href="/admin"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith('/admin')
                  ? 'bg-red-50 text-red-700'
                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="hidden xl:inline">Admin</span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link href="/profile" className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500 hidden sm:block">{username || 'Profile'}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith('/admin') ? 'bg-red-50 text-red-700' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin Panel
            </Link>
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}