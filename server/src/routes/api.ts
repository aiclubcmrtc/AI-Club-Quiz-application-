import { Router } from 'express';
import {
  incidents,
  incidentLogs,
  incidentMetrics,
  incidentTraces,
  incidentTimelines,
  auditEvents,
  evaluationsData,
  getSummary,
  resetNominal,
  triggerScenario
} from '../data.js';

export const apiRouter = Router();

// Health check
apiRouter.get('/healthz', (req, res) => {
  res.json({
    status: 'ok',
    version: '3.2.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Dashboard summary telemetry
apiRouter.get('/dashboard/summary', (req, res) => {
  res.json(getSummary());
});

// List incidents
apiRouter.get('/incidents', (req, res) => {
  const { severity, status } = req.query;
  let result = [...incidents];
  if (severity && typeof severity === 'string' && severity !== 'all') {
    result = result.filter(i => i.severity.toLowerCase() === severity.toLowerCase());
  }
  if (status && typeof status === 'string' && status !== 'all') {
    result = result.filter(i => i.status.toLowerCase() === status.toLowerCase());
  }
  res.json(result);
});

// Get single incident
apiRouter.get('/incidents/:id', (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json(incident);
});

// Get incident logs
apiRouter.get('/incidents/:id/logs', (req, res) => {
  const logs = incidentLogs[req.params.id] || incidentLogs['INC-1042'] || [];
  res.json(logs);
});

// Get incident metrics
apiRouter.get('/incidents/:id/metrics', (req, res) => {
  const metrics = incidentMetrics[req.params.id] || incidentMetrics['INC-1042'];
  res.json(metrics);
});

// Get incident traces
apiRouter.get('/incidents/:id/traces', (req, res) => {
  const traces = incidentTraces[req.params.id] || incidentTraces['INC-1042'] || [];
  res.json(traces);
});

// Get incident timeline
apiRouter.get('/incidents/:id/timeline', (req, res) => {
  const timeline = incidentTimelines[req.params.id] || incidentTimelines['INC-1042'] || [];
  res.json(timeline);
});

// Start AI investigation
apiRouter.post('/incidents/:id/investigate', (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  incident.workflowState = 'investigating';
  incident.status = 'INVESTIGATING';
  incident.confidence = 94;
  incident.updatedAt = new Date().toISOString();

  // Add timeline entry
  const timeline = incidentTimelines[incident.id] || [];
  timeline.push({
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    type: 'INVESTIGATION_EXPANDED',
    description: 'AI Multi-Agent deep correlation finished. Confidence updated to 94%.',
    service: 'SentinelOps AI Engine',
    status: 'completed'
  });

  // Add audit log
  auditEvents.unshift({
    id: `AUD-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    actor: 'Investigation Agent',
    action: 'Ran trace and AST differential correlation analysis',
    target: incident.id,
    result: 'success',
    risk: 'none',
    incidentId: incident.id,
    verificationHash: `sha256-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`
  });

  res.json(incident);
});

// Generate recommendation
apiRouter.post('/incidents/:id/recommendation', (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  incident.workflowState = 'awaiting-approval';
  incident.status = 'AWAITING APPROVAL';
  incident.updatedAt = new Date().toISOString();

  res.json(incident);
});

// Human approve recommendation
apiRouter.post('/incidents/:id/approve', (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  const { actor = 'Alex Rivera (On-Call SRE)', note = 'Approved safe execution plan.' } = req.body || {};
  incident.approvedBy = actor;
  incident.workflowState = 'awaiting-approval';
  incident.status = 'AWAITING APPROVAL';
  incident.updatedAt = new Date().toISOString();

  auditEvents.unshift({
    id: `AUD-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    actor: actor,
    action: `Approved mitigation: ${incident.recommendation}. Note: "${note}"`,
    target: incident.id,
    result: 'success',
    risk: incident.risk.toLowerCase() as any,
    incidentId: incident.id,
    verificationHash: `sha256-${Math.random().toString(36).substring(2, 12)}`
  });

  res.json(incident);
});

// Human reject recommendation
apiRouter.post('/incidents/:id/reject', (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  const { actor = 'Alex Rivera', note = 'Rejected by operator discretion.' } = req.body || {};
  incident.workflowState = 'rejected';
  incident.status = 'REJECTED';
  incident.updatedAt = new Date().toISOString();

  auditEvents.unshift({
    id: `AUD-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    actor: actor,
    action: `Rejected mitigation recommendation. Note: "${note}"`,
    target: incident.id,
    result: 'rejected',
    risk: 'none',
    incidentId: incident.id,
    verificationHash: `sha256-${Math.random().toString(36).substring(2, 12)}`
  });

  res.json(incident);
});

// Execute safe remediation
apiRouter.post('/incidents/:id/execute', (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  incident.workflowState = 'executing';
  incident.status = 'EXECUTING';
  incident.updatedAt = new Date().toISOString();

  // Improve metrics slightly during execution
  if (incidentMetrics[incident.id]) {
    incidentMetrics[incident.id].errorRate = 4.2;
    incidentMetrics[incident.id].latency = 820;
  }

  auditEvents.unshift({
    id: `AUD-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    actor: 'SentinelOps Actuator',
    action: `Executing safe canary rollback: ${incident.recommendation}`,
    target: incident.id,
    result: 'success',
    risk: 'medium',
    incidentId: incident.id,
    verificationHash: `sha256-${Math.random().toString(36).substring(2, 12)}`
  });

  res.json(incident);
});

// Rollback incident
apiRouter.post('/incidents/:id/rollback', (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  incident.workflowState = 'rolled-back';
  incident.status = 'RESOLVED';
  incident.outcome = 'Safe rollback complete. State restored to previous verified release.';
  incident.updatedAt = new Date().toISOString();

  if (incidentMetrics[incident.id]) {
    incidentMetrics[incident.id].errorRate = 0.05;
    incidentMetrics[incident.id].latency = 48;
    incidentMetrics[incident.id].cpu = 32;
  }

  auditEvents.unshift({
    id: `AUD-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    actor: 'Alex Rivera / SentinelOps Rollback Guard',
    action: `Rollback applied successfully. Snapshot ${incident.mitigationPlan?.recoverySnapshotId || 'snap-default'} verified.`,
    target: incident.id,
    result: 'success',
    risk: 'low',
    incidentId: incident.id,
    verificationHash: `sha256-${Math.random().toString(36).substring(2, 12)}`
  });

  res.json(incident);
});

// Verify recovery
apiRouter.post('/incidents/:id/verify', (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  incident.workflowState = 'verified';
  incident.status = 'RESOLVED';
  incident.outcome = 'All synthetic health checks passing. P95 latency restored to 42ms. Zero 5xx errors recorded over 300s window.';
  incident.updatedAt = new Date().toISOString();

  // Reset metrics to healthy nominal
  if (incidentMetrics[incident.id]) {
    incidentMetrics[incident.id].errorRate = 0.02;
    incidentMetrics[incident.id].latency = 42;
    incidentMetrics[incident.id].cpu = 28;
    incidentMetrics[incident.id].memory = 45;
  }

  auditEvents.unshift({
    id: `AUD-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    actor: 'Verification Sentinel',
    action: 'Synthetic health audit passed: latency 42ms, 0% error rate. Incident closed.',
    target: incident.id,
    result: 'success',
    risk: 'none',
    incidentId: incident.id,
    verificationHash: `sha256-${Math.random().toString(36).substring(2, 12)}`
  });

  res.json(incident);
});

// Audit events
apiRouter.get('/audit', (req, res) => {
  res.json(auditEvents);
});

// Evaluation benchmark results
apiRouter.get('/evaluations', (req, res) => {
  res.json(evaluationsData);
});

// Run evaluations suite
apiRouter.post('/evaluations/run', (req, res) => {
  // Boost agent accuracy slightly to simulate ongoing learning
  evaluationsData.agent.rootCauseAccuracy = Math.min(99.4, +(evaluationsData.agent.rootCauseAccuracy + 0.3).toFixed(1));
  evaluationsData.agent.timeToDiagnosis = Math.max(28, evaluationsData.agent.timeToDiagnosis - 2);

  auditEvents.unshift({
    id: `AUD-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    actor: 'Chaos Benchmark Runner',
    action: 'Executed automated evaluation test suite across 4 synthetic incident scenarios',
    target: 'Evaluation Engine',
    result: 'success',
    risk: 'none',
    incidentId: 'EVAL-RUN',
    verificationHash: `sha256-${Math.random().toString(36).substring(2, 12)}`
  });

  res.json(evaluationsData);
});

// Simulation trigger (for interactive live demos)
apiRouter.post('/simulation/trigger', (req, res) => {
  const { scenario = 'payment-spike' } = req.body || {};
  triggerScenario(scenario);
  res.json({ success: true, message: `Chaos scenario '${scenario}' triggered.`, summary: getSummary() });
});

// Reset to nominal
apiRouter.post('/simulation/reset', (req, res) => {
  resetNominal();
  res.json({ success: true, message: 'All microservices restored to nominal state.', summary: getSummary() });
});
