import type { Metadata, Viewport } from "next";
import { MotionProvider } from "@/components/motion/motion-provider";
import { publicEnv } from "@/lib/env";
import { cn } from "@/lib/utils";
import { montserrat, robotoSlab } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: "Zenit | Bombas de agua y refrigerantes para ferreterías en Venezuela",
  description:
    "Zenit, marca de Inversiones Lefre: bombas de agua, presostatos y refrigerantes con distribución nacional.",
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
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
