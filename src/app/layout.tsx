import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "sonner";

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Boardly | AI-Powered Task Management",
  description: "Simplify project organization with AI-powered boards, lists, and cards. Enhance productivity with natural language processing and intuitive drag-and-drop interface.",
  keywords: ["task management", "project management", "AI", "productivity", "collaboration", "kanban", "boards"],
  authors: [{ name: "Boardly Team" }],
  creator: "Boardly",
  publisher: "Boardly",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://boardly.app",
    title: "Boardly | AI-Powered Task Management",
    description: "Simplify project organization with AI-powered boards, lists, and cards. Enhance productivity with natural language processing and intuitive drag-and-drop interface.",
    siteName: "Boardly",
  },
  twitter: {
    card: "summary_large_image",
    title: "Boardly | AI-Powered Task Management",
    description: "Simplify project organization with AI-powered boards, lists, and cards. Enhance productivity with natural language processing and intuitive drag-and-drop interface.",
    creator: "@boardlyapp",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
              <Toaster position="top-right" />
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
