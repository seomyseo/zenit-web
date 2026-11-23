import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ZenitLogo } from "@/components/brand/zenit-logo";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only z-[60] rounded bg-zenit-black px-4 py-2 text-sm font-semibold text-zenit-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {site.header.skipToContent}
      </a>

      {/* Barra superior discreta: vínculo con Inversiones Lefre. */}
      <div className="bg-zenit-black text-zenit-white">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-end px-4 sm:px-6">
          <a
            href={site.owner.url}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 text-xs font-medium tracking-wide text-zenit-white/85 hover:text-zenit-white"
          >
            {site.header.distributedBy}
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
            <span className="sr-only">(abre en una pestaña nueva)</span>
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-border bg-zenit-white/95 backdrop-blur supports-[backdrop-filter]:bg-zenit-white/85">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20">
          <Link href="/" aria-label={site.header.homeLabel} className="rounded-sm py-2.5 lg:py-3">
            {/* Alto 40/52 px + espacio libre ≥ altura de la "Z" (11/14 px) dentro del header. */}
            <ZenitLogo height={40} priority className="lg:hidden" />
            <ZenitLogo height={52} priority className="hidden lg:inline-block" />
          </Link>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="rounded-sm px-3 py-2 text-sm font-semibold text-zenit-black transition-colors hover:text-zenit-green"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild size="lg" className="hidden h-11 px-4 font-semibold sm:inline-flex">
              <a href={site.header.cta.href}>{site.header.cta.label}</a>
            </Button>
            <MobileNav />
          </div>
        </div>
      </header>
    </>
  );
}
