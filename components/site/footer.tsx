import { ArrowUpRight, AtSign } from "lucide-react";
import Link from "next/link";
import { ZenitLogo } from "@/components/brand/zenit-logo";
import { LeadCta } from "@/components/leads/lead-cta";
import { site } from "@/content/site";
import { publicEnv } from "@/lib/env";

export function SiteFooter() {
  const { footer, owner, instagram, header } = site;
  return (
    <footer className="bg-zenit-green text-zenit-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:py-16">
        <div>
          <ZenitLogo variant="blanco" height={56} />
          <p className="mt-4 text-sm text-zenit-white/85">{footer.brandLine}</p>
        </div>

        <nav aria-labelledby="footer-links-title">
          <h2 id="footer-links-title" className="text-sm font-semibold tracking-wide uppercase">
            {footer.linksTitle}
          </h2>
          <ul className="mt-4 space-y-1">
            {footer.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-10 items-center text-sm text-zenit-white/85 hover:text-zenit-white hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={owner.url}
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-10 items-center gap-1 text-sm text-zenit-white/85 hover:text-zenit-white hover:underline"
              >
                lefre.com.ve
                <ArrowUpRight aria-hidden="true" className="size-3.5" />
                <span className="sr-only">{header.newTab}</span>
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold tracking-wide uppercase">{footer.contactTitle}</h2>
          <ul className="mt-4 space-y-3">
            <li>
              <a
                href={instagram.url}
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-10 items-center gap-2 text-sm text-zenit-white/85 hover:text-zenit-white hover:underline"
              >
                <AtSign aria-hidden="true" className="size-4" />
                {footer.instagramLabel} {instagram.handle}
                <span className="sr-only">{header.newTab}</span>
              </a>
            </li>
            {/* Captación centralizada en LeadCta (WhatsApp con mensaje, o Instagram si no hay número). */}
            {publicEnv.NEXT_PUBLIC_WHATSAPP_URL ? (
              <li>
                <LeadCta inverted />
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      {/* Barra inferior en negro, debajo del footer verde */}
      <div className="bg-zenit-black">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-zenit-white/85 sm:px-6">
          © {new Date().getFullYear()} {owner.name}. {footer.rights}
        </p>
      </div>
    </footer>
  );
}
