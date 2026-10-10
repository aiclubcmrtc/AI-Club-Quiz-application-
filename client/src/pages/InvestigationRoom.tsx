import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  Bot,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Lock,
  Layers,
  FileSearch,
  GitBranch,
  ShieldCheck,
  Terminal,
  Zap,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { sound } from '../utils/audio';

export const InvestigationRoom: React.FC = () => {
  const { incidents, selectedIncident, investigateIncident } = useIncidents();
  const incident = selectedIncident || incidents[0];

  const [investigating, setInvestigating] = useState(false);
  const [agentLogs, setAgentLogs] = useState<string[]>([
    "Triage Sentinel: Ingested telemetry alert from Datadog webhook (HTTP 504 surge)",
    "Trace Correlator: Extracted 240 spans; identified 3,950ms bottleneck at Postgres pool checkout",
    "AST Diff Sentinel: Scanned Git commit 8f42c1 in release v2.4.1 — unindexed query detected",
    "Inference Sentinel: Hypothesis confidence calibrated at 94.2% (Connection pool starvation)"
  ]);

  const handleRunInvestigation = async () => {
    sound.playClick();
    setInvestigating(true);

    // Stream thought tokens
    setAgentLogs([
      "Triage Sentinel: Initializing fresh telemetry capture across us-east-1 and us-west-2...",
    ]);

    setTimeout(() => {
      setAgentLogs(prev => [
        ...prev,
        "Log Correlator: Parsed 14,200 structured log lines from checkout-api pods.",
        "Log Correlator: Found 18 fatal 'PG::ConnectionBad: pool exhausted' exceptions."
      ]);
      sound.playClick();
    }, 1000);

    setTimeout(() => {
      setAgentLogs(prev => [
        ...prev,
        "Trace Correlator: Correlating Zipkin trace 9f8a-221 -> span 'db_acquire_lock' exceeded 250ms SLA.",
        "AST Correlator: Diffing commit v2.4.1 vs v2.4.0 — query lacks composite index on (account_id, created_at)."
      ]);
      sound.playClick();
    }, 2200);

    setTimeout(async () => {
      setAgentLogs(prev => [
        ...prev,
        "Inference Sentinel: Leading hypothesis confirmed with 94.2% Bayesian confidence.",
        "Remediation Planner: Reversible rollback plan synthesized. Sandbox dry-run passed."
      ]);
      sound.playSuccess();
      setInvestigating(false);
      if (incident?.id) {
        await investigateIncident(incident.id);
      }
    }, 3600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-primary uppercase">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            MULTI-AGENT AUTONOMOUS CORE
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            AI Investigation Room
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Autonomous multi-agent orchestration reasoning over logs, distributed traces, and AST differentials.
          </p>
        </div>

        <button
          onClick={handleRunInvestigation}
          disabled={investigating}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${investigating ? 'animate-spin' : ''}`} />
          <span>{investigating ? 'Correlating Telemetry...' : 'Run Deep Multi-Agent Triage'}</span>
        </button>
      </div>

      {/* Grid: Agent Roster + Live Reasoning Ledger */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Agent Roster (1 col) */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-[#0f172a]/90 p-5 panel-glass">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-border pb-3 mb-4 flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-cyan-400" />
              Active Autonomous Agents
            </div>

            <div className="space-y-3">
              {[
                { name: 'Triage Sentinel', role: 'Signal & Alert Ingestion', status: 'ACTIVE', icon: Sparkles },
                { name: 'Trace Correlator', role: 'Distributed Span Analysis', status: investigating ? 'THINKING' : 'IDLE', icon: GitBranch },
                { name: 'AST Diff Sentinel', role: 'Git Commit Code Inspection', status: investigating ? 'THINKING' : 'READY', icon: Terminal },
                { name: 'Inference Sentinel', role: 'Hypothesis Probability Model', status: 'ACTIVE', icon: Layers },
                { name: 'Remediation Planner', role: 'Safe Rollback Architect', status: 'STANDBY', icon: Zap }
              ].map((agent, i) => {
                const Icon = agent.icon;
                return (
                  <div key={i} className="p-3 rounded-lg border border-border bg-card/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 border border-primary/20 text-primary">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-white">{agent.name}</div>
                        <div className="text-[10px] text-muted-foreground">{agent.role}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                      agent.status === 'THINKING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' :
                      agent.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Safety Boundary Callout */}
          <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-blue-950/20 p-4 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
              <Lock className="h-3.5 w-3.5" />
              AIR-GAPPED ACTION BOUNDARY
            </div>
            Agents are restricted to read-only diagnostics and ephemeral sandbox rehearsals. No production state can mutate without operator sign-off.
          </div>
        </div>

        {/* Right: Hypothesis Ledger & Live Thought Stream (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Leading Hypothesis Card */}
          <div className="rounded-xl border border-cyan-500/30 bg-[#0d1527] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-4">
              <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                Leading Causal Hypothesis
              </span>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 font-mono text-xs font-bold text-cyan-300">
                {incident?.confidence ?? 94}% CONFIDENCE
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-xl font-bold text-white">
                {incident?.rootCause || 'Database connection pool starvation triggered by release v2.4.1.'}
              </h3>

              {/* Hypothesis Competitors Ledger */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-mono font-bold text-muted-foreground uppercase">
                  COMPETING HYPOTHESES PROBABILITY DISTRIBUTION
                </div>

                {[
                  { title: 'Postgres Connection Pool Starvation (Unindexed Query)', prob: 94, status: 'Strong Evidence' },
                  { title: 'Redis Cache Shard Key Eviction Saturation', prob: 22, status: 'Weak Support' },
                  { title: 'Regional AWS VPC Network Packet Loss', prob: 6, status: 'Contradicted by traces' },
                ].map((hypo, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-border bg-card/60">
                    <div className="flex justify-between items-center text-xs mb-1 font-mono">
                      <span className="font-bold text-slate-200">{hypo.title}</span>
                      <span className="text-cyan-400 font-bold">{hypo.prob}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${hypo.prob > 70 ? 'bg-primary' : 'bg-slate-600'}`}
                        style={{ width: `${hypo.prob}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                      Status: {hypo.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Agent Reasoning Log Stream */}
          <div className="rounded-xl border border-border bg-[#090e1a] p-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
              <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                Live Agent Reasoning Stream
              </span>
              <span className="text-[10px] text-cyan-400 font-semibold animate-pulse">
                ● STREAMING
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {agentLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-300">
                  <span className="text-cyan-500 font-bold shrink-0">›</span>
                  <span className="text-slate-300">{log}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-border flex justify-end">
              <Link
                href="/remediation"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300"
              >
                Proceed to Remediation Approval Gate <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
