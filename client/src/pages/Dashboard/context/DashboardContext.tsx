import React, { createContext, useContext, ReactNode } from 'react';
import { useDashboardState, DashboardData } from '../modules/useDashboardState';

interface DashboardContextType {
  dashboards: DashboardData[];
  currentDashboard: DashboardData | null;
  setCurrentDashboard: (dashboard: DashboardData | null) => void;
  createDashboard: (name: string) => Promise<DashboardData>;
  addChartToDashboard: (dashboardId: string, chart: any) => Promise<DashboardData>;
  removeChartFromDashboard: (dashboardId: string, chartIndex: number) => Promise<DashboardData>;
  deleteDashboard: (dashboardId: string) => Promise<void>;
  getDashboardById: (dashboardId: string) => DashboardData | undefined;
  status: {
    isLoading: boolean;
    isFetching: boolean;
    error: unknown;
    refreshing: boolean;
  };
  refetch: () => Promise<any>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const dashboardState = useDashboardState();

  return (
    <DashboardContext.Provider value={dashboardState}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
}
