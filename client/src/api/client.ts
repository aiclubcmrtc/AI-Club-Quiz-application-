import { 
  Incident, 
  IncidentMetrics, 
  LogEntry, 
  TraceSpan, 
  TimelineEvent, 
  AuditEvent, 
  DashboardSummary, 
  EvaluationResults 
} from '../types';

// Fallback initial data in case the backend is momentarily offline or restarting
const fallbackIncidents: Incident[] = [
  {
    id: "INC-1042",
    title: "Payment API Latency Spike & Pool Exhaustion",
    severity: "CRITICAL",
    status: "AWAITING APPROVAL",
    workflowState: "awaiting-approval",
    affectedServices: ["Payment Gateway", "Database", "API Gateway"],
    rootCause: "Postgres connection pool exhaustion caused by unindexed query introduced in deployment v2.4.1.",
    recommendation: "Execute safe container rollback to release v2.4.0 and re-allocate 50 connections to payment worker pool.",
    risk: "MEDIUM",
    confidence: 94,
    reversible: true,
    rollbackAvailable: true,
    approvedBy: null,
    outcome: null,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    mitigationPlan: {
      actionType: "CANARY_ROLLBACK",
      targetService: "checkout-payment-api",
      description: "Revert image checkout-api:v2.4.1 -> checkout-api:v2.4.0 in us-east-1 and us-west-2 clusters.",
      blastRadius: ["Payment Gateway", "Checkout API", "Stripe Bridge"],
      recoverySnapshotId: "snap-rec-9941a",
      estimatedTimeToRestoreSeconds: 45
    }
  },
  {
    id: "INC-1043",
    title: "Redis Cluster Memory Spike & Key Eviction Storm",
    severity: "HIGH",
    status: "OPEN",
    workflowState: "investigating",
    affectedServices: ["Session Cache", "Auth Service", "Redis Primary"],
    rootCause: "Session TTL anomaly causing 120,000 invalid token keys to flood redis cluster memory buffer.",
    recommendation: "Apply dynamic key eviction dampener and adjust maxmemory-policy to volatile-lru.",
    risk: "LOW",
    confidence: 88,
    reversible: true,
    rollbackAvailable: true,
    approvedBy: null,
    outcome: null,
    createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "INC-1044",
    title: "JWT Token Verification Cascade Failure",
    severity: "HIGH",
    status: "RESOLVED",
    workflowState: "verified",
    affectedServices: ["Auth Service", "API Gateway"],
    rootCause: "JWKS public key rotation timeout against external identity provider.",
    recommendation: "Switch to cached JWKS standby keys and raise timeout to 5000ms.",
    risk: "LOW",
    confidence: 96,
    reversible: true,
    rollbackAvailable: true,
    approvedBy: "Alex Rivera",
    outcome: "Recovery verified in 28 seconds. Error rate dropped from 14.2% to 0.04%.",
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
  }
];

const fallbackSummary: DashboardSummary = {
  systemHealth: 88.4,
  activeIncidents: 2,
  servicesHealthy: 10,
  servicesTotal: 12,
  aiConfidence: 94,
  errorRate: 3.8,
  recoveryTime: 42
};

const fallbackLogs: LogEntry[] = [
  { timestamp: "10:42:10", service: "checkout-api", level: "INFO", message: "Incoming POST /v1/checkout/charge (tid: 9f8a-221)" },
  { timestamp: "10:42:11", service: "payment-gateway", level: "WARN", message: "Database connection acquisition exceeded warning threshold 250ms (actual: 1240ms)" },
  { timestamp: "10:42:12", service: "postgres-primary", level: "ERROR", message: "FATAL: remaining connection slots are reserved for non-replication superuser connections" },
  { timestamp: "10:42:13", service: "payment-gateway", level: "ERROR", message: "PG::ConnectionBad: pool exhausted (size: 100, active: 100, waiting: 842)" },
  { timestamp: "10:42:14", service: "api-gateway", level: "ERROR", message: "HTTP 504 Gateway Timeout downstream payment-service (p95: 4,820ms)" },
  { timestamp: "10:42:16", service: "investigation-sentinel", level: "INFO", message: "AI Agent correlated alert with release deployment v2.4.1 executed 2m prior" }
];

const fallbackTraces: TraceSpan[] = [
  { service: "api-gateway", dependency: "checkout-api", latency: 4210, status: "degraded", endpoint: "POST /v1/checkout" },
  { service: "checkout-api", dependency: "payment-gateway", latency: 4180, status: "degraded", endpoint: "POST /internal/charge" },
  { service: "payment-gateway", dependency: "postgres-primary", latency: 3950, status: "degraded", endpoint: "TCP Pool Acquire" },
  { service: "payment-gateway", dependency: "stripe-bridge", latency: 180, status: "healthy", endpoint: "POST /v1/tokens" }
];

