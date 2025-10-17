import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../server/routers.js";
import { createContext } from "../server/_core/context.js";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // Convert Vercel request to Fetch API request
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    const fetchRequest = new Request(url, {
      method: req.method,
      headers: new Headers(req.headers),
      body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : null,
    });

    const fetchResponse = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: fetchRequest,
      router: appRouter,
      createContext: () => createContext({ req, res }),
    });

    // Convert Fetch API response to Vercel response
    res.status(fetchResponse.status);
    fetchResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    const body = await fetchResponse.text();
    res.send(body);
  } catch (error) {
    console.error("tRPC handler error:", error);
    res.status(500).json({
      error: {
        message: error.message || "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
      },
    });
  }
}
