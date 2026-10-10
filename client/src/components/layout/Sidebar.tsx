import React from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  AlertTriangle,
  Bot,
  Network,
  History,
  Zap,
  Terminal,
  Gauge,
  ListChecks,
  Settings2,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Radio,
  ExternalLink
} from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [location] = useLocation();
  const { incidents, summary } = useIncidents();

  const activeIncidentsCount = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'REJECTED').length;

  const navGroups = [
    {
      label: 'OPERATIONS',
      items: [
        { label: 'Command Center', href: '/command-center', icon: LayoutDashboard },
        { 
          label: 'Incidents Feed', 
          href: '/incidents', 
          icon: AlertTriangle, 
          badge: activeIncidentsCount > 0 ? `${activeIncidentsCount}` : undefined,
          badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30'
        },
        { label: 'AI Investigation', href: '/investigation', icon: Bot, highlight: true },
        { label: 'Service Map', href: '/service-map', icon: Network },
        { label: 'Incident Timeline', href: '/timeline', icon: History },
      ]
    },
    {
      label: 'SAFETY & CONTROL',
      items: [
        { label: 'Remediation Gate', href: '/remediation', icon: Zap },
        { label: 'Sandbox Simulator', href: '/sandbox', icon: Terminal },
        { label: 'AI Evaluations', href: '/evaluations', icon: Gauge },
        { label: 'Audit Trail', href: '/audit', icon: ListChecks },
      ]
    },
    {
      label: 'CONFIGURATION',
      items: [
        { label: 'System Settings', href: '/settings', icon: Settings2 },
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-[#0b1120] text-slate-300 transition-transform duration-300 ease-in-out md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link href="/" onClick={onClose} className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Sentinel<span className="text-primary">Ops</span>
                <span className="rounded bg-primary/20 px-1 py-0.5 text-[9px] font-mono text-cyan-300 font-extrabold">AI</span>
              </div>
              <div className="text-[9px] font-mono font-medium tracking-wider text-muted-foreground uppercase">
                Autonomous Command
              </div>
            </div>
          </Link>
        </div>

        {/* Live Agent Autonomy Status Card */}
        <div className="mx-3 mt-4 rounded-xl border border-cyan-500/20 bg-gradient-to-b from-cyan-950/30 to-blue-950/20 p-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-cyan-400">
            <span className="flex items-center gap-1.5">
              <Radio className="h-3 w-3 animate-pulse text-cyan-400" />
              AUTONOMY CORE
            </span>
            <span className="font-mono text-[10px] text-cyan-300/80">AIR-GAPPED</span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-300 leading-tight">
            Human approval gate active on all production modifications.
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-wider text-muted-foreground uppercase">
                {group.label}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location === item.href || (item.href === '/command-center' && location === '/dashboard');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`
                        group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all
                        ${isActive 
                          ? 'bg-primary/15 text-cyan-300 font-semibold border border-primary/30 glow-cyan-sm' 
                          : 'text-slate-400 hover:bg-card/70 hover:text-slate-200 border border-transparent'}
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-200'}`} />
                        <span>{item.label}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {item.badge && (
                          <span className={`rounded-full border px-1.5 py-0.2 text-[10px] font-mono font-bold ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                        {item.highlight && !isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                        )}
                        {isActive && (
                          <ChevronRight className="h-3.5 w-3.5 text-primary" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer info */}
        <div className="border-t border-border p-3.5 bg-card/40">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-mono">v3.2.0 • PROD</span>
            <Link href="/" className="hover:text-cyan-400 flex items-center gap-1">
              Landing Page <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};
