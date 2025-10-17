import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers.js";
import { createContext } from "../server/_core/context.js";
import express from "express";

const app = express();

// Configure body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// tRPC middleware
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Export as Vercel serverless function
export default app;
