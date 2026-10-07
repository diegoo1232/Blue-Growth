"use client";

import { geoDistance, geoOrthographic, geoPath } from "d3-geo";
import { useEffect, useRef } from "react";
import { feature } from "topojson-client";
import land110 from "world-atlas/land-110m.json";

// Globo terráqueo en colores planos, a modo de "motion graphic": gira de oeste a este una vuelta completa cada
// PERIODO segundos (el final enlaza con el principio, en bucle) y van apareciendo, con un pequeño rebote, señaladores de
// ubicación rojos que se quedan un instante y desaparecen. Dibujado desde cero con datos de tierras de Natural Earth
// (dominio público). Va centrado dentro de la pantalla de la tablet, sin fondo propio (se ve el azul de la tablet).
// Se ve en la tablet (escritorio) y en el teléfono (móvil): se adapta solo al tamaño de la pantalla.

const PERIODO = 6.15; // segundos por vuelta completa
// Longitud que queda al frente (centro del globo) en cada instante, medida sobre el vídeo de referencia: el giro no es
// perfectamente uniforme, así que se interpola suavemente entre estos puntos. El último (t = PERIODO) equivale al primero
// más 360°, de modo que el bucle no tiene salto.
const GIRO: [number, number][] = [
  [0, -25], // Atlántico: América a la izquierda, Europa y África a la derecha
  [0.35, 10],
  [0.9, 67],
  [1.8, 112],
  [2.6, 152],
  [3.5, 180],
  [4.5, 245],
  [5.5, 312],
  [PERIODO, 335], // = -25 + 360: igual que el primer fotograma, el bucle no tiene salto
];
function longitudEn(t: number) {
  // spline Catmull-Rom entre los puntos de GIRO (velocidad continua, sin sacudidas)
  let i = GIRO.findIndex((p) => p[0] > t) - 1;
  if (i < 0) i = GIRO.length - 2;
  const p0 = GIRO[Math.max(0, i - 1)];
  const p1 = GIRO[i];
  const p2 = GIRO[i + 1];
  const p3 = GIRO[Math.min(GIRO.length - 1, i + 2)];
  const h = p2[0] - p1[0];
  const u = (t - p1[0]) / h;
  const m1 = ((p2[1] - p0[1]) / (p2[0] - p0[0])) * h;
  const m2 = ((p3[1] - p1[1]) / (p3[0] - p1[0])) * h;
  const u2 = u * u;
  const u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * p1[1] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * p2[1] + (u3 - u2) * m2;
}
const LAT_CENTRO = 28; // inclinación del eje hacia nosotros: se ve algo más del hemisferio norte
const INCLINACION = 0; // giro del eje sobre sí mismo, en grados (como un globo de escritorio con el eje torcido)
const FRACCION = 0.86; // el globo ocupa el 86 % del lado menor de la pantalla: grande, pero sin tocar los bordes

const OCEANO = "#2a2a42";
const TIERRA = "#eae6d4";
const SOMBRA = "rgba(8, 8, 26, 0.2)"; // creciente del lado derecho: la tierra pasa a gris, el océano a un tono más oscuro
const PIN = "#d6353b";
const PIN_SOMBRA = "#bb2a31";
const PIN_PUNTO = "#eee8da";

// Señaladores: lugar, instante (s) en que aparecen, y cuánto duran visibles
const PINES = [
  { lon: -5, lat: 37, t0: 0.08, permanencia: 0.12 }, // España y el norte de África (breve: abre el bucle)
  { lon: 66, lat: 57, t0: 0.62 }, // Rusia
  { lon: 113, lat: 34, t0: 0.8 }, // China
  { lon: -150, lat: 63, t0: 3.38 }, // Alaska
  { lon: -98, lat: 38, t0: 4.2 }, // centro de EE. UU.
];
const ENTRADA = 0.26; // segundos que tarda en aparecer (con rebote)
const PERMANENCIA = 0.46; // segundos que se queda
const SALIDA = 0.2; // segundos que tarda en desaparecer

