import React from 'react';
import { Link } from 'wouter';
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Server,
  Zap,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Flame,
  ArrowDownRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Clock,
  Layers,
  Terminal
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { sound } from '../utils/audio';

export const CommandCenter: React.FC = () => {
  const { incidents, summary, selectIncidentById, triggerChaosScenario, resetToNominal } = useIncidents();

  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'REJECTED');
  const health = summary?.systemHealth ?? 98.4;
  const isHealthy = health > 95;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-primary uppercase">
            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
            OPERATIONAL FLIGHT COCKPIT
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Command Center
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real-time telemetry, automated multi-agent triage, and air-gapped human control gates.
          </p>
        </div>

        {/* Quick Simulation Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerChaosScenario('payment-spike')}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all"
            title="Inject simulated Payment API Latency Spike"
          >
            <Flame className="h-3.5 w-3.5 text-red-400" />
            <span className="hidden sm:inline">Simulate P1 Spike</span>
          </button>
          <button
            onClick={resetToNominal}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all"
            title="Reset environment to nominal state"
          >
            <RotateCcw className="h-3.5 w-3.5 text-emerald-400" />
            <span>Nominal Reset</span>
          </button>
        </div>
      </div>

      {/* Top 5 KPI Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Health Score Gauge */}
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-border bg-[#0f172a]/80 p-4 panel-glass">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">SYSTEM HEALTH</span>
            <Activity className={`h-4 w-4 ${isHealthy ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`font-display text-3xl font-black ${isHealthy ? 'text-emerald-400' : 'text-amber-400'}`}>
              {health}%
            </span>
            <span className="text-[11px] font-mono text-slate-400">INDEX</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${health}%` }}
            />
          </div>
        </div>

        {/* Active Incidents */}
        <div className="rounded-xl border border-border bg-[#0f172a]/80 p-4 panel-glass">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">ACTIVE INCIDENTS</span>
            <AlertTriangle className={`h-4 w-4 ${activeIncidents.length > 0 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`font-display text-3xl font-black ${activeIncidents.length > 0 ? 'text-red-400' : 'text-slate-100'}`}>
              {activeIncidents.length}
            </span>
            <span className="text-[11px] text-slate-400">
              {activeIncidents.length === 1 ? '1 needs review' : `${activeIncidents.length} in queue`}
            </span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-muted-foreground">
            {activeIncidents.filter(i => i.severity === 'CRITICAL').length} Critical • {activeIncidents.filter(i => i.severity === 'HIGH').length} High
          </div>
        </div>

        {/* Healthy Services */}
        <div className="rounded-xl border border-border bg-[#0f172a]/80 p-4 panel-glass">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">SERVICES HEALTHY</span>
            <Server className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-black text-cyan-400">
              {summary?.servicesHealthy ?? 10}/{summary?.servicesTotal ?? 12}
            </span>
            <span className="text-[11px] text-slate-400">nodes</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-muted-foreground">
            Edge & Cache nominal
          </div>
        </div>

        {/* AI Confidence */}
        <div className="rounded-xl border border-border bg-[#0f172a]/80 p-4 panel-glass">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">AI CONFIDENCE</span>
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-black text-primary">
              {summary?.aiConfidence ?? 94}%
            </span>
            <span className="text-[11px] text-slate-400">calibrated</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-muted-foreground">
            AST diff correlation
          </div>
        </div>

        {/* Global Error Rate & MTTR */}
        <div className="rounded-xl border border-border bg-[#0f172a]/80 p-4 panel-glass">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">ERROR RATE</span>
            <ArrowDownRight className={`h-4 w-4 ${(summary?.errorRate ?? 0) > 2 ? 'text-red-400' : 'text-emerald-400'}`} />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`font-display text-3xl font-black ${(summary?.errorRate ?? 0) > 2 ? 'text-red-400' : 'text-emerald-400'}`}>
              {summary?.errorRate ?? 0.08}%
            </span>
            <span className="text-[11px] text-slate-400">p99</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-muted-foreground">
            avg MTTR: {summary?.recoveryTime ?? 42}s
          </div>
        </div>
      </div>

      {/* Main Grid: Attention Queue + System Posture */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Attention Queue (2 Cols) */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-[#0f172a]/90 panel-glass overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-card/40">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-slate-200">
                Incident Attention Queue
              </h2>
            </div>
            <Link 
              href="/incidents" 
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              View all ({incidents.length}) <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-border/60 flex-1">
            {activeIncidents.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                <div className="font-display text-base font-bold text-white">All Clear — No Active Incidents</div>
                <p className="text-xs text-slate-400 mt-1">SentinelOps continuous triage agents are observing telemetry.</p>
                <button
                  onClick={() => triggerChaosScenario('payment-spike')}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20"
                >
                  <Flame className="h-3.5 w-3.5" /> Simulate Incident Now
                </button>
              </div>
            ) : (
              activeIncidents.map((incident) => {
                const isCrit = incident.severity === 'CRITICAL';
                return (
                  <div
                    key={incident.id}
                    className="p-5 hover:bg-card/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded px-2 py-0.5 text-[10px] font-mono font-extrabold uppercase border ${
                          isCrit 
                            ? 'bg-red-500/15 text-red-400 border-red-500/30' 
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}>
                          {incident.severity}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-300">
                          {incident.id}
                        </span>
                        <span className="rounded bg-slate-800 border border-border px-2 py-0.5 text-[10px] font-mono text-slate-400 uppercase">
                          {incident.workflowState.replace('-', ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                          {incident.confidence}% AI confidence
                        </span>
                      </div>

                      <h3 className="font-display text-sm font-bold text-white truncate">
                        {incident.title}
                      </h3>

                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span>Services:</span>
                        <span className="text-slate-300 font-mono text-[11px]">
                          {incident.affectedServices.join(' • ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/incidents/${incident.id}`}
                        onClick={() => selectIncidentById(incident.id)}
                        className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-cyan-500/40 hover:text-white transition-colors"
                      >
                        Inspect
                      </Link>
                      <Link
                        href="/remediation"
                        onClick={() => selectIncidentById(incident.id)}
                        className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:brightness-110 transition-all flex items-center gap-1.5"
                      >
                        <Zap className="h-3.5 w-3.5" />
                        Remediation Gate
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* System Posture & Service Pressure (1 Col) */}
        <div className="space-y-6">
          {/* Microservice Pressure */}
          <div className="rounded-xl border border-border bg-[#0f172a]/90 p-5 panel-glass">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5 text-cyan-400" />
                Service Pressure
              </h3>
              <Link href="/service-map" className="text-[11px] text-cyan-400 hover:underline">
                Topology →
              </Link>
            </div>

            <div className="space-y-3.5">
              {[
                { name: 'Payment Gateway', load: activeIncidents.some(i => i.id === 'INC-1042') ? 94 : 32, state: activeIncidents.some(i => i.id === 'INC-1042') ? 'CRITICAL' : 'NOMINAL' },
                { name: 'Postgres Primary', load: activeIncidents.some(i => i.id === 'INC-1042') ? 88 : 41, state: activeIncidents.some(i => i.id === 'INC-1042') ? 'WARNING' : 'NOMINAL' },
                { name: 'Redis Cache Cluster', load: activeIncidents.some(i => i.id === 'INC-1043') ? 92 : 28, state: activeIncidents.some(i => i.id === 'INC-1043') ? 'WARNING' : 'NOMINAL' },
                { name: 'API Gateway', load: 45, state: 'NOMINAL' },
                { name: 'Auth Service', load: activeIncidents.some(i => i.id === 'INC-1044') ? 81 : 22, state: activeIncidents.some(i => i.id === 'INC-1044') ? 'WARNING' : 'NOMINAL' }
              ].map((svc, i) => (
                <div key={i} className="text-xs">
                  <div className="flex justify-between items-center mb-1 font-mono">
                    <span className="text-slate-300 font-semibold">{svc.name}</span>
                    <span className={svc.state === 'CRITICAL' ? 'text-red-400 font-bold' : svc.state === 'WARNING' ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                      {svc.load}% {svc.state}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        svc.load > 85 ? 'bg-red-500' : svc.load > 60 ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${svc.load}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Security & Guardrails Checklist */}
          <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-blue-950/20 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              Air-Gapped SRE Guardrails
            </div>
            <ul className="text-[11px] space-y-1.5 text-slate-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                Human approval required for all P1/P2 changes
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                Pre-flight sandbox rehearsal before production
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                Automated 1-click snapshot rollback ready
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
