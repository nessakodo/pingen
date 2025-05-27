import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: "Pingen — Instantly Remix Your Inspiration",
  description: "Transform your Pinterest boards with AI-powered creative collaboration. Add your twist to any board and generate new, inspired content.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
