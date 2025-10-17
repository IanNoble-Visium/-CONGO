import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

// Demo user for static authentication
const DEMO_USER = {
  id: "demo-user-001",
  name: "Demo User",
  email: "demo@congo.cd",
  role: "admin" as const,
  createdAt: new Date(),
  lastSignedIn: new Date(),
  loginMethod: "demo",
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } =
    options ?? {};
  const [isLoading, setIsLoading] = useState(true);

  // Get auth state from localStorage
  const getAuthState = useCallback(() => {
    if (typeof window === "undefined") {
      return { user: null, isAuthenticated: false };
    }

    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (isAuthenticated) {
      return { user: DEMO_USER, isAuthenticated: true };
    }
    return { user: null, isAuthenticated: false };
  }, []);

  const [authState, setAuthState] = useState(() => getAuthState());

  // Initialize auth state on mount
  useEffect(() => {
    setAuthState(getAuthState());
    setIsLoading(false);
  }, [getAuthState]);

  const logout = useCallback(async () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    setAuthState({ user: null, isAuthenticated: false });
    window.location.href = "/login";
  }, []);

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (isLoading) return;
    if (authState.isAuthenticated) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, redirectPath, isLoading, authState.isAuthenticated]);

  return {
    user: authState.user,
    loading: isLoading,
    error: null,
    isAuthenticated: authState.isAuthenticated,
    refresh: () => setAuthState(getAuthState()),
    logout,
  };
}
