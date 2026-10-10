import React, { useState } from 'react';
import {
  Settings2,
  ShieldCheck,
  Bell,
  Volume2,
  VolumeX,
  Lock,
  RotateCcw,
  Check,
  User,
  Sliders
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { sound } from '../utils/audio';

export const SettingsPage: React.FC = () => {
  const { soundEnabled, toggleSound } = useIncidents();
  const [autoRehearse, setAutoRehearse] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('2.5');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    sound.playSuccess();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-primary uppercase">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            OPERATIONAL POLICY & GUARDRAILS
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            System Settings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Configure safety boundaries, operator profile, and telemetry sampling rates.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
        >
          {saved ? <Check className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
          <span>{saved ? 'Preferences Saved!' : 'Save Preferences'}</span>
        </button>
      </div>

      {/* Operator Profile */}
      <div className="rounded-xl border border-border bg-[#0f172a]/90 p-6 panel-glass">
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-border pb-3 mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-cyan-400" />
          Active SRE Operator Profile
        </h3>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 font-display text-lg font-bold text-white shadow-lg shadow-cyan-500/20">
            AR
          </div>
          <div>
            <div className="font-display text-base font-bold text-white">Alex Rivera</div>
            <div className="text-xs text-muted-foreground font-mono">Lead Reliability Engineer • Platform Core</div>
            <div className="text-[11px] text-cyan-400 font-mono mt-0.5">Role: Primary On-Call Command Authorized</div>
          </div>
        </div>
      </div>

      {/* Safety Policies */}
      <div className="rounded-xl border border-cyan-500/30 bg-[#0d1527] p-6 shadow-xl space-y-4">
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-border/80 pb-3 flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Core Autonomy Guardrails (Immutable SRE Policy)
        </h3>

        <div className="space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-card/60 border border-border">
            <div>
              <div className="font-bold text-white">Enforce Human Approval Gate (P1 / P2 Incidents)</div>
              <div className="text-slate-400 text-[11px] mt-0.5">AI cannot mutate production clusters without operator cryptographic authorization.</div>
            </div>
            <span className="rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 px-3 py-1 font-bold text-[10px]">
              LOCKED ACTIVE
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-card/60 border border-border">
            <div>
              <div className="font-bold text-white">Require Ephemeral Sandbox Rehearsal</div>
              <div className="text-slate-400 text-[11px] mt-0.5">Run synthetic shadow traffic replay before permitting any rollback execution.</div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                setAutoRehearse(!autoRehearse);
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${autoRehearse ? 'bg-primary' : 'bg-slate-700'}`}
            >
              <span className={`block w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${autoRehearse ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Interface & Feedback */}
      <div className="rounded-xl border border-border bg-[#0f172a]/90 p-6 panel-glass space-y-4">
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-border pb-3 flex items-center gap-2">
          <Sliders className="h-4 w-4 text-cyan-400" />
          Cockpit Feedback & Stream Preferences
        </h3>

        <div className="space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-card/60 border border-border">
            <div>
              <div className="font-bold text-white">Web Audio Synthesizer Cues</div>
              <div className="text-slate-400 text-[11px] mt-0.5">Tactile synthesized audio tones on alert injection, button actuation, and restoral verification.</div>
            </div>
            <button
              onClick={toggleSound}
              className={`w-11 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-primary' : 'bg-slate-700'}`}
            >
              <span className={`block w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${soundEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-card/60 border border-border">
            <div>
              <div className="font-bold text-white">SSE Telemetry Push Interval</div>
              <div className="text-slate-400 text-[11px] mt-0.5">Frequency of continuous background metric updates.</div>
            </div>
            <select
              value={refreshInterval}
              onChange={(e) => {
                sound.playClick();
                setRefreshInterval(e.target.value);
              }}
              className="bg-card border border-border text-white text-xs rounded-lg px-3 py-1.5 outline-none focus:border-primary font-mono"
            >
              <option value="1">1.0s (Ultra Realtime)</option>
              <option value="2.5">2.5s (Balanced)</option>
              <option value="5">5.0s (Low Network)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
