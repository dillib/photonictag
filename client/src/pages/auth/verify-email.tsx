import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const verifyMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Verification failed");
      }

      return response.json();
    },
    onSuccess: () => {
      setStatus("success");
    },
    onError: (error: Error) => {
      setStatus("error");
      setErrorMessage(error.message);
    },
  });

  // Verify token on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      verifyMutation.mutate(token);
    } else {
      setStatus("error");
      setErrorMessage("Invalid or missing verification token");
    }
  }, []);

  // Loading state
  if (status === "loading") {
    return (
      <AuthCard
        title="Verifying your email"
        description="Please wait while we verify your email address"
      >
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">This will only take a moment...</p>
        </div>
      </AuthCard>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <AuthCard
        title="Email verified!"
        description="Your email has been successfully verified"
      >
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-muted-foreground">
            Your account is now active. You can sign in and start using PhotonicTag.
          </p>
        </div>

        <Button
          className="w-full mt-6"
          onClick={() => setLocation("/auth/login?success=verified")}
        >
          Continue to Sign In
        </Button>
      </AuthCard>
    );
  }

  // Error state
  return (
    <AuthCard
      title="Verification failed"
      description="We couldn't verify your email address"
    >
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-muted-foreground">
          {errorMessage || "The verification link may have expired or is invalid."}
        </p>
      </div>

      <div className="space-y-3 mt-6">
        <Link href="/auth/login">
          <Button className="w-full">Go to Sign In</Button>
        </Link>
        <p className="text-sm text-center text-muted-foreground">
          Need a new verification email?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>{" "}
          and we'll send you a new link.
        </p>
      </div>
    </AuthCard>
  );
}
