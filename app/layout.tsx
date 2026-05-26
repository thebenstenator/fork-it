import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { PostHogProvider } from "@/components/PostHogProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "fork it. — dinner sorted",
  description:
    "Real dinner ideas from whatever you've got. Type your ingredients and get 3 practical meal ideas in seconds. No account, no nonsense.",
  metadataBase: new URL("https://forkit.food"),
  openGraph: {
    title: "fork it.",
    description: "Fork what's in your fridge. Dinner sorted.",
    url: "https://forkit.food",
    siteName: "fork it.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "fork it.",
    description: "Fork what's in your fridge. Dinner sorted.",
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
    <html lang="en" className={`${inter.variable} h-full antialiased`} style={{ colorScheme: 'light' }}>
      <body className="min-h-full flex flex-col font-sans">
        <PostHogProvider>
          {children}
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
