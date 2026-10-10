import React, { useState } from 'react';
import {
  ListChecks,
  Search,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Filter,
  Copy,
  Check
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { sound } from '../utils/audio';

export const AuditPage: React.FC = () => {
  const { auditEvents } = useIncidents();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = auditEvents.filter(a => 
    a.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportJSON = () => {
    sound.playClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditEvents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sentinelops-audit-log-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    sound.playClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-primary uppercase">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            IMMUTABLE COMPLIANCE LEDGER
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Audit Trail
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Append-only cryptographic record of all agent inferences, sandbox tests, and human operator sign-offs.
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="rounded-xl border border-cyan-500/30 bg-cyan-950/40 px-4 py-2 text-xs font-mono font-bold text-cyan-300 hover:bg-cyan-950/70 transition-all flex items-center gap-2"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export SOC 2 JSON Log</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0f172a]/70 p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Cryptographically Signed Records: <strong>{auditEvents.length}</strong></span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit records..."
            className="w-full rounded-lg border border-border bg-card/60 py-1.5 pl-8 pr-3 text-xs text-white placeholder-muted-foreground outline-none focus:border-primary font-mono"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-[#0f172a]/90 panel-glass overflow-x-auto">
        <table className="w-full text-left text-xs font-mono min-w-[700px]">
          <thead className="border-b border-border bg-card/60 text-muted-foreground uppercase text-[10px]">
            <tr>
              <th className="px-5 py-3.5">ID / Time</th>
              <th className="px-5 py-3.5">Actor</th>
              <th className="px-5 py-3.5">Action & Target</th>
              <th className="px-5 py-3.5">Risk</th>
              <th className="px-5 py-3.5">Result</th>
              <th className="px-5 py-3.5">Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-slate-300">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-card/40 transition-colors">
                <td className="px-5 py-4">
                  <div className="font-bold text-white">{item.id}</div>
                  <div className="text-[10px] text-muted-foreground">{new Date(item.timestamp).toLocaleTimeString()}</div>
                </td>
                <td className="px-5 py-4 font-semibold text-cyan-300">
                  {item.actor}
                </td>
                <td className="px-5 py-4 max-w-md">
                  <div className="text-white font-medium">{item.action}</div>
                  <div className="text-[10px] text-slate-400">Target: {item.target}</div>
                </td>
                <td className="px-5 py-4 uppercase font-bold text-[10px]">
                  <span className={`px-2 py-0.5 rounded ${
                    item.risk === 'high' ? 'bg-red-500/20 text-red-400' :
                    item.risk === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {item.risk}
                  </span>
                </td>
                <td className="px-5 py-4 uppercase font-bold text-[10px]">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {item.result}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => handleCopyHash(item.verificationHash, item.id)}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-cyan-300 transition-colors"
                    title={item.verificationHash}
                  >
                    <span>{item.verificationHash.slice(0, 16)}...</span>
                    {copiedId === item.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
