"use client";

import { motion } from "motion/react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Retraso en segundos, para escalonar elementos de una misma sección. */
  delay?: number;
  as?: "div" | "li" | "section";
  /** Dirección de entrada: desde abajo (sutil, por defecto) o desde la derecha (tarjetas). */
  from?: "below" | "right";
};

/**
 * Entrada al aparecer en pantalla. Con prefers-reduced-motion, MotionConfig
 * (reducedMotion="user") anula el desplazamiento y queda solo la opacidad.
 */
export function Reveal({ children, className, delay = 0, as = "div", from = "below" }: RevealProps) {
  const Component = motion[as];
  const offset = from === "right" ? { x: 64, y: 0 } : { x: 0, y: 12 };
  return (
    <Component
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: from === "right" ? 0.6 : 0.45, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </Component>
  );
}
