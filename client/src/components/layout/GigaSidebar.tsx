import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Home,
  PlayCircle,
  Tv,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  X,
  Zap,
  ArrowRight,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { sounds } from '../../utils/soundEngine';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface GigaSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GigaSidebar: React.FC<GigaSidebarProps> = ({ isOpen, onClose }) => {
  const [location] = useLocation();
  const [audioEnabled, setAudioEnabled] = useState(sounds.enabled);
  const [quickPin, setQuickPin] = useState('');
  const { clubLogo, eventName, isAuthenticated, roomPin } = useAdminAuth();

  const toggleAudio = () => {
    sounds.enabled = !sounds.enabled;
    setAudioEnabled(sounds.enabled);
    if (sounds.enabled) sounds.playPop();
  };

  // Curated navigation links - only essentials
  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/play', label: 'Join Game', icon: PlayCircle, badge: 'Live PIN', badgeColor: 'bg-emerald-100 text-emerald-700' },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/about', label: 'AI Club CMRTC', icon: Users },
    // Only visible for admin when authenticated
    ...(isAuthenticated ? [
      { href: '/host', label: 'Host Projector', icon: Tv, badge: 'Admin Live', badgeColor: 'bg-blue-100 text-blue-700' },
      { href: '/admin', label: 'Master Admin', icon: ShieldCheck, badge: 'Active', badgeColor: 'bg-amber-100 text-amber-800' },
    ] : []),
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm md:hidden"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-white/95 backdrop-blur-xl border-r border-blue-100 text-slate-800 transition-transform duration-300 ease-in-out md:translate-x-0 shadow-lg md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header with Circular AI Club Logo */}
        <div className="px-5 py-4 border-b border-blue-100 flex items-center justify-between bg-blue-50/40">
          <Link href="/" onClick={onClose} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full overflow-hidden p-0.5 bg-white border border-blue-200 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform ring-2 ring-blue-500/10">
              <img src={clubLogo} alt="AI Club Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <div className="font-display font-bold text-lg tracking-tight text-slate-900 leading-tight">
                AI CLUB <span className="text-blue-600 font-extrabold">CMRTC</span>
              </div>
              <div className="text-[10px] font-medium text-slate-500 tracking-wider uppercase truncate max-w-[110px]">
                {eventName}
              </div>
            </div>
          </Link>
          <button 
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-blue-100/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Join PIN Widget */}
        <div className="p-3 mx-3 my-3 rounded-2xl bg-blue-50/80 border border-blue-200/80 shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1.5">
            <span className="flex items-center gap-1.5 text-blue-600 font-bold">
              <Zap className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
              Quick Join Room
            </span>
            <span className="text-[10px] text-emerald-600 font-bold px-1.5 py-0.2 rounded-full bg-emerald-100">LIVE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <input 
              type="text" 
              placeholder={`PIN: ${roomPin.replace(/\s+/g, '')}`} 
              value={quickPin}
              onChange={(e) => setQuickPin(e.target.value)}
              className="w-full bg-white border border-blue-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 font-mono font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner"
            />
            <Link 
              href={`/play?pin=${quickPin || roomPin.replace(/\s+/g, '')}`}
              onClick={onClose}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shrink-0 shadow-sm"
              title="Join Game"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="p-3 border-t border-blue-100 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
          <button 
            onClick={toggleAudio}
            className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors"
          >
            {audioEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-medium">Audio On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-rose-500" />
                <span className="text-[11px] font-medium">Muted</span>
              </>
            )}
          </button>
          <span className="text-[10px] font-mono text-slate-400">CMRTC • 2026</span>
        </div>
      </aside>
    </>
  );
};
