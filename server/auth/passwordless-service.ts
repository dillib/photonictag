import { PasswordlessClient } from "@passwordlessdev/passwordless-nodejs";

// Initialize Passwordless client
const passwordlessClient = new PasswordlessClient(
  process.env.PASSWORDLESS_SECRET_KEY!,
  { baseUrl: process.env.PASSWORDLESS_API_URL || "https://v4.passwordless.dev" }
);

export interface PasswordlessRegistration {
  token: string;
  userId: string;
  alias?: string;
}

export interface PasswordlessVerification {
  token: string;
}

export class PasswordlessService {
  /**
   * Generate registration token for new user
   */
  async generateRegistrationToken(userId: string, alias?: string): Promise<string> {
    try {
      const result = await passwordlessClient.createRegisterToken({
        userId,
        username: alias || userId,
        aliases: alias ? [alias] : undefined,
        discoverable: true,
      } as any);
      return result.token;
    } catch (error) {
      console.error("Passwordless registration token error:", error);
      throw new Error("Failed to generate registration token");
    }
  }

  /**
   * Verify authentication token
   */
  async verifyToken(token: string): Promise<{ userId: string; success: boolean }> {
    try {
      const result = await passwordlessClient.verifyToken(token);
      if (!result) {
        return { userId: "", success: false };
      }
      return {
        userId: result.userId,
        success: result.success,
      };
    } catch (error) {
      console.error("Passwordless verification error:", error);
      throw new Error("Failed to verify authentication token");
    }
  }

  /**
   * Delete credential for user
   */
  async deleteCredential(credentialId: string): Promise<void> {
    try {
      await passwordlessClient.deleteCredential(Buffer.from(credentialId, 'base64'));
    } catch (error) {
      console.error("Passwordless delete credential error:", error);
      throw new Error("Failed to delete credential");
    }
  }

  /**
   * List credentials for user
   */
  async listCredentials(userId: string): Promise<any[]> {
    try {
      const credentials = await passwordlessClient.listCredentials(userId);
      return credentials;
    } catch (error) {
      console.error("Passwordless list credentials error:", error);
      throw new Error("Failed to list credentials");
    }
  }
}

export const passwordlessService = new PasswordlessService();
