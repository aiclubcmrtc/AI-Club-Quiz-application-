import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  ShieldCheck, 
  Search, 
  Volume2, 
  VolumeX, 
  Flame, 
  RotateCcw, 
  ChevronDown, 
  Sparkles,
  ExternalLink,
  Activity,
  Menu,
  X
} from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';

export const Navbar: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
  const [location] = useLocation();
  const { summary, soundEnabled, toggleSound, triggerChaosScenario, resetToNominal, searchQuery, setSearchQuery } = useIncidents();
  const [chaosDropdownOpen, setChaosDropdownOpen] = useState(false);

  const isHealthy = (summary?.systemHealth ?? 100) > 95;
  const healthPercent = summary?.systemHealth ?? 98.4;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-xl md:px-8">
      {/* Left: Mobile toggle + breadcrumb status */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted hover:text-white md:hidden"
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/30 text-primary transition-all group-hover:scale-105 group-hover:glow-cyan-sm">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="font-display text-sm font-bold tracking-tight text-white hidden sm:inline-block">
            sentinel<span className="text-primary font-extrabold">ops</span>
          </span>
        </Link>

        <span className="text-slate-600 hidden sm:inline">/</span>

        {/* Live System Health Beacon */}
        <div className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs">
          <span className={`relative flex h-2 w-2`}>
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isHealthy ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className="font-mono text-[11px] font-semibold tracking-wider text-slate-300">
            {healthPercent}% HEALTH
          </span>
        </div>
      </div>

      {/* Middle: Fast Search */}
      <div className="hidden lg:flex items-center relative max-w-xs w-full mx-4">
        <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter incidents, services (e.g. INC-1042)..."
          className="w-full rounded-lg border border-border bg-card/50 py-1.5 pl-8 pr-12 text-xs text-white placeholder-muted-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/40"
        />
        <kbd className="absolute right-2.5 top-2 pointer-events-none rounded border border-border bg-background px-1.5 text-[9px] font-mono font-medium text-muted-foreground">
          Ctrl K
        </kbd>
      </div>

      {/* Right Controls: Simulator Trigger, Sound, User */}
      <div className="flex items-center gap-2.5">
        {/* Chaos Scenario Trigger Dropdown */}
        <div className="relative">
          <button
            onClick={() => setChaosDropdownOpen(!chaosDropdownOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-300 transition-all hover:bg-amber-500/20"
            title="Inject chaos incident to test AI response"
          >
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Simulate Chaos</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {chaosDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl border border-border bg-card p-2 shadow-2xl z-50">
              <div className="px-2 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border mb-1">
                Inject Synthetic Failure
              </div>
              <button
                onClick={() => {
                  triggerChaosScenario('payment-spike');
                  setChaosDropdownOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 text-xs rounded-lg hover:bg-primary/10 hover:text-cyan-300 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white">Payment Latency Spike (P1)</div>
                  <div className="text-[10px] text-muted-foreground">Exhausts DB connection pool</div>
                </div>
                <Flame className="h-3.5 w-3.5 text-red-400 shrink-0" />
              </button>
              <button
                onClick={() => {
                  triggerChaosScenario('redis-storm');
                  setChaosDropdownOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 text-xs rounded-lg hover:bg-primary/10 hover:text-cyan-300 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white">Redis Key Eviction Storm (P2)</div>
                  <div className="text-[10px] text-muted-foreground">OOM flood on session shard</div>
                </div>
                <Flame className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              </button>
              <button
                onClick={() => {
                  triggerChaosScenario('auth-cascade');
                  setChaosDropdownOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 text-xs rounded-lg hover:bg-primary/10 hover:text-cyan-300 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white">Auth Token Flapping (P2)</div>
                  <div className="text-[10px] text-muted-foreground">JWKS timeout cascade</div>
                </div>
                <Flame className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              </button>
              <div className="border-t border-border mt-1 pt-1">
                <button
                  onClick={() => {
                    resetToNominal();
                    setChaosDropdownOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-2 text-xs rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-colors flex items-center gap-2 font-medium"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore All Systems Nominal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Audio feedback button */}
        <button
          onClick={toggleSound}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:text-white ${soundEnabled ? 'text-primary border-primary/30 bg-primary/5' : 'bg-card'}`}
          title={soundEnabled ? 'Sound Effects Enabled' : 'Sound Effects Muted'}
          aria-label="Toggle sound feedback"
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>

        {/* Landing Page link if inside cockpit */}
        {location !== '/' && (
          <Link
            href="/"
            className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-cyan-400 px-2 py-1"
          >
            Landing Page <ExternalLink className="h-3 w-3" />
          </Link>
        )}

        {/* Operator Profile */}
        <Link 
          href="/settings" 
          className="flex items-center gap-2 rounded-lg border border-border bg-card p-1 pr-2.5 transition-colors hover:border-primary/40"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-tr from-cyan-600 to-blue-600 text-[10px] font-bold text-white">
            AR
          </div>
          <span className="hidden sm:inline font-mono text-[11px] text-slate-300 font-medium">Alex Rivera</span>
        </Link>
      </div>
    </header>
  );
};
