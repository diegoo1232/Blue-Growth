"use client";

import { geoCentroid, geoDistance, geoOrthographic, geoPath } from "d3-geo";
import { useEffect, useRef } from "react";
import { feature, mesh } from "topojson-client";
import countries110 from "world-atlas/countries-110m.json";
import land110 from "world-atlas/land-110m.json";

// Globo terráqueo en colores planos, a modo de "motion graphic". Recorre dos países con un señalador rojo cada uno:
// Venezuela y Brasil. El globo gira hasta Venezuela, se acerca (zoom in) hasta que el país casi toca los bordes de la
// pantalla mientras aparecen poco a poco las líneas que separan los países, se queda 2 s, y se aleja (zoom out) con el
// mismo movimiento a la inversa. Después gira un poco hasta Brasil y repite lo mismo. Al acabar da una vuelta y empieza de nuevo.
// Dibujado con datos de Natural Earth (dominio público). Va centrado dentro de la pantalla de la tablet o del teléfono,
// sin fondo propio (se ve el azul del dispositivo). Se adapta solo al tamaño de la pantalla.

const LAT_CENTRO = 18; // inclinación del eje hacia nosotros cuando no hay zoom
const FRACCION = 0.86; // sin zoom, el globo ocupa el 86 % del lado menor de la pantalla: grande, pero sin tocar los bordes
const AJUSTE = 0.94; // con zoom, el país llega al 94 % del ancho o alto de la pantalla (casi toca las orillas)

const OCEANO = "#2a2a42";
const TIERRA = "#eae6d4";
const FRONTERA = "rgba(42, 42, 66, 0.8)"; // línea entre países
const SOMBRA = "rgba(8, 8, 26, 0.2)"; // creciente del lado derecho: la tierra pasa a gris, el océano a un tono más oscuro
const PIN = "#d6353b";
const PIN_SOMBRA = "#bb2a31";
const PIN_PUNTO = "#eee8da";

// ── Línea de tiempo (segundos) ───────────────────────────────────────────────────────────────────────────────────────
const T = {
  llegaV: 1.8, // el globo llega a Venezuela
  zoomIn1: [1.8, 3.4],
  espera1: [3.4, 5.4], // 2 s quieto con el zoom hecho
  zoomOut1: [5.4, 7.0],
  giro: [7.0, 8.4], // de Venezuela a Brasil
  zoomIn2: [8.4, 10.0],
  espera2: [10.0, 12.0],
  zoomOut2: [12.0, 13.6],
  vuelta: [13.6, 16.6], // da la vuelta al mundo hasta el punto de partida
} as const;
const TOTAL = 16.6;
const SALTO_INICIO = 110; // grados al oeste de Venezuela desde donde arranca el giro

const ENTRADA = 0.26; // el señalador aparece con rebote
const SALIDA = 0.3;
const PINES = {
  venezuela: { aparece: 1.2, desaparece: 13.9 },
  brasil: { aparece: 7.4, desaparece: 13.9 },
};

