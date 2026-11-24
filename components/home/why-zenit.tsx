import { Building2, FileText, MapPinned, Wrench, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { site } from "@/content/site";

const ICONS: Record<(typeof site.why.points)[number]["icon"], LucideIcon> = {
  building: Building2,
  map: MapPinned,
  file: FileText,
  wrench: Wrench,
};

export function WhyZenit() {
  const { why } = site;
  return (
    <section id="por-que-zenit" aria-labelledby="why-title" className="border-b border-border bg-zenit-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <SectionHeading id="why-title" eyebrow={why.eyebrow} title={why.title} />
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {why.points.map((point) => {
            const Icon = ICONS[point.icon];
            return (
              <li key={point.title} className="border-t-2 border-zenit-green pt-5">
                <Icon aria-hidden="true" className="size-7 text-zenit-green" strokeWidth={1.75} />
                <h3 className="mt-4 text-lg font-bold text-zenit-black">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zenit-gray">{point.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
