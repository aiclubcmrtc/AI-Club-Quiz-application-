import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import {
  AlertTriangle,
  Bot,
  Zap,
  CheckCircle2,
  Clock,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  GitBranch,
  FileSearch,
  Activity,
  Layers,
  Database,
  Terminal,
  ShieldAlert,
  Server,
  ChevronRight
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { api } from '../api/client';
import { LogEntry, TraceSpan, TimelineEvent, IncidentMetrics } from '../types';
import { sound } from '../utils/audio';

export const IncidentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { incidents, investigateIncident, selectIncidentById } = useIncidents();

  const incident = incidents.find(i => i.id === id) || incidents[0];

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [traces, setTraces] = useState<TraceSpan[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [metrics, setMetrics] = useState<IncidentMetrics | null>(null);
  const [logFilter, setLogFilter] = useState<'ALL' | 'ERROR' | 'WARN' | 'INFO'>('ALL');
  const [activeTab, setActiveTab] = useState<'logs' | 'traces' | 'timeline'>('logs');

  useEffect(() => {
    if (incident?.id) {
      api.getLogs(incident.id).then(setLogs);
      api.getTraces(incident.id).then(setTraces);
      api.getTimeline(incident.id).then(setTimeline);
      api.getMetrics(incident.id).then(setMetrics);
    }
  }, [incident?.id]);

  if (!incident) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold">Incident Not Found</h2>
        <Link href="/incidents" className="text-primary mt-2 inline-block">Return to incidents</Link>
      </div>
    );
  }

  const isCrit = incident.severity === 'CRITICAL';
  const filteredLogs = logs.filter(l => logFilter === 'ALL' || l.level === logFilter);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
        <Link href="/incidents" className="hover:text-cyan-400 flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Incident Feed
        </Link>
        <span>/</span>
        <span className="text-slate-300 font-bold">{incident.id}</span>
      </div>

      {/* Incident War-Room Header */}
      <div className="rounded-2xl border border-border bg-[#0f172a]/90 p-6 panel-glass flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded px-2.5 py-0.5 text-xs font-mono font-black uppercase border ${
              isCrit ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}>
              {incident.severity}
            </span>
            <span className="font-mono text-sm font-bold text-slate-200">
              {incident.id}
            </span>
            <span className="rounded bg-slate-800 border border-border px-2 py-0.5 text-[10px] font-mono text-slate-300 uppercase">
              {incident.status}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Opened: {new Date(incident.createdAt).toLocaleTimeString()}
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            {incident.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>Impacted Services:</span>
            {incident.affectedServices.map(s => (
              <span key={s} className="rounded bg-card border border-border px-2 py-0.5 font-mono text-slate-300">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => investigateIncident(incident.id)}
            className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-500/40 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Bot className="h-4 w-4 text-cyan-400" />
            Trigger Deep Triage
          </button>

          <Link
            href="/remediation"
            onClick={() => selectIncidentById(incident.id)}
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:brightness-110 transition-all flex items-center gap-1.5"
          >
            <Zap className="h-4 w-4" />
            Remediation Console
          </Link>
        </div>
      </div>

      {/* Grid: Root Cause Analysis + Live Telemetry */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Root Cause Assessment Card (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-cyan-500/30 bg-[#0d1527] p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              AI Multi-Agent Root Cause Synthesis
            </div>
            <div className="rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 font-mono text-xs font-bold text-cyan-300">
              {incident.confidence}% CONFIDENCE
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-lg sm:text-xl font-bold text-white leading-snug">
              {incident.rootCause}
            </h3>

            <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-4 text-xs text-slate-300 leading-relaxed font-mono">
              <strong className="text-cyan-300 block mb-1">Causal Evidence Trail:</strong>
              P95 database latency rose 12,000% immediately following deployment <code>v2.4.1</code>. 
              Distributed traces confirm connection pool starvation was concentrated in the payment gateway pool acquire step.
            </div>

            {/* Proposed Recommendation */}
            <div className="rounded-lg border border-border bg-card/60 p-4">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1">
                RECOMMENDED MITIGATION
              </div>
              <div className="text-sm font-bold text-emerald-400">
                {incident.recommendation}
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <RotateCcw className="h-3 w-3" /> Reversible
                </span>
                <span>• Snapshot: {incident.mitigationPlan?.recoverySnapshotId || 'snap-rec-9941a'}</span>
                <span>• Est. Recovery: {incident.mitigationPlan?.estimatedTimeToRestoreSeconds || 45}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Incident Telemetry Metrics (1 col) */}
        <div className="rounded-xl border border-border bg-[#0f172a]/90 p-5 panel-glass">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              Live Span Metrics
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">REAL-TIME</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-border bg-card">
              <div className="text-muted-foreground text-[10px] font-mono">P95 LATENCY</div>
              <div className={`text-xl font-bold font-display mt-1 ${(metrics?.latency ?? 0) > 1000 ? 'text-red-400' : 'text-emerald-400'}`}>
                {metrics?.latency ?? 4210} ms
              </div>
            </div>
            <div className="p-3 rounded-lg border border-border bg-card">
              <div className="text-muted-foreground text-[10px] font-mono">ERROR RATE</div>
              <div className={`text-xl font-bold font-display mt-1 ${(metrics?.errorRate ?? 0) > 2 ? 'text-red-400' : 'text-emerald-400'}`}>
                {metrics?.errorRate ?? 18.4}%
              </div>
            </div>
            <div className="p-3 rounded-lg border border-border bg-card">
              <div className="text-muted-foreground text-[10px] font-mono">CPU LOAD</div>
              <div className="text-xl font-bold font-display text-slate-200 mt-1">
                {metrics?.cpu ?? 88}%
              </div>
            </div>
            <div className="p-3 rounded-lg border border-border bg-card">
              <div className="text-muted-foreground text-[10px] font-mono">POOL USAGE</div>
              <div className="text-xl font-bold font-display text-amber-400 mt-1">
                {metrics?.connections ?? 984}/1000
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Logs, Distributed Traces, Timeline */}
      <div className="rounded-xl border border-border bg-[#0f172a]/90 panel-glass overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-border bg-card/40 px-5 pt-3 gap-6 text-xs font-mono font-bold">
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'logs' ? 'border-primary text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileSearch className="h-3.5 w-3.5" />
            Correlated Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('traces')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'traces' ? 'border-primary text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="h-3.5 w-3.5" />
            Trace Waterfall ({traces.length})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'timeline' ? 'border-primary text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Incident Timeline ({timeline.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5">
          {activeTab === 'logs' && (
            <div className="space-y-3 font-mono text-xs">
              {/* Level Filter */}
              <div className="flex items-center gap-2 pb-2">
                <span className="text-[10px] text-muted-foreground uppercase">Filter Level:</span>
                {(['ALL', 'ERROR', 'WARN', 'INFO'] as const).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setLogFilter(lvl)}
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      logFilter === lvl ? 'bg-primary text-black' : 'bg-card border border-border text-slate-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {/* Log entries */}
              <div className="divide-y divide-border/40 max-h-96 overflow-y-auto pr-2">
                {filteredLogs.map((log, idx) => (
                  <div key={idx} className="py-2.5 flex items-start gap-3">
                    <span className="text-slate-500 text-[10px] shrink-0">{log.timestamp}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                      log.level === 'ERROR' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      log.level === 'WARN' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-slate-300 shrink-0 font-bold">{log.service}:</span>
                    <span className="text-slate-400 break-all">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'traces' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 mb-2 font-mono">
                Distributed trace spans showing downstream latency degradation:
              </div>
              <div className="space-y-2">
                {traces.map((span, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        span.status === 'degraded' ? 'bg-red-400 animate-pulse' :
                        span.status === 'watch' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`} />
                      <span className="font-bold text-white">{span.service}</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-slate-300">{span.dependency}</span>
                      {span.endpoint && (
                        <span className="text-[10px] text-muted-foreground bg-slate-800 px-1.5 py-0.5 rounded">
                          {span.endpoint}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${span.status === 'degraded' ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, (span.latency / 4500) * 100)}%` }}
                        />
                      </div>
                      <span className={`font-bold ${span.status === 'degraded' ? 'text-red-400' : 'text-slate-300'}`}>
                        {span.latency} ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4 font-mono text-xs">
              {timeline.map((evt, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <span className="text-slate-500 text-[11px] shrink-0 pt-0.5">{evt.timestamp}</span>
                  <div className="h-2 w-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <div>
                    <div className="font-bold text-white">{evt.type}</div>
                    <div className="text-slate-400 mt-0.5">{evt.description}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{evt.service}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
