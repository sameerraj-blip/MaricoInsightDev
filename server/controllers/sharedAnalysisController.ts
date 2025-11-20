import { Request, Response } from "express";
import {
  sharedAnalysesResponseSchema,
  AnalysisSessionSummary,
} from "../../shared/schema.js";
import {
  acceptSharedAnalysisInvite,
  createSharedAnalysisInvite,
  declineSharedAnalysisInvite,
  getSharedAnalysisInviteById,
  listSharedAnalysesForOwner,
  listSharedAnalysesForUser,
  type ChatDocument,
} from "../lib/cosmosDB.js";

const getUserEmailFromRequest = (req: Request): string | undefined => {
  const headerEmail = req.headers["x-user-email"];
  if (typeof headerEmail === "string" && headerEmail.trim().length > 0) {
    return headerEmail.toLowerCase();
  }
  const queryEmail = req.query.username;
  if (typeof queryEmail === "string" && queryEmail.trim().length > 0) {
    return queryEmail.toLowerCase();
  }
  return undefined;
};

const toSessionSummary = (chatDocument: ChatDocument): AnalysisSessionSummary => ({
  id: chatDocument.id,
  fileName: chatDocument.fileName,
  uploadedAt: chatDocument.uploadedAt,
  createdAt: chatDocument.createdAt,
  lastUpdatedAt: chatDocument.lastUpdatedAt,
  collaborators: chatDocument.collaborators || [chatDocument.username],
  dataSummary: chatDocument.dataSummary,
  chartsCount: chatDocument.charts?.length || 0,
  insightsCount: chatDocument.insights?.length || 0,
  messagesCount: chatDocument.messages?.length || 0,
  blobInfo: chatDocument.blobInfo,
  analysisMetadata: chatDocument.analysisMetadata,
  sessionId: chatDocument.sessionId,
});

const sanitizeEmail = (value: string) => value.trim().toLowerCase();

export const shareAnalysisController = async (req: Request, res: Response) => {
  try {
    const ownerEmail = getUserEmailFromRequest(req);
    if (!ownerEmail) {
      return res.status(401).json({ error: "Missing authenticated user email." });
    }

    const { sessionId, targetEmail, note } = req.body || {};
    if (!sessionId || !targetEmail) {
      return res.status(400).json({ error: "sessionId and targetEmail are required." });
    }

    const invite = await createSharedAnalysisInvite({
      ownerEmail,
      targetEmail: sanitizeEmail(targetEmail),
      sourceSessionId: sessionId,
      note,
    });

    res.status(201).json({ invite });
  } catch (error) {
    console.error("shareAnalysisController error:", error);
    const message = error instanceof Error ? error.message : "Failed to share analysis.";
    const statusCode = (error as any)?.statusCode || 500;
    res.status(statusCode).json({ error: message });
  }
};

export const getIncomingSharedAnalysesController = async (req: Request, res: Response) => {
  try {
    const userEmail = getUserEmailFromRequest(req);
    if (!userEmail) {
      return res.status(401).json({ error: "Missing authenticated user email." });
    }

    const invitations = await listSharedAnalysesForUser(userEmail);
    const responsePayload = {
      pending: invitations.filter((invite) => invite.status === "pending"),
      accepted: invitations.filter((invite) => invite.status === "accepted"),
    };

    // Validate payload before sending (throws if invalid)
    sharedAnalysesResponseSchema.parse(responsePayload);
    res.json(responsePayload);
  } catch (error) {
    console.error("getIncomingSharedAnalysesController error:", error);
    const message = error instanceof Error ? error.message : "Failed to load shared analyses.";
    const statusCode = (error as any)?.statusCode || 500;
    res.status(statusCode).json({ error: message });
  }
};

export const getSentSharedAnalysesController = async (req: Request, res: Response) => {
  try {
    const userEmail = getUserEmailFromRequest(req);
    if (!userEmail) {
      return res.status(401).json({ error: "Missing authenticated user email." });
    }

    const invitations = await listSharedAnalysesForOwner(userEmail);
    res.json({ invitations });
  } catch (error) {
    console.error("getSentSharedAnalysesController error:", error);
    const message = error instanceof Error ? error.message : "Failed to load sent shared analyses.";
    const statusCode = (error as any)?.statusCode || 500;
    res.status(statusCode).json({ error: message });
  }
};

export const acceptSharedAnalysisController = async (req: Request, res: Response) => {
  try {
    const userEmail = getUserEmailFromRequest(req);
    if (!userEmail) {
      return res.status(401).json({ error: "Missing authenticated user email." });
    }

    const { inviteId } = req.params;
    if (!inviteId) {
      return res.status(400).json({ error: "inviteId is required." });
    }

    const { invite, newSession } = await acceptSharedAnalysisInvite(inviteId, userEmail);
    const summary = toSessionSummary(newSession);

    res.json({
      invite,
      acceptedSession: summary,
    });
  } catch (error) {
    console.error("acceptSharedAnalysisController error:", error);
    const message = error instanceof Error ? error.message : "Failed to accept shared analysis.";
    const statusCode = (error as any)?.statusCode || 500;
    res.status(statusCode).json({ error: message });
  }
};

export const declineSharedAnalysisController = async (req: Request, res: Response) => {
  try {
    const userEmail = getUserEmailFromRequest(req);
    if (!userEmail) {
      return res.status(401).json({ error: "Missing authenticated user email." });
    }

    const { inviteId } = req.params;
    if (!inviteId) {
      return res.status(400).json({ error: "inviteId is required." });
    }

    const invite = await declineSharedAnalysisInvite(inviteId, userEmail);
    res.json({ invite });
  } catch (error) {
    console.error("declineSharedAnalysisController error:", error);
    const message = error instanceof Error ? error.message : "Failed to decline shared analysis.";
    const statusCode = (error as any)?.statusCode || 500;
    res.status(statusCode).json({ error: message });
  }
};

export const getSharedAnalysisInviteController = async (req: Request, res: Response) => {
  try {
    const userEmail = getUserEmailFromRequest(req);
    if (!userEmail) {
      return res.status(401).json({ error: "Missing authenticated user email." });
    }

    const { inviteId } = req.params;
    if (!inviteId) {
      return res.status(400).json({ error: "inviteId is required." });
    }

    const invite = await getSharedAnalysisInviteById(inviteId, userEmail);
    if (!invite) {
      return res.status(404).json({ error: "Shared analysis invite not found." });
    }

    res.json({ invite });
  } catch (error) {
    console.error("getSharedAnalysisInviteController error:", error);
    const message = error instanceof Error ? error.message : "Failed to load shared analysis invite.";
    const statusCode = (error as any)?.statusCode || 500;
    res.status(statusCode).json({ error: message });
  }
};

