"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
} from "motion/react";
import { Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const FRASE = "todo bajo control ·";
const VELOCIDAD = 60; // píxeles por segundo cuando la página está quieta
const EMPUJE_SCROLL = 900; // píxeles extra que añade recorrer todo el bloque con el scroll

// Bloque fijado: el texto gigante avanza siempre (también quieto) y acelera con el scroll;
// la línea ondulada se dibuja sola, el aspirador gira sin parar y la tarjeta de vídeo queda en el centro.
export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  // Cinta infinita: avance continuo por tiempo + empuje del scroll, en bucle sin saltos.
  const unidad = useRef<HTMLSpanElement>(null);
  const [ancho, setAncho] = useState(0);
  const tiempo = useMotionValue(0);
  const x = useMotionValue(0);
  useEffect(() => {
    const medir = () => setAncho(unidad.current?.offsetWidth ?? 0);
    medir();
    document.fonts?.ready.then(medir);
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);
  useAnimationFrame((_, delta) => {
    tiempo.set(tiempo.get() + (VELOCIDAD * Math.min(delta, 64)) / 1000);
    if (!ancho) return;
    const recorrido = tiempo.get() + scrollYProgress.get() * EMPUJE_SCROLL;
    x.set(-(recorrido % ancho));
  });
  // La línea ondulada se dibuja sola cuando el bloque aparece en pantalla, sin depender del scroll.
  const draw = useMotionValue(0.05);
  const enVista = useInView(ref, { amount: 0.25, once: true });
  useEffect(() => {
    if (!enVista) return;
    const a = animate(draw, 1, { duration: 2.4, delay: 0.2, ease: [0.45, 0, 0.2, 1] });
    return () => a.stop();
  }, [enVista, draw]);

  return (
    <section ref={ref} id="como-funciona" className="relative h-[130vh] bg-white">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <motion.p
          style={{ x }}
          data-cinta
          className="relative z-0 whitespace-nowrap text-[96px] font-semibold leading-[0.9] tracking-[-0.055em] text-ink md:text-[200px]"
          aria-hidden
        >
          {[0, 1, 2, 3].map((i) => (
            <span key={i} ref={i === 0 ? unidad : undefined} className="inline-block pr-[0.3em]">
              {FRASE}
            </span>
          ))}
        </motion.p>

        <svg
          viewBox="0 0 1440 300"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 top-[calc(50%-190px)] z-10 h-[300px] w-full"
          aria-hidden
        >
          <motion.path
            d="M-30 120 C 90 20, 170 250, 300 150 S 470 -10, 560 110 S 700 260, 820 180 S 980 30, 1080 90 S 1260 250, 1470 60"
            fill="none"
            stroke="var(--azul)"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ pathLength: draw }}
          />
        </svg>

        <div className="relative z-20 mx-auto w-full max-w-[1120px] px-6 pt-8 md:pt-12">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative grid min-h-[300px] overflow-hidden rounded-[26px] bg-gradient-to-br from-[#f8f9fa] to-[#eaecf0] shadow-[0_40px_70px_-36px_rgb(20_22_27/0.45),inset_0_1px_0_#fff] md:grid-cols-[1fr_1.15fr]"
          >
            <div className="relative z-10 p-8 md:p-12">
              <h2 className="text-[44px] font-medium leading-[0.98] tracking-[-0.045em] text-ink md:text-[60px]">
                Así
                <br />
                funciona
              </h2>
              <p className="mt-5 max-w-[220px] text-[13px] leading-relaxed text-gris">
                Mira la presentación en vídeo y descubre cómo se conecta tu casa.
              </p>
            </div>

            <div
              className="relative min-h-[260px]"
              data-slot="como-funciona-video"
              data-slot-type="video-poster"
              data-slot-spec="vídeo horizontal 16:9, producto sobre fondo claro"
            >
              {/* alfombra de puntos */}
              <div className="absolute inset-0 bg-[radial-gradient(circle,rgb(20_22_27/0.16)_1px,transparent_1.7px)] [background-size:7px_7px] [mask-image:radial-gradient(60%_70%_at_75%_85%,#000_30%,transparent)]" />
              {/* robot aspirador (dibujo propio) */}
              <div className="girar-lento absolute -right-20 -top-24 size-[300px] md:size-[340px]">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#fdfdfe] to-[#d9dce3] shadow-[0_30px_60px_-24px_rgb(20_22_27/0.45)]" />
                <div className="absolute inset-[9%] rounded-full bg-gradient-to-br from-[#f2f3f6] to-[#e3e6eb] shadow-[inset_0_2px_6px_rgb(255_255_255),inset_0_-6px_14px_rgb(20_22_27/0.08)]" />
                <div className="absolute inset-[30%] rounded-full border border-white/80 bg-gradient-to-br from-[#eceef2] to-[#dadde3]" />
                <div className="absolute left-[22%] top-[60%] h-[7px] w-[16%] rounded-full bg-[#c4c9d2]" />
              </div>
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Ver el vídeo de presentación"
                className="pulso absolute left-1/2 top-1/2 grid size-28 -translate-1/2 place-items-center rounded-full bg-white/70 shadow-[0_24px_44px_-14px_rgb(20_22_27/0.35),inset_0_2px_8px_#fff] backdrop-blur-md transition-transform duration-300 ease-out hover:scale-110 md:left-[42%] md:size-32"
              >
                <Play className="size-6 translate-x-0.5 fill-azul text-azul" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative grid aspect-video w-full max-w-[860px] place-items-center rounded-2xl bg-noche text-white/70"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm">Aquí irá el vídeo de presentación de BLUE GROWTH</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
