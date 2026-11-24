import type { Metadata } from "next";
import { CardsEscaparate } from "@/components/lab/cards/cards-escaparate";
import { CardsFicha } from "@/components/lab/cards/cards-ficha";
import { CardsRiel } from "@/components/lab/cards/cards-riel";
import { getCardGroups } from "@/lib/card-data";

/** Laboratorio: 3 propuestas de tarjetas de producto para comparar. No se indexa. */
export const metadata: Metadata = {
  title: "Laboratorio: tarjetas de producto",
  robots: { index: false, follow: false },
};

const VARIANTS = [
  {
    id: "tarjetas-a",
    name: "A · Ficha técnica",
    note: "Clara y técnica. Modelo grande, etiqueta de variante y 3 cifras clave. Foto sobre cuadrícula de plano con encuadre uniforme; al pasar el mouse el producto sube y una barra verde recorre la base. Entrada escalonada al hacer scroll.",
    dark: false,
  },
  {
    id: "tarjetas-b",
    name: "B · Escaparate",
    note: "Oscura y de vitrina. Un foco de luz sigue al cursor y la tarjeta se inclina en 3D; el producto flota sobre el foco. Cifras en blanco con separadores verdes. Entrada con escala desde abajo.",
    dark: true,
  },
  {
    id: "tarjetas-c",
    name: "C · Riel",
    note: "Un riel horizontal por grupo que se desliza con el dedo, con flechas y barra de avance. Fotos grandes; al pasar el mouse entra una banda verde diagonal. Las tarjetas entran desde la derecha.",
    dark: false,
  },
] as const;

export default function CardsLabPage() {
  const groups = getCardGroups();

  return (
    <main id="contenido" className="flex-1">
      <h1 className="sr-only">Laboratorio: propuestas de tarjetas de producto</h1>
      <nav aria-label="Propuestas" className="sticky top-16 z-40 border-b border-border bg-zenit-gray-50/95 backdrop-blur lg:top-20">
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
        <section
          key={variant.id}
          id={variant.id}
          aria-labelledby={`${variant.id}-title`}
          className={`scroll-mt-32 ${variant.dark ? "bg-zenit-black" : "bg-zenit-white"}`}
        >
          <div className="border-y border-border bg-zenit-white">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
              <h2 id={`${variant.id}-title`} className="text-sm font-bold text-zenit-black">
                Propuesta {variant.name}
              </h2>
              <p className="mt-1 max-w-3xl text-sm text-zenit-gray">{variant.note}</p>
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
            {variant.id === "tarjetas-a" ? <CardsFicha groups={groups} /> : null}
            {variant.id === "tarjetas-b" ? <CardsEscaparate groups={groups} /> : null}
            {variant.id === "tarjetas-c" ? <CardsRiel groups={groups} /> : null}
          </div>
        </section>
      ))}
    </main>
  );
}
