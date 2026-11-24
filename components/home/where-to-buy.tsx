import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { site } from "@/content/site";

export function WhereToBuy() {
  const { whereToBuy, owner, header } = site;
  return (
    <section id="donde-comprar" aria-labelledby="where-title" className="bg-zenit-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <SectionHeading id="where-title" eyebrow={whereToBuy.eyebrow} title={whereToBuy.title} />
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {whereToBuy.steps.map((step, index) => (
            <li key={step.title} className="flex gap-4 rounded-sm border border-border bg-zenit-white p-5 sm:p-6">
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-zenit-green font-display text-lg text-zenit-white"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="text-base font-bold text-zenit-black">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-zenit-gray">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-zenit-black">{whereToBuy.coverage}</p>
          <a
            href={owner.url}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 text-sm font-semibold text-zenit-green underline-offset-4 hover:underline"
          >
            {whereToBuy.ownerCta}: lefre.com.ve
            <ArrowUpRight aria-hidden="true" className="size-4" />
            <span className="sr-only">{header.newTab}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
