import { Router } from "express";
import {
  acceptSharedAnalysisController,
  declineSharedAnalysisController,
  getIncomingSharedAnalysesController,
  getSentSharedAnalysesController,
  getSharedAnalysisInviteController,
  shareAnalysisController,
} from "../controllers/sharedAnalysisController.js";

const router = Router();

router.post("/shared-analyses", shareAnalysisController);
router.get("/shared-analyses/incoming", getIncomingSharedAnalysesController);
router.get("/shared-analyses/sent", getSentSharedAnalysesController);
router.get("/shared-analyses/:inviteId", getSharedAnalysisInviteController);
router.post("/shared-analyses/:inviteId/accept", acceptSharedAnalysisController);
router.post("/shared-analyses/:inviteId/decline", declineSharedAnalysisController);

export default router;

