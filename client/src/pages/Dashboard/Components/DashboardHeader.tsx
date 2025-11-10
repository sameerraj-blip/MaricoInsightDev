import React from 'react';
import { ArrowLeft, BarChart3, Calendar, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  name: string;
  createdAt: Date;
  chartCount: number;
  isExporting: boolean;
  onBack: () => void;
  onExport: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  name,
  createdAt,
  chartCount,
  isExporting,
  onBack,
  onExport,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to dashboards">
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <div className="flex-1 min-w-[200px]">
        <h1 className="text-2xl font-semibold text-foreground">{name}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Created {createdAt.toLocaleDateString()}
          </span>
          <span className="inline-flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            {chartCount} chart{chartCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <Button onClick={onExport} className="ml-auto" disabled={isExporting}>
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Exporting…
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Export PPT
          </>
        )}
      </Button>
    </div>
  );
};

