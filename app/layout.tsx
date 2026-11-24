import type { Metadata, Viewport } from "next";
import { MotionProvider } from "@/components/motion/motion-provider";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { site } from "@/content/site";
import { publicEnv } from "@/lib/env";
import { cn } from "@/lib/utils";
import { montserrat, robotoSlab } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: site.seo.homeTitle,
    template: "%s | Zenit",
  },
  description: site.seo.homeDescription,
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: "es_VE",
    siteName: site.name,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#02682e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-VE"
      className={cn("h-full antialiased", montserrat.variable, robotoSlab.variable)}
    >
      <body className="flex min-h-full flex-col">
        <MotionProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </MotionProvider>
      </body>
    </html>
  );
}
