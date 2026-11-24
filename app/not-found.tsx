import Link from "next/link";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";

export default function NotFound() {
  return (
    <main id="contenido" className="flex flex-1 items-center">
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="font-display text-6xl text-zenit-green">404</p>
        <h1 className="mt-4 font-display text-3xl text-zenit-black">{site.notFound.title}</h1>
        <p className="mt-3 text-zenit-gray">{site.notFound.text}</p>
        <Button asChild size="xl" className="mt-8">
          <Link href="/productos">{site.notFound.cta}</Link>
        </Button>
      </div>
    </main>
  );
}
