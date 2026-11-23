import type { Metadata } from "next";
import { publicEnv } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: "Zenit | Bombas de agua y refrigerantes para ferreterías en Venezuela",
  description:
    "Zenit, marca de Inversiones Lefre: bombas de agua, presostatos y refrigerantes con distribución nacional.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-VE" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
