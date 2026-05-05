"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/FileUploader";
import Link from "next/link";

export default function HomePage() {
  const [resumeText, setResumeText] = useState("");
  const [intensity, setIntensity] = useState<"mild" | "spicy">("mild");

  const handleFileLoaded = (text: string) => {
    setResumeText(text);
  };

  const handleGetStarted = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-block">
            <span className="text-6xl mb-4 block">🔥</span>
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              RoastMyResume
            </h1>
          </div>
          
          <div className="h-20 md:h-24 max-w-3xl mx-auto">
            <TypingAnimation />
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered resume roasting that destroys your ego while secretly improving your career. 
            Hilarious, brutal, and actually helpful.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Button onClick={handleGetStarted} size="lg" className="h-14 px-8 text-lg">
              Get Roasted Now
            </Button>
            <Link href="#pricing">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg">
                View Pricing
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="pt-8">
            <p className="text-sm text-muted-foreground">
              🔥 <strong>5,000+</strong> roasts served and counting
            </p>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="🎭"
            title="Brutal Comedy"
            description="Get roasted by our AI stand-up comedian who's also a career expert. It hurts so good."
          />
          <FeatureCard
            icon="✨"
            title="Glow-Up Tips"
            description="Behind every savage joke is actionable career advice that'll actually get you hired."
          />
          <FeatureCard
            icon="📊"
            title="ATS Optimization"
            description="Pro users get resume rewrites optimized for Applicant Tracking Systems."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-muted-foreground">Start free, upgrade when you're ready</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            title="Free"
            price="$0"
            period=""
            features={[
              "1 roast per day",
              "Basic roast & glow-up tips",
              "Watermarked share images",
              "Standard support",
            ]}
            cta="Get Started"
            popular={false}
          />
          <PricingCard
            title="Pro"
            price="$9.99"
            period="/month"
            features={[
              "Unlimited roasts",
              "ATS rewrite optimization",
              "Watermark-free images",
              "Priority support",
              "All future features",
            ]}
            cta="Upgrade to Pro"
            popular={true}
          />
        </div>
      </section>

      {/* Hall of Shame */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">🏆 Hall of Shame</h2>
          <p className="text-muted-foreground">Some of our finest roasts (fake but relatable)</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <HallOfShameCard
            quote="Your 'leadership skills' section just says 'I led a team once in 2019 and they didn't mutiny.' That's the bare minimum, Karen."
            intensity="Spicy"
          />
          <HallOfShameCard
            quote="You listed 'Microsoft Office' as a skill in 2024? Do you also put 'breathing oxygen' on your resume?"
            intensity="Mild"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-muted py-8 mt-16">
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

function TypingAnimation() {
  const texts = [
    "Your resume is about to get destroyed (lovingly).",
    "Prepare for emotional damage (with career advice).",
    "Where egos go to die (and careers get better).",
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useState(() => {
    const currentText = texts[currentIndex];
    
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayedText.length < currentText.length) {
            setDisplayedText(currentText.slice(0, displayedText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          if (displayedText.length > 0) {
            setDisplayedText(displayedText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex((prev) => (prev + 1) % texts.length);
          }
        }
      },
      isDeleting ? 50 : 100
    );

    return () => clearTimeout(timeout);
  });

  return (
    <p className="text-2xl md:text-3xl font-medium h-16 flex items-center justify-center">
      {displayedText}
      <span className="animate-pulse ml-1">|</span>
    </p>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card rounded-xl p-6 text-left space-y-3"
    >
      <div className="text-4xl">{icon}</div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}

function PricingCard({
  title,
  price,
  period,
  features,
  cta,
  popular,
}: {
  title: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  popular: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`rounded-xl p-8 ${
        popular
          ? "grill-mark-border glass-card"
          : "border border-muted"
      }`}
    >
      {popular && (
        <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
          MOST POPULAR
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-muted-foreground">{period}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link href="/dashboard">
        <Button className="w-full" variant={popular ? "default" : "outline"}>
          {cta}
        </Button>
      </Link>
    </motion.div>
  );
}

function HallOfShameCard({ quote, intensity }: { quote: string; intensity: string }) {
  return (
    <div className="glass-card rounded-lg p-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-primary">
          {intensity === "Spicy" ? "🔥" : "🌶️"} {intensity}
        </span>
      </div>
      <p className="font-serif text-lg italic">"{quote}"</p>
    </div>
  );
}
