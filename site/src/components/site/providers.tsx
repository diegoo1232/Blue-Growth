"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { MotionConfig } from "motion/react";
import { useEffect } from "react";
import { despuesDeMoverScroll } from "./scroll-hooks";
import { EVENTO_SINCRONIZAR, modoSalto } from "./estado-telefonos";

// Scroll suave en toda la página (como en la referencia) y animaciones siempre activas,
// también con "reducir movimiento" activado.
export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 }); // suave pero ágil: sin la sensación de "arrastrar" la rueda
    (window as unknown as { lenis: Lenis }).lenis = lenis;
    let id = 0;
    const raf = (t: number) => {
      lenis.raf(t);
      despuesDeMoverScroll.forEach((f) => f());
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    // los enlaces internos (#seccion) también se desplazan con suavidad
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a || a.getAttribute("href") === "#") return;
      e.preventDefault();
      // durante el salto, las animaciones de las secciones cambian de estado al instante (ver estado-telefonos)
      modoSalto.activo = true;
      // se mantiene un poco después de acabar el movimiento, para que se procesen los últimos eventos de scroll
      const cerrar = () => {
        modoSalto.activo = false;
        window.dispatchEvent(new Event(EVENTO_SINCRONIZAR));
      };
      const fin = () => window.setTimeout(cerrar, 600);
      lenis.scrollTo(a.getAttribute("href")!, { duration: 1.4, onComplete: fin });
      window.setTimeout(cerrar, 3000); // por si el scroll se interrumpe y nunca llega a "completo"
    };
    document.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return <MotionConfig reducedMotion="never">{children}</MotionConfig>;
}
