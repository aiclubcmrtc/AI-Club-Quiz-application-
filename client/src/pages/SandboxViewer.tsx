import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  Terminal,
  Play,
  CheckCircle2,
  RefreshCw,
  Server,
  Cloud,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { sound } from '../utils/audio';

export const SandboxViewer: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(true);
  const [progress, setProgress] = useState(100);

  const handleRunSimulation = () => {
    sound.playClick();
    setRunning(true);
    setCompleted(false);
    setProgress(10);

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) {
          clearInterval(interval);
          setRunning(false);
          setCompleted(true);
          sound.playSuccess();
          return 100;
        }
        return p + 20;
      });
    }, 400);
  };

  const checks = [
    { label: 'Synthetic Traffic Replay', detail: '12,400 sampled payment requests replayed with zero 5xx', done: completed },
    { label: 'Target Rollback Image Integrity', detail: 'checkout-api:v2.4.0 verified clean sha256 checksum', done: completed },
    { label: 'Postgres Pool Allocation Health', detail: 'Active connections throttled under 45% ceiling', done: completed },
    { label: 'Error Budget Guardrail Check', detail: 'P99 latency &lt; 48ms; budget consumption 0.00%', done: completed },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-primary uppercase">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            ZERO-RISK REHEARSAL ENVIRONMENT
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Sandbox Simulator
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Pre-flight rehearsal running simulated traffic replay in an isolated ephemeral namespace.
          </p>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={running}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
        >
          <Play className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Simulating Rehearsal...' : 'Run Sandbox Simulation'}</span>
        </button>
      </div>

      {/* Grid: Simulation Status + Environment Manifest */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Simulation Status & Checks (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-cyan-500/30 bg-[#0d1527] p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-cyan-400" />
                Simulation Status
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                completed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {running ? 'RUNNING REPLAY' : completed ? 'SIMULATION PASSED' : 'READY'}
              </span>
            </div>

            {/* Progress Bar */}
            {running && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-cyan-400">
                  <span>Replaying 12,400 transactions...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Automated Verification Checks */}
            <div className="space-y-3">
              <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                PRE-FLIGHT REHEARSAL CHECKS
              </div>

              {checks.map((c, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-lg border border-border bg-card/60 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={`h-4 w-4 ${c.done ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <div>
                      <div className="font-bold text-white">{c.label}</div>
                      <div className="text-[11px] text-muted-foreground">{c.detail}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold ${c.done ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {c.done ? 'PASSED' : 'PENDING'}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <Link
                href="/remediation"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300"
              >
                Proceed to Remediation Sign-Off <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Environment Manifest (1 col) */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-[#0f172a]/90 p-5 panel-glass">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-border pb-3 mb-4 flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5 text-cyan-400" />
              Isolated Manifest
            </h3>

            <div className="divide-y divide-border/60 text-xs font-mono">
              <div className="py-2.5 flex justify-between">
                <span className="text-muted-foreground">Cluster</span>
                <span className="font-bold text-slate-200">sentinel-sim-04</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-muted-foreground">Namespace</span>
                <span className="font-bold text-slate-200">ephemeral-us-east-1</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-muted-foreground">Target Image</span>
                <span className="font-bold text-cyan-400">checkout-api:v2.4.0</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-muted-foreground">Sample Rate</span>
                <span className="font-bold text-slate-200">100% Shadow Traffic</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-muted-foreground">TTL Expiry</span>
                <span className="font-bold text-amber-400">14:40 UTC (Auto-purge)</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-cyan-950/20 p-4 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
              <ShieldCheck className="h-4 w-4" />
              PRODUCTION AIR-GAP VERIFIED
            </div>
            Sandbox traffic replay has zero routing permissions to real payment gateways or customer-facing databases.
          </div>
        </div>
      </div>
    </div>
  );
};
