import { SectionHeading } from "@/components/site/section-heading";
import { site } from "@/content/site";

/** Calidad y respaldo. Sin sellos ni normas: Zenit no tiene certificaciones. */
export function Quality() {
  const { quality } = site;
  return (
    <section id="calidad" aria-labelledby="quality-title" className="bg-zenit-black text-zenit-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:py-20">
        <div>
          <SectionHeading id="quality-title" eyebrow={quality.eyebrow} title={quality.title} inverted />
          <div className="mt-6 max-w-2xl space-y-4 text-base leading-relaxed text-zenit-white/85">
            {quality.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-4">
          {quality.facts.map((fact) => (
            <li key={fact.label} className="border-l-4 border-zenit-green bg-zenit-white/5 px-5 py-6">
              <span className="block font-display text-4xl text-zenit-white sm:text-5xl">{fact.value}</span>
              <span className="mt-2 block text-sm text-zenit-white/85">{fact.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
