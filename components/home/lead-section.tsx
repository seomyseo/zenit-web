import { LeadForm } from "@/components/leads/lead-form";
import { SectionHeading } from "@/components/site/section-heading";
import { site } from "@/content/site";
import { publicEnv } from "@/lib/env";
import { GROUP_LABELS, getPublishedProducts } from "@/lib/products";

export function LeadSection() {
  const { leadForm } = site;
  const products = getPublishedProducts().map((p) => ({
    erpCode: p.erpCode,
    name: p.name,
    groupLabel: GROUP_LABELS[p.group],
  }));

  return (
    <section id="contacto" aria-labelledby="lead-title" className="bg-zenit-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:py-20">
        <SectionHeading id="lead-title" eyebrow={leadForm.eyebrow} title={leadForm.title} lead={leadForm.lead} />
        <LeadForm products={products} whatsappUrl={publicEnv.NEXT_PUBLIC_WHATSAPP_URL} />
      </div>
    </section>
  );
}
