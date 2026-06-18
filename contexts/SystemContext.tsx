'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { systemService, type SystemMetric, type SystemAlert, type ServiceStatus, type SystemStats } from '@/services/system';
import { useAuth } from './AuthContext';

interface SystemContextType {
  metrics: SystemMetric[];
  alerts: SystemAlert[];
  services: ServiceStatus[];
  systemStats: SystemStats | null;
  healthScore: number;
  isLoading: boolean;
  error: string | null;
  refreshSystemData: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  getHealthyMetricsFromContext: () => SystemMetric[];
  getWarningMetricsFromContext: () => SystemMetric[];
  getErrorMetricsFromContext: () => SystemMetric[];
  getRecentAlertsFromContext: (hours?: number) => SystemAlert[];
  getCriticalAlertsFromContext: () => SystemAlert[];
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export function SystemProvider({ children }: { children: React.ReactNode }) {
  const { user: currentUser, sessionEpoch } = useAuth();

  // Simple permission check function
  const hasPermission = ()=> {
    if (!currentUser) return false;
    // Only admins have system permissions
    return currentUser.role === 'admin';
  };

  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [healthScore, setHealthScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSystemData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!currentUser) {
        setMetrics([]);
        setAlerts([]);
        setServices([]);
        setHealthScore(0);
        return;
      }

      // Only admins can see system data
      if (!hasPermission()) {
        setMetrics([]);
        setAlerts([]);
        setServices([]);
        setHealthScore(0);
        return;
      }

      const response = await systemService.getSystemData();

      const fetchedMetrics = response.data?.metrics ?? [];
      const fetchedAlerts = response.data?.alerts ?? [];
      const fetchedServices = response.data?.services ?? [];
      const fetchedStats = response.data?.stats ?? null;

      setMetrics(fetchedMetrics);
      setAlerts(fetchedAlerts);
      setServices(fetchedServices);
      setSystemStats(fetchedStats);

      // Compute health score: percentage of metrics with status === 'healthy'
      const total = fetchedMetrics.length;
      const healthy = fetchedMetrics.filter(m => m.status === 'healthy').length;
      setHealthScore(total > 0 ? Math.round((healthy / total) * 100) : 0);

    } catch (err) {
      console.error('Error loading system data:', err);
      setError('Failed to load system data');

      setMetrics([]);
      setAlerts([]);
      setServices([]);
      setSystemStats(null);
      setHealthScore(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?._id, currentUser?.role]);

  useEffect(() => {
    if (currentUser?._id) {
      loadSystemData();

      // Re-fetch every 30 seconds for real-time system monitoring
      const interval = setInterval(() => {
        loadSystemData();
      }, 30000);

      return () => clearInterval(interval);
    } else {
      setMetrics([]);
      setAlerts([]);
      setServices([]);
      setHealthScore(0);
      setIsLoading(false);
    }
  }, [currentUser?._id, currentUser?.role, sessionEpoch, loadSystemData]);

  const getHealthyMetricsFromContext = (): SystemMetric[] => {
    return metrics.filter(metric => metric.status === 'healthy');
  };

  const getWarningMetricsFromContext = (): SystemMetric[] => {
    return metrics.filter(metric => metric.status === 'warning');
  };

  const getErrorMetricsFromContext = (): SystemMetric[] => {
    return metrics.filter(metric => metric.status === 'error');
  };

  const getRecentAlertsFromContext = (hours: number = 24): SystemAlert[] => {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return alerts.filter(alert => new Date(alert.time) > cutoffTime);
  };

  const getCriticalAlertsFromContext = (): SystemAlert[] => {
    return alerts.filter(alert =>
      alert.type === 'error' || (alert.type === 'warning' && alert.severity === 'high')
    );
  };

  const refreshSystemData = async () => {
    await loadSystemData();
  };

  const value: SystemContextType = {
    metrics,
    alerts,
    services,
    systemStats,
    healthScore,
    isLoading,
    error,
    getHealthyMetricsFromContext,
    getWarningMetricsFromContext,
    getErrorMetricsFromContext,
    getRecentAlertsFromContext,
    getCriticalAlertsFromContext,
    refreshSystemData,
    hasPermission
  };

  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
}
