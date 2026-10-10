import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Incident, DashboardSummary, AuditEvent, EvaluationResults } from '../types';
import { api } from '../api/client';
import { sound } from '../utils/audio';

interface IncidentContextType {
  incidents: Incident[];
  selectedIncident: Incident | null;
  summary: DashboardSummary | null;
  auditEvents: AuditEvent[];
  evaluations: EvaluationResults | null;
  loading: boolean;
  soundEnabled: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  toggleSound: () => void;
  selectIncidentById: (id: string) => void;
  refreshData: () => Promise<void>;
  investigateIncident: (id: string) => Promise<void>;
  approveIncident: (id: string, note?: string) => Promise<void>;
  rejectIncident: (id: string, note?: string) => Promise<void>;
  executeIncident: (id: string) => Promise<void>;
  rollbackIncident: (id: string) => Promise<void>;
  verifyIncident: (id: string) => Promise<void>;
  triggerChaosScenario: (scenario: 'payment-spike' | 'redis-storm' | 'auth-cascade') => Promise<void>;
  resetToNominal: () => Promise<void>;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationResults | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sound.isEnabled());
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleSound = () => {
    const next = !soundEnabled;
    sound.setEnabled(next);
    setSoundEnabled(next);
    if (next) sound.playClick();
  };

  const refreshData = useCallback(async () => {
    try {
      const [sum, incs, audits, evals] = await Promise.all([
        api.getSummary(),
        api.getIncidents(),
        api.getAudit(),
        api.getEvaluations()
      ]);
      setSummary(sum);
      setIncidents(incs);
      setAuditEvents(audits);
      setEvaluations(evals);

      // Keep selected incident updated
      setSelectedIncident(prev => {
        if (!prev && incs.length > 0) return incs[0];
        if (prev) {
          const matched = incs.find(i => i.id === prev.id);
          return matched || incs[0] || null;
        }
        return null;
      });
    } catch (err) {
      console.error('Error refreshing incident data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load & SSE telemetry stream setup
  useEffect(() => {
    refreshData();

    // Setup live Server-Sent Events (SSE) telemetry if supported
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/stream/telemetry');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && typeof data.systemHealth === 'number') {
            setSummary(prev => ({
              ...prev,
              systemHealth: data.systemHealth,
              activeIncidents: data.activeIncidents ?? prev?.activeIncidents ?? 1,
              servicesHealthy: data.servicesHealthy ?? prev?.servicesHealthy ?? 10,
              servicesTotal: data.servicesTotal ?? 12,
              aiConfidence: data.aiConfidence ?? 94,
              errorRate: data.errorRate ?? prev?.errorRate ?? 0.08,
              recoveryTime: data.recoveryTime ?? 42
            }));
          }
        } catch {
          // Ignore parse errors
        }
      };
    } catch (e) {
      console.log('SSE not available, falling back to interval refresh');
    }

    // Polling backup every 5 seconds for incidents list
    const interval = setInterval(() => {
      refreshData();
    }, 5000);

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [refreshData]);

  const selectIncidentById = (id: string) => {
    sound.playClick();
    const inc = incidents.find(i => i.id === id);
    if (inc) setSelectedIncident(inc);
  };

  const investigateIncident = async (id: string) => {
    sound.playClick();
    try {
      const updated = await api.investigate(id);
      setIncidents(prev => prev.map(i => i.id === id ? updated : i));
      if (selectedIncident?.id === id) setSelectedIncident(updated);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const approveIncident = async (id: string, note?: string) => {
    sound.playClick();
    try {
      const updated = await api.approve(id, 'Alex Rivera (On-Call SRE)', note);
      setIncidents(prev => prev.map(i => i.id === id ? updated : i));
      if (selectedIncident?.id === id) setSelectedIncident(updated);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const rejectIncident = async (id: string, note?: string) => {
    sound.playClick();
    try {
      const updated = await api.reject(id, 'Alex Rivera', note);
      setIncidents(prev => prev.map(i => i.id === id ? updated : i));
      if (selectedIncident?.id === id) setSelectedIncident(updated);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const executeIncident = async (id: string) => {
    sound.playClick();
    try {
      const updated = await api.execute(id);
      setIncidents(prev => prev.map(i => i.id === id ? updated : i));
      if (selectedIncident?.id === id) setSelectedIncident(updated);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const rollbackIncident = async (id: string) => {
    sound.playRollback();
    try {
      const updated = await api.rollback(id);
      setIncidents(prev => prev.map(i => i.id === id ? updated : i));
      if (selectedIncident?.id === id) setSelectedIncident(updated);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const verifyIncident = async (id: string) => {
    sound.playSuccess();
    try {
      const updated = await api.verify(id);
      setIncidents(prev => prev.map(i => i.id === id ? updated : i));
      if (selectedIncident?.id === id) setSelectedIncident(updated);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const triggerChaosScenario = async (scenario: 'payment-spike' | 'redis-storm' | 'auth-cascade') => {
    sound.playAlert();
    try {
      await api.triggerScenario(scenario);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const resetToNominal = async () => {
    sound.playSuccess();
    try {
      await api.resetScenario();
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        selectedIncident,
        summary,
        auditEvents,
        evaluations,
        loading,
        soundEnabled,
        searchQuery,
        setSearchQuery,
        toggleSound,
        selectIncidentById,
        refreshData,
        investigateIncident,
        approveIncident,
        rejectIncident,
        executeIncident,
        rollbackIncident,
        verifyIncident,
        triggerChaosScenario,
        resetToNominal
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
};
