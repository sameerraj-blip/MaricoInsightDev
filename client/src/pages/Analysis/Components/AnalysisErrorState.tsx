import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalysisErrorStateProps {
  onRetry: () => void;
}

/**
 * Error state component for the Analysis page
 * Displays when there's an error loading sessions
 */
export const AnalysisErrorState = ({ onRetry }: AnalysisErrorStateProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-600 mb-4">
          <FileText className="h-12 w-12 mx-auto mb-2" />
          <h2 className="text-xl font-semibold">Failed to load sessions</h2>
          <p className="text-gray-600 mt-2">There was an error loading your analysis history.</p>
        </div>
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      </div>
    </div>
  );
};

