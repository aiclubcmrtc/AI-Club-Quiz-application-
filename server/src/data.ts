import { 
  Incident, 
  LogEntry, 
  IncidentMetrics, 
  TraceSpan, 
  TimelineEvent, 
  AuditEvent, 
  DashboardSummary, 
  EvaluationResults 
} from './types.js';

export let incidents: Incident[] = [
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
    mitigationPlan: {
      actionType: "CONFIG_HOT_APPLY",
      targetService: "redis-cluster-shard-01",
      description: "Set volatile-lru policy and purge expired session prefixes.",
      blastRadius: ["Session Cache", "Auth Service"],
      recoverySnapshotId: "snap-redis-8822b",
      estimatedTimeToRestoreSeconds: 20
    }
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

export let incidentLogs: Record<string, LogEntry[]> = {
  "INC-1042": [
    { timestamp: "10:42:10.104", service: "checkout-api", level: "INFO", message: "Incoming POST /v1/checkout/charge (tid: 9f8a-221)" },
    { timestamp: "10:42:11.442", service: "payment-gateway", level: "WARN", message: "Database connection acquisition exceeded warning threshold 250ms (actual: 1240ms)" },
    { timestamp: "10:42:12.890", service: "postgres-primary", level: "ERROR", message: "FATAL: remaining connection slots are reserved for non-replication superuser connections" },
    { timestamp: "10:42:13.120", service: "payment-gateway", level: "ERROR", message: "PG::ConnectionBad: pool exhausted (size: 100, active: 100, waiting: 842)" },
    { timestamp: "10:42:14.305", service: "api-gateway", level: "ERROR", message: "HTTP 504 Gateway Timeout downstream payment-service (p95: 4,820ms)" },
    { timestamp: "10:42:16.881", service: "investigation-sentinel", level: "INFO", message: "AI Agent correlated alert with release deployment v2.4.1 executed 2m prior" },
    { timestamp: "10:42:18.012", service: "investigation-sentinel", level: "INFO", message: "AST diff identified unindexed query SELECT * FROM ledger_entries WHERE account_id = $1" }
  ],
  "INC-1043": [
    { timestamp: "10:15:02", service: "redis-cluster", level: "WARN", message: "Memory usage exceeded 85% watermark (used: 28.4GB / 32GB)" },
    { timestamp: "10:16:30", service: "auth-service", level: "ERROR", message: "RedisCommandTimeout: SETEX session token timed out after 300ms" },
    { timestamp: "10:18:12", service: "redis-cluster", level: "ERROR", message: "OOM command not allowed when used memory > 'maxmemory'" }
  ],
  "INC-1044": [
    { timestamp: "09:02:11", service: "auth-service", level: "ERROR", message: "Failed to fetch JWKS from https://idp.internal/keys: dial tcp timeout" },
    { timestamp: "09:02:44", service: "api-gateway", level: "WARN", message: "Auth service fallback triggered: serving cached token verification" },
    { timestamp: "09:05:10", service: "verification-agent", level: "INFO", message: "Failover verification succeeded: 100% tokens valid" }
  ]
};

export let incidentMetrics: Record<string, IncidentMetrics> = {
  "INC-1042": {
    cpu: 88,
    memory: 84,
    latency: 4210, // ms
    errorRate: 18.4, // %
    connections: 984,
    throughput: 1420
  },
  "INC-1043": {
    cpu: 64,
    memory: 92,
    latency: 840,
    errorRate: 6.8,
    connections: 610,
    throughput: 2800
  },
  "INC-1044": {
    cpu: 24,
    memory: 45,
    latency: 48,
    errorRate: 0.04,
    connections: 320,
    throughput: 3400
  }
};

export let incidentTraces: Record<string, TraceSpan[]> = {
  "INC-1042": [
    { service: "api-gateway", dependency: "checkout-api", latency: 4210, status: "degraded", endpoint: "POST /v1/checkout", spanId: "sp-01" },
    { service: "checkout-api", dependency: "payment-gateway", latency: 4180, status: "degraded", endpoint: "POST /internal/charge", spanId: "sp-02" },
    { service: "payment-gateway", dependency: "postgres-primary", latency: 3950, status: "degraded", endpoint: "TCP Pool Acquire", spanId: "sp-03" },
    { service: "payment-gateway", dependency: "stripe-bridge", latency: 180, status: "healthy", endpoint: "POST /v1/tokens", spanId: "sp-04" },
    { service: "payment-gateway", dependency: "redis-session", latency: 12, status: "healthy", endpoint: "GET session_key", spanId: "sp-05" }
  ],
  "INC-1043": [
    { service: "api-gateway", dependency: "auth-service", latency: 890, status: "watch", endpoint: "GET /auth/verify", spanId: "sp-11" },
    { service: "auth-service", dependency: "redis-primary", latency: 840, status: "degraded", endpoint: "GET user_session", spanId: "sp-12" }
  ],
  "INC-1044": [
    { service: "api-gateway", dependency: "auth-service", latency: 48, status: "healthy", endpoint: "POST /v1/auth", spanId: "sp-21" },
    { service: "auth-service", dependency: "idp-vault", latency: 22, status: "healthy", endpoint: "GET /certs", spanId: "sp-22" }
  ]
};

export let incidentTimelines: Record<string, TimelineEvent[]> = {
  "INC-1042": [
    { timestamp: "10:40:00", type: "DEPLOYMENT", description: "Release Controller deployed release v2.4.1 to production", service: "Release Engine", status: "completed" },
    { timestamp: "10:42:10", type: "ALERT_SIGNAL", description: "Datadog synthetic check detected P95 latency > 3000ms threshold", service: "Payment Gateway", status: "completed" },
    { timestamp: "10:43:05", type: "INVESTIGATION_START", description: "SentinelOps multi-agent triage initialized: log correlator & trace analyzer attached", service: "SentinelOps Core", status: "completed" },
    { timestamp: "10:44:20", type: "ROOT_CAUSE_ISOLATED", description: "Root cause confirmed: DB connection pool exhaustion in release v2.4.1", service: "Inference Sentinel", status: "completed" },
    { timestamp: "10:45:00", type: "PROPOSAL_GENERATED", description: "Reversible container rollback plan synthesized & sandbox dry-run passed", service: "Remediation Planner", status: "completed" },
    { timestamp: "10:45:30", type: "HUMAN_GATE", description: "Awaiting operator cryptographic approval before touching production traffic", service: "Approval Boundary", status: "waiting" }
  ],
  "INC-1043": [
    { timestamp: "10:15:00", type: "ALERT_SIGNAL", description: "Memory watermark exceeded 85%", service: "Redis Cache", status: "completed" },
    { timestamp: "10:17:30", type: "INVESTIGATION_START", description: "Analyzing TTL distribution across 1.2M keys", service: "Log Sentinel", status: "completed" }
  ],
  "INC-1044": [
    { timestamp: "09:00:00", type: "ALERT_SIGNAL", description: "JWKS cert timeout warning", service: "Auth Service", status: "completed" },
    { timestamp: "09:03:00", type: "APPROVAL", description: "Alex Rivera approved cached cert fallback", service: "Command Center", status: "completed" },
    { timestamp: "09:05:00", type: "VERIFIED", description: "All auth requests recovered to nominal 0.04% error rate", service: "Verification Sentinel", status: "completed" }
  ]
};

export let auditEvents: AuditEvent[] = [
  {
    id: "AUD-9901",
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    actor: "SentinelOps AI Engine",
    action: "Generated reversible rollback proposal and ran sandbox dry-run",
    target: "INC-1042 (checkout-api)",
    result: "success",
    risk: "medium",
    incidentId: "INC-1042",
    verificationHash: "sha256-8a9f3b2e7c4d1e0f5a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f"
  },
  {
    id: "AUD-9900",
    timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    actor: "SentinelOps AI Engine",
    action: "Completed multi-agent hypothesis ledger (94% confidence)",
    target: "INC-1042 (postgres-primary)",
    result: "success",
    risk: "none",
    incidentId: "INC-1042",
    verificationHash: "sha256-4b2e8a9f7c1d0e5f3a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6a"
  },
  {
    id: "AUD-9899",
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    actor: "Alex Rivera (On-Call SRE)",
    action: "Cryptographic human sign-off on JWKS failover",
    target: "INC-1044 (auth-service)",
    result: "success",
    risk: "low",
    incidentId: "INC-1044",
    verificationHash: "sha256-1f0e5a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f8a9f3b2e7c4d"
  }
];

export let evaluationsData: EvaluationResults = {
  scenarios: [
    {
      id: "SCN-101",
      name: "Postgres Connection Pool Starvation Under Spike",
      groundTruth: "Connection pool starvation due to unindexed query",
      agentRootCause: "Connection pool exhaustion from unindexed query in release v2.4.1",
      baselineRootCause: "Generic database high CPU alert",
      agentConfidence: 96,
      diagnosisSeconds: 38,
      remediationSuccess: true
    },
    {
      id: "SCN-102",
      name: "Redis Key Eviction Storm on Cluster Shard",
      groundTruth: "Session token TTL bug causing OOM",
      agentRootCause: "Invalid token keys flooding memory buffer, missing TTL",
      baselineRootCause: "Memory limit reached on host",
      agentConfidence: 92,
      diagnosisSeconds: 44,
      remediationSuccess: true
    },
    {
      id: "SCN-103",
      name: "Kubernetes OOMKill Pod Crashloop Cascading Blast",
      groundTruth: "JVM heap limit mismatched with cgroup v2 container limit",
      agentRootCause: "Heap allocation 4GB exceeded pod limit 3.5GB in container spec",
      baselineRootCause: "Pod restarting frequently",
      agentConfidence: 95,
      diagnosisSeconds: 29,
      remediationSuccess: true
    },
    {
      id: "SCN-104",
      name: "Microservice Circuit Breaker False-Open Flapping",
      groundTruth: "Aggressive timeout setting during transient network blip",
      agentRootCause: "Timeout set to 150ms instead of 800ms baseline",
      baselineRootCause: "Upstream 503 errors reported",
      agentConfidence: 91,
      diagnosisSeconds: 52,
      remediationSuccess: true
    }
  ],
  agent: {
    rootCauseAccuracy: 95.8,
    timeToDiagnosis: 41, // seconds
    remediationSuccessRate: 98.2, // %
    falsePositiveRate: 2.4, // %
    confidenceCalibration: 96.5 // %
  },
  baseline: {
    rootCauseAccuracy: 64.2,
    timeToDiagnosis: 480, // seconds
    remediationSuccessRate: 58.7,
    falsePositiveRate: 18.9,
    confidenceCalibration: 62.0
  }
};

export function getSummary(): DashboardSummary {
  const active = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'REJECTED').length;
  // Calculate health index dynamically based on active incidents
  let health = 99.4;
  let errorRate = 0.08;
  
  if (active > 0) {
    const critCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
    const highCount = incidents.filter(i => i.severity === 'HIGH' && i.status !== 'RESOLVED').length;
    health = Math.max(72, +(99.4 - critCount * 14.5 - highCount * 6.2).toFixed(1));
    errorRate = +(0.08 + critCount * 4.2 + highCount * 1.8).toFixed(2);
  }

  return {
    systemHealth: health,
    activeIncidents: active,
    servicesHealthy: active === 0 ? 12 : Math.max(9, 12 - active),
    servicesTotal: 12,
    aiConfidence: 94,
    errorRate: errorRate,
    recoveryTime: 42 // seconds average
  };
}

