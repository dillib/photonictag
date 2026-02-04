import { useState, useEffect } from "react";
import { Client } from "@passwordlessdev/passwordless-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Fingerprint, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PasswordlessLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PasswordlessLogin({ onSuccess, onError }: PasswordlessLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      setIsSupported(false);
    }
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // Initialize Passwordless client
      const client = new Client({
        apiUrl: import.meta.env.VITE_PASSWORDLESS_API_URL || "https://v4.passwordless.dev",
        apiKey: import.meta.env.VITE_PASSWORDLESS_PUBLIC_KEY || "",
      });

      // Start sign-in process
      const token = await client.signinWithDiscoverable();

      if (!token) {
        throw new Error("Authentication cancelled");
      }

      // Verify token with backend
      const response = await fetch("/api/auth/passwordless/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Authentication successful",
          description: "Welcome back!",
        });
        onSuccess?.();
      } else {
        throw new Error(data.message || "Authentication failed");
      }
    } catch (error: any) {
      console.error("Passwordless login error:", error);
      const errorMessage = error.message || "Authentication failed";
      toast({
        title: "Authentication failed",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Passwordless Login
          </CardTitle>
          <CardDescription>
            Your browser doesn't support WebAuthn. Please use email/password login instead.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          Passwordless Login
        </CardTitle>
        <CardDescription>
          Sign in securely with your fingerprint, face recognition, or security key.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <Shield className="h-5 w-5 text-green-500" />
          <div className="text-sm">
            <p className="font-medium">Secure & Private</p>
            <p className="text-muted-foreground">Your biometric data never leaves your device</p>
          </div>
        </div>

        <Button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              <Fingerprint className="mr-2 h-4 w-4" />
              Sign in with Passkey
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Works with Touch ID, Face ID, Windows Hello, and security keys
        </p>
      </CardContent>
    </Card>
  );
}

interface PasswordlessRegisterProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PasswordlessRegister({ onSuccess, onError }: PasswordlessRegisterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const { toast } = useToast();

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      // Get registration token from backend
      const tokenResponse = await fetch("/api/auth/passwordless/register-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const tokenData = await tokenResponse.json();

      if (!tokenData.success) {
        throw new Error(tokenData.message || "Failed to get registration token");
      }

      // Initialize Passwordless client
      const client = new Client({
        apiUrl: tokenData.apiUrl,
        apiKey: tokenData.publicKey,
      });

      // Start registration process
      await client.register(tokenData.token);

      setIsRegistered(true);
      toast({
        title: "Registration successful",
        description: "You can now sign in with your passkey!",
      });
      onSuccess?.();
    } catch (error: any) {
      console.error("Passwordless registration error:", error);
      const errorMessage = error.message || "Registration failed";
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Passkey Registered
          </CardTitle>
          <CardDescription>
            Your passkey has been set up successfully. You can now use it to sign in.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          Set Up Passkey
        </CardTitle>
        <CardDescription>
          Create a secure passkey for passwordless authentication. Works with your device's biometric authentication.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <Shield className="h-5 w-5 text-blue-500" />
          <div className="text-sm">
            <p className="font-medium">Enhanced Security</p>
            <p className="text-muted-foreground">Passkeys are phishing-resistant and more secure than passwords</p>
          </div>
        </div>

        <Button
          onClick={handleRegister}
          disabled={isLoading}
          className="w-full"
          size="lg"
          variant="outline"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              <Fingerprint className="mr-2 h-4 w-4" />
              Create Passkey
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          You'll use your device's biometric authentication (Touch ID, Face ID, etc.)
        </p>
      </CardContent>
    </Card>
  );
}
