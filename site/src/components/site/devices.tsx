"use client";

import { animate, motion, useAnimationFrame, useMotionValue } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";
import { devices } from "./device-art";

const equipos = [
  { art: devices.camara, name: ["Cámara", "exterior"] },
  { art: devices.robot, name: ["Robot", "aspirador"] },
  { art: devices.bombilla, name: ["Bombilla", "inteligente"] },
  { art: devices.router, name: ["Router", "wifi"] },
  { art: devices.termostato, name: ["Termostato", "conectado"] },
  { art: devices.cerradura, name: ["Cerradura", "digital"] },
  { art: devices.sensor, name: ["Sensor de", "movimiento"] },
  { art: devices.altavoz, name: ["Altavoz", "multisala"] },
];

const VELOCIDAD = 40; // píxeles por segundo: el carrusel avanza solo, sin necesidad de scroll
const COPIAS = 3; // el conjunto se repite para que el bucle no tenga huecos ni saltos

// Carrusel automático en bucle infinito. Se pausa al pasar el ratón; las flechas lo adelantan o
// lo retrasan dos tarjetas con una transición suave y luego sigue solo.
export function Devices() {
  const x = useMotionValue(0);
  const grupo = useRef<HTMLDivElement>(null);
  const pausa = useRef(false);
  const animando = useRef(false);

  useAnimationFrame((_, delta) => {
    const ancho = grupo.current?.offsetWidth ?? 0;
    if (!ancho || animando.current) return;
    let v = x.get();
    if (!pausa.current) v -= (VELOCIDAD * Math.min(delta, 64)) / 1000;
    if (v <= -ancho) v += ancho;
    x.set(v);
  });

  const mover = (dir: 1 | -1) => {
    const ancho = grupo.current?.offsetWidth ?? 0;
    const tarjeta = grupo.current?.querySelector("article");
    if (!ancho || !tarjeta) return;
    const paso = (tarjeta.clientWidth + 16) * 2;
    // al retroceder, se parte de la copia siguiente para no mostrar un hueco a la izquierda
    if (dir === -1 && x.get() > -paso) x.set(x.get() - ancho);
    animando.current = true;
    animate(x, x.get() - dir * paso, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => {
        animando.current = false;
        let v = x.get();
        while (v <= -ancho) v += ancho;
        x.set(v);
      },
    });
  };

  return (
    <section id="dispositivos" className="bg-niebla py-24 md:py-28">
      <div className="mx-auto w-full max-w-[1120px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-end justify-between"
        >
          <h2 className="text-[44px] font-medium leading-[0.98] tracking-[-0.045em] text-ink md:text-[60px]">
            Conecta tus
            <br />
            dispositivos
          </h2>
          <div className="mb-1 flex gap-2">
            <button
              type="button"
              onClick={() => mover(-1)}
              aria-label="Anterior"
              className="grid size-8 place-items-center rounded-full bg-azul-claro text-azul transition duration-300 hover:scale-110 hover:bg-azul hover:text-white"
            >
              <ArrowLeft className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => mover(1)}
              aria-label="Siguiente"
              className="grid size-8 place-items-center rounded-full bg-azul text-white shadow-[0_8px_20px_-8px_rgb(29_91_255/0.9)] transition duration-300 hover:scale-110 hover:bg-[#1546d6]"
            >
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="mt-10 w-full overflow-hidden py-6"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        onPointerEnter={() => (pausa.current = true)}
        onPointerLeave={() => (pausa.current = false)}
      >
        <motion.div style={{ x }} className="flex w-max pl-6 md:pl-[max(24px,calc((100vw_-_1120px)/2_+_24px))]">
          {Array.from({ length: COPIAS }, (_, c) => (
            <div
              key={c}
              ref={c === 0 ? grupo : undefined}
              className="flex gap-4 pr-4"
              aria-hidden={c > 0 || undefined}
            >
              {equipos.map(({ art, name }, i) => (
                <article
                  key={name.join()}
                  {...(c === 0
                    ? { "data-slot": `equipo-${i + 1}`, "data-slot-type": "device-photo", "data-slot-spec": "foto de producto cuadrada, fondo blanco" }
                    : {})}
                  className="group flex h-[200px] w-[150px] shrink-0 flex-col justify-between rounded-2xl bg-white p-4 shadow-[0_20px_44px_-30px_rgb(20_22_27/0.4)] transition-shadow duration-300 ease-out hover:shadow-[0_28px_50px_-24px_rgb(29_91_255/0.45)] md:h-[220px] md:w-[170px] md:p-5"
                >
                  <div className="size-[96px] transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-110 md:size-[104px]">
                    {art}
                  </div>
                  <p className="text-[13px] font-medium leading-tight text-ink">
                    {name[0]}
                    <br />
                    {name[1]}
                  </p>
                </article>
              ))}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
