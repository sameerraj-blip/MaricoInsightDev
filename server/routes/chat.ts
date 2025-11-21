import { Router } from "express";
import { chatWithAI, chatWithAIStream, streamChatMessagesController } from "../controllers/chatController.js";

const router = Router();

// Chat endpoint
router.post('/chat', chatWithAI);

// Streaming chat endpoint (SSE)
router.post('/chat/stream', chatWithAIStream);

// Real-time chat messages streaming endpoint (SSE)
router.get('/chat/:sessionId/stream', streamChatMessagesController);

export default router;
