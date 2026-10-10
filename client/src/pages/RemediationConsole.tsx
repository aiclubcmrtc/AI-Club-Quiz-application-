import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Play,
  Lock,
  X,
  Check,
  Clock,
  RefreshCw,
  Terminal,
  Database,
  Users,
  Sparkles
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

export const RemediationConsole: React.FC = () => {
  const { 
    incidents, 
    selectedIncident, 
    approveIncident, 
    rejectIncident, 
    executeIncident, 
    rollbackIncident, 
    verifyIncident 
  } = useIncidents();

  const incident = selectedIncident || incidents[0];
  const [operatorNote, setOperatorNote] = useState<string>('Approved zero-downtime rollback following AST diff verification.');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!incident) {
    return (
      <div className="py-20 text-center text-slate-400">
        <h2 className="text-xl font-bold">No Active Incident Selected</h2>
        <Link href="/incidents" className="text-primary mt-2 inline-block">Choose an incident from the queue</Link>
      </div>
    );
  }

  const workflow = incident.workflowState;

  const handleApprove = async () => {
    setIsProcessing(true);
    await approveIncident(incident.id, operatorNote);
    setIsProcessing(false);
  };

  const handleReject = async () => {
    setIsProcessing(true);
    await rejectIncident(incident.id, operatorNote);
    setIsProcessing(false);
  };

  const handleExecute = async () => {
    setIsProcessing(true);
    await executeIncident(incident.id);
    setIsProcessing(false);
  };

  const handleRollback = async () => {
    setIsProcessing(true);
    await rollbackIncident(incident.id);
    setIsProcessing(false);
  };

  const handleVerify = async () => {
    setIsProcessing(true);
    await verifyIncident(incident.id);
    setIsProcessing(false);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  const stages = [
    { id: 'detected', label: 'Alert Ingested' },
    { id: 'investigating', label: 'AI Triaged' },
    { id: 'awaiting-approval', label: 'Human Gate' },
    { id: 'executing', label: 'Sandbox Execution' },
    { id: 'verified', label: 'Restoral Verified' }
  ];

  const currentIdx = stages.findIndex(s => s.id === workflow);
  const activeStep = currentIdx >= 0 ? currentIdx : 2;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-primary uppercase">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            HUMAN-IN-THE-LOOP CONTROL GATE
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Remediation Console
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            A safe operational action is explainable, sandboxed, approved, executed, and verified.
          </p>
        </div>

        {/* Approval Boundary Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1.5 text-xs font-mono font-bold text-cyan-300">
          <Lock className="h-4 w-4 text-cyan-400" />
          <span>CRYPTOGRAPHIC APPROVAL BOUNDARY ACTIVE</span>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="rounded-xl border border-border bg-[#0f172a]/90 p-5 panel-glass">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {stages.map((stage, idx) => {
            const isCompleted = idx < activeStep || workflow === 'verified';
            const isCurrent = idx === activeStep && workflow !== 'verified';
            return (
              <div key={stage.id} className="flex items-center gap-2 text-xs font-mono">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shrink-0 ${
                  isCompleted ? 'bg-emerald-500 text-black' :
                  isCurrent ? 'bg-primary text-black animate-pulse' :
                  'bg-slate-800 text-slate-500'
                }`}>
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                </span>
                <span className={`font-semibold ${isCurrent ? 'text-cyan-300' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Proposed Mitigation + Guardrails */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Action Proposal Card (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-cyan-500/30 bg-[#0d1527] p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-cyan-400" />
                Autonomous Remediation Proposal
              </span>
              <span className="rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono px-2.5 py-0.5 font-bold">
                RISK: {incident.risk}
              </span>
            </div>

            <div>
              <div className="text-xs font-mono text-muted-foreground uppercase">TARGET INCIDENT: {incident.id}</div>
              <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-white">
                {incident.recommendation}
              </h2>
            </div>

            {/* Safety Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 px-2.5 py-1 flex items-center gap-1 font-semibold">
                <RotateCcw className="h-3 w-3" /> Reversible Rollback Ready
              </span>
              <span className="rounded bg-blue-950/40 border border-blue-800/40 text-blue-300 px-2.5 py-1 font-semibold">
                Snapshot: {incident.mitigationPlan?.recoverySnapshotId || 'snap-rec-9941a'}
              </span>
              <span className="rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 px-2.5 py-1 font-semibold">
                Dry-Run Simulation: PASSED
              </span>
            </div>

            {/* Plan Details */}
            <div className="rounded-lg border border-border bg-card/60 p-4 text-xs font-mono text-slate-300 space-y-2 leading-relaxed">
              <div>
                <strong className="text-white">Execution Plan:</strong> Revert container image to release v2.4.0 in us-east-1 and us-west-2 clusters.
                Reallocate connection pool to 100 slots to alleviate queuing.
              </div>
              <div className="text-muted-foreground">
                <strong className="text-slate-300">Expected Result:</strong> P95 database query latency will return from 4,210ms to &lt; 50ms within 45 seconds. Zero data-loss guarantee.
              </div>
            </div>

            {/* Operator Signature / Notes Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
                <span>Operator Approval Signature & Context Note:</span>
                <span className="text-[10px] text-muted-foreground font-normal">Recorded into immutable audit ledger</span>
              </label>
              <textarea
                value={operatorNote}
                onChange={(e) => setOperatorNote(e.target.value)}
                rows={2}
                placeholder="Add operator sign-off rationale..."
                className="w-full rounded-lg border border-border bg-card/60 p-3 text-xs text-white placeholder-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 font-mono"
              />
            </div>

            {/* Interactive Action Controls */}
            <div className="pt-2 border-t border-border flex flex-wrap items-center gap-3">
              {workflow === 'awaiting-approval' && (
                <>
                  <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>Approve Safe Rollback</span>
                  </button>

                  <button
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1.5"
                  >
                    <X className="h-4 w-4" />
                    <span>Reject Plan</span>
                  </button>

                  <Link
                    href="/sandbox"
                    className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <Terminal className="h-3.5 w-3.5" />
                    <span>Rehearse in Sandbox</span>
                  </Link>
                </>
              )}

              {(workflow === 'executing' || incident.status === 'AWAITING APPROVAL') && (
                <button
                  onClick={handleExecute}
                  disabled={isProcessing}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Execute Canary Rollback Now</span>
                </button>
              )}

              {/* Verify Recovery */}
              <button
                onClick={handleVerify}
                disabled={isProcessing}
                className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 ml-auto"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Verify Synthetic Restoral</span>
              </button>

              {/* Emergency Rollback */}
              <button
                onClick={handleRollback}
                disabled={isProcessing}
                className="rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-2.5 text-xs font-bold text-red-300 hover:bg-red-950/60 transition-all flex items-center gap-1.5"
                title="Immediately revert any applied change"
              >
                <RotateCcw className="h-3.5 w-3.5 text-red-400" />
                <span>Emergency 1-Click Rollback</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Guardrails & Approver Info (1 col) */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-[#0f172a]/90 p-5 panel-glass">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-border pb-3 mb-4 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              SRE Operational Guardrails
            </h3>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="p-3 rounded-lg border border-border bg-card/60">
                <div className="text-muted-foreground text-[10px] uppercase">BLAST RADIUS LIMIT</div>
                <div className="font-bold text-slate-200 mt-0.5">Isolated to Payment Service pods</div>
                <div className="text-[10px] text-emerald-400 mt-1">✓ No database schema writes required</div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-card/60">
                <div className="text-muted-foreground text-[10px] uppercase">RECOVERY SNAPSHOT</div>
                <div className="font-bold text-slate-200 mt-0.5">Verified clean container image</div>
                <div className="text-[10px] text-cyan-400 mt-1">checkout-api:v2.4.0 (sha256-9941a)</div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-card/60">
                <div className="text-muted-foreground text-[10px] uppercase">ON-CALL OPERATOR</div>
                <div className="font-bold text-slate-200 mt-0.5 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/20 text-[9px] font-bold text-cyan-300">AR</span>
                  Alex Rivera (Lead SRE)
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">Platform Engineering Core</div>
              </div>
            </div>
          </div>

          {/* Sandbox Rehearsal Shortcut */}
          <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-blue-950/20 p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-1">
              <Terminal className="h-4 w-4 text-cyan-400" />
              Ephemeral Sandbox Simulation
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Test traffic replay and container health checks against 12,400 requests in an isolated namespace before production roll out.
            </p>
            <Link
              href="/sandbox"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:underline"
            >
              Open Sandbox Environment →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
