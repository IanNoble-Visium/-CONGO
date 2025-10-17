import type { User } from "../../drizzle/schema";

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

class SDKServer {
  /**
   * Get the demo user
   * @example
   * const user = await sdk.getUser();
   */
  async getUser(): Promise<User> {
    return DEMO_USER;
  }


}

export const sdk = new SDKServer();