const suave = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2); // easeInOutCubic
const tramo = (t: number, [a, b]: readonly [number, number]) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const mezcla = (a: number, b: number, k: number) => a + (b - a) * k;
const rebote = (t: number) => {
  // easeOutBack: sobrepasa un poco el tamaño final y se asienta
  const c1 = 1.9;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const escalaPin = (t: number, { aparece, desaparece }: { aparece: number; desaparece: number }) => {
  if (t < aparece) return 0;
  if (t < aparece + ENTRADA) return Math.max(0, rebote((t - aparece) / ENTRADA));
  if (t < desaparece) return 1;
  if (t < desaparece + SALIDA) return 1 - (t - desaparece) / SALIDA;
  return 0;
};

// ── Datos ────────────────────────────────────────────────────────────────────────────────────────────────────────────
type Pieza = { g: never; b: [number, number, number, number] }; // trozo del mapa y su caja [oeste, sur, este, norte]
function caja(coords: unknown): [number, number, number, number] {
  let a = 1e9;
  let b = 1e9;
  let d = -1e9;
  let e = -1e9;
  const recorre = (p: unknown) => {
    const q = p as number[] | unknown[];
    if (typeof q[0] === "number") {
      const [x, y] = q as number[];
      a = Math.min(a, x);
      d = Math.max(d, x);
      b = Math.min(b, y);
      e = Math.max(e, y);
    } else (q as unknown[]).forEach(recorre);
  };
  recorre(coords);
  return [a, b, d, e];
}
function construir(land: unknown, countries: unknown, troceado = false) {
  const tierras = feature(land as never, (land as { objects: { land: never } }).objects.land);
  const fronteras = mesh(
    countries as never,
    (countries as unknown as { objects: { countries: never } }).objects.countries,
    (a, b) => a !== b,
  );
  let pols: Pieza[] = [];
  let lineas: Pieza[] = [];
  if (troceado) {
    // El mapa detallado se trocea en islas/países sueltos, cada uno con su caja: con zoom solo se dibuja lo que se ve
    const geoms = ((tierras as unknown as { features?: { geometry: { type: string; coordinates: unknown[] } }[]; geometry?: { type: string; coordinates: unknown[] } }).features ??
      [(tierras as unknown as { geometry: { type: string; coordinates: unknown[] } })]).map((f) => ("geometry" in f ? f.geometry : f));
    const poligonos = geoms.flatMap((g) => (g.type === "MultiPolygon" ? g.coordinates : [g.coordinates]));
    pols = poligonos.map((co) => ({ g: { type: "Polygon", coordinates: co } as never, b: caja(co) }));
    lineas = (fronteras as unknown as { coordinates: unknown[] }).coordinates.map((co) => ({
      g: { type: "LineString", coordinates: co } as never,
      b: caja(co),
    }));
  }
  return { tierras, fronteras, pols, lineas };
}
type Datos = ReturnType<typeof construir>;

// De todas las piezas, las que caen dentro del casquete visible (centro lon/lat y radio angular `th`, en radianes)
function visibles(piezas: Pieza[], lon: number, lat: number, th: number) {
  const D = 180 / Math.PI;
  const lat0 = lat - th * D;
  const lat1 = lat + th * D;
  const dl = lat0 <= -90 || lat1 >= 90 ? 180 : Math.min(180, (th * D) / Math.cos((Math.max(Math.abs(lat0), Math.abs(lat1)) * Math.PI) / 180));
  return piezas.filter((p) => p.b[3] >= lat0 && p.b[1] <= lat1 && (dl >= 180 || (p.b[2] >= lon - dl && p.b[0] <= lon + dl) || p.b[2] - p.b[0] > 180));
}

// Versión ligera (incluida en la página): sirve para empezar y para calcular dónde está cada país.
const datos110: Datos = construir(land110, countries110);
const paises = (feature(countries110 as never, (countries110 as unknown as { objects: { countries: never } }).objects.countries) as unknown as {
  features: { id?: string | number; properties: { name: string } }[];
}).features;
const buscaPais = (nombre: string) => paises.find((p) => p.properties.name === nombre)!;
const VENEZUELA = buscaPais("Venezuela");
const BRASIL = buscaPais("Brazil");
const centroV = geoCentroid(VENEZUELA as never); // [lon, lat]
const centroB = geoCentroid(BRASIL as never);

// Cuánto hay que acercarse (veces el radio del globo) para que el país casi toque los bordes de la pantalla
function zoomPara(pais: unknown, centro: [number, number], R0: number, W: number, H: number) {
  const p = geoOrthographic().rotate([-centro[0], -centro[1]]).scale(R0).translate([0, 0]).clipAngle(90);
  const [[x0, y0], [x1, y1]] = geoPath(p).bounds(pais as never);
  const mitadAncho = Math.max(Math.abs(x0), Math.abs(x1));
  const mitadAlto = Math.max(Math.abs(y0), Math.abs(y1));
  return Math.min(16, Math.max(1.5, Math.min((W / 2) * AJUSTE / mitadAncho, (H / 2) * AJUSTE / mitadAlto)));
}

export function GloboMapa({ pausaSi }: { pausaSi?: () => boolean }) {
  const caja = useRef<HTMLDivElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cont = caja.current;
    const cv = lienzo.current;
    if (!cont || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let W = 0; // tamaño del lienzo en px CSS: toda la pantalla (para que el zoom llegue a las orillas)
    let H = 0;
    let R0 = 0; // radio del globo sin zoom
    let zoomV = 4;
    let zoomB = 2;
    let dpr = 1;
    const medir = () => {
      // tamaño de maquetación (offsetWidth/Height): no lo altera la escala de la tablet
      W = cont.offsetWidth;
      H = cont.offsetHeight;
      R0 = Math.floor(Math.min(W, H) * FRACCION) / 2;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.style.width = `${W}px`;
      cv.style.height = `${H}px`;
      cv.width = Math.max(1, Math.round(W * dpr));
      cv.height = Math.max(1, Math.round(H * dpr));
      if (R0 > 0) {
        zoomV = zoomPara(VENEZUELA, centroV, R0, W, H);
        zoomB = zoomPara(BRASIL, centroB, R0, W, H);
      }
    };
    medir();
    // se vuelve a medir cada vez que cambia el tamaño de la pantalla (la tablet puede tomar su tamaño final después)
    const ro = new ResizeObserver(medir);
    ro.observe(cont);

    // Mapa detallado (50 m): se carga aparte, sin retrasar la página, y reemplaza al ligero en cuanto llega.
    let fino: Datos | null = null;
    let vivo = true;
    Promise.all([import("world-atlas/land-50m.json"), import("world-atlas/countries-50m.json")])
      .then(([l, c]) => {
        if (vivo) fino = construir(l.default, c.default, true);
      })
      .catch(() => {});

    let visible = false;
    let inicio = performance.now() / 1000;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !visible) inicio = performance.now() / 1000; // cada vez que se ve, empieza desde el principio
        visible = e.isIntersecting;
      },
      { rootMargin: "80px" },
    );
    io.observe(cont);

    const lonInicio = centroV[0] - SALTO_INICIO;

    let raf = 0;
    const pinta = () => {
      raf = requestAnimationFrame(pinta);
      if (!visible || document.hidden || (pausaSi && pausaSi()) || W === 0 || H === 0 || R0 === 0) return;
      const t = (performance.now() / 1000 - inicio) % TOTAL;

      // 1) hacia dónde mira el globo y cuánto zoom lleva
      let lon: number;
      let e = 0; // avance del zoom, de 0 (sin zoom) a 1 (zoom completo)
      let objetivo = centroV;
      let zoom = zoomV;
      if (t < T.llegaV) {
        lon = mezcla(lonInicio, centroV[0], suave(t / T.llegaV));
      } else if (t < T.zoomOut1[1]) {
        lon = centroV[0];
        e = t < T.espera1[0] ? suave(tramo(t, T.zoomIn1)) : t < T.espera1[1] ? 1 : 1 - suave(tramo(t, T.zoomOut1));
      } else if (t < T.giro[1]) {
        lon = mezcla(centroV[0], centroB[0], suave(tramo(t, T.giro)));
        objetivo = centroB;
        zoom = zoomB;
      } else if (t < T.zoomOut2[1]) {
        lon = centroB[0];
        objetivo = centroB;
        zoom = zoomB;
        e = t < T.espera2[0] ? suave(tramo(t, T.zoomIn2)) : t < T.espera2[1] ? 1 : 1 - suave(tramo(t, T.zoomOut2));
      } else {
        lon = mezcla(centroB[0], lonInicio + 360, suave(tramo(t, T.vuelta)));
        objetivo = centroB;
        zoom = zoomB;
      }
      const lat = mezcla(LAT_CENTRO, objetivo[1], e);
      const R = R0 * Math.pow(zoom, e); // el zoom crece de forma pareja (exponencial), sin acelerones
      const cx = W / 2;
      const cy = H / 2;

      // con mucho zoom solo se dibuja la parte del globo que cabe en pantalla
      const mitadDiagonal = Math.hypot(W, H) / 2;
      const clip = mitadDiagonal >= R ? 90 : Math.min(90, (Math.asin(mitadDiagonal / R) * 180) / Math.PI + 4);
      const proy = geoOrthographic().scale(R).translate([cx, cy]).clipAngle(clip).rotate([-lon, -lat, 0]);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // océano
      ctx.fillStyle = OCEANO;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // tierras
      // (sin zoom, el mapa ligero; con zoom, el detallado, y solo las piezas que se ven, para que vaya fluido)
      const mapaFino = clip < 45 ? fino : null; // el mapa detallado, solo cuando ya se ha cargado y hay zoom
      const detalle = mapaFino !== null;
      const trazo = geoPath(proy, ctx);
      const th = (clip * Math.PI) / 180;
      ctx.fillStyle = TIERRA;
      ctx.beginPath();
      if (detalle) for (const p of visibles(mapaFino!.pols, lon, lat, th)) trazo(p.g);
      else trazo(datos110.tierras as never);
      ctx.fill();

      // líneas entre países: se van mostrando a medida que crece el zoom
      const verLineas = Math.min(1, Math.max(0, (e - 0.06) / 0.7));
      if (verLineas > 0.01) {
        ctx.save();
        ctx.globalAlpha = verLineas;
        ctx.strokeStyle = FRONTERA;
        ctx.lineWidth = 0.7 + 0.9 * verLineas;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        if (detalle) for (const p of visibles(mapaFino!.lineas, lon, lat, th)) trazo(p.g);
        else trazo(datos110.fronteras as never);
        ctx.stroke();
        ctx.restore();
      }

      // creciente de sombra en el lado derecho (todo lo que queda fuera de un círculo igual desplazado a la izquierda)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();
      ctx.beginPath();
      ctx.rect(0, 0, W, H);
      ctx.arc(cx - R * 0.125, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = SOMBRA;
      ctx.fill("evenodd");
      ctx.restore();

      // señaladores: siempre del mismo tamaño (no crecen con el zoom), con la punta en el centro de cada país
      const radioCabeza = R0 * 0.124;
      const centro: [number, number] = [lon, lat];
      const lista: [[number, number], { aparece: number; desaparece: number }][] = [
        [centroV, PINES.venezuela],
        [centroB, PINES.brasil],
      ];
      for (const [p, tiempos] of lista) {
        const k = escalaPin(t, tiempos);
        if (k <= 0.001) continue;
        if (geoDistance(p, centro) > Math.PI / 2 - 0.08) continue; // al otro lado del globo
        const xy = proy(p);
        if (!xy) continue;
        dibujaPin(ctx, xy[0], xy[1], radioCabeza * k);
      }
    };
    raf = requestAnimationFrame(pinta);

    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [pausaSi]);

  return (
    <div ref={caja} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <canvas ref={lienzo} className="block" />
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
