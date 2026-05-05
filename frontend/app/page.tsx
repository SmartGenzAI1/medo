"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { TypeAnimation } from "framer-motion";
import { Flame, Shield, Share2, Zap } from "lucide-react";
import { Button } from "./components/ui/button";
import { FileUploader } from "./components/FileUploader";
import { signIn, useSession } from "next-auth/react";

export default function Home() {
  const [resumeText, setResumeText] = useState("");
  const [intensity, setIntensity] = useState<"mild" | "spicy">("mild");
  const { data: session } = useSession();

  const handleFileLoaded = (text: string) => {
    setResumeText(text);
  };

  const handleError = (error: string) => {
    console.error(error);
    alert(error);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              RoastMyResume
            </span>
          </h1>
          
          <div className="h-24 mb-8">
            <TypeAnimation
              sequence={[
                "Your resume is about to get destroyed (lovingly).",
                2000,
                "Brutally honest feedback that actually helps.",
                2000,
                "5,000+ roasts served and counting!",
                2000,
              ]}
              wrapper="p"
              speed={50}
              className="text-xl md:text-2xl text-muted-foreground"
              repeat={Infinity}
            />
          </div>

          {!session ? (
            <Button 
              size="lg" 
              onClick={() => signIn("google")}
              className="text-lg px-8 py-6"
            >
              Sign in with Google to Get Roasted
            </Button>
          ) : (
            <div className="max-w-2xl mx-auto">
              <FileUploader 
                onFileLoaded={handleFileLoaded}
                onError={handleError}
              />
              
              {resumeText && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <h3 className="text-xl font-semibold mb-4">Choose Your Pain Level:</h3>
                  <div className="flex gap-4 justify-center mb-6">
                    <Button
                      variant={intensity === "mild" ? "default" : "outline"}
                      onClick={() => setIntensity("mild")}
                      className="flex items-center gap-2"
                    >
                      <Flame className="h-4 w-4" />
                      Mild - Gently Roasted
                    </Button>
                    <Button
                      variant={intensity === "spicy" ? "default" : "outline"}
                      onClick={() => setIntensity("spicy")}
                      className="flex items-center gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      Spicy - Destroy Me
                    </Button>
                  </div>
                  
                  <Button size="lg" className="text-lg px-8">
                    🔥 Roast My Resume!
                  </Button>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-lg border bg-card"
          >
            <Flame className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Brutal Roasts</h3>
            <p className="text-muted-foreground">
              Hilariously savage feedback that&apos;s so wrong, it&apos;s right for your career.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-lg border bg-card"
          >
            <Shield className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Glow-Up Tips</h3>
            <p className="text-muted-foreground">
              Actionable career advice hidden behind the comedy to actually improve your resume.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-lg border bg-card"
          >
            <Share2 className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Share Everywhere</h3>
            <p className="text-muted-foreground">
              Perfectly formatted images for Instagram, Twitter, LinkedIn, and more.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-12 text-center">
        <p className="text-2xl font-display text-muted-foreground">
          🔥 5,000+ roasts served and counting!
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 RoastMyResume. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Terms of Service</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
