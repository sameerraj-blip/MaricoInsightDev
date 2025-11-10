// Vercel serverless function entry point
// This wraps the Express app for Vercel deployment
import 'dotenv/config';

// Set VERCEL env so server knows it's running on Vercel
process.env.VERCEL = '1';

// Import the app factory function
import { createApp } from '../server/index.js';

// Create app immediately (synchronous, cached by Vercel)
// @vercel/node automatically handles Express apps
const app = createApp();

// Export the Express app directly - Vercel's @vercel/node handles it
export default app;
