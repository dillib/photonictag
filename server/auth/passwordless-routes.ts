import { Router, Request, Response } from "express";
import { passwordlessService } from "./passwordless-service";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import type { User } from "@shared/schema";

const router = Router();

/**
 * POST /auth/passwordless/register-token
 * Generate a registration token for passwordless setup
 */
router.post("/register-token", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const userId = user.id;
    const { alias } = req.body;

    const token = await passwordlessService.generateRegistrationToken(userId, alias);
    
    res.json({
      success: true,
      token,
      apiUrl: process.env.PASSWORDLESS_API_URL || "https://v4.passwordless.dev",
      publicKey: process.env.PASSWORDLESS_PUBLIC_KEY,
    });
  } catch (error) {
    console.error("Passwordless register token error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate registration token",
    });
  }
});

/**
 * POST /auth/passwordless/verify
 * Verify passwordless authentication token
 */
router.post("/verify", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const result = await passwordlessService.verifyToken(token);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Find user by ID
    const userId = result.userId;
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create session
    (req.session as any).userId = user.id;
    (req.session as any).email = user.email;

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        // company: user.company, // Not in schema currently
        // role: user.role, // Not in schema currently
      },
    });
  } catch (error) {
    console.error("Passwordless verify error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
});

/**
 * GET /auth/passwordless/credentials
 * List user's registered credentials
 */
router.get("/credentials", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const userId = user.id;
    const credentials = await passwordlessService.listCredentials(userId);
    
    res.json({
      success: true,
      credentials,
    });
  } catch (error) {
    console.error("Passwordless list credentials error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to list credentials",
    });
  }
});

/**
 * DELETE /auth/passwordless/credentials/:id
 * Delete a credential
 */
router.delete("/credentials/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await passwordlessService.deleteCredential(id);
    
    res.json({
      success: true,
      message: "Credential deleted successfully",
    });
  } catch (error) {
    console.error("Passwordless delete credential error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete credential",
    });
  }
});

export default router;
