"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/FileUploader";
import { RoastResult } from "@/components/RoastResult";

export default function Dashboard() {
  const { data: session, status, update } = useSession();
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [intensity, setIntensity] = useState<"mild" | "spicy">("mild");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roastResult, setRoastResult] = useState<{
    roast: string;
    glow_up: string;
    ats_rewrite?: string;
    intensity: string;
  } | null>(null);

  const userTier = (session?.user as any)?.tier || "free";

  const handleFileLoaded = (text: string, name: string) => {
    setResumeText(text);
    setFileName(name);
    setError(null);
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
  };

  const handleSubmit = async () => {
    if (!resumeText) return;
    if (!session) {
      signIn("google");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: resumeText,
          intensity,
          user_id: session.user?.id,
          tier: userTier,
        }),
      });

      if (response.status === 429) {
        setError("🚫 You've reached your daily free limit! Come back tomorrow or upgrade to Pro.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to generate roast");
      }

      const data = await response.json();
      setRoastResult(data);
      
      // Refresh session to update usage count
      await update();
    } catch (err) {
      console.error("Roast error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!session) {
      signIn("google");
      return;
    }

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user?.id,
          email: session.user?.email,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Upgrade error:", err);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-muted py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <h1 className="text-xl font-bold">RoastMyResume</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <div className="text-sm">
                  <span className="text-muted-foreground">Plan:</span>{" "}
                  <span className={userTier === "pro" ? "text-primary font-semibold" : ""}>
                    {userTier === "pro" ? "⭐ Pro" : "Free"}
                  </span>
                </div>
                {userTier === "free" && (
                  <Button onClick={handleUpgrade} size="sm" variant="default">
                    Upgrade to Pro
                  </Button>
                )}
                <Button onClick={() => signOut()} variant="ghost" size="sm">
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={() => signIn("google")} size="sm">
                Sign In with Google
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {!roastResult ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Upload Your Resume</h2>
              <p className="text-muted-foreground">
                Get brutally roasted (lovingly) by our AI comedian
              </p>
            </div>

            <FileUploader onFileLoaded={handleFileLoaded} onError={handleError} />

            {/* Intensity Selector */}
            {resumeText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <p className="text-sm font-medium mb-3">Choose roast intensity:</p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant={intensity === "mild" ? "default" : "outline"}
                      onClick={() => setIntensity("mild")}
                    >
                      🌶️ Mild - Gently roasted
                    </Button>
                    <Button
                      variant={intensity === "spicy" ? "default" : "outline"}
                      onClick={() => setIntensity("spicy")}
                    >
                      🔥 Spicy - Destroy me
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading || !session}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Roasting...
                    </span>
                  ) : !session ? (
                    "Sign in to Get Roasted"
                  ) : (
                    "🔥 Roast My Resume!"
                  )}
                </Button>

                {!session && (
                  <p className="text-center text-sm text-muted-foreground">
                    Sign in with Google to continue
                  </p>
                )}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg text-center"
              >
                {error}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <RoastResult
            roast={roastResult.roast}
            glow_up={roastResult.glow_up}
            ats_rewrite={roastResult.ats_rewrite}
            intensity={roastResult.intensity}
            tier={userTier}
            onResumeText={resumeText}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-muted py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 RoastMyResume. All rights reserved.</p>
          <p className="mt-2">
            <a href="#" className="hover:text-foreground">Terms</a> ·{" "}
            <a href="#" className="hover:text-foreground">Privacy</a> ·{" "}
            <a href="#" className="hover:text-foreground">Contact</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
