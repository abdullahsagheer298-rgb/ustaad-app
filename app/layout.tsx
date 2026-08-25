import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ustaad — AI Teacher",
  description: "An AI teacher that can teach, quiz, test, and track progress.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
