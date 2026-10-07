"use client";

import { motion, useAnimationFrame, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { CalendarDays } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { blanqueo, progresoEscena } from "./blanqueo";
import { Logo } from "./logo";

const ease = [0.22, 1, 0.36, 1] as const;

// El fondo se difumina a blanco de forma pareja a lo largo de este tramo de scroll (fracción de la altura de la portada)
const TRAMO_DIFUMINADO = 0.9;

const nav = [
  { label: "Inicio", href: "#" },
  { label: "Agendar reunión", href: "#reunion" },
];

type Variante = "azul" | "ink" | "blanco";

const estilos: Record<Variante, string> = {
  azul: "bg-azul text-white shadow-[0_10px_24px_-10px_rgb(29_91_255/0.8)] hover:bg-[#1546d6]",
  ink: "bg-ink text-white hover:bg-azul",
  // sobre el fondo azul oscuro de la portada
  blanco: "bg-white text-azul shadow-[0_14px_30px_-12px_rgb(0_0_0/0.55)] hover:bg-azul-claro",
};

export function DownloadButton({ className = "", variante = "azul" }: { className?: string; variante?: Variante }) {
  return (
    <a
      href="#reunion"
      className={`group inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${estilos[variante]} ${className}`}
    >
      <CalendarDays className="size-4 transition-transform duration-300 group-hover:-rotate-12" /> Agendar reunión
    </a>
  );
}

const PALABRA_FONDO = "Diseño Web";
const VELOCIDAD_FONDO = 12; // píxeles por segundo (muy lento a propósito)
const COPIAS_FONDO = 5; // repeticiones de la palabra: bastan para cubrir cualquier pantalla sin huecos

// Cinta de fondo: "Diseño Web · Diseño Web · …" en bucle infinito, siempre en movimiento, con la misma
// inclinación, tamaño y posición que tenía la firma. Al arrancar, la primera palabra queda centrada.
function CintaFondo() {
  const caja = useRef<HTMLDivElement>(null);
  const unidad = useRef<HTMLSpanElement>(null);
  const palabra = useRef<HTMLSpanElement>(null);
  const [medidas, setMedidas] = useState({ base: 0, unidad: 0 });
  const x = useMotionValue(0);
  const tiempo = useRef(0);

  useEffect(() => {
    const medir = () => {
      const c = caja.current?.offsetWidth ?? 0;
      const u = unidad.current?.offsetWidth ?? 0;
      const w = palabra.current?.offsetWidth ?? 0;
      // la cinta empieza una unidad a la izquierda para que la segunda palabra quede centrada y haya otra a su izquierda
      setMedidas({ base: c / 2 - w / 2 - u, unidad: u });
    };
    medir();
    document.fonts?.ready.then(medir);
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);

  // Rendimiento: la cinta solo se mueve mientras la portada se ve (el tiempo sigue contando para que no salte al volver)
  const portadaVisible = useRef(true);
  useEffect(() => {
    const el = caja.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => (portadaVisible.current = e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useAnimationFrame((_, delta) => {
    tiempo.current += Math.min(delta, 64) / 1000;
    if (!medidas.unidad || !portadaVisible.current) return;
    // al avanzar una unidad entera el dibujo es idéntico al inicial: el bucle no tiene saltos
    x.set(medidas.base - ((tiempo.current * VELOCIDAD_FONDO) % medidas.unidad));
  });

  return (
    <div
      ref={caja}
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[62%] w-[200vw] -translate-x-1/2 -translate-y-1/2 -rotate-[7deg] select-none"
    >
      <motion.div
        style={{ x }}
        className="flex w-max whitespace-nowrap font-[family-name:var(--font-script)] text-[44vw] leading-none text-[#7db4ff]/[0.2] blur-[1.5px] md:text-[27vw]"
      >
        {Array.from({ length: COPIAS_FONDO }, (_, i) => (
          <span key={i} ref={i === 0 ? unidad : undefined} className="inline-block">
            <span ref={i === 0 ? palabra : undefined}>{PALABRA_FONDO}</span>
            <span className="px-[0.3em]">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function Hero() {
  const { scrollY } = useScroll();
  const textY = useTransform(scrollY, [0, 600], [0, -60]);
  // La portada se desvanece durante la transición hacia la sección siguiente (y reaparece al volver): las dos nunca
  // se ven a la vez. Sin opacidad no hay clics: no se puede pulsar algo que ya no se ve.
  const opacidadPortada = useTransform(progresoEscena, (p) => 1 - Math.min(1, p / 0.45));
  const clicsPortada = useTransform(progresoEscena, (p) => (p > 0.3 ? "none" : "auto"));

  // Difuminado a blanco: lineal (ritmo parejo), uniforme en toda la portada y sin bordes.
  const seccion = useRef<HTMLElement>(null);
  const alto = useRef(1);
  const actualizar = (v: number) => blanqueo.set(Math.min(1, Math.max(0, v / (alto.current * TRAMO_DIFUMINADO))));
  useEffect(() => {
    const medir = () => {
      alto.current = seccion.current?.offsetHeight || 1;
      actualizar(scrollY.get());
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useMotionValueEvent(scrollY, "change", actualizar);

  return (
    <motion.section
      ref={seccion}
      style={{ opacity: opacidadPortada, pointerEvents: clicsPortada }}
      className="relative overflow-hidden text-white"
    >
      {/* fondo: degradado negro > azul > blanco, grano de película y cinta caligráfica gigante y tenue en movimiento */}
      <div className="fondo-hero absolute inset-0" aria-hidden />
      <CintaFondo />
      <div className="grano pointer-events-none absolute inset-0 opacity-[0.42] mix-blend-overlay" aria-hidden />
      {/* capa blanca que va cubriendo el degradado por igual en toda la portada hasta hacerlo desaparecer */}
      <motion.div className="pointer-events-none absolute inset-0 bg-white" style={{ opacity: blanqueo }} aria-hidden />

      <motion.header
        className="relative z-40 mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4 md:px-10"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
      >
        <Logo />
        <nav className="hidden items-center gap-9 text-[13px] font-medium text-white/90 md:flex">
          {nav.map((n) => (
            <a key={n.label} href={n.href} className="transition-colors hover:text-white">
              {n.label}
            </a>
          ))}
        </nav>
        <DownloadButton variante="blanco" className="whitespace-nowrap !px-3.5 !py-2 !text-[12px]" />
      </motion.header>

      <div className="relative mx-auto h-[522px] max-w-[1200px] px-6 md:h-[717px] md:px-10">
        <motion.div style={{ y: textY }} className="relative z-20 flex flex-col items-center pt-[46px] text-center md:pt-[60px]">
          <motion.h1
            className="whitespace-nowrap text-[min(80px,calc((100vw_-_48px)/9.3))] font-black leading-[0.98] tracking-[-0.045em] text-white"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease }}
          >
            Tu web profesional,
            <br /> más accesible
          </motion.h1>
          <motion.p
            className="mx-auto mt-4 max-w-[440px] font-serif text-[17px] leading-snug text-white/90 md:text-[19px]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.12, ease }}
          >
            Diseñamos webs rápidas, claras y accesibles para que tu negocio llegue a más personas.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.22, ease }}
          >
            <DownloadButton variante="blanco" className="mt-6" />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
