"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toPng } from "html-to-image";
import { motion } from "framer-motion";

interface SocialShareModalProps {
  roast: string;
  tier: "free" | "pro";
  onResumeText?: string;
  onClose: () => void;
}

const platforms = [
  { name: "Instagram", width: 1080, height: 1080, icon: "📸" },
  { name: "Twitter/X", width: 1200, height: 675, icon: "🐦" },
  { name: "Threads", width: 1080, height: 1080, icon: "🧵" },
  { name: "Reddit", width: 1200, height: 630, icon: "👽" },
  { name: "LinkedIn", width: 1200, height: 627, icon: "💼" },
];

export function SocialShareModal({ roast, tier, onResumeText, onClose }: SocialShareModalProps) {
  const [generating, setGenerating] = useState<string | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const generateImage = async (platform: typeof platforms[0]) => {
    setGenerating(platform.name);
    
    if (!imageRef.current) return;

    try {
      const dataUrl = await toPng(imageRef.current, {
        width: platform.width,
        height: platform.height,
        style: {
          width: `${platform.width}px`,
          height: `${platform.height}px`,
        },
      });

      const link = document.createElement("a");
      link.download = `roast-my-resume-${platform.name.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Image generation failed:", error);
    } finally {
      setGenerating(null);
    }
  };

  const firstTwoSentences = roast.split(/[.!?]+/).slice(0, 2).join(". ") + ".";

  return (
    <div className="space-y-6">
      {/* Hidden image template */}
      <div className="sr-only">
        <div
          ref={imageRef}
          className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-12"
          style={{ width: "1080px", height: "1080px" }}
        >
          {/* Blurred background texture */}
          <div 
            className="absolute inset-0 opacity-10 blur-sm overflow-hidden"
            style={{ fontSize: "8px", lineHeight: "1.2", padding: "20px" }}
          >
            {onResumeText || "Resume text preview"}
          </div>
          
          {/* Logo */}
          <div className="absolute top-8 right-8 text-2xl font-bold text-orange-500">
            🔥 RoastMyResume
          </div>
          
          {/* Main content */}
          <div className="relative z-10 h-full flex flex-col justify-center">
            <div className="text-5xl font-serif leading-tight mb-8">
              <span className="text-orange-500">{firstTwoSentences}</span>
            </div>
            
            <div className="text-xl text-gray-400 mt-auto">
              Get roasted at RoastMyResume.com
            </div>
          </div>
          
          {/* Watermark for free users */}
          {tier === "free" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-6xl font-bold text-white/10 rotate-[-30deg]">
                Made with RoastMyResume
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Platform buttons */}
      <div className="grid grid-cols-2 gap-3">
        {platforms.map((platform) => (
          <Button
            key={platform.name}
            onClick={() => generateImage(platform)}
            disabled={generating !== null}
            variant="outline"
            className="h-auto py-4 flex flex-col gap-1"
          >
            <span className="text-2xl">{platform.icon}</span>
            <span className="text-sm font-medium">{platform.name}</span>
            {generating === platform.name && (
              <span className="text-xs text-muted-foreground">Generating...</span>
            )}
          </Button>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        {tier === "free" && (
          <p>⚠️ Free plan includes watermark. Upgrade to Pro for clean images!</p>
        )}
      </div>

      <Button onClick={onClose} variant="ghost" className="w-full">
        Close
      </Button>
    </div>
  );
}
