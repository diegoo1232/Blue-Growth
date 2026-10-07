"use client";

import dynamic from "next/dynamic";
import { motion, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";

// Solo en el navegador: el anillo calcula posiciones con decimales y el servidor y el navegador no los escriben igual
const CircularCarousel = dynamic(() => import("./CircularCarousel"), { ssr: false });

// Los 5 últimos diseños de la lista de proyectos (Diseño pagina web 13 a 17).
// Las capturas están en public/galeria/ (portada de cada web a 1280×720, tomadas con su servidor local).
const DISENOS = [
  {
    src: "/galeria/diseno-13.jpg",
    alt: "Portada de la web de la clínica dental Sonrisa Viva, con el titular «Cuidamos tu sonrisa sin miedo»",
    title: "Sonrisa Viva",
    subtitle: "Clínica dental · Diseño 13",
  },
  {
    src: "/galeria/diseno-14.jpg",
    alt: "Portada de la web de TradeVisión Academy, con el titular «Aprende a operar tu propio futuro»",
    title: "TradeVisión Academy",
    subtitle: "Academia de trading · Diseño 14",
  },
  {
    src: "/galeria/diseno-15.jpg",
    alt: "Portada de la web de Voltix, con el titular «Ingeniería electrónica a medida y a tiempo»",
    title: "Voltix",
    subtitle: "Ingeniería electrónica · Diseño 15",
  },
  {
    src: "/galeria/diseno-16.jpg",
    alt: "Portada de la web de Rumbo Salvaje, con el titular «Expediciones guiadas con todo claro desde el inicio»",
    title: "Rumbo Salvaje",
    subtitle: "Expediciones guiadas · Diseño 16",
  },
  {
    src: "/galeria/diseno-17.jpg",
    alt: "Portada de la web BLUE GROWTH en su versión de app para casas inteligentes, con el titular «Tu casa, más simple»",
    title: "BLUE GROWTH",
    subtitle: "App de casa inteligente · Diseño 17",
  },
];

// Inclinación del anillo, en grados (negativo = sube hacia la derecha)
const DIAGONAL = -28;

const tramo = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

// Contenido de la pantalla del teléfono: se dibuja al tamaño final de la pantalla (unos 406 × 880 px)
// y el teléfono lo reduce por escala cuando está pequeño.
// `avance` es el avance de la transición a formulario (px de scroll desde que se fija la escena): los textos
// rectos se desvanecen justo antes de que el barrido del formulario llegue a su zona, para que no se pisen.
// `desfase` (px) retrasa ambos desvanecimientos cuando el barrido ocurre más tarde (móvil).
export function GaleriaDisenos({ avance, desfase }: { avance: MotionValue<number>; desfase?: MotionValue<number> }) {
  const [activo, setActivo] = useState(0);
  // Pantalla de la tablet (escritorio): más ancha que la del móvil, así que las tarjetas se escalan en proporción.
  // La del móvil (≈ 342 px) se queda como siempre. Se mide el ancho de maquetación (no afectado por la escala).
  const caja = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState(0);
  useEffect(() => {
    const medir = () => setAncho(caja.current?.offsetWidth ?? 0);
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);
  const esTablet = ancho >= 460;
  const actual = DISENOS[activo] ?? DISENOS[0];
  const opacidadTitulo = useTransform(desfase ? [avance, desfase] : [avance], ([v, d = 0]: number[]) => 1 - tramo(v - d, 15, 55));
  const opacidadPie = useTransform(desfase ? [avance, desfase] : [avance], ([v, d = 0]: number[]) => 1 - tramo(v - d, -85, -40));

  return (
    <div ref={caja} className="absolute inset-0 overflow-hidden text-white">
      {/* Anillo grande e inclinado en diagonal. Su contenedor es más ancho que la pantalla y la propia
          pantalla del teléfono recorta lo que sobresale. */}
      <div
        className="absolute left-1/2 top-1/2 h-[80%] w-[210%] -translate-x-1/2 -translate-y-1/2"
        style={{ rotate: `${DIAGONAL}deg` }}
      >
        <CircularCarousel
          items={DISENOS}
          preset="cylinder"
          intro="rise"
          cardWidth={esTablet ? Math.round(ancho * 0.8) : 330}
          aspectRatio={1.3}
          tilt={-14}
          gap={esTablet ? Math.round(ancho * 0.062) : 26}
          autoplay="drift"
          speed={14}
          pauseOnHover={false}
          cornerRadius={12}
          fadeColor="#1a1c23"
          onChange={setActivo}
        />
      </div>

      {/* Título arriba y pie de foto abajo, siempre rectos (no giran con el anillo) */}
      <motion.div style={{ opacity: opacidadTitulo }} className="pointer-events-none relative z-10 px-5 pt-[52px] max-md:pt-11 md:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">Portafolio</p>
        <h3 className="mt-1.5 text-[26px] font-extrabold leading-[1.05] tracking-[-0.035em]">Nuestros últimos diseños</h3>
        <p className="mt-2 font-serif text-[14px] italic text-white/70">Arrastra la galería para recorrerlos</p>
      </motion.div>
      <motion.div
        style={{ opacity: opacidadPie }}
        className="pointer-events-none absolute inset-x-0 bottom-7 z-10 flex flex-col items-center gap-1.5 px-6 text-center"
        aria-hidden
      >
        <span className="text-[16px] font-semibold leading-tight">{actual.title}</span>
        <span className="text-[13px] text-white/60">{actual.subtitle}</span>
        <span className="mt-1 text-[12px] tabular-nums text-white/50">
          {String(activo + 1).padStart(2, "0")} / {String(DISENOS.length).padStart(2, "0")}
        </span>
      </motion.div>
    </div>
  );
}
