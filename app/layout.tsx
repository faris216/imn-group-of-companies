import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { getAdapter } from "@/lib/data";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#011F5F",
};

export async function generateMetadata(): Promise<Metadata> {
  const adapter = getAdapter();
  const settings = await adapter.getSettings();
  // Domain is purchased later (spec §79): fall back to Vercel URL, then localhost.
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return {
    metadataBase: new URL(base),
    title: {
      default: settings.seo_title ?? "IMN Group of Companies",
      template: `%s · ${settings.site_title}`,
    },
    description: settings.seo_description ?? undefined,
    openGraph: {
      type: "website",
      siteName: settings.site_title,
      title: settings.seo_title ?? settings.site_title,
      description: settings.seo_description ?? undefined,
      images: ["/assets/brand/imn-logo.png"],
    },
    twitter: { card: "summary", title: settings.seo_title ?? settings.site_title, description: settings.seo_description ?? undefined },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
