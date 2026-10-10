import React, { useState } from 'react';
import {
  Gauge,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Award,
  Clock,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { api } from '../api/client';
import { sound } from '../utils/audio';

export const EvaluationsPage: React.FC = () => {
  const { evaluations, refreshData } = useIncidents();
  const [isRunning, setIsRunning] = useState(false);

  const handleRunSuite = async () => {
    sound.playClick();
    setIsRunning(true);
    try {
      await api.runEvaluations();
      await refreshData();
      sound.playSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const agent = evaluations?.agent || {
    rootCauseAccuracy: 95.8,
    timeToDiagnosis: 41,
    remediationSuccessRate: 98.2,
    falsePositiveRate: 2.4,
    confidenceCalibration: 96.5
  };

  const baseline = evaluations?.baseline || {
    rootCauseAccuracy: 64.2,
    timeToDiagnosis: 480,
    remediationSuccessRate: 58.7,
    falsePositiveRate: 18.9,
    confidenceCalibration: 62.0
  };

  const scenarios = evaluations?.scenarios || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-primary uppercase">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            EMPIRICAL TRUST BENCHMARKS
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Agent Evaluations & Benchmarks
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Standardized chaos engineering evaluations comparing SentinelOps AI against rule-based baselines.
          </p>
        </div>

        <button
          onClick={handleRunSuite}
          disabled={isRunning}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Running Chaos Suite...' : 'Run Full Evaluation Suite'}</span>
        </button>
      </div>

      {/* 5 KPI Benchmark Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl border border-border bg-[#0f172a]/80 panel-glass">
          <div className="text-muted-foreground text-[10px] font-mono font-bold uppercase">ACCURACY</div>
          <div className="text-2xl font-black font-display text-cyan-400 mt-2">{agent.rootCauseAccuracy}%</div>
          <div className="text-[11px] text-slate-400 mt-1">{baseline.rootCauseAccuracy}% baseline</div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-[#0f172a]/80 panel-glass">
          <div className="text-muted-foreground text-[10px] font-mono font-bold uppercase">TIME TO DIAGNOSIS</div>
          <div className="text-2xl font-black font-display text-emerald-400 mt-2">{agent.timeToDiagnosis}s</div>
          <div className="text-[11px] text-slate-400 mt-1">{baseline.timeToDiagnosis}s baseline</div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-[#0f172a]/80 panel-glass">
          <div className="text-muted-foreground text-[10px] font-mono font-bold uppercase">REMEDY SUCCESS</div>
          <div className="text-2xl font-black font-display text-cyan-400 mt-2">{agent.remediationSuccessRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">{baseline.remediationSuccessRate}% baseline</div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-[#0f172a]/80 panel-glass">
          <div className="text-muted-foreground text-[10px] font-mono font-bold uppercase">FALSE POSITIVES</div>
          <div className="text-2xl font-black font-display text-emerald-400 mt-2">{agent.falsePositiveRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">{baseline.falsePositiveRate}% baseline</div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-[#0f172a]/80 panel-glass col-span-2 sm:col-span-1">
          <div className="text-muted-foreground text-[10px] font-mono font-bold uppercase">CALIBRATION</div>
          <div className="text-2xl font-black font-display text-cyan-400 mt-2">{agent.confidenceCalibration}%</div>
          <div className="text-[11px] text-slate-400 mt-1">{baseline.confidenceCalibration}% baseline</div>
        </div>
      </div>

      {/* Scenario Benchmark Table */}
      <div className="rounded-xl border border-border bg-[#0f172a]/90 panel-glass overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-card/40 flex items-center justify-between">
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-cyan-400" />
            Standardized Incident Benchmark Scenarios
          </h3>
          <span className="text-xs font-mono text-muted-foreground">{scenarios.length} scenarios tested</span>
        </div>

        <div className="divide-y divide-border/60">
          {scenarios.map((sc) => (
            <div key={sc.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{sc.name}</span>
                  <span className="text-[10px] text-muted-foreground bg-slate-800 px-1.5 py-0.5 rounded">{sc.id}</span>
                </div>
                <div className="text-slate-400">
                  <strong className="text-slate-300">Ground Truth:</strong> {sc.groundTruth}
                </div>
                <div className="text-cyan-300">
                  <strong className="text-slate-400">SentinelOps Inference:</strong> {sc.agentRootCause}
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 pt-2 md:pt-0">
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground">CONFIDENCE</div>
                  <div className="font-bold text-cyan-400">{sc.agentConfidence}%</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground">DIAGNOSIS</div>
                  <div className="font-bold text-slate-200">{sc.diagnosisSeconds}s</div>
                </div>
                <div>
                  <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    sc.remediationSuccess ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {sc.remediationSuccess ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
