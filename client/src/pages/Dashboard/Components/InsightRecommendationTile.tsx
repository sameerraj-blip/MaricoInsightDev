import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit2 } from 'lucide-react';

interface InsightRecommendationTileProps {
  variant: 'insight' | 'recommendation';
  text: string;
  onEdit?: () => void;
}

export function InsightRecommendationTile({ variant, text, onEdit }: InsightRecommendationTileProps) {
  const isInsight = variant === 'insight';
  const containerClasses = isInsight
    ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
    : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
  const titleClasses = isInsight
    ? 'text-blue-900 dark:text-blue-100'
    : 'text-green-900 dark:text-green-100';
  const textClasses = isInsight
    ? 'text-blue-800 dark:text-blue-200'
    : 'text-green-800 dark:text-green-200';
  const iconClasses = isInsight
    ? 'text-blue-600 hover:text-blue-800'
    : 'text-green-600 hover:text-green-800';

  return (
    <div className={`h-full flex flex-col p-4 rounded-md border ${containerClasses} overflow-hidden relative`}>
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className={`text-sm font-semibold ${titleClasses}`}>{isInsight ? 'Key Insight' : 'Suggestion'}</h3>
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className={`h-6 w-6 ${iconClasses}`}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            aria-label={`Edit ${isInsight ? 'insight' : 'suggestion'}`}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <p className={`text-sm leading-relaxed ${textClasses}`}>{text}</p>
      </div>
    </div>
  );
}


