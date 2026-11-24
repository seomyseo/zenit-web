"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Cuenta desde 0 hasta la cifra inicial del valor ("45 m", "42 L/min", "24 meses").
 * Valores que no empiezan por un entero seguido de espacio ("110/220 V", "pH 8,81")
 * se muestran tal cual. Con movimiento reducido, muestra el valor final.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const match = /^(\d+)(\s.*)$/.exec(value);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const target = match ? Number(match[1]) : 0;
  const countable = match !== null;
  // Arranca en el valor final (lo que ve un buscador o quien no tiene JS); cuenta desde 0 al aparecer.
  const [current, setCurrent] = useState(target);

  useEffect(() => {
    if (!countable || !inView || reduce) return;
    const controls = animate(0, target, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (latest) => setCurrent(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, reduce, target, countable]);

  if (!match) return <span className={className}>{value}</span>;
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">
        {reduce ? target : current}
        {match[2]}
      </span>
    </span>
  );
}
