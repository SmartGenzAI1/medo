"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Share2, Lock, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { SocialShareModal } from "./SocialShareModal";
import { cn } from "@/lib/utils";

interface RoastResultProps {
  roast: string;
  glow_up: string;
  ats_rewrite?: string;
  intensity: "mild" | "spicy";
  isPro: boolean;
  resumeText: string;
}

export function RoastResult({
  roast,
  glow_up,
  ats_rewrite,
  intensity,
  isPro,
  resumeText,
}: RoastResultProps) {
  const [activeTab, setActiveTab] = useState("roast");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    let textToCopy = `🔥 RoastMyResume - ${intensity === "spicy" ? "Spicy" : "Mild"} Roast\n\n`;
    
    if (activeTab === "roast") {
      textToCopy += roast;
    } else if (activeTab === "glow-up") {
      textToCopy += glow_up;
    } else {
      textToCopy += ats_rewrite || "";
    }

    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="grill-mark-border bg-card/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-3xl flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Your Resume Roast
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Share Your Roast</DialogTitle>
                  </DialogHeader>
                  <SocialShareModal
                    roast={roast}
                    glow_up={glow_up}
                    ats_rewrite={ats_rewrite}
                    intensity={intensity}
                    isPro={isPro}
                    resumeText={resumeText}
                    onClose={() => setShareModalOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="roast">The Roast 🔥</TabsTrigger>
              <TabsTrigger value="glow-up">Glow-Up Tips ✨</TabsTrigger>
              <TabsTrigger value="ats" disabled={!isPro && !ats_rewrite}>
                {isPro ? "ATS Rewrite 📄" : "ATS Rewrite 🔒"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roast" className="mt-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="prose prose-invert max-w-none">
                  <p className="font-display text-lg leading-relaxed whitespace-pre-wrap">
                    {roast}
                  </p>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="glow-up" className="mt-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="prose prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{glow_up}</p>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="ats" className="mt-6">
              {!isPro ? (
                <div className="text-center py-12">
                  <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">
                    Upgrade to Pro for ATS Rewrites
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Get AI-powered bullet point rewrites optimized for Applicant Tracking Systems
                  </p>
                  <Button>Upgrade to Pro</Button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="prose prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{ats_rewrite}</p>
                  </div>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
