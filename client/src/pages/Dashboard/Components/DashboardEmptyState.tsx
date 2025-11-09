import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';

interface DashboardEmptyStateProps {
  name: string;
  onBack: () => void;
}

export const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({ name, onBack }) => {
  return (
    <div className="flex h-[calc(100vh-160px)] flex-col items-center justify-center gap-6 bg-background border border-dashed border-border rounded-2xl">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <BarChart3 className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="max-w-md text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">{name}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This dashboard is waiting for its first chart. Head back to your analyses and add visualisations using the
          “Add to dashboard” action on any chart.
        </p>
      </div>
      <Button variant="outline" onClick={onBack}>
        Back to dashboards
      </Button>
    </div>
  );
};

