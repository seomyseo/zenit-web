"use client";

import { Separator as SeparatorPrimitive } from "radix-ui";
import * as React from "react";
import { cn } from "@/lib/utils";

/** Separador punteado con bordes desvanecidos (de "contact-with-globe", 21st.dev), en gris de marca. */
export function FormDots({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  const horizontal = orientation === "horizontal";
  return (
    <SeparatorPrimitive.Root
      decorative={decorative}
      orientation={orientation}
      className={cn("flex shrink-0 items-center justify-center overflow-hidden", horizontal ? "w-full" : "h-full", className)}
      {...props}
    >
      <div className={cn("relative", horizontal ? "h-4 w-full" : "h-full w-4")}>
        <div
          className="absolute inset-0 bg-repeat text-zenit-gray/40"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 0.8px, transparent 0.8px)",
            backgroundSize: horizontal ? "6px 100%" : "100% 6px",
            maskImage: horizontal
              ? "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)"
              : "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          }}
        />
      </div>
    </SeparatorPrimitive.Root>
  );
}
