import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardSectionNavProps {
  sections: Array<{ id: string; title: string; count: number }>;
  activeSectionId: string;
  onSelect: (sectionId: string) => void;
}

export const DashboardSectionNav: React.FC<DashboardSectionNavProps> = ({
  sections,
  activeSectionId,
  onSelect,
}) => {
  return (
    <nav className="hidden lg:block w-52 shrink-0">
      <div className="sticky top-20 space-y-1">
        {sections.map((section) => {
          const isActive = section.id === activeSectionId;
          return (
            <button
              key={section.id}
              onClick={() => onSelect(section.id)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-md transition-colors text-sm',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-muted text-muted-foreground'
              )}
            >
              <div className="flex items-center justify-between">
                <span>{section.title}</span>
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-background border px-1 text-[11px] text-muted-foreground">
                  {section.count}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

