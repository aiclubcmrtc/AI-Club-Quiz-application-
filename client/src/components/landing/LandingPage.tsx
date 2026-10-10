import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ArrowRight,
  Bot,
  Zap,
  Activity,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Terminal,
  Network,
  Lock,
  Layers,
  Sparkles,
  Play,
  Check,
  Server,
  Database,
  Cpu,
  RefreshCw,
  Flame,
  Clock,
  Award,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';

// Interactive background canvas with futuristic floating nodes
const CyberCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes
    const particleCount = Math.min(60, Math.floor(width / 24));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.3 ? 'rgba(6, 182, 212,' : 'rgba(59, 130, 246,'
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} 0.6)`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-0 opacity-40"
    />
  );
};

export const LandingPage: React.FC = () => {
  // Interactive Simulator state
  const [simStep, setSimStep] = useState<number>(0);
  const [simRunning, setSimRunning] = useState<boolean>(false);
  const [simLatency, setSimLatency] = useState<number>(45);
  const [simErrorRate, setSimErrorRate] = useState<number>(0.02);
  const [simHealth, setSimHealth] = useState<number>(99.8);

  const startSimulation = () => {
    sound.playAlert();
    setSimRunning(true);
    setSimStep(1);
    setSimLatency(4280);
    setSimErrorRate(19.4);
    setSimHealth(72.5);

    // Step 2: Auto investigation
    setTimeout(() => {
      setSimStep(2);
      sound.playClick();
    }, 2000);

    // Step 3: Recommendation generated
    setTimeout(() => {
      setSimStep(3);
      sound.playClick();
    }, 3800);
  };

  const handleApproveMitigation = () => {
    sound.playClick();
    setSimStep(4); // Executing

    setTimeout(() => {
      setSimStep(5); // Verified
      setSimLatency(42);
      setSimErrorRate(0.01);
      setSimHealth(99.9);
      setSimRunning(false);
      sound.playSuccess();
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {}
    }, 2200);
  };

  const handleResetSim = () => {
    sound.playClick();
    setSimStep(0);
    setSimRunning(false);
    setSimLatency(45);
    setSimErrorRate(0.02);
    setSimHealth(99.8);
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 relative overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <CyberCanvas />

      {/* Cyber Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-cyan-500/15 via-blue-600/10 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#060911]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-white">
                sentinel<span className="text-primary font-black">ops</span>
              </span>
              <span className="ml-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-mono font-bold text-cyan-300">
                AI COMMAND
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Core Pillars</a>
            <a href="#simulator" className="hover:text-cyan-400 transition-colors">Interactive Rehearsal</a>
            <a href="#architecture" className="hover:text-cyan-400 transition-colors">Architecture</a>
            <a href="#benchmarks" className="hover:text-cyan-400 transition-colors">Evaluations</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/command-center"
              onClick={() => sound.playClick()}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:border-cyan-400 hover:glow-cyan-sm active:scale-95"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 text-cyan-400" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-28 md:pb-36 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-4 py-1.5 text-xs font-mono font-semibold text-cyan-300 backdrop-blur-md shadow-inner"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span>SENTINELOPS AI v3.2 • ZERO-BLACK-BOX SRE AUTONOMY</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-8 font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.08]"
          >
            The Calm Inside <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              The Production Incident.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Autonomous multi-agent triage that correlates distributed spans, pinpoints causal code diffs, sandboxes the fix, and awaits operator sign-off before anything touches traffic.
          </motion.p>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/command-center"
              onClick={() => sound.playClick()}
              className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-500/25 transition-all hover:scale-105 hover:brightness-110 active:scale-95"
            >
              <span>Open Live Command Center</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#simulator"
              onClick={() => sound.playClick()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold text-slate-200 backdrop-blur-md transition-all hover:bg-white/10 hover:border-cyan-500/30"
            >
              <Play className="h-4 w-4 text-cyan-400" />
              <span>Try Live Interactive Simulator</span>
            </a>
          </motion.div>

          {/* Live Metric Ticker Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              { label: 'MTTR REDUCTION', val: '74%', detail: 'avg 41s vs 520s baseline', icon: Clock, color: 'text-cyan-400' },
              { label: 'ACCURACY SCORE', val: '95.8%', detail: 'zero-hallucination AST diffs', icon: Award, color: 'text-emerald-400' },
              { label: 'HUMAN GUARDRAIL', val: '100%', detail: 'strict approval boundary', icon: Lock, color: 'text-sky-400' },
              { label: 'REVERSIBLE SNAPSHOT', val: '0 RISK', detail: 'deterministic 1-click revert', icon: RotateCcw, color: 'text-amber-400' }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="rounded-xl border border-white/5 bg-[#0f172a]/60 p-4 text-left backdrop-blur-sm hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="font-mono text-[10px] font-bold tracking-wider">{stat.label}</span>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div className={`mt-2 font-display text-2xl font-black ${stat.color}`}>
                    {stat.val}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">{stat.detail}</div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Interactive Simulator Section */}
      <section id="simulator" className="py-20 relative z-10 border-y border-white/5 bg-[#0a0f1d]/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 font-mono text-[11px] font-semibold text-cyan-300">
              HANDS-ON SIMULATION REHEARSAL
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Test-Drive The Autonomous Response Engine
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Inject a simulated P1 database connection exhaustion event right now and watch SentinelOps agents isolate the root cause and propose a verified safe mitigation.
            </p>
          </div>

          {/* Simulator Console Container */}
          <div className="mt-12 rounded-2xl border border-cyan-500/30 bg-[#0d1527] p-5 sm:p-8 shadow-2xl glow-cyan-sm relative overflow-hidden">
            {/* Header Telemetry Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${simRunning ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
                <div>
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    SIMULATED CLUSTER: <span className="text-white">us-east-1-prod</span>
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    {simStep === 0 && 'Nominal Operating Envelope'}
                    {simStep === 1 && <span className="text-red-400 flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" /> P1 ALERT: Payment API Latency Threshold Breached</span>}
                    {simStep === 2 && <span className="text-cyan-400 flex items-center gap-1.5"><Bot className="h-4 w-4 animate-spin" /> Multi-Agent Log & Trace Correlation In Progress</span>}
                    {simStep === 3 && <span className="text-amber-400 flex items-center gap-1.5"><Lock className="h-4 w-4" /> Awaiting Operator Approval For Reversible Rollback</span>}
                    {simStep === 4 && <span className="text-blue-400 flex items-center gap-1.5"><RefreshCw className="h-4 w-4 animate-spin" /> Executing Canary Rollback In Sandbox Rehearsal</span>}
                    {simStep === 5 && <span className="text-emerald-400 flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Recovery Verified • 100% Synthetic Checks Passing</span>}
                  </div>
                </div>
              </div>

              {/* Live Mini Gauges */}
              <div className="flex items-center gap-4 font-mono text-xs">
                <div className="rounded-lg border border-border bg-card px-3 py-1.5">
                  <span className="text-muted-foreground text-[10px] block">P95 LATENCY</span>
                  <span className={`font-bold ${simLatency > 500 ? 'text-red-400' : 'text-emerald-400'}`}>{simLatency} ms</span>
                </div>
                <div className="rounded-lg border border-border bg-card px-3 py-1.5">
                  <span className="text-muted-foreground text-[10px] block">ERROR RATE</span>
                  <span className={`font-bold ${simErrorRate > 1 ? 'text-red-400' : 'text-emerald-400'}`}>{simErrorRate}%</span>
                </div>
                <div className="rounded-lg border border-border bg-card px-3 py-1.5">
                  <span className="text-muted-foreground text-[10px] block">HEALTH INDEX</span>
                  <span className={`font-bold ${simHealth < 90 ? 'text-amber-400' : 'text-emerald-400'}`}>{simHealth}%</span>
                </div>
              </div>
            </div>

            {/* Step-by-Step Interactive Workflow */}
            <div className="mt-8 grid lg:grid-cols-3 gap-6">
              {/* Left Column: Causal Evidence & AI Reasoning */}
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-xl border border-border bg-[#090e1a] p-5">
                  <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-3">
                    <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                      <Sparkles className="h-3.5 w-3.5" />
                      AI REASONING LEDGER
                    </span>
                    <span>CONFIDENCE: {simStep >= 2 ? '94.2%' : '0%'}</span>
                  </div>

                  {simStep === 0 && (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      <Activity className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                      All telemetry streams within baseline limits. Click "Trigger Chaos Incident" to simulate an outage.
                    </div>
                  )}

                  {simStep >= 1 && (
                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex items-start gap-2 text-red-400 bg-red-950/20 p-2.5 rounded-lg border border-red-900/30">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <div>
                          <strong>ANOMALY INGESTED:</strong> HTTP 504 Gateway Timeouts surged on POST /v1/checkout. DB pool acquire timeout after 250ms.
                        </div>
                      </div>

                      {simStep >= 2 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-2 text-cyan-300 bg-cyan-950/20 p-2.5 rounded-lg border border-cyan-900/30"
                        >
                          <Bot className="h-4 w-4 shrink-0 mt-0.5 text-cyan-400" />
                          <div>
                            <strong>AST CAUSAL CORRELATION:</strong> Commit <code>8f42c1</code> in release v2.4.1 added unindexed query on <code>ledger_entries</code>.
                            Lock wait time jumped from 4ms to 3,950ms.
                          </div>
                        </motion.div>
                      )}

                      {simStep >= 3 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-2 text-emerald-300 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/30"
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                          <div>
                            <strong>PROPOSED SAFE REMEDIATION:</strong> Canary container rollback to release v2.4.0 image. Pre-flight snapshot <code>snap-rec-9941a</code> verified.
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>

                {/* Evidence Artifacts Preview */}
                <div className="rounded-xl border border-border bg-[#090e1a] p-4 text-xs font-mono">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    CORRELATED ARTIFACTS
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 text-slate-300">
                    <div className="p-2 rounded bg-card/60 border border-border flex items-center justify-between">
                      <span>checkout-api.log</span>
                      <span className="text-red-400 font-bold">18 ERROR lines</span>
                    </div>
                    <div className="p-2 rounded bg-card/60 border border-border flex items-center justify-between">
                      <span>postgres-pool.trace</span>
                      <span className="text-amber-400 font-bold">3,950ms wait</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Action Trigger */}
              <div className="rounded-xl border border-border bg-[#090e1a] p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                      OPERATOR ACTION GATE
                    </span>
                    <span className="rounded bg-primary/20 text-cyan-400 text-[10px] font-mono px-2 py-0.5 font-bold">
                      AIR-GAPPED
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    SentinelOps never touches production traffic without explicit operator authorization. The action below is non-destructive and carries an instant 1-click rollback snapshot.
                  </p>
                </div>

                <div className="space-y-3">
                  {simStep === 0 && (
                    <button
                      onClick={startSimulation}
                      className="w-full rounded-xl bg-gradient-to-r from-red-600 to-amber-600 py-3 text-xs font-bold text-white shadow-lg shadow-red-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Flame className="h-4 w-4" />
                      Trigger P1 Chaos Incident
                    </button>
                  )}

                  {simStep > 0 && simStep < 3 && (
                    <div className="w-full rounded-xl border border-cyan-500/30 bg-cyan-950/30 py-3 text-xs font-bold text-cyan-300 flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
                      Autonomous Agents Correlating...
                    </div>
                  )}

                  {simStep === 3 && (
                    <button
                      onClick={handleApproveMitigation}
                      className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Approve & Rehearse Mitigation
                    </button>
                  )}

                  {simStep === 4 && (
                    <div className="w-full rounded-xl border border-blue-500/30 bg-blue-950/30 py-3 text-xs font-bold text-blue-300 flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
                      Rehearsing Sandbox Rollback...
                    </div>
                  )}

                  {simStep === 5 && (
                    <div className="space-y-2">
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        Incident Resolved in 38s!
                      </div>
                      <button
                        onClick={handleResetSim}
                        className="w-full rounded-lg border border-border bg-card py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                      >
                        Reset Simulator
                      </button>
                    </div>
                  )}

                  <Link
                    href="/command-center"
                    className="w-full text-center block text-[11px] text-cyan-400 hover:underline pt-2 font-mono"
                  >
                    Open Full Production Console →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Section */}
      <section id="features" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 font-mono text-[11px] font-semibold text-cyan-300">
              UNCOMPROMISING ARCHITECTURE
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Designed For High-Stakes Production
            </h2>
            <p className="mt-4 text-slate-400 text-base">
              Autonomous AI without safety guardrails is a liability. SentinelOps is built with mathematical verification and deterministic safeguards.
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Bot,
                title: 'Multi-Agent Correlation',
                description: 'Specialized sentinels inspect logs, traces, AST code diffs, and metric shifts to construct an explainable hypothesis ledger.',
                tag: 'ZERO HALLUCINATIONS'
              },
              {
                icon: Lock,
                title: 'Cryptographic Human Gate',
                description: 'AI prepares, dry-runs, and simulates the action. An authorized operator must sign off before any production mutation occurs.',
                tag: 'AIR-GAPPED APPROVAL'
              },
              {
                icon: Network,
                title: 'Sub-Second Blast Radius',
                description: 'Live dependency graph models downstream cascades, isolating degraded microservices before checkout funnels collapse.',
                tag: 'TOPOLOGY AWARE'
              },
              {
                icon: RotateCcw,
                title: 'Deterministic 1-Click Rollback',
                description: 'Every recommended action generates an instant rollback state machine, guaranteeing zero data loss or state corruption.',
                tag: 'SAFE RECOVERY'
              }
            ].map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-white/5 bg-[#0d1424]/80 p-6 backdrop-blur-sm hover:border-cyan-500/40 hover:glow-cyan-sm transition-all group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mt-4 font-mono text-[10px] font-bold text-cyan-400 tracking-wider">
                    {pillar.tag}
                  </div>
                  <h3 className="mt-1 font-display text-lg font-bold text-white">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architecture Flow Section */}
      <section id="architecture" className="py-24 border-t border-white/5 bg-[#080d18] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="rounded-full border border-blue-500/30 bg-blue-950/40 px-3 py-1 font-mono text-[11px] font-semibold text-blue-300">
              END-TO-END PIPELINE
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-5xl font-bold text-white tracking-tight">
              From First Anomaly To Verified Restoral
            </h2>
            <p className="mt-4 text-slate-400 text-base">
              A transparent, audit-ready operational record constructed in real-time.
            </p>
          </div>

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { num: '01', title: 'TELEMETRY INGEST', desc: 'Synthetics, OpenTelemetry traces, and logs stream into the anomaly detection mesh.', icon: Activity },
              { num: '02', title: 'AI TRIAGE CORE', desc: 'Multi-agent correlation pins down exact causal line, container version, and latency hotspot.', icon: Bot },
              { num: '03', title: 'SANDBOX REHEARSAL', desc: 'Proposed recovery action dry-runs against simulated traffic in an isolated namespace.', icon: Terminal },
              { num: '04', title: 'OPERATOR GATE', desc: 'On-call SRE reviews blast radius, reads the reasoning ledger, and approves execution.', icon: Lock },
              { num: '05', title: 'HEALTH VERIFIED', desc: 'Post-recovery automated probes verify p95 latency and error rate before incident close.', icon: CheckCircle2 },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative rounded-xl border border-border bg-[#0f172a]/60 p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-muted-foreground mb-4">
                    <span className="font-mono text-sm font-black text-cyan-400">{step.num}</span>
                    <Icon className="h-4 w-4 text-slate-400" />
                  </div>
                  <h4 className="font-display text-sm font-bold text-white mb-2">{step.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Evaluations & Benchmark Comparison */}
      <section id="benchmarks" className="py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 font-mono text-[11px] font-semibold text-emerald-300">
              EMPIRICALLY PROVEN
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Benchmarked Against Real-World Incidents
            </h2>
            <p className="mt-4 text-slate-400 text-base">
              Comparing SentinelOps AI against conventional rule-based alerting and manual human on-call across 500+ chaos engineering scenarios.
            </p>
          </div>

          <div className="mt-12 overflow-x-auto rounded-2xl border border-border bg-[#0d1424] shadow-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-border bg-[#090e1a] text-slate-400 font-mono uppercase text-[11px]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Evaluation Metric</th>
                  <th className="px-6 py-4 font-bold text-cyan-400">SentinelOps AI</th>
                  <th className="px-6 py-4 font-semibold text-slate-400">Traditional Alerting</th>
                  <th className="px-6 py-4 font-semibold text-slate-400">Manual On-Call</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-slate-300">
                <tr>
                  <td className="px-6 py-4 font-semibold text-white">Mean Time to Diagnosis (MTTD)</td>
                  <td className="px-6 py-4 font-bold text-cyan-300 font-mono bg-cyan-950/10">38 seconds</td>
                  <td className="px-6 py-4 text-slate-400 font-mono">14 minutes</td>
                  <td className="px-6 py-4 text-slate-400 font-mono">22 minutes</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-white">Root Cause Accuracy</td>
                  <td className="px-6 py-4 font-bold text-emerald-400 font-mono bg-cyan-950/10">95.8%</td>
                  <td className="px-6 py-4 text-slate-400 font-mono">64.2%</td>
                  <td className="px-6 py-4 text-slate-400 font-mono">71.0%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-white">Safe Remediation Success Rate</td>
                  <td className="px-6 py-4 font-bold text-emerald-400 font-mono bg-cyan-950/10">98.2%</td>
                  <td className="px-6 py-4 text-slate-400 font-mono">58.7%</td>
                  <td className="px-6 py-4 text-slate-400 font-mono">79.5%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-white">False Positive Fatigue Rate</td>
                  <td className="px-6 py-4 font-bold text-cyan-300 font-mono bg-cyan-950/10">2.4%</td>
                  <td className="px-6 py-4 text-slate-400 font-mono">18.9%</td>
                  <td className="px-6 py-4 text-slate-400 font-mono">N/A</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-white">Reversible Rollback Guarantee</td>
                  <td className="px-6 py-4 font-bold text-emerald-400 font-mono bg-cyan-950/10">100% Pre-tested</td>
                  <td className="px-6 py-4 text-slate-400 font-mono">Manual</td>
                  <td className="px-6 py-4 text-slate-400 font-mono">Manual</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Ready CTA Banner */}
      <section className="py-20 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/80 via-[#0d162b] to-blue-950/80 p-8 sm:p-14 text-center overflow-hidden shadow-2xl glow-cyan">
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Take Full Command Of Production Reliability
            </h2>
            <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
              Inspect active incidents, test autonomous multi-agent investigations, review audit trails, and manage safety guardrails now.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/command-center"
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-cyan-500/30 hover:scale-105 transition-all"
              >
                <span>Launch Live Command Center</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-[#04060b] relative z-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="font-display font-bold text-slate-300">SentinelOps AI</span>
            <span>— The Calm Inside The Incident.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/command-center" className="hover:text-cyan-400">Console</Link>
            <Link href="/incidents" className="hover:text-cyan-400">Incidents</Link>
            <Link href="/evaluations" className="hover:text-cyan-400">Benchmarks</Link>
            <Link href="/audit" className="hover:text-cyan-400">Audit Trail</Link>
            <Link href="/settings" className="hover:text-cyan-400">Guardrails</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
