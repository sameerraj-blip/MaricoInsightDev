import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface DashboardFiltersProps {
  isLoading: boolean;
  onReset?: () => void | Promise<any>;
  appliedFilters?: string[];
  hasActiveFilters?: boolean;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  isLoading,
  onReset,
  appliedFilters = [],
  hasActiveFilters = false,
}) => {
  const visibleFilters = hasActiveFilters ? appliedFilters.slice(0, 4) : [];
  const remainingCount =
    hasActiveFilters && appliedFilters.length > visibleFilters.length
      ? appliedFilters.length - visibleFilters.length
      : 0;

  const handleReset = async () => {
    if (!onReset) return;
    await onReset();
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Filters</span>
        <Separator orientation="vertical" className="h-4" />
        <span>{hasActiveFilters ? `${appliedFilters.length} active` : 'All data'}</span>
      </div>
      <div className="flex flex-1 flex-wrap gap-2">
        {hasActiveFilters ? (
          <>
            {visibleFilters.map((filter, idx) => (
              <span
                key={`${filter}-${idx}`}
                className="inline-flex items-center rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-foreground"
              >
                {filter}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="inline-flex items-center rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground">
                +{remainingCount} more
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-muted-foreground">No filters applied</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isLoading && (
          <span className="text-xs font-medium uppercase tracking-wide text-primary">Updating…</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={isLoading || !hasActiveFilters}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

