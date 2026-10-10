import React, { useState } from 'react';
import {
  History,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Bot,
  Zap,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { sound } from '../utils/audio';

export const TimelinePage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(3);

  const steps = [
    {
      time: '10:40:00',
      title: 'Deployment v2.4.1 Released',
      service: 'Release Engine',
      type: 'DEPLOYMENT',
      status: 'completed',
      latency: '45 ms',
      errorRate: '0.01%',
      detail: 'ArgoCD deployed release v2.4.1 to us-east-1 and us-west-2 clusters.'
    },
    {
      time: '10:42:10',
      title: 'Synthetic Alert: P95 Latency Exceeded',
      service: 'Datadog Synthetic Mesh',
      type: 'ANOMALY',
      status: 'completed',
      latency: '4,210 ms',
      errorRate: '18.4%',
      detail: 'HTTP 504 Gateway Timeouts surged on POST /v1/checkout. Connection acquire threshold (250ms) exceeded.'
    },
    {
      time: '10:43:05',
      title: 'Autonomous Multi-Agent Triage Initialized',
      service: 'SentinelOps AI Core',
      type: 'INVESTIGATION',
      status: 'completed',
      latency: '4,150 ms',
      errorRate: '19.2%',
      detail: 'Log Sentinel parsed 14,200 lines. Trace Analyzer isolated pool acquire contention in postgres-primary.'
    },
    {
      time: '10:44:20',
      title: 'Root Cause Isolated: Unindexed Query',
      service: 'Inference Sentinel',
      type: 'FINDING',
      status: 'completed',
      latency: '3,980 ms',
      errorRate: '17.8%',
      detail: 'AST code differential in commit 8f42c1 confirmed table scan on ledger_entries table. Confidence: 94.2%.'
    },
    {
      time: '10:45:10',
      title: 'Mitigation Proposed & Sandbox Passed',
      service: 'Remediation Planner',
      type: 'PROPOSAL',
      status: 'completed',
      latency: '3,900 ms',
      errorRate: '18.0%',
      detail: 'Reversible rollback to v2.4.0 image validated in sandbox. Ephemeral replay of 12,400 queries succeeded.'
    },
    {
      time: '10:46:00',
      title: 'Operator Sign-Off Granted',
      service: 'Human Approval Gate',
      type: 'APPROVAL',
      status: 'completed',
      latency: '850 ms',
      errorRate: '4.2%',
      detail: 'Alex Rivera (Lead SRE) authorized execution with cryptographic signature. Snapshot snap-rec-9941a locked.'
    },
    {
      time: '10:47:15',
      title: 'Recovery Verified Nominal',
      service: 'Verification Sentinel',
      type: 'VERIFIED',
      status: 'completed',
      latency: '42 ms',
      errorRate: '0.01%',
      detail: 'Synthetic probes passed 100%. P95 latency restored to 42ms. Zero 5xx errors across 300s window. Incident closed.'
    }
  ];

  const handleTogglePlay = () => {
    sound.playClick();
    if (!isPlaying) {
      setIsPlaying(true);
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            clearInterval(interval);
            setIsPlaying(false);
            sound.playSuccess();
            return steps.length - 1;
          }
          sound.playClick();
          return prev + 1;
        });
      }, 1500);
    } else {
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    sound.playClick();
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const current = steps[currentStep];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-primary uppercase">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            DETERMINISTIC INCIDENT TIME MACHINE
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Incident Playback & Timeline
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Scrub through time to observe exact telemetry shifts, agent inferences, and human intervention points.
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePlay}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isPlaying ? 'Pause Playback' : 'Play Timeline'}</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Scrub Slider Bar */}
      <div className="rounded-xl border border-border bg-[#0f172a]/90 p-5 panel-glass space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="text-slate-300 font-bold">
            TIMELINE SCRUBBER: <span className="text-cyan-400">{current.time}</span>
          </span>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">P95: <strong className={current.latency.includes('4,') ? 'text-red-400' : 'text-emerald-400'}>{current.latency}</strong></span>
            <span className="text-slate-400">ERR: <strong className={current.errorRate.includes('18') ? 'text-red-400' : 'text-emerald-400'}>{current.errorRate}</strong></span>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max={steps.length - 1}
          value={currentStep}
          onChange={(e) => {
            sound.playClick();
            setCurrentStep(Number(e.target.value));
          }}
          className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
        />

        {/* Step Ticks */}
        <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                sound.playClick();
                setCurrentStep(idx);
              }}
              className={`hover:text-cyan-400 ${idx === currentStep ? 'text-cyan-300 font-bold' : ''}`}
            >
              {s.time.slice(0, 5)}
            </button>
          ))}
        </div>
      </div>

      {/* Current Step Callout Card */}
      <div className="rounded-2xl border border-cyan-500/30 bg-[#0d1527] p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary/20 text-cyan-300 font-mono text-xs font-bold px-2 py-0.5">
              STEP {currentStep + 1} OF {steps.length}
            </span>
            <span className="text-xs font-mono text-slate-400">{current.time} UTC</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground uppercase">{current.service}</span>
        </div>

        <h3 className="font-display text-xl font-bold text-white">
          {current.title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-300 font-mono leading-relaxed bg-[#090e1a] p-4 rounded-xl border border-border">
          {current.detail}
        </p>
      </div>

      {/* Complete Chronological Feed */}
      <div className="rounded-xl border border-border bg-[#0f172a]/90 p-6 panel-glass">
        <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-border pb-3 mb-5">
          Full Operational Record
        </h4>

        <div className="space-y-6 relative pl-4 border-l border-border">
          {steps.map((st, idx) => {
            const isPassed = idx <= currentStep;
            return (
              <div
                key={idx}
                onClick={() => {
                  sound.playClick();
                  setCurrentStep(idx);
                }}
                className={`relative cursor-pointer transition-opacity ${isPassed ? 'opacity-100' : 'opacity-40'}`}
              >
                <span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background ${
                  idx === currentStep ? 'bg-cyan-400 ring-4 ring-cyan-500/20' : isPassed ? 'bg-emerald-500' : 'bg-slate-700'
                }`} />

                <div className="rounded-lg border border-border/60 bg-card/60 p-3.5 hover:border-cyan-500/30 transition-all">
                  <div className="flex flex-wrap items-center justify-between text-xs font-mono gap-2 mb-1">
                    <span className="text-cyan-400 font-bold">{st.time}</span>
                    <span className="text-slate-500">{st.service}</span>
                  </div>
                  <div className="font-bold text-sm text-white">{st.title}</div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">{st.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
