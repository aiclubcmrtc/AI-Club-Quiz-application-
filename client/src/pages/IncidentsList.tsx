import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  AlertTriangle,
  Search,
  Filter,
  Bot,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Flame,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { sound } from '../utils/audio';

export const IncidentsList: React.FC = () => {
  const { incidents, selectIncidentById, triggerChaosScenario } = useIncidents();
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = incidents.filter(inc => {
    const matchesSev = severityFilter === 'all' || inc.severity.toLowerCase() === severityFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || inc.status.toLowerCase().includes(statusFilter.toLowerCase());
    const matchesSearch = searchTerm === '' || 
      inc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.affectedServices.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSev && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-primary uppercase">
            <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
            LIVE TELEMETRY LOG
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Incident Feed
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Immutable log of all active anomalies, agent investigations, and verified restoral outcomes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerChaosScenario('redis-storm')}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-all"
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Inject Redis Storm</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#0f172a]/70 p-4 rounded-xl border border-border">
        {/* Severity Pill Selector */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Severity:
          </span>
          {['all', 'CRITICAL', 'HIGH'].map((sev) => (
            <button
              key={sev}
              onClick={() => {
                sound.playClick();
                setSeverityFilter(sev);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold uppercase transition-all ${
                severityFilter === sev
                  ? 'bg-primary text-black font-extrabold shadow-md shadow-cyan-500/20'
                  : 'bg-card border border-border text-slate-300 hover:text-white hover:border-slate-600'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, title, or service..."
            className="w-full rounded-lg border border-border bg-card/60 py-1.5 pl-8 pr-3 text-xs text-white placeholder-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Incidents Table / Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card/50 p-12 text-center text-slate-400">
            <ShieldCheck className="h-10 w-10 text-slate-600 mx-auto mb-2" />
            <div className="font-display font-bold text-white">No Incidents Found</div>
            <p className="text-xs mt-1">Try relaxing your search or filters.</p>
          </div>
        ) : (
          filtered.map((incident) => {
            const isCrit = incident.severity === 'CRITICAL';
            const isResolved = incident.status === 'RESOLVED';

            return (
              <div
                key={incident.id}
                className="rounded-xl border border-border bg-[#0f172a]/80 p-5 panel-glass hover:border-cyan-500/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                <div className="space-y-2 min-w-0 max-w-3xl">
                  {/* Status header */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded px-2.5 py-0.5 text-[11px] font-mono font-black uppercase border ${
                      isCrit
                        ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : isResolved
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {incident.severity}
                    </span>

                    <span className="font-mono text-xs font-bold text-slate-200">
                      {incident.id}
                    </span>

                    <span className="rounded bg-slate-800/80 border border-border px-2 py-0.5 text-[10px] font-mono text-slate-300 uppercase">
                      {incident.status}
                    </span>

                    <span className="text-[11px] font-mono text-cyan-400 font-semibold flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      {incident.confidence}% confidence
                    </span>

                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 ml-auto sm:ml-0">
                      <Clock className="h-3 w-3" />
                      {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Title & Root Cause Preview */}
                  <div>
                    <h3 className="font-display text-base font-bold text-white">
                      {incident.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      <strong className="text-slate-300">Root Cause:</strong> {incident.rootCause}
                    </p>
                  </div>

                  {/* Services & Metadata */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="text-slate-500">Affected:</span>
                    {incident.affectedServices.map(svc => (
                      <span key={svc} className="rounded bg-card border border-border px-2 py-0.5 text-[11px] font-mono text-slate-300">
                        {svc}
                      </span>
                    ))}
                    {incident.reversible && (
                      <span className="rounded bg-emerald-950/40 border border-emerald-800/30 text-emerald-400 px-2 py-0.5 text-[10px] font-mono flex items-center gap-1">
                        <RotateCcw className="h-2.5 w-2.5" /> Reversible
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/40">
                  <Link
                    href={`/incidents/${incident.id}`}
                    onClick={() => selectIncidentById(incident.id)}
                    className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-500/40 hover:text-white transition-colors"
                  >
                    Deep Inspection
                  </Link>

                  <Link
                    href="/remediation"
                    onClick={() => selectIncidentById(incident.id)}
                    className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:brightness-110 transition-all flex items-center gap-1.5"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Remediation
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
