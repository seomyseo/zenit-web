import { getPublishedProducts } from "@/lib/products";

// Página provisional: la home real se construye en el paso 4 del brief.
export default function Home() {
  const products = getPublishedProducts();
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
      <h1 className="text-2xl font-bold">Zenit</h1>
      <p className="mt-2 text-zenit-gray">
        Sitio en construcción. Productos cargados: {products.length}.
      </p>
    </main>
  );
}
