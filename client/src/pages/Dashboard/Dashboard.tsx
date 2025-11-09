import React, { useState } from 'react';
import { useDashboardContext } from './context/DashboardContext';
import { DashboardData } from './modules/useDashboardState';
import { DashboardList } from './Components/DashboardList';
import { DashboardView } from './Components/DashboardView';

export default function Dashboard() {
  const { 
    dashboards, 
    currentDashboard, 
    setCurrentDashboard, 
    deleteDashboard,
    removeChartFromDashboard,
    status,
    refetch,
  } = useDashboardContext();

  const handleViewDashboard = (dashboard: DashboardData) => {
    setCurrentDashboard(dashboard);
  };

  const handleBackToList = () => {
    setCurrentDashboard(null);
  };

  const handleDeleteDashboard = async (dashboardId: string) => {
    if (confirm('Are you sure you want to delete this dashboard? This action cannot be undone.')) {
      await deleteDashboard(dashboardId);
    }
  };

  const handleDeleteChart = async (chartIndex: number) => {
    console.log('Delete chart clicked:', { chartIndex, currentDashboard: currentDashboard?.id });
    if (currentDashboard && confirm('Are you sure you want to remove this chart from the dashboard?')) {
      console.log('Proceeding with chart deletion');
      const updatedDashboard = await removeChartFromDashboard(currentDashboard.id, chartIndex);
      setCurrentDashboard(updatedDashboard);
      await refetch();
    } else {
      console.log('Chart deletion cancelled or no current dashboard');
    }
  };

  if (currentDashboard) {
    return (
      <DashboardView
        dashboard={currentDashboard}
        onBack={handleBackToList}
        onDeleteChart={handleDeleteChart}
        isRefreshing={status.refreshing}
        onRefresh={refetch}
      />
    );
  }

  return (
    <DashboardList
      dashboards={dashboards}
      isLoading={status.isLoading}
      isRefreshing={status.refreshing}
      onViewDashboard={handleViewDashboard}
      onDeleteDashboard={handleDeleteDashboard}
    />
  );
}