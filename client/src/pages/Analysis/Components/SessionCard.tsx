import { Calendar, FileText, MessageSquare, BarChart3, Loader2, Trash2, Edit2, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Session } from '../types';
import { formatDate, formatFileName } from '../utils/formatting';

interface SessionCardProps {
  session: Session;
  isLoading: boolean;
  onSessionClick: (session: Session) => void;
  onEditClick: (e: React.MouseEvent, session: Session) => void;
  onDeleteClick: (e: React.MouseEvent, session: Session) => void;
  onShareClick: (e: React.MouseEvent, session: Session) => void;
}

/**
 * Card component for displaying a single analysis session
 * Shows session metadata and action buttons
 */
export const SessionCard = ({
  session,
  isLoading,
  onSessionClick,
  onEditClick,
  onDeleteClick,
  onShareClick,
}: SessionCardProps) => {
  return (
    <Card
      className={cn(
        'hover:shadow-md transition-shadow border-gray-200 relative',
        isLoading ? 'cursor-wait opacity-75' : 'cursor-pointer'
      )}
      onClick={() => !isLoading && onSessionClick(session)}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600 font-medium">Loading analysis...</p>
          </div>
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-gray-900">
                {formatFileName(session.fileName)}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {session.id.split('_')[0]}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Last analysis {formatDate(session.lastUpdatedAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{session.messageCount} messages</span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span>{session.chartCount} charts</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right text-sm text-gray-500">
              <div>{new Date(session.lastUpdatedAt).toLocaleDateString()}</div>
              <div className="text-xs">
                {new Date(session.lastUpdatedAt).toLocaleTimeString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => onShareClick(e, session)}
                disabled={isLoading}
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                title="Share analysis"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => onEditClick(e, session)}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                title="Edit analysis name"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => onDeleteClick(e, session)}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                title="Delete analysis"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

