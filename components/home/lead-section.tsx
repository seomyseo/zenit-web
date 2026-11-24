import { ArrowUpRight, AtSign, Globe, MessageCircle, type LucideIcon } from "lucide-react";
import { LeadForm } from "@/components/leads/lead-form";
import { Reveal } from "@/components/motion/reveal";
import { FormDots } from "@/components/ui/form-dots";
import { GlobeWireframe } from "@/components/ui/globe-wireframe";
import { site } from "@/content/site";
import { publicEnv } from "@/lib/env";
import { getPublishedProducts } from "@/lib/products";

type ContactLink = { icon: LucideIcon; label: string; href: string };

/**
 * Sección de captación. Estructura adaptada de "contact-with-globe" (21st.dev):
 * encabezado centrado, columna con canales reales y globo centrado en Venezuela,
 * y tarjeta con el formulario de leads (validación, honeypot, webhook).
 */
export function LeadSection() {
  const { leadForm, instagram, owner, header } = site;
  // Solo para precargar el mensaje cuando se llega desde una ficha.
  const products = getPublishedProducts().map((p) => ({ erpCode: p.erpCode, name: p.name }));

  // Solo canales reales: teléfono y correo siguen pendientes del cliente (no se inventan).
  const links: ContactLink[] = [
    { icon: AtSign, label: `Instagram ${instagram.handle}`, href: instagram.url },
    { icon: Globe, label: leadForm.aside.website, href: owner.url },
    ...(publicEnv.NEXT_PUBLIC_WHATSAPP_URL
      ? [{ icon: MessageCircle, label: leadForm.whatsapp, href: publicEnv.NEXT_PUBLIC_WHATSAPP_URL }]
      : []),
  ];

  return (
    <section id="contacto" aria-labelledby="lead-title" className="relative overflow-hidden bg-zenit-gray-50 py-16 lg:py-20">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mb-10 flex flex-col items-center gap-4 text-center lg:mb-12">
          <span className="inline-flex items-center rounded-full border border-zenit-green/30 bg-zenit-green/10 px-4 py-1.5 text-sm font-semibold text-zenit-green">
            {leadForm.eyebrow}
          </span>
          <h2 id="lead-title" className="font-display text-4xl text-zenit-black md:text-5xl lg:text-6xl">
            {leadForm.title}
          </h2>
          <p className="max-w-md text-base text-zenit-gray">{leadForm.lead}</p>
        </Reveal>

        <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal delay={0.1} className="order-2 flex flex-col gap-6 lg:sticky lg:top-28 lg:order-1">
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-semibold text-zenit-black">{leadForm.aside.title}</h3>
              <p className="max-w-xs text-sm leading-relaxed text-zenit-gray">{leadForm.aside.text}</p>
            </div>

            <ul className="flex flex-col gap-3">
              {links.map(({ icon: Icon, label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener"
                    className="group flex w-fit min-h-10 items-center gap-3 text-sm text-zenit-gray transition-colors duration-200 hover:text-zenit-black"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-zenit-gray-200 bg-zenit-white transition-colors duration-200 group-hover:border-zenit-green/40 group-hover:bg-zenit-green/10">
                      <Icon aria-hidden="true" className="size-4 text-zenit-gray transition-colors duration-200 group-hover:text-zenit-green" />
                    </span>
                    {label}
                    <ArrowUpRight aria-hidden="true" className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span className="sr-only">{header.newTab}</span>
                  </a>
                </li>
              ))}
            </ul>

            {/* Globo centrado en Venezuela (en verde), con desvanecido inferior como en el original */}
            <div className="relative h-56 overflow-hidden sm:h-64">
              <GlobeWireframe className="absolute top-0 left-1/2 max-w-[22rem] -translate-x-1/2" />
              <span className="absolute top-3 left-0 inline-flex items-center gap-2 rounded-full bg-zenit-white px-3 py-1 text-xs font-semibold text-zenit-black shadow-sm">
                <span aria-hidden="true" className="size-2 rounded-full bg-zenit-green" />
                {leadForm.aside.coverage}
              </span>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zenit-gray-50 to-transparent"
              />
            </div>
          </Reveal>

          <Reveal
            delay={0.2}
            className="order-1 flex flex-col gap-5 rounded-2xl border border-zenit-gray-200 bg-zenit-white p-5 shadow-[0_20px_50px_-30px_rgb(0_0_0/0.35)] sm:p-8 lg:order-2"
          >
            <div>
              <h3 className="mb-0.5 text-lg font-semibold text-zenit-black">{leadForm.card.title}</h3>
              <p className="text-sm text-zenit-gray">{leadForm.card.text}</p>
            </div>
            <FormDots />
            <LeadForm products={products} whatsappUrl={publicEnv.NEXT_PUBLIC_WHATSAPP_URL} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
