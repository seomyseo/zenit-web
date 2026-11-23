"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { ZenitLogo } from "@/components/brand/zenit-logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { site } from "@/content/site";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon-lg" className="size-11 lg:hidden">
          <Menu aria-hidden="true" className="size-6" />
          <span className="sr-only">{site.header.menuLabel}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(20rem,88vw)] gap-0 p-0">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="sr-only">{site.header.menuTitle}</SheetTitle>
          <SheetDescription className="sr-only">{site.header.distributedBy}</SheetDescription>
          <ZenitLogo height={36} />
        </SheetHeader>
        <nav aria-label="Principal (móvil)" className="p-3">
          <ul className="flex flex-col">
            {site.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={close}
                  className="flex min-h-12 items-center rounded-sm px-3 text-base font-semibold text-zenit-black hover:bg-muted hover:text-zenit-green"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto border-t border-border p-5">
          <Button asChild size="xl" className="w-full">
            <a href={site.header.cta.href} onClick={close}>
              {site.header.cta.label}
            </a>
          </Button>
          <a
            href={site.owner.url}
            target="_blank"
            rel="noopener"
            className="mt-4 block text-center text-sm text-zenit-gray underline-offset-4 hover:underline"
          >
            {site.header.distributedBy}
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
