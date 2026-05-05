"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SocialShareModal } from "./SocialShareModal";

interface RoastResultProps {
  roast: string;
  glow_up: string;
  ats_rewrite?: string;
  intensity: string;
  tier: "free" | "pro";
  onResumeText?: string;
}

export function RoastResult({ roast, glow_up, ats_rewrite, intensity, tier, onResumeText }: RoastResultProps) {
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(roast);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl mx-auto"
      >
        <Card className="grill-mark-border glass-card overflow-hidden">
          <CardContent className="p-0">
            <Tabs defaultValue="roast" className="w-full">
              <div className="bg-muted/30 p-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="roast">🔥 The Roast</TabsTrigger>
                  <TabsTrigger value="glowup">✨ Glow-Up</TabsTrigger>
                  <TabsTrigger value="ats" disabled={tier === "free"}>
                    📝 ATS Rewrite {tier === "free" && "🔒"}
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="roast" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="font-serif text-lg leading-relaxed">
                      {roast.split("\n").map((paragraph, i) => (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className="mb-4"
                        >
                          {paragraph}
                        </motion.p>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 pt-4 border-t border-muted">
                      <Button onClick={handleCopy} variant="outline" size="sm">
                        {copied ? "✓ Copied!" : "📋 Copy Roast"}
                      </Button>
                      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                        <DialogTrigger asChild>
                          <Button variant="default" size="sm">
                            🚀 Share
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Share Your Roast</DialogTitle>
                          </DialogHeader>
                          <SocialShareModal
                            roast={roast}
                            tier={tier}
                            onResumeText={onResumeText}
                            onClose={() => setShareOpen(false)}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="glowup" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-semibold mb-4">💎 Your Glow-Up Tips</h3>
                    <div className="font-sans text-base leading-relaxed">
                      {glow_up.split("\n").map((tip, i) => (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className="mb-3"
                        >
                          {tip}
                        </motion.p>
                      ))}
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="ats" className="mt-0">
                  {tier === "pro" && ats_rewrite ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-semibold mb-4">📊 ATS-Optimized Rewrite</h3>
                      <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                        <pre className="whitespace-pre-wrap font-sans text-sm">
                          {ats_rewrite}
                        </pre>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🔒</div>
                      <h3 className="text-xl font-semibold mb-2">Upgrade to Pro</h3>
                      <p className="text-muted-foreground mb-4">
                        Get ATS-optimized rewrites and unlimited roasts
                      </p>
                      <Button>Upgrade Now</Button>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
