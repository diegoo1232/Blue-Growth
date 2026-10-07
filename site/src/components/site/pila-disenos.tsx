"use client";

import { useEffect, useRef } from "react";

// "Pila descendente" dentro de la tablet de la ficha: las portadas de los últimos seis diseños se apilan una detrás de otra.
// La de delante se ve entera y las demás asoman por debajo como franjas cada vez más estrechas. Cada ciclo la tarjeta de
// delante baja, se mete detrás de la pila y pasa al final, mientras la siguiente sube a primer plano y la pila se recoloca
// debajo. Tras una vuelta completa la pila se recoge detrás de la tarjeta y se vuelve a abrir (la parada para reorganizarse).
// Las imágenes se ven COMPLETAS (la mesa de trabajo entera, sin recortar): cada tarjeta tiene la proporción 16:9 de la captura.
// Se ve en la tablet (escritorio) y en el teléfono (móvil): se adapta solo al tamaño de la pantalla.

const DISENOS = [
  { src: "/galeria/diseno-12.jpg", alt: "Portada de la web de Horizonte Capital, con el titular «No necesitas saber de finanzas para proteger lo que ahorraste»" },
  { src: "/galeria/diseno-13.jpg", alt: "Portada de la web de la clínica dental Sonrisa Viva, con el titular «Cuidamos tu sonrisa sin miedo»" },
  { src: "/galeria/diseno-14.jpg", alt: "Portada de la web de TradeVisión Academy, con el titular «Aprende a operar tu propio futuro»" },
  { src: "/galeria/diseno-15.jpg", alt: "Portada de la web de Voltix, con el titular «Ingeniería electrónica a medida y a tiempo»" },
  { src: "/galeria/diseno-16.jpg", alt: "Portada de la web de Rumbo Salvaje, con el titular «Expediciones guiadas con todo claro desde el inicio»" },
  { src: "/galeria/diseno-17.jpg", alt: "Portada de la web BLUE GROWTH en su versión de app para casas inteligentes, con el titular «Tu casa, más simple»" },
];
const N = DISENOS.length;

const ANCHO = 0.82; // ancho de la tarjeta de delante respecto al ancho de la pantalla
const ESCALON = 0.055; // cuánto más estrecha es cada tarjeta que la anterior de la pila
const FRANJA = 0.045; // lo que asoma de cada tarjeta de la pila (en anchos de pantalla)
const ASPECTO = 9 / 16;

const ESPERA = 1.4; // s con la pila quieta
const MOVER = 1.0; // s que dura el relevo
const CICLO = ESPERA + MOVER;
const VUELTA = N * CICLO; // s hasta completar una vuelta
const REORG = 1.6; // s de recogida y apertura de la pila
const TOTAL = VUELTA + REORG;

const suave = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2); // easeInOutCubic
const salida = (x: number) => 1 - Math.pow(1 - x, 3); // easeOutCubic
const tramo = (x: number) => Math.min(1, Math.max(0, x));

export function PilaDisenos({ pausaSi }: { pausaSi?: () => boolean }) {
  const caja = useRef<HTMLDivElement>(null);
  const tarjetas = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const cont = caja.current;
    if (!cont) return;

    let W = 0;
    let H = 0;
    const medir = () => {
      // tamaño de maquetación (no lo altera la escala de la tablet)
      W = cont.offsetWidth;
      H = cont.offsetHeight;
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(cont);

    let visible = false;
    let inicio = performance.now() / 1000 - (VUELTA + 0.2); // empieza con la pila recogida, como el vídeo
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !visible) inicio = performance.now() / 1000 - (VUELTA + 0.2);
        visible = e.isIntersecting;
      },
      { rootMargin: "80px" },
    );
    io.observe(cont);

    let raf = 0;
    const pinta = () => {
      raf = requestAnimationFrame(pinta);
      if (!visible || document.hidden || (pausaSi && pausaSi()) || W === 0 || H === 0) return;

      const t = (performance.now() / 1000 - inicio) % TOTAL;
      let idx = 0; // tarjeta que está delante
      let e = 0; // avance (0-1) del relevo en curso
      let f = 1; // 1 = pila abierta, 0 = recogida detrás de la tarjeta de delante
      if (t < VUELTA) {
        idx = Math.floor(t / CICLO);
        const dentro = t - idx * CICLO;
        if (dentro > ESPERA) e = (dentro - ESPERA) / MOVER;
      } else {
        const r = t - VUELTA;
        f = r < 0.5 ? 1 - suave(r / 0.5) : r < 0.7 ? 0 : suave(tramo((r - 0.7) / 0.9));
      }

      const cw = W * ANCHO;
      const ch = cw * ASPECTO;
      const franja = FRANJA * W * Math.min(2, Math.max(1, H / W / (4 / 3))); // en pantallas más altas (móvil) la pila se abre más
      const grupo = ch + (N - 1) * franja; // alto del conjunto con la pila abierta
      const base = (H - grupo) / 2 + ch; // borde inferior de la tarjeta de delante
      const pose = (k: number) => {
        const s = 1 - ESCALON * k * f;
        return { s, abajo: base + k * franja * f };
      };

      const viaja = suave(e);
      const pila = salida(tramo((e - 0.15) / 0.85));

      for (let c = 0; c < N; c++) {
        const el = tarjetas.current[c];
        if (!el) continue;
        const slot = (c - idx + N) % N;
        let k: number;
        let z: number;
        if (slot === 0) {
          k = viaja * (N - 1); // la de delante baja por la pila hasta el final
          z = e < 0.55 ? 200 : 0;
        } else {
          k = slot - pila; // las demás suben un puesto
          z = 100 - slot;
        }
        const { s, abajo } = pose(k);
        const x = (W - cw * s) / 2;
        const y = abajo - ch * s;
        el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
        el.style.zIndex = String(z);
        el.style.opacity = "1";
      }
    };
    raf = requestAnimationFrame(pinta);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [pausaSi]);

  return (
    <div ref={caja} className="pointer-events-none absolute inset-0 block overflow-hidden" aria-hidden>
      {DISENOS.map((d, i) => (
        <div
          key={d.src}
          ref={(el) => {
            tarjetas.current[i] = el;
          }}
          className="absolute left-0 top-0 origin-top-left overflow-hidden rounded-[10px] bg-white opacity-0 shadow-[0_10px_30px_rgba(5,20,90,0.35)] will-change-transform"
          style={{ width: `${ANCHO * 100}%`, aspectRatio: "16 / 9" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={d.src} alt={d.alt} loading="lazy" draggable={false} className="block h-full w-full object-contain" />
        </div>
      ))}
    </div>
  );
}
