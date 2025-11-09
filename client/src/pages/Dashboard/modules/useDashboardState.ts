import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChartSpec, Dashboard as ServerDashboard } from '@shared/schema';
import { dashboardsApi } from '@/lib/api';

export interface DashboardData {
  id: string;
  name: string;
  charts: ChartSpec[];
  createdAt: Date;
  updatedAt: Date;
}

const normalizeDashboard = (dashboard: ServerDashboard): DashboardData => ({
  id: dashboard.id,
  name: dashboard.name,
  charts: dashboard.charts || [],
  createdAt: new Date(dashboard.createdAt),
  updatedAt: new Date(dashboard.updatedAt),
});

export const useDashboardState = () => {
  const queryClient = useQueryClient();
  const [currentDashboard, setCurrentDashboard] = useState<DashboardData | null>(null);

  const {
    data: dashboards = [],
    isFetching,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ['dashboards', 'list'],
    queryFn: async () => {
      const res = await dashboardsApi.list();
      return res.dashboards.map(normalizeDashboard);
    },
    staleTime: 1000 * 60 * 5,
  });

  const createDashboardMutation = useMutation({
    mutationFn: async (name: string) => {
      const created = await dashboardsApi.create(name);
      return normalizeDashboard(created);
    },
    onSuccess: (createdDashboard) => {
      queryClient.setQueryData<DashboardData[]>(['dashboards', 'list'], (prev) => {
        const existing = prev ?? [];
        return [...existing, createdDashboard];
      });
      setCurrentDashboard(createdDashboard);
    },
  });

  const addChartMutation = useMutation({
    mutationFn: async ({ dashboardId, chart }: { dashboardId: string; chart: ChartSpec }) => {
      const updated = await dashboardsApi.addChart(dashboardId, chart);
      return normalizeDashboard(updated);
    },
    onSuccess: (updatedDashboard) => {
      queryClient.setQueryData<DashboardData[]>(['dashboards', 'list'], (prev) => {
        if (!prev) return [updatedDashboard];
        return prev.map((dashboard) => (dashboard.id === updatedDashboard.id ? updatedDashboard : dashboard));
      });
      setCurrentDashboard((prev) => (prev?.id === updatedDashboard.id ? updatedDashboard : prev));
    },
  });

  const removeChartMutation = useMutation({
    mutationFn: async ({ dashboardId, chartIndex }: { dashboardId: string; chartIndex: number }) => {
      const updated = await dashboardsApi.removeChart(dashboardId, { index: chartIndex });
      return normalizeDashboard(updated);
    },
    onSuccess: (updatedDashboard) => {
      queryClient.setQueryData<DashboardData[]>(['dashboards', 'list'], (prev) => {
        if (!prev) return [updatedDashboard];
        return prev.map((dashboard) => (dashboard.id === updatedDashboard.id ? updatedDashboard : dashboard));
      });
      setCurrentDashboard((prev) => (prev?.id === updatedDashboard.id ? updatedDashboard : prev));
    },
  });

  const deleteDashboardMutation = useMutation({
    mutationFn: async (dashboardId: string) => {
      await dashboardsApi.remove(dashboardId);
      return dashboardId;
    },
    onSuccess: (dashboardId) => {
      queryClient.setQueryData<DashboardData[]>(['dashboards', 'list'], (prev) =>
        (prev ?? []).filter((dashboard) => dashboard.id !== dashboardId)
      );
      setCurrentDashboard((prev) => (prev?.id === dashboardId ? null : prev));
    },
  });

  const getDashboardById = useCallback(
    (dashboardId: string): DashboardData | undefined => dashboards.find((dashboard) => dashboard.id === dashboardId),
    [dashboards]
  );

  const createDashboard = useCallback((name: string) => createDashboardMutation.mutateAsync(name), [
    createDashboardMutation,
  ]);

  const addChartToDashboard = useCallback(
    (dashboardId: string, chart: ChartSpec) => addChartMutation.mutateAsync({ dashboardId, chart }),
    [addChartMutation]
  );

  const removeChartFromDashboard = useCallback(
    (dashboardId: string, chartIndex: number) =>
      removeChartMutation.mutateAsync({ dashboardId, chartIndex }),
    [removeChartMutation]
  );

  const deleteDashboard = useCallback(
    async (dashboardId: string) => {
      await deleteDashboardMutation.mutateAsync(dashboardId);
    },
    [deleteDashboardMutation]
  );

  const status = useMemo(
    () => ({
      isLoading,
      isFetching,
      error,
      refreshing: isFetching && !isLoading,
    }),
    [error, isFetching, isLoading]
  );

  return {
    dashboards,
    currentDashboard,
    setCurrentDashboard,
    createDashboard,
    addChartToDashboard,
    removeChartFromDashboard,
    deleteDashboard,
    getDashboardById,
    status,
    refetch,
  };
};
