import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from "~/const";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "./index.css";

// Set favicon and title from environment variables
const appLogo = import.meta.env.VITE_APP_LOGO || "/images/logo.jpg";
const appTitle = import.meta.env.VITE_APP_TITLE || "CongoAddressMapper";

// Update favicon
const favicon = document.getElementById("favicon") as HTMLLinkElement;
if (favicon) {
  favicon.href = appLogo;
}

const appleTouchIcon = document.getElementById("apple-touch-icon") as HTMLLinkElement;
if (appleTouchIcon) {
  appleTouchIcon.href = appLogo;
}

// Update page title
const pageTitle = document.getElementById("page-title");
if (pageTitle) {
  pageTitle.textContent = appTitle;
}
document.title = appTitle;

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = "/login";
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
