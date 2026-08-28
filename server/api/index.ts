// Entry point Vercel uses to run the Express app as a serverless function.
// Locally and in Docker, the app still runs the normal way via src/server.ts.
import app from "../src/app";

export default app;