// Reset everything to pristine nominal status
export function resetNominal() {
  incidents.forEach(inc => {
    inc.status = "RESOLVED";
    inc.workflowState = "verified";
    inc.outcome = "System restored to nominal operating envelope.";
    inc.updatedAt = new Date().toISOString();
  });
  
  Object.keys(incidentMetrics).forEach(id => {
    incidentMetrics[id] = {
      cpu: 28,
      memory: 42,
      latency: 45,
      errorRate: 0.02,
      connections: 210,
      throughput: 3800
    };
  });
  
  auditEvents.unshift({
    id: `AUD-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    actor: "Alex Rivera (On-Call SRE)",
    action: "Manual environment reset: all microservices verified nominal",
    target: "Global Cluster",
    result: "success",
    risk: "none",
    incidentId: "SYSTEM-RESET",
    verificationHash: "sha256-reset-" + Math.random().toString(36).substring(2)
  });
}

// Trigger custom chaos scenario
export function triggerScenario(type: 'payment-spike' | 'redis-storm' | 'auth-cascade') {
  if (type === 'payment-spike') {
    const inc = incidents.find(i => i.id === 'INC-1042');
    if (inc) {
      inc.status = 'AWAITING APPROVAL';
      inc.workflowState = 'awaiting-approval';
      inc.approvedBy = null;
      inc.outcome = null;
      inc.updatedAt = new Date().toISOString();
    }
    incidentMetrics['INC-1042'] = {
      cpu: 92,
      memory: 86,
      latency: 4450,
      errorRate: 19.8,
      connections: 994,
      throughput: 1100
    };
  } else if (type === 'redis-storm') {
    const inc = incidents.find(i => i.id === 'INC-1043');
    if (inc) {
      inc.status = 'OPEN';
      inc.workflowState = 'investigating';
      inc.updatedAt = new Date().toISOString();
    }
    incidentMetrics['INC-1043'] = {
      cpu: 78,
      memory: 95,
      latency: 1240,
      errorRate: 11.2,
      connections: 840,
      throughput: 1800
    };
  } else if (type === 'auth-cascade') {
    const inc = incidents.find(i => i.id === 'INC-1044');
    if (inc) {
      inc.status = 'AWAITING APPROVAL';
      inc.workflowState = 'awaiting-approval';
      inc.approvedBy = null;
      inc.outcome = null;
      inc.updatedAt = new Date().toISOString();
    }
    incidentMetrics['INC-1044'] = {
      cpu: 81,
      memory: 68,
      latency: 2150,
      errorRate: 16.4,
      connections: 750,
      throughput: 950
    };
  }
}
