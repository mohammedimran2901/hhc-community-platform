'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, PlayCircle, Lightbulb } from 'lucide-react';

const HELP_SEEN_KEY = 'hhc-help-seen-v1';

export default function FirstVisitHelp() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show the help bubble on first visit (per browser / localStorage)
    const seen = localStorage.getItem(HELP_SEEN_KEY);
    if (!seen) {
      // Delay slightly so the page renders first
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(HELP_SEEN_KEY, 'true');
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 relative">
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm">Need help using the platform?</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Watch our quick walkthrough video to learn how to navigate the community forum, announcements, polls, and more.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Link
                href="/how-to-use"
                onClick={dismiss}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                Watch Walkthrough
              </Link>
              <button
                onClick={dismiss}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 px-2 py-1.5 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </div>

        {/* Pulsing indicator dot */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full" />
      </div>
    </div>
  );
}