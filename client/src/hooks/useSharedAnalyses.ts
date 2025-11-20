import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnalysisSessionSummary,
  SharedAnalysesResponse,
  SharedAnalysisInvite,
} from "@shared/schema";
import { sharedAnalysesApi } from "@/api/sharedAnalyses";
import { useToast } from "@/hooks/use-toast";

interface SharedAnalysesHookState {
  pending: SharedAnalysisInvite[];
  accepted: SharedAnalysisInvite[];
  loading: boolean;
  error: string | null;
}

const initialState: SharedAnalysesHookState = {
  pending: [],
  accepted: [],
  loading: true,
  error: null,
};

export const useSharedAnalyses = () => {
  const [{ pending, accepted, loading, error }, setState] =
    useState<SharedAnalysesHookState>(initialState);
  const [isMutating, setIsMutating] = useState(false);
  const { toast } = useToast();

  const loadSharedAnalyses = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await sharedAnalysesApi.getIncoming();
      setState({
        pending: response.pending,
        accepted: response.accepted,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error("Failed to load shared analyses:", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Unable to fetch shared analyses.",
      }));
    }
  }, []);

  useEffect(() => {
    loadSharedAnalyses();
  }, [loadSharedAnalyses]);

  const acceptInvite = useCallback(
    async (inviteId: string): Promise<AnalysisSessionSummary | null> => {
      setIsMutating(true);
      try {
        const { invite, acceptedSession } = await sharedAnalysesApi.accept(inviteId);
        setState((prev) => ({
          ...prev,
          pending: prev.pending.filter((item) => item.id !== inviteId),
          accepted: [invite, ...prev.accepted.filter((item) => item.id !== inviteId)],
        }));
        toast({
          title: "Joined analysis workspace",
          description: "You're now collaborating on the original analysis.",
        });
        return acceptedSession;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to accept shared analysis.";
        toast({
          title: "Failed to accept analysis",
          description: message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [toast]
  );

  const declineInvite = useCallback(
    async (inviteId: string) => {
      setIsMutating(true);
      try {
        await sharedAnalysesApi.decline(inviteId);
        setState((prev) => ({
          ...prev,
          pending: prev.pending.filter((item) => item.id !== inviteId),
        }));
        toast({
          title: "Invite declined",
          description: "The shared analysis invite has been removed.",
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to decline shared analysis.";
        toast({
          title: "Failed to decline",
          description: message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [toast]
  );

  const shareAnalysis = useCallback(
    async (payload: { sessionId: string; targetEmail: string; note?: string }) => {
      setIsMutating(true);
      try {
        const result = await sharedAnalysesApi.share(payload);
        toast({
          title: "Analysis shared",
          description: `Invite sent to ${payload.targetEmail}.`,
        });
        return result.invite;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to share this analysis.";
        toast({
          title: "Share failed",
          description: message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [toast]
  );

  return {
    pending,
    accepted,
    loading,
    error,
    isMutating,
    refresh: loadSharedAnalyses,
    acceptInvite,
    declineInvite,
    shareAnalysis,
    hasSharedItems: useMemo(() => pending.length + accepted.length > 0, [pending, accepted]),
  };
};

