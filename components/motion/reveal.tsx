"use client";

import { motion } from "motion/react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Retraso en segundos, para escalonar elementos de una misma sección. */
  delay?: number;
  as?: "div" | "li" | "section";
};

/** Entrada sutil al aparecer en pantalla: opacidad y 12 px hacia arriba. */
export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
    >
      {children}
    </Component>
  );
}
