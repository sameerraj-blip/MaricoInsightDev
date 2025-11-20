import { useMemo } from "react";
import { AnalysisSessionSummary, SharedAnalysisInvite } from "@shared/schema";
import { useSharedAnalyses } from "@/hooks/useSharedAnalyses";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Mail, RefreshCcw, Share2, Users } from "lucide-react";

interface SharedAnalysesPanelProps {
  onAccepted?: (summary: AnalysisSessionSummary) => void;
}

const formatTimestamp = (value?: number) => {
  if (!value) return "—";
  const date = new Date(value);
  return `${date.toLocaleDateString()} · ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const PreviewStats = ({ invite }: { invite: SharedAnalysisInvite }) => {
  if (!invite.preview) return null;
  const { preview } = invite;
  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      <span>{preview.chartsCount} charts</span>
      <span>·</span>
      <span>{preview.insightsCount} insights</span>
      <span>·</span>
      <span>{preview.messagesCount} messages</span>
    </div>
  );
};

export const SharedAnalysesPanel = ({ onAccepted }: SharedAnalysesPanelProps) => {
  const {
    pending,
    accepted,
    loading,
    error,
    refresh,
    acceptInvite,
    declineInvite,
    isMutating,
    hasSharedItems,
  } = useSharedAnalyses();

  const pendingInvites = useMemo(() => pending.slice(0, 5), [pending]);
  const acceptedInvites = useMemo(() => accepted.slice(0, 5), [accepted]);

  const renderInviteCard = (invite: SharedAnalysisInvite) => (
    <div
      key={invite.id}
      className="rounded-lg border border-border p-4 flex flex-col gap-3 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{invite.preview?.fileName ?? "Shared analysis"}</p>
          <p className="text-xs text-muted-foreground">
            Shared by {invite.ownerEmail} · {formatTimestamp(invite.createdAt)}
          </p>
        </div>
        <Badge variant="secondary" className="gap-1 text-xs">
          <Mail className="h-3 w-3" />
          {invite.targetEmail}
        </Badge>
      </div>
      {invite.note && (
        <p className="text-sm text-muted-foreground italic border-l-2 border-muted pl-3">
          “{invite.note}”
        </p>
      )}
      <PreviewStats invite={invite} />
      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1"
          disabled={isMutating}
          onClick={async () => {
            const summary = await acceptInvite(invite.id);
            if (summary && onAccepted) {
              onAccepted(summary);
            }
          }}
        >
          Join workspace
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isMutating}
          onClick={() => declineInvite(invite.id)}
        >
          Decline
        </Button>
      </div>
    </div>
  );

  const renderAcceptedCard = (invite: SharedAnalysisInvite) => (
    <div
      key={`accepted-${invite.id}`}
      className="rounded-lg border border-dashed border-border p-4 bg-muted/30 text-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{invite.preview?.fileName ?? "Shared analysis"}</p>
          <p className="text-xs text-muted-foreground">
            Accepted {formatTimestamp(invite.acceptedAt)} · from {invite.ownerEmail}
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          Collaborating
        </Badge>
      </div>
    </div>
  );

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-4 w-4 text-primary" />
            Shared with you
          </CardTitle>
          <CardDescription>
            Join live collaborative analyses that teammates shared with you.
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <RefreshCcw className="h-4 w-4 mr-1" />
              Refresh
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive flex items-center justify-between">
            <span>{error}</span>
            <Button variant="destructive" size="sm" onClick={refresh}>
              Retry
            </Button>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {!loading && pendingInvites.length === 0 && !error && (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            <Users className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            {hasSharedItems
              ? "You’re all caught up. Invite cards will show here when teammates share analyses."
              : "No shared analyses yet. Ask a teammate to share an analysis with you."}
          </div>
        )}

        {pendingInvites.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Pending invites
            </p>
            {pendingInvites.map(renderInviteCard)}
          </div>
        )}

        {acceptedInvites.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Users className="h-4 w-4" />
              Recently joined workspaces
            </p>
            <div className="space-y-2">{acceptedInvites.map(renderAcceptedCard)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

