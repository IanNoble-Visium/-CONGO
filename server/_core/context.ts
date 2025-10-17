import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { Request, Response } from "express";
import type { User } from "../../drizzle/schema";

export type TrpcContext = {
  req: Request;
  res: Response;
  user: User | null;
};

// Demo user for static authentication
const DEMO_USER: User = {
  id: "demo-user-001",
  name: "Demo User",
  email: "demo@congo.cd",
  loginMethod: "demo",
  role: "admin",
  createdAt: new Date(),
  lastSignedIn: new Date(),
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // For demo purposes, always return the demo user
  // In production, this would validate session tokens
  const user = DEMO_USER;

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
