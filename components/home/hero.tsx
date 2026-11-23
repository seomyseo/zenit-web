import { Check } from "lucide-react";
import Image from "next/image";
import { WingMotif } from "@/components/brand/wing-motif";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";
import type { Product } from "@/lib/products";

export function Hero({ featured }: { featured: Product }) {
  const image = featured.images[0]!;
  const { hero } = site;

  return (
    <section id="inicio" aria-labelledby="hero-title" className="bg-zenit-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-10 pb-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pt-16 lg:pb-20">
        <div>
          <p className="flex items-center gap-3 text-sm font-semibold tracking-wide text-zenit-green uppercase">
            <WingMotif height={12} />
            {hero.eyebrow}
          </p>
          <h1
            id="hero-title"
            className="mt-4 font-display text-[2.15rem] leading-[1.08] text-zenit-black sm:text-5xl lg:text-[3.6rem]"
          >
            {hero.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zenit-gray sm:text-lg">
            {hero.lead}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="xl">
              <a href={hero.primaryCta.href}>{hero.primaryCta.label}</a>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="border-2 border-zenit-black bg-transparent text-zenit-black hover:bg-zenit-black hover:text-zenit-white"
            >
              <a href={hero.secondaryCta.href}>{hero.secondaryCta.label}</a>
            </Button>
          </div>
          <ul className="mt-8 flex flex-col gap-2 text-sm font-medium text-zenit-black sm:flex-row sm:flex-wrap sm:gap-x-6">
            {hero.highlights.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-zenit-green" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="relative mx-auto aspect-square w-full max-w-[20rem] overflow-hidden rounded-sm bg-zenit-gray-50 sm:max-w-[28rem] lg:max-w-[34rem]">
            <Image
              src={image.src}
              alt={image.alt}
              width={1200}
              height={1200}
              priority
              sizes="(min-width: 1024px) 34rem, (min-width: 640px) 28rem, 20rem"
              className="h-full w-full object-contain p-5 sm:p-10"
            />
          </div>
          {featured.model ? (
            <p className="mx-auto mt-3 max-w-[20rem] text-center text-xs font-medium text-zenit-gray sm:max-w-[28rem] lg:max-w-[34rem] lg:text-right">
              <span className="font-semibold text-zenit-black">{featured.model}</span> · {featured.name}
            </p>
          ) : null}
        </div>
      </div>

      <div className="bg-zenit-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-6 sm:px-6 lg:py-8">
          <p className="tagline text-2xl text-zenit-white sm:text-4xl lg:text-5xl">{site.tagline}</p>
          <WingMotif height={40} className="hidden sm:inline-block" />
        </div>
      </div>
    </section>
  );
}