const salidaRebote = (t: number) => {
  // easeOutBack: sobrepasa un poco el tamaño final y se asienta
  const c1 = 1.9;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

function escalaPin(t: number, t0: number, permanencia = PERMANENCIA) {
  const dt = ((t - t0) % PERIODO + PERIODO) % PERIODO;
  if (dt < ENTRADA) return Math.max(0, salidaRebote(dt / ENTRADA));
  if (dt < ENTRADA + permanencia) return 1;
  if (dt < ENTRADA + permanencia + SALIDA) return 1 - (dt - ENTRADA - permanencia) / SALIDA;
  return 0;
}

const tierras = feature(land110 as never, (land110 as never as { objects: { land: never } }).objects.land);

export function GloboMapa({ pausaSi }: { pausaSi?: () => boolean }) {
  const caja = useRef<HTMLDivElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cont = caja.current;
    const cv = lienzo.current;
    if (!cont || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let lado = 0; // tamaño del lienzo en px CSS
    let dpr = 1;
    const medir = () => {
      // tamaño de maquetación (offsetWidth/Height): no lo altera la escala de la tablet
      lado = Math.floor(Math.min(cont.offsetWidth, cont.offsetHeight) * FRACCION);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.style.width = `${lado}px`;
      cv.style.height = `${lado}px`;
      cv.width = Math.max(1, Math.round(lado * dpr));
      cv.height = Math.max(1, Math.round(lado * dpr));
    };
    medir();
    // se vuelve a medir cada vez que cambia el tamaño de la pantalla (la tablet puede tomar su tamaño final después)
    const ro = new ResizeObserver(medir);
    ro.observe(cont);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "80px" });
    io.observe(cont);

    let raf = 0;
    const pinta = () => {
      raf = requestAnimationFrame(pinta);
      if (!visible || document.hidden || (pausaSi && pausaSi()) || lado === 0) return;
      const t = (performance.now() / 1000) % PERIODO;
      const lon = longitudEn(t);
      const R = lado / 2;
      const proy = geoOrthographic().scale(R).translate([R, R]).clipAngle(90).rotate([-lon, -LAT_CENTRO, INCLINACION]);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, lado, lado);

      // océano
      ctx.fillStyle = OCEANO;
      ctx.beginPath();
      ctx.arc(R, R, R, 0, Math.PI * 2);
      ctx.fill();

      // tierras
      ctx.fillStyle = TIERRA;
      ctx.beginPath();
      geoPath(proy, ctx)(tierras);
      ctx.fill();

      // creciente de sombra en el lado derecho (todo lo que queda fuera de un círculo igual desplazado a la izquierda)
      ctx.save();
      ctx.beginPath();
      ctx.arc(R, R, R, 0, Math.PI * 2);
      ctx.clip();
      ctx.beginPath();
      ctx.rect(0, 0, lado, lado);
      ctx.arc(R - R * 0.125, R, R, 0, Math.PI * 2);
      ctx.fillStyle = SOMBRA;
      ctx.fill("evenodd");
      ctx.restore();

      // señaladores
      const centro: [number, number] = [lon, LAT_CENTRO];
      const radioCabeza = lado * 0.062;
      for (const p of PINES) {
        const k = escalaPin(t, p.t0, p.permanencia);
        if (k <= 0.001) continue;
        if (geoDistance([p.lon, p.lat], centro) > Math.PI / 2 - 0.08) continue; // al otro lado del globo
        const xy = proy([p.lon, p.lat]);
        if (!xy) continue;
        dibujaPin(ctx, xy[0], xy[1], radioCabeza * k);
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
    <div ref={caja} className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden>
      <canvas ref={lienzo} />
    </div>
  );
}

// Señalador en forma de gota, con la punta clavada en (x, y), un punto claro en la cabeza y la mitad derecha más oscura.
function dibujaPin(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  if (r < 0.5) return;
  const cx = x;
  const cy = y - r * 1.95; // centro de la cabeza
  const gota = new Path2D();
  gota.moveTo(x, y);
  gota.bezierCurveTo(x - r * 0.35, y - r * 0.8, cx - r, cy + r * 0.55, cx - r, cy);
  gota.arc(cx, cy, r, Math.PI, 0, false);
  gota.bezierCurveTo(cx + r, cy + r * 0.55, x + r * 0.35, y - r * 0.8, x, y);
  gota.closePath();

  ctx.save();
  ctx.fillStyle = PIN;
  ctx.fill(gota);
  // mitad derecha algo más oscura (dos tonos planos)
  ctx.clip(gota);
  ctx.fillStyle = PIN_SOMBRA;
  ctx.fillRect(cx + r * 0.12, cy - r * 1.2, r * 1.2, r * 3.4);
  ctx.restore();

  ctx.fillStyle = PIN_PUNTO;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
  ctx.fill();
}
