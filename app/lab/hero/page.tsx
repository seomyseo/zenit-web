import type { Metadata } from "next";
import { HeroAltura } from "@/components/lab/hero-altura";
import { HeroDiagonal } from "@/components/lab/hero-diagonal";
import { HeroVitrina } from "@/components/lab/hero-vitrina";
import { site } from "@/content/site";
import { getHeroSlides, getModelCodes, getShelfProducts } from "@/lib/lab/hero-data";

/** Laboratorio: 3 variantes de hero para que el cliente compare. No se indexa. */
export const metadata: Metadata = {
  title: "Laboratorio: variantes del hero",
  robots: { index: false, follow: false },
};

const VARIANTS = [
  {
    id: "variante-a",
    name: "A · Altura",
    note: "Escenario negro a pantalla completa. Rotan 3 productos (bomba, kit solar, refrigerante) con un corte diagonal verde; las cifras suben y el lema gigante se mueve al hacer scroll.",
  },
  {
    id: "variante-b",
    name: "B · Diagonal",
    note: "Fondo blanco con panel verde cortado en el ángulo de las alas. La bomba sola, grande, sobre el corte; franjas del ala que barren y ficha de cifras en negro.",
  },
  {
    id: "variante-c",
    name: "C · Vitrina",
    note: "La línea completa sobre un piso verde: los productos suben uno tras otro y una cinta corre con los modelos y el lema.",
  },
] as const;

export default function HeroLabPage() {
  const { hero, tagline } = site;
  const common = {
    eyebrow: hero.eyebrow,
    title: hero.title,
    lead: hero.lead,
    tagline,
    primaryCta: hero.primaryCta,
    secondaryCta: hero.secondaryCta,
  };
  const slides = getHeroSlides();

  return (
    <main id="contenido" className="flex-1">
      <nav aria-label="Variantes" className="sticky top-16 z-40 border-b border-border bg-zenit-gray-50/95 backdrop-blur lg:top-20">
        <ul className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2 sm:px-6">
          {VARIANTS.map((v) => (
            <li key={v.id}>
              <a
                href={`#${v.id}`}
                className="inline-flex min-h-10 items-center rounded-sm px-3 text-sm font-semibold whitespace-nowrap text-zenit-black hover:bg-zenit-gray-100"
              >
                {v.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {VARIANTS.map((variant) => (
        <div key={variant.id} id={variant.id} className="scroll-mt-32">
          <div className="border-y border-border bg-zenit-white">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
              <p className="text-sm font-bold text-zenit-black">Variante {variant.name}</p>
              <p className="mt-1 max-w-3xl text-sm text-zenit-gray">{variant.note}</p>
            </div>
          </div>
          {variant.id === "variante-a" ? <HeroAltura {...common} slides={slides} /> : null}
          {variant.id === "variante-b" ? <HeroDiagonal {...common} product={slides[0]!} /> : null}
          {variant.id === "variante-c" ? (
            <HeroVitrina {...common} products={getShelfProducts()} codes={getModelCodes()} />
          ) : null}
        </div>
      ))}
    </main>
  );
}
