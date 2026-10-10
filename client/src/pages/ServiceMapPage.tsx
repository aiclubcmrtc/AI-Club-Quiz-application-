import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  Network,
  Server,
  Database,
  Cloud,
  Code2,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { sound } from '../utils/audio';

interface ServiceNode {
  id: string;
  name: string;
  category: 'EDGE' | 'APP' | 'DATA' | 'QUEUE';
  status: 'healthy' | 'watch' | 'degraded';
  latency: string;
  errorRate: string;
  throughput: string;
  upstream: string[];
  downstream: string[];
}

export const ServiceMapPage: React.FC = () => {
  const { incidents, triggerChaosScenario } = useIncidents();
  const hasPaymentIncident = incidents.some(i => i.id === 'INC-1042' && i.status !== 'RESOLVED');
  const hasRedisIncident = incidents.some(i => i.id === 'INC-1043' && i.status !== 'RESOLVED');

  const services: ServiceNode[] = [
    {
      id: 'edge-router',
      name: 'Cloudflare Edge Mesh',
      category: 'EDGE',
      status: 'healthy',
      latency: '8 ms',
      errorRate: '0.00%',
      throughput: '14.2k rps',
      upstream: ['Internet'],
      downstream: ['api-gateway']
    },
    {
      id: 'api-gateway',
      name: 'Kong API Gateway',
      category: 'EDGE',
      status: hasPaymentIncident ? 'watch' : 'healthy',
      latency: hasPaymentIncident ? '420 ms' : '22 ms',
      errorRate: hasPaymentIncident ? '4.2%' : '0.01%',
      throughput: '12.8k rps',
      upstream: ['edge-router'],
      downstream: ['checkout-api', 'auth-service']
    },
    {
      id: 'checkout-api',
      name: 'Checkout & Cart Engine',
      category: 'APP',
      status: hasPaymentIncident ? 'degraded' : 'healthy',
      latency: hasPaymentIncident ? '4,210 ms' : '45 ms',
      errorRate: hasPaymentIncident ? '18.4%' : '0.02%',
      throughput: '1,420 rps',
      upstream: ['api-gateway'],
      downstream: ['payment-gateway', 'redis-cache']
    },
    {
      id: 'payment-gateway',
      name: 'Payment Processing Pods',
      category: 'APP',
      status: hasPaymentIncident ? 'degraded' : 'healthy',
      latency: hasPaymentIncident ? '3,950 ms' : '85 ms',
      errorRate: hasPaymentIncident ? '19.8%' : '0.01%',
      throughput: '980 rps',
      upstream: ['checkout-api'],
      downstream: ['postgres-primary', 'stripe-bridge']
    },
    {
      id: 'auth-service',
      name: 'Auth & JWT Token Vault',
      category: 'APP',
      status: 'healthy',
      latency: '24 ms',
      errorRate: '0.00%',
      throughput: '3,200 rps',
      upstream: ['api-gateway'],
      downstream: ['redis-cache']
    },
    {
      id: 'redis-cache',
      name: 'Redis Session Shard',
      category: 'DATA',
      status: hasRedisIncident ? 'degraded' : hasPaymentIncident ? 'watch' : 'healthy',
      latency: hasRedisIncident ? '840 ms' : '3 ms',
      errorRate: hasRedisIncident ? '11.2%' : '0.00%',
      throughput: '28.4k ops',
      upstream: ['checkout-api', 'auth-service'],
      downstream: []
    },
    {
      id: 'postgres-primary',
      name: 'PostgreSQL Primary Cluster',
      category: 'DATA',
      status: hasPaymentIncident ? 'degraded' : 'healthy',
      latency: hasPaymentIncident ? '3,950 ms' : '14 ms',
      errorRate: hasPaymentIncident ? '18.4%' : '0.00%',
      throughput: '4,800 qps',
      upstream: ['payment-gateway'],
      downstream: []
    }
  ];

  const [selectedService, setSelectedService] = useState<ServiceNode>(services[2]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-primary uppercase">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            DYNAMIC TOPOLOGY & CASCADE MAPPING
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Service Topology Map
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real-time blast radius inspection and inter-service latency degradation graphs.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Healthy
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Warning
          </span>
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" /> Degraded
          </span>
        </div>
      </div>

      {/* Grid: Topology Canvas + Node Inspector */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Interactive Topology Graph (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-[#0a0f1d] p-6 shadow-xl relative min-h-[500px] flex flex-col justify-between overflow-hidden">
          {/* Background grid */}
          <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

          {/* Blast Radius Warning Banner if degraded */}
          {hasPaymentIncident && (
            <div className="relative z-10 rounded-xl border border-red-500/30 bg-red-950/40 p-3 flex items-center justify-between text-xs font-mono text-red-300 mb-4">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <strong>ACTIVE CASCADE:</strong> Connection starvation in postgres-primary impacting checkout-api & payment-gateway.
              </span>
              <Link href="/remediation" className="text-white underline font-bold shrink-0 ml-2">
                Remediate →
              </Link>
            </div>
          )}

          {/* Interactive Nodes Layout */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 my-auto py-6">
            {services.map((svc) => {
              const isSelected = selectedService.id === svc.id;
              const isDegraded = svc.status === 'degraded';
              const isWatch = svc.status === 'watch';

              return (
                <button
                  key={svc.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedService(svc);
                  }}
                  className={`
                    p-4 rounded-xl border text-left transition-all backdrop-blur-md relative
                    ${isSelected ? 'ring-2 ring-cyan-400 glow-cyan-sm' : ''}
                    ${isDegraded 
                      ? 'border-red-500/60 bg-red-950/30 hover:border-red-400' 
                      : isWatch
                      ? 'border-amber-500/60 bg-amber-950/30 hover:border-amber-400'
                      : 'border-white/10 bg-[#0f172a]/70 hover:border-cyan-500/40'}
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[9px] font-bold uppercase text-muted-foreground">
                      {svc.category}
                    </span>
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      isDegraded ? 'bg-red-400 animate-ping' :
                      isWatch ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                  </div>

                  <div className="font-display text-sm font-bold text-white truncate">
                    {svc.name}
                  </div>

                  <div className="mt-3 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-muted-foreground">p95:</span>
                    <span className={`font-bold ${isDegraded ? 'text-red-400' : 'text-slate-200'}`}>
                      {svc.latency}
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-mono text-[11px] mt-0.5">
                    <span className="text-muted-foreground">err:</span>
                    <span className={`font-bold ${isDegraded ? 'text-red-400' : 'text-slate-200'}`}>
                      {svc.errorRate}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="relative z-10 text-[11px] font-mono text-muted-foreground flex justify-between pt-4 border-t border-border/40">
            <span>Click any node to inspect telemetry and cascade blast radius.</span>
            <span>Real-time Jaeger / OpenTelemetry mesh</span>
          </div>
        </div>

        {/* Right: Selected Node Telemetry Inspector (1 col) */}
        <div className="rounded-2xl border border-cyan-500/30 bg-[#0d1527] p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Service Inspector
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                selectedService.status === 'degraded' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {selectedService.status}
              </span>
            </div>

            <div>
              <h3 className="font-display text-xl font-bold text-white">
                {selectedService.name}
              </h3>
              <div className="text-xs font-mono text-cyan-400 mt-0.5">
                ID: {selectedService.id}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2">
              <div className="p-3 rounded-lg border border-border bg-card">
                <div className="text-muted-foreground text-[10px]">P95 LATENCY</div>
                <div className="text-base font-bold text-white mt-1">{selectedService.latency}</div>
              </div>
              <div className="p-3 rounded-lg border border-border bg-card">
                <div className="text-muted-foreground text-[10px]">ERROR RATE</div>
                <div className={`text-base font-bold mt-1 ${selectedService.errorRate !== '0.00%' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {selectedService.errorRate}
                </div>
              </div>
              <div className="p-3 rounded-lg border border-border bg-card col-span-2">
                <div className="text-muted-foreground text-[10px]">THROUGHPUT LOAD</div>
                <div className="text-base font-bold text-cyan-400 mt-1">{selectedService.throughput}</div>
              </div>
            </div>

            {/* Dependencies */}
            <div className="space-y-2 pt-2 text-xs font-mono">
              <div className="text-[11px] font-bold text-slate-400 uppercase">
                DEPENDENCY GRAPH
              </div>
              <div className="p-2.5 rounded bg-card/60 border border-border">
                <span className="text-muted-foreground">Upstream: </span>
                <span className="text-slate-200">{selectedService.upstream.join(', ') || 'None (Edge)'}</span>
              </div>
              <div className="p-2.5 rounded bg-card/60 border border-border">
                <span className="text-muted-foreground">Downstream: </span>
                <span className="text-slate-200">{selectedService.downstream.join(', ') || 'None (Sink)'}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-4">
            <Link
              href="/incidents"
              className="w-full rounded-xl bg-card border border-border py-2 text-center text-xs font-bold text-slate-200 hover:text-white hover:border-cyan-500/40 block transition-all"
            >
              View Active Incidents for this Node
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
