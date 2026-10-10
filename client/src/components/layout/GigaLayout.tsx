import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, Play, Sparkles, ShieldCheck } from 'lucide-react';
import { GigaSidebar } from './GigaSidebar';
import { BackgroundShapes } from './BackgroundShapes';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface GigaLayoutProps {
  children: React.ReactNode;
}

export const GigaLayout: React.FC<GigaLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { clubLogo, isAuthenticated } = useAdminAuth();
  const [, setLocation] = useLocation();

  // Discreet Admin hotkey: Alt+A or Ctrl+Shift+A for organizers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setLocation('/admin/login');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-transparent text-slate-800 flex flex-col font-sans relative selection:bg-blue-500/20 selection:text-blue-700">
      {/* Background Shapes with White & Light Blue Theme */}
      <BackgroundShapes />

      {/* Sidebar Navigation */}
      <GigaSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-60 flex flex-col min-w-0 z-10">
        {/* Mobile Header (White & Light Blue) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-blue-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white p-0.5 border border-blue-200 flex items-center justify-center shadow-sm">
                <img src={clubLogo} alt="Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <span className="font-display font-bold text-base text-slate-900">
                AI CLUB <span className="text-blue-600 font-extrabold">CMRTC</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/play"
              className="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-3 h-3 fill-current" />
              Join Game
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

        {/* Footer (Clean White & Light Blue) */}
        <footer className="border-t border-blue-100 bg-white/80 backdrop-blur-md py-6 px-4 sm:px-8 mt-12 text-center sm:text-left text-xs text-slate-500 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-display font-bold text-sm text-slate-800">
                AI CLUB CMRTC
              </span>
              <span>•</span>
              <span>CMR Technical Campus, Hyderabad</span>
              <span>•</span>
              <span className="text-blue-600 font-semibold">Battle of Bits '26</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-slate-600">
              <Link href="/about" className="hover:text-blue-600 transition-colors">About Club</Link>
              <Link href="/leaderboard" className="hover:text-blue-600 transition-colors">Leaderboard</Link>
              <Link href="/play" className="hover:text-blue-600 transition-colors">Join Arena</Link>
              {isAuthenticated && (
                <Link href="/admin" className="hover:text-blue-600 transition-colors font-semibold text-blue-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Master Admin
                </Link>
              )}
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1 text-blue-600 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Live Quiz Game
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
