import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "RoastMyResume - Get Brutally Roasted (Lovingly)",
  description: "AI-powered resume roasting that destroys your ego while improving your career. Upload your resume and get hilarious, actionable feedback.",
  keywords: ["resume", "roast", "AI", "career advice", "job search", "ATS"],
  openGraph: {
    title: "RoastMyResume",
    description: "Your resume is about to get destroyed (lovingly).",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
