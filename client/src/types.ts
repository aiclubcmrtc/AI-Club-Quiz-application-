export interface Incident {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'INVESTIGATING' | 'AWAITING APPROVAL' | 'EXECUTING' | 'RESOLVED' | 'REJECTED';
  workflowState: 'detected' | 'investigating' | 'awaiting-approval' | 'executing' | 'verified' | 'rejected' | 'rolled-back';
  affectedServices: string[];
  rootCause: string;
  recommendation: string;
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  reversible: boolean;
  rollbackAvailable: boolean;
  approvedBy: string | null;
  outcome: string | null;
  createdAt: string;
  updatedAt: string;
  mitigationPlan?: {
    actionType: string;
    targetService: string;
    description: string;
    blastRadius: string[];
    recoverySnapshotId: string;
    estimatedTimeToRestoreSeconds: number;
  };
}

export interface LogEntry {
  timestamp: string;
  service: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  message: string;
  details?: Record<string, any>;
}

export interface IncidentMetrics {
  cpu: number;
  memory: number;
  latency: number;
  errorRate: number;
  connections: number;
  throughput?: number;
}

export interface TraceSpan {
  service: string;
  dependency: string;
  latency: number;
  status: 'healthy' | 'watch' | 'degraded';
  endpoint?: string;
  spanId?: string;
}

export interface TimelineEvent {
  timestamp: string;
  type: string;
  description: string;
  service: string;
  status: 'completed' | 'in_progress' | 'waiting' | 'failed' | 'pending';
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  result: 'success' | 'pending' | 'rejected' | 'warning';
  risk: 'high' | 'medium' | 'low' | 'none';
  incidentId: string;
  verificationHash: string;
}

export interface DashboardSummary {
  systemHealth: number;
  activeIncidents: number;
  servicesHealthy: number;
  servicesTotal: number;
  aiConfidence: number;
  errorRate: number;
  recoveryTime: number;
}

export interface EvaluationScenario {
  id: string;
  name: string;
  groundTruth: string;
  agentRootCause: string;
  baselineRootCause: string;
  agentConfidence: number;
  diagnosisSeconds: number;
  remediationSuccess: boolean;
}

export interface EvaluationMetrics {
  rootCauseAccuracy: number;
  timeToDiagnosis: number;
  remediationSuccessRate: number;
  falsePositiveRate: number;
  confidenceCalibration: number;
}

export interface EvaluationResults {
  scenarios: EvaluationScenario[];
  agent: EvaluationMetrics;
  baseline: EvaluationMetrics;
}
