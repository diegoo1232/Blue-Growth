"use client";

import { animate, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Phone, ScreenRoom } from "./phone";

const cifras = [
  { n: 2014, suf: "", text: "Año en que empezamos a conectar hogares", desde: 1400 },
  { n: 180, suf: "+", text: "Instaladores certificados en todo el país", desde: 0 },
  { n: 650, suf: "+", text: "Proyectos entregados a nuestros clientes", desde: 0 },
  { n: 5, suf: "", text: "Años de garantía en todos nuestros equipos", desde: 0 },
];

function Contador({ n, suf, desde }: { n: number; suf: string; desde: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [v, setV] = useState(desde);
  useEffect(() => {
    if (!inView) return;
    const c = animate(desde, n, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (x) => setV(Math.round(x)),
    });
    return () => c.stop();
  }, [inView, n, desde]);
  return (
    <span ref={ref} className="tabular-nums">
      {v}
      {suf}
    </span>
  );
}

// El móvil entra solo al aparecer en pantalla (se endereza y se coloca) y después se balancea
// y flota sin parar. Nada de esto depende del scroll.
function MovilInclinado({ slot, className }: { slot: string; className: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, rotate: 34, y: 200, x: 70 }}
      whileInView={{ opacity: 1, rotate: 12, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flotar-suave">
        <div className="balancear">
          <Phone slot={slot}>
            <ScreenRoom />
          </Phone>
        </div>
      </div>
    </motion.div>
  );
}

export function Stats() {
  return (
    <section id="cifras" className="relative overflow-hidden bg-white pb-64 pt-24 md:py-32">
      <div className="mx-auto grid w-full max-w-[1120px] items-center gap-10 px-6 md:grid-cols-[1.05fr_1fr]">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {cifras.map((c, i) => (
            <motion.div
              key={c.text}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.9, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-[#eef0f3] bg-white p-5 shadow-[0_20px_44px_-30px_rgb(20_22_27/0.4)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_26px_50px_-26px_rgb(29_91_255/0.45)] md:p-7"
            >
              <p className="text-[32px] font-medium tracking-[-0.03em] text-ink md:text-[44px]">
                <Contador n={c.n} suf={c.suf} desde={c.desde} />
              </p>
              <p className="mt-2 max-w-[160px] text-[12px] leading-snug text-gris md:mt-3 md:text-[13px]">{c.text}</p>
            </motion.div>
          ))}
        </div>

        <MovilInclinado slot="cifras-movil" className="mx-auto hidden w-[250px] md:block" />
      </div>
      {/* en móvil el teléfono asoma por la derecha, igual de inclinado */}
      <MovilInclinado slot="cifras-movil-sm" className="absolute -bottom-32 right-[-30px] w-[170px] md:hidden" />
    </section>
  );
}