const fallbackTimeline: TimelineEvent[] = [
  { timestamp: "10:40:00", type: "DEPLOYMENT", description: "Release Controller deployed release v2.4.1 to production", service: "Release Engine", status: "completed" },
  { timestamp: "10:42:10", type: "ALERT_SIGNAL", description: "Datadog synthetic check detected P95 latency > 3000ms threshold", service: "Payment Gateway", status: "completed" },
  { timestamp: "10:43:05", type: "INVESTIGATION_START", description: "SentinelOps multi-agent triage initialized: log correlator & trace analyzer attached", service: "SentinelOps Core", status: "completed" },
  { timestamp: "10:44:20", type: "ROOT_CAUSE_ISOLATED", description: "Root cause confirmed: DB connection pool exhaustion in release v2.4.1", service: "Inference Sentinel", status: "completed" },
  { timestamp: "10:45:00", type: "PROPOSAL_GENERATED", description: "Reversible container rollback plan synthesized & sandbox dry-run passed", service: "Remediation Planner", status: "completed" },
  { timestamp: "10:45:30", type: "HUMAN_GATE", description: "Awaiting operator cryptographic approval before touching production traffic", service: "Approval Boundary", status: "waiting" }
];

// Helper to make API requests with safe fallback
async function request<T>(endpoint: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      }
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[SentinelOps API] Failed to fetch /api${endpoint}, using fallback state:`, err);
    if (fallback !== undefined) {
      return fallback;
    }
    throw err;
  }
}

export const api = {
  // Health
  getHealth: () => request<{ status: string }>('/healthz', undefined, { status: 'ok' }),

  // Summary
  getSummary: () => request<DashboardSummary>('/dashboard/summary', undefined, fallbackSummary),

  // Incidents
  getIncidents: (severity?: string, status?: string) => {
    const params = new URLSearchParams();
    if (severity) params.set('severity', severity);
    if (status) params.set('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Incident[]>(`/incidents${query}`, undefined, fallbackIncidents);
  },

  getIncident: (id: string) => 
    request<Incident>(`/incidents/${id}`, undefined, fallbackIncidents.find(i => i.id === id) || fallbackIncidents[0]),

  getLogs: (id: string) => 
    request<LogEntry[]>(`/incidents/${id}/logs`, undefined, fallbackLogs),

  getMetrics: (id: string) => 
    request<IncidentMetrics>(`/incidents/${id}/metrics`, undefined, {
      cpu: 88,
      memory: 84,
      latency: 4210,
      errorRate: 18.4,
      connections: 984,
      throughput: 1420
    }),

  getTraces: (id: string) => 
    request<TraceSpan[]>(`/incidents/${id}/traces`, undefined, fallbackTraces),

  getTimeline: (id: string) => 
    request<TimelineEvent[]>(`/incidents/${id}/timeline`, undefined, fallbackTimeline),

  // Actions
  investigate: (id: string) => 
    request<Incident>(`/incidents/${id}/investigate`, { method: 'POST' }),

  recommend: (id: string) => 
    request<Incident>(`/incidents/${id}/recommendation`, { method: 'POST' }),

  approve: (id: string, actor?: string, note?: string) => 
    request<Incident>(`/incidents/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ actor, note })
    }),

  reject: (id: string, actor?: string, note?: string) => 
    request<Incident>(`/incidents/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ actor, note })
    }),

  execute: (id: string) => 
    request<Incident>(`/incidents/${id}/execute`, { method: 'POST' }),

  rollback: (id: string) => 
    request<Incident>(`/incidents/${id}/rollback`, { method: 'POST' }),

  verify: (id: string) => 
    request<Incident>(`/incidents/${id}/verify`, { method: 'POST' }),

  // Audit
  getAudit: () => 
    request<AuditEvent[]>('/audit', undefined, [
      {
        id: "AUD-9901",
        timestamp: new Date().toISOString(),
        actor: "SentinelOps AI Engine",
        action: "Generated reversible rollback proposal and ran sandbox dry-run",
        target: "INC-1042 (checkout-api)",
        result: "success",
        risk: "medium",
        incidentId: "INC-1042",
        verificationHash: "sha256-8a9f3b2e7c4d1e0f5a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f"
      }
    ]),

  // Evaluations
  getEvaluations: () => 
    request<EvaluationResults>('/evaluations'),

  runEvaluations: () => 
    request<EvaluationResults>('/evaluations/run', { method: 'POST' }),

  // Chaos simulations
  triggerScenario: (scenario: 'payment-spike' | 'redis-storm' | 'auth-cascade') => 
    request<{ success: boolean; message: string; summary: DashboardSummary }>('/simulation/trigger', {
      method: 'POST',
      body: JSON.stringify({ scenario })
    }),

  resetScenario: () => 
    request<{ success: boolean; message: string; summary: DashboardSummary }>('/simulation/reset', {
      method: 'POST'
    })
};
