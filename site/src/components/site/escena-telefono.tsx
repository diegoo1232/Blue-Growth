"use client";

import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
import { Accessibility, Palette, Smartphone, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { blanqueo, progresoEscena } from "./blanqueo";
import { acumular, control2, control3, EVENTO_SINCRONIZAR, intencionMinima, modoSalto, salida2 } from "./estado-telefonos";
import { GaleriaDisenos } from "./galeria-disenos";
import { PilaDisenos } from "./pila-disenos";

// La pila se detiene mientras la tablet de la escena está fuera
const pausarPila = () => salida2.get() > 0.99;
import { Phone } from "./phone";

const ease = [0.22, 1, 0.36, 1] as const;

const FRASE = "Blue Growth ·";
const VELOCIDAD = 60; // píxeles por segundo de la cinta de texto cuando la página está quieta
const EMPUJE_SCROLL = 900; // píxeles extra que añade recorrer la escena con el scroll

// Tamaño del teléfono al principio (en la portada), en píxeles de ancho
const ANCHO_INICIAL_MOVIL = 190;
const ANCHO_INICIAL_ESCRITORIO = 330; // tablet (en móvil, el teléfono de 190 px)

// Reparto de la transición, en píxeles de scroll medidos desde el momento en que la escena se fija
// (0 = justo al fijarse; negativo = un poco antes). El teléfono empieza a crecer ya antes de fijarse
// y la cortina del formulario barre mientras crece: cuando el teléfono casi ha alcanzado su tamaño final
// (hacia los 90 px) el formulario ya está completo.
const CRECE_DESDE = -40;
const CRECE_HASTA = 300;
const FORM_DESDE = -30;
const FORM_HASTA = 70;
// TRANSICIÓN AUTOMÁTICA de la portada al destino (teléfono a la derecha con los textos): al llegar a este punto de
// scroll arranca sola y se completa en DURACION_TRANSICION segundos, vaya el scroll rápido, lento o se detenga. Es
// independiente de cuánto se scrollee. Bajando y cruzando el punto avanza; subiendo y cruzándolo vuelve al revés.
// Toda la coreografía de abajo (crecer, moverse, barrido, etiquetas, textos…) está escrita en "píxeles de avance"
// virtuales entre EFECTO_DESDE (portada) y EFECTO_HASTA (destino); el tiempo los recorre.
const DISPARO_TRANSICION = -60; // px de avance en que se dispara al BAJAR: justo ANTES de fijarse la escena, mientras la portada aún se ve
// La vuelta (al subir) arranca MUCHO antes y es más ágil: si no, al subir con la escena ya saliendo el teléfono seguía
// casi en el destino. Entre ambos puntos manda la dirección del scroll.
const DISPARO_VUELTA = 330; // px de avance por debajo de los que, al SUBIR, vuelve a la portada
const DURACION_TRANSICION = 1.8; // segundos (ida)
const DURACION_VUELTA = 1.4; // segundos (vuelta)
const EASE_TRANSICION = [0.4, 0, 0.2, 1] as const;
const EFECTO_DESDE = -120;
const EFECTO_HASTA = 560;
// Recorrido del teléfono hacia la derecha: cae primero y se curva hacia su sitio (lo manda el scroll)
const MOVE_DESDE = 100;
const MOVE_HASTA = 560;
// MÓVIL: de la portada al destino (teléfono a la derecha con los textos) en UN SOLO movimiento, sin parada
// intermedia con el teléfono grande y centrado: crece, cae y se desplaza a la vez, con el mismo ritmo, y el
// barrido de la galería a azul liso ocurre durante el trayecto. Escritorio conserva sus tramos de siempre.
const MOVIL_DESDE = -40;
const MOVIL_HASTA = MOVE_HASTA;
const MOVIL_BARRIDO_DESDE = 120;
const MOVIL_BARRIDO_HASTA = 320;
// Salida del teléfono: al pasar este punto de scroll se encoge un 15 %, gira un poco y sale de la pantalla por la derecha.
// Es una animación AUTOMÁTICA (no sigue al scroll): se completa sola y al volver hacia arriba se repite al revés.
const UMBRAL_SALIDA = 560; // móvil: justo cuando se suelta la escena (con su recorrido móvil de 560 px)
// Escritorio: sale más tarde, ya con la escena soltada y subiendo (90 px por encima de su posición fija)
const UMBRAL_SALIDA_ESCRITORIO = 576; // 480 + 20 %: ~176 px después de soltarse la escena
const umbralSalida = () => (typeof window !== "undefined" && window.innerWidth >= 768 ? UMBRAL_SALIDA_ESCRITORIO : UMBRAL_SALIDA);
// Al subir, el teléfono reaparece en cuanto la escena vuelve a verse (≈ un 72 % de la pantalla), sin esperar a
// llegar al punto de salida: la dirección del scroll decide si sale (bajando) o vuelve (subiendo).
const UMBRAL_REGRESO = 668; // igual en móvil y escritorio: la escena aún ~270 px fuera por arriba
export const DURACION_SALIDA = 0.875; // segundos (0,7 + 25 %)
export const ENCOGE_SALIDA = 0.15;
export const GIRO_SALIDA = 7.2; // grados (leve), mientras sale de la pantalla
// Scroll que dura la escena fijada: transición + recorrido + teléfono quieto, y se suelta justo después de
// cruzar el umbral de salida (sin colchón de scroll en el que no pase nada): la página sigue bajando enseguida.
// Recorrido fijo MODERADO: la transición es automática (no necesita scroll para avanzar), así que este tramo solo da
    // tiempo a verla y a ver el destino un momento. Antes 732 px (≈7 muescas, demasiado); con 260 px (≈2-3) el
    // teléfono se iba con una sola muesca desde que llegaba. Ahora 400 px (≈4).
const RECORRIDO_FIJADO = 400; // escritorio: la escena se suelta aquí
// MÓVIL: más margen. Con el dedo, deslizar ~1,5 cm (con la inercia de iOS suelen ser 200-300 px) no debe sacar el
// teléfono: desde que llega a su sitio le queda ≈ 360 px de recorrido antes de la salida (antes ≈ 180).
const RECORRIDO_FIJADO_MOVIL = 560;
// Ancho (en % de la altura de la pantalla del teléfono) del borde difuminado de la cortina
const BORDE_CORTINA = 8;

control2.configurar(DURACION_SALIDA, [...ease]);
control3.configurar(DURACION_SALIDA, [...ease]);

const tramo = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));
const suave = (t: number) => t * t * (3 - 2 * t);
// arranque inmediato y frenada final suave: el teléfono responde al scroll desde el primer píxel
const sale = (t: number) => 1 - Math.pow(1 - t, 3);

// Etiquetas alrededor del teléfono: posición respecto al centro de la escena
const chips = [
  { icon: Palette, text: ["Diseño", "a medida"], lado: 1, pos: "left-[calc(50%+70px)] top-[calc(50%-165px)] md:left-[calc(50%+200px)] md:top-[calc(50%-216px)]", d: 1.0, f: "-1.4s" },
  { icon: Smartphone, text: ["Adaptada", "a móvil"], lado: -1, pos: "right-[calc(50%+60px)] top-[calc(50%-80px)] md:right-[calc(50%+200px)] md:top-[calc(50%-108px)]", d: 1.1, f: "0s" },
  { icon: Zap, text: ["Carga", "ultrarrápida"], lado: 1, pos: "left-[calc(50%+80px)] top-[calc(50%-28px)] md:left-[calc(50%+260px)] md:top-[calc(50%-36px)]", d: 1.2, f: "-3.5s" },
  { icon: Accessibility, text: ["Accesible", "para todos"], lado: -1, pos: "right-[calc(50%+70px)] top-[calc(50%+28px)] md:right-[calc(50%+300px)] md:top-[calc(50%+36px)]", d: 1.3, f: "-2.6s" },
];

function Etiqueta({
  c,
  avance,
}: {
  c: (typeof chips)[number];
  avance: ReturnType<typeof useMotionValue<number>>;
}) {
  const Icon = c.icon;
  // al crecer el teléfono, las etiquetas se alejan hacia su lado y se desvanecen
  const opacity = useTransform(avance, (v) => 1 - suave(tramo(v, -100, 90)));
  const x = useTransform(avance, (v) => c.lado * 160 * suave(tramo(v, -100, 120)));
  return (
    <motion.div style={{ opacity, x }} className={`pointer-events-none absolute z-20 ${c.pos}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.6, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 18, delay: c.d }}
      >
        <div
          className="flotar flex items-center gap-2.5 rounded-2xl bg-white/85 py-2 pl-2 pr-3.5 shadow-[0_22px_44px_-16px_rgb(20_22_27/0.25)] backdrop-blur-md md:gap-3 md:py-2.5 md:pl-2.5 md:pr-5"
          style={{ animationDelay: c.f }}
        >
          <span className="grid size-7 place-items-center rounded-lg bg-azul text-white shadow-[0_6px_14px_-6px_rgb(29_91_255/0.9)] md:size-9 md:rounded-xl">
            <Icon className="size-3.5 md:size-4" />
          </span>
          <span className="whitespace-nowrap text-[10px] font-medium leading-tight text-ink md:text-[12px]">
            {c.text[0]}
            <br />
            {c.text[1]}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Escena fijada: empieza justo bajo la portada con el teléfono pequeño y las etiquetas orbitando; al hacer
// scroll el teléfono crece hasta casi llenar la pantalla y un barrido de abajo arriba deja su pantalla
// en azul liso.
export function EscenaTelefono() {
  const seccion = useRef<HTMLElement>(null);
  const telefono = useRef<HTMLDivElement>(null);
  const fijada = useRef<HTMLDivElement>(null);
  const titularRef = useRef<HTMLHeadingElement>(null);
  const textoRef = useRef<HTMLParagraphElement>(null);
  // Solo móvil: posición vertical (px) del titular y del texto para que el conjunto quede centrado en la pantalla
  const [dispMovil, setDispMovil] = useState<{ titular: number; texto: number } | null>(null);

  const { scrollY } = useScroll();
  const { scrollYProgress: total } = useScroll({ target: seccion, offset: ["start end", "end end"] });

  // Avance CRUDO del scroll en píxeles desde que la escena se fija (negativo = todavía no se ha fijado). Solo sirve
  // para decidir CUÁNDO se dispara la transición y la salida del teléfono; no mueve nada directamente.
  const avanceCrudo = useMotionValue(-2000);
  const actualizar = () => avanceCrudo.set(-(seccion.current?.getBoundingClientRect().top ?? 2000));
  useMotionValueEvent(scrollY, "change", actualizar);

  // Progreso de la transición automática (0 = portada, 1 = destino), animado por tiempo
  const progreso = progresoEscena;
  const adelante = useRef(false);
  const ultimoT = useRef(0);
  const acumT = useRef(0);
  const animT = useRef<ReturnType<typeof animate> | null>(null);
  const irATransicion = (haciaDestino: boolean, inmediato = false) => {
    adelante.current = haciaDestino;
    animT.current?.stop();
    if (inmediato || modoSalto.activo) progreso.set(haciaDestino ? 1 : 0);
    else
      animT.current = animate(progreso, haciaDestino ? 1 : 0, {
        duration: haciaDestino ? DURACION_TRANSICION : DURACION_VUELTA,
        ease: [...EASE_TRANSICION],
      });
  };
  useMotionValueEvent(avanceCrudo, "change", (v) => {
    const dv = v - ultimoT.current;
    if (Math.abs(dv) < 1) return;
    ultimoT.current = v;
    const movido = acumular(acumT, dv); // lo scrolleado de verdad en esta dirección
    if (!adelante.current && dv > 0 && v > DISPARO_TRANSICION && movido >= intencionMinima()) irATransicion(true);
    else if (adelante.current && dv < 0 && v < DISPARO_VUELTA && -movido >= intencionMinima()) irATransicion(false);
  });
  // "Avance virtual" que usa toda la coreografía: recorre de EFECTO_DESDE a EFECTO_HASTA según el progreso
  const avance = useTransform(progreso, (p) => EFECTO_DESDE + p * (EFECTO_HASTA - EFECTO_DESDE));
  useEffect(() => {
    // al cargar (o si la página se restaura a mitad de la escena) arranca ya en su sitio, sin animar desde cero
    const inicial = () => {
      actualizar();
      ultimoT.current = avanceCrudo.get();
      irATransicion(avanceCrudo.get() > DISPARO_TRANSICION, true);
    };
    inicial();
    document.fonts?.ready.then(actualizar);
    window.addEventListener("resize", actualizar);
    return () => window.removeEventListener("resize", actualizar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Medidas: el teléfono está dibujado a su tamaño FINAL y se reduce por escala al principio.
  const escalaInicial = useMotionValue(0.58);
  const escalaFinal = useMotionValue(0.88);
  const modoMovil = useMotionValue(0); // 1 = móvil (transición única), 0 = escritorio
  const destinoX = useMotionValue(0); // cuánto se desplaza desde el centro hasta su sitio, en píxeles
  const destinoY = useMotionValue(0);
  const altoMaximo = useRef(0);
  const recorridoSalida = useMotionValue(600); // cuánto se desplaza a la derecha al salir: lo justo para quedar fuera de la pantalla
  useEffect(() => {
    const medir = () => {
      const w = telefono.current?.offsetWidth;
      const h = telefono.current?.offsetHeight;
      if (!w || !h) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const movil = vw < 768;
      // En el iPhone la barra del navegador se esconde al scrollear y la altura visible crece. Se toma la MAYOR altura
      // vista (así el conjunto no salta cada vez que la barra aparece o desaparece) y se usa la MISMA para el texto y
      // para el teléfono: antes cada uno usaba una distinta y, al esconderse la barra, el titular chocaba con el teléfono.
      altoMaximo.current = Math.max(altoMaximo.current, vh);
      const alto = fijada.current?.offsetHeight ?? vh;
      const H = movil ? Math.max(alto, altoMaximo.current) : vh;
      modoMovil.set(movil ? 1 : 0);
      escalaInicial.set(Math.min(1, (movil ? ANCHO_INICIAL_MOVIL : ANCHO_INICIAL_ESCRITORIO) / w));
      // Destino: en escritorio, a la derecha y un poco más abajo del centro; en móvil, abajo a la derecha y más
      // pequeño: el titular va justo encima y el texto en la columna de su izquierda.
      const sf = movil ? 0.54 : 0.88;
      escalaFinal.set(sf);
      const cx = movil ? vw - (w * sf) / 2 - 16 : vw * 0.74;
      let cy = vh / 2 + vh * 0.03;
      if (movil) {
        // Móvil: titular + teléfono forman un bloque centrado en vertical; el texto va a la izquierda,
        // centrado con el teléfono.
        const ht = titularRef.current?.offsetHeight ?? 64;
        const hx = textoRef.current?.offsetHeight ?? 130;
        const hueco = 18; // entre el titular y el teléfono
        const hp = h * sf;
        const arriba = (H - (ht + hueco + hp)) / 2;
        cy = arriba + ht + hueco + hp / 2;
        setDispMovil({ titular: arriba, texto: cy - hx / 2 });
      } else {
        setDispMovil(null);
      }
      recorridoSalida.set(vw - cx + (w * sf) * 0.65 + 80); // incluye lo que se mete hacia dentro al encogerse y girar
      destinoX.set(cx - vw / 2);
      destinoY.set(cy - (movil ? alto : vh) / 2); // el teléfono nace en el centro del contenedor fijo (su altura "alto")
    };
    medir();
    document.fonts?.ready.then(medir); // al cargar las fuentes cambia la altura del texto
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [escalaInicial, escalaFinal, modoMovil, destinoX, destinoY, recorridoSalida]);

  const escala = useTransform(
    [avance, escalaInicial, escalaFinal, modoMovil],
    ([v, e, f, m]: number[]) =>
      m
        ? e + (f - e) * suave(tramo(v, MOVIL_DESDE, MOVIL_HASTA))
        : e + (f - e) * sale(tramo(v, CRECE_DESDE, CRECE_HASTA)),
  );
  // Recorrido curvo: la caída arranca antes que el desplazamiento lateral, así la trayectoria dibuja un arco
  const xMover = useTransform([avance, destinoX, modoMovil], ([v, dx, m]: number[]) =>
    dx * suave(m ? tramo(v, MOVIL_DESDE + 100, MOVIL_HASTA) : tramo(v, MOVE_DESDE + 60, MOVE_HASTA)),
  );
  const yMover = useTransform([avance, destinoY, modoMovil], ([v, dy, m]: number[]) =>
    dy * suave(m ? tramo(v, MOVIL_DESDE, MOVIL_HASTA - 100) : tramo(v, MOVE_DESDE, MOVE_HASTA - 60)),
  );

  // Salida automática: 0 = visible, 1 = fuera. Cruzar el umbral dispara la animación completa (nunca queda a medias)
  // El valor vive en `estado-telefonos`: los dos teléfonos de la página se coordinan para no verse a la vez
  // (este solo vuelve a entrar cuando el de la ficha del formulario ya se ha ido del todo).
  const salida = salida2;
  const estaFuera = useRef(false);
  const irASalida = (fuera: boolean, inmediato = false) => {
    estaFuera.current = fuera;
    control2.querer(!fuera, inmediato || modoSalto.activo);
  };
  const ultimoAvance = useRef(avanceCrudo.get());
  // Con el recorrido corto, quien scrollea rápido puede cruzar el punto de salida antes de que la transición
  // (automática) haya terminado. La salida espera a que el teléfono esté en su sitio: así el destino siempre se ve.
  const salidaPendiente = useRef(false);
  const acumS = useRef(0);
  useMotionValueEvent(avanceCrudo, "change", (v) => {
    const dv = v - ultimoAvance.current;
    if (Math.abs(dv) < 1) return; // ignora temblores mínimos para no confundir la dirección
    ultimoAvance.current = v;
    const movido = acumular(acumS, dv);
    if (!estaFuera.current && dv > 0 && v > umbralSalida() && movido >= intencionMinima()) {
      if (progreso.get() >= 0.95) irASalida(true);
      else salidaPendiente.current = true;
    } else if (v <= umbralSalida()) {
      salidaPendiente.current = false; // volvió a subir antes de que llegara: ya no hay salida que hacer
    }
    if (estaFuera.current && dv < 0 && v < UMBRAL_REGRESO && -movido >= intencionMinima()) irASalida(false);
  });
  useMotionValueEvent(progreso, "change", (p) => {
    if (salidaPendiente.current && p >= 0.95) {
      salidaPendiente.current = false;
      if (!estaFuera.current && avanceCrudo.get() > umbralSalida()) irASalida(true);
    }
  });
  useEffect(() => {
    irASalida(avanceCrudo.get() > umbralSalida(), true); // si la página se restaura más abajo, arranca ya en su estado
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Al acabar un salto por enlace, el estado se ajusta al instante a la posición real
  useEffect(() => {
    const sincronizar = () => {
      const v = -(seccion.current?.getBoundingClientRect().top ?? 2000);
      avanceCrudo.set(v);
      salidaPendiente.current = false;
      irATransicion(v > DISPARO_TRANSICION, true);
      irASalida(v > umbralSalida(), true);
    };
    window.addEventListener(EVENTO_SINCRONIZAR, sincronizar);
    return () => window.removeEventListener(EVENTO_SINCRONIZAR, sincronizar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const escalaSalida = useTransform(salida, (s) => 1 - ENCOGE_SALIDA * s);
  const giroSalida = useTransform(salida, (s) => GIRO_SALIDA * s);
  const xSalida = useTransform([salida, recorridoSalida], ([s, d]: number[]) => d * s);
  // sale por el lado derecho: solo se desvanece al final del recorrido, cuando ya está en el borde
  const opacidadSalida = useTransform(salida, (s) => 1 - tramo(s, 0.7, 1));

  // textos de la izquierda: aparecen cuando el teléfono llega a su sitio
  const opacidadTexto = useTransform(avance, (v) => suave(tramo(v, MOVE_HASTA - 220, MOVE_HASTA)));
  const subeTexto = useTransform(avance, (v) => 24 * (1 - suave(tramo(v, MOVE_HASTA - 220, MOVE_HASTA))));

  // flotación suave del teléfono: solo mientras es pequeño; al empezar a crecer se apaga para que el formulario no se mueva
  const tiempo = useMotionValue(0);
  const flota = useMotionValue(0);
  const yTotal = useTransform([flota, yMover], ([f, m]: number[]) => f + m);
  // Rendimiento: ningún bucle trabaja si la escena no está en pantalla, y la flotación se detiene del todo cuando
  // ya se ha apagado (al empezar la transición).
  const escenaVisible = useRef(true);
  useEffect(() => {
    const el = seccion.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => (escenaVisible.current = e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useAnimationFrame((_, delta) => {
    tiempo.set(tiempo.get() + delta / 1000);
    if (!escenaVisible.current) return;
    const apagado = 1 - tramo(avance.get(), -120, -40);
    if (apagado === 0 && flota.get() === 0) return;
    flota.set(-(Math.sin((tiempo.get() * 2 * Math.PI) / 6) * 0.5 + 0.5) * 7 * apagado);
  });

  // los textos de la galería se desvanecen justo antes de que el barrido llegue a su zona: en móvil el barrido ocurre
  // más tarde, así que se desplazan lo mismo
  const desfaseGaleria = useTransform(modoMovil, (m) => (m ? MOVIL_BARRIDO_DESDE - FORM_DESDE : 0));

  // pantallas: el formulario sube desde abajo como un barrido de borde difuminado y cubre la app
  const cortina = useTransform([avance, modoMovil], ([v, m]: number[]) => {
    const r = suave(m ? tramo(v, MOVIL_BARRIDO_DESDE, MOVIL_BARRIDO_HASTA) : tramo(v, FORM_DESDE, FORM_HASTA));
    const hasta = r * (100 + BORDE_CORTINA);
    return `linear-gradient(to top, #000 ${hasta - BORDE_CORTINA}%, transparent ${hasta}%)`;
  });

  // cinta de texto gigante: avanza siempre y acelera con el scroll; aparece al llegar y se apaga al crecer el teléfono
  const unidad = useRef<HTMLSpanElement>(null);
  const [ancho, setAncho] = useState(0);
  const x = useMotionValue(0);
  useEffect(() => {
    const medir = () => setAncho(unidad.current?.offsetWidth ?? 0);
    medir();
    document.fonts?.ready.then(medir);
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);
  useAnimationFrame(() => {
    if (!ancho || !escenaVisible.current) return;
    x.set(-((tiempo.get() * VELOCIDAD + total.get() * EMPUJE_SCROLL) % ancho));
  });
  const opacidadCinta = useTransform([blanqueo, avance], ([b, v]: number[]) => tramo(b, 0.5, 0.9) * (1 - 0.88 * suave(tramo(v, 40, 330))));

  // la línea ondulada se dibuja sola cuando la escena aparece
  const draw = useMotionValue(0.05);
  const enVista = useInView(seccion, { amount: 0.05, once: true });
  useEffect(() => {
    if (!enVista) return;
    const a = animate(draw, 1, { duration: 2.4, delay: 0.2, ease: [0.45, 0, 0.2, 1] });
    return () => a.stop();
  }, [enVista, draw]);

  return (
    <section
      ref={seccion}
      id="contacto"
      className="pointer-events-none relative -mt-[50svh] h-[calc(100svh+var(--recorrido-movil))] md:-mt-[54svh] md:h-[calc(100svh+var(--recorrido))]"
      style={{ ["--recorrido" as string]: `${RECORRIDO_FIJADO}px`, ["--recorrido-movil" as string]: `${RECORRIDO_FIJADO_MOVIL}px` }}
    >
      <div ref={fijada} className="sticky top-0 h-svh overflow-x-clip">
        {/* cinta de texto gigante + línea ondulada, detrás del teléfono */}
        <motion.div style={{ opacity: opacidadCinta }} className="absolute inset-x-0 top-1/2 -translate-y-1/2" aria-hidden>
          <motion.p
            style={{ x }}
            data-cinta
            className="whitespace-nowrap text-[88px] font-black leading-[0.9] tracking-[-0.06em] text-ink md:text-[190px]"
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
            className="pointer-events-none absolute inset-x-0 top-[calc(50%-120px)] h-[190px] w-full md:top-[calc(50%-190px)] md:h-[300px]"
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
        </motion.div>

        {/* etiquetas que orbitan el teléfono */}
        {chips.map((c) => (
          <Etiqueta key={c.text.join()} c={c} avance={avance} />
        ))}

        {/* teléfono: dibujado a tamaño final, reducido por escala al principio */}
        <motion.div
          ref={telefono}
          style={{ scale: escala, x: xMover, y: yTotal }}
          className="pointer-events-auto absolute left-1/2 top-1/2 z-10 h-[min(94svh,900px)] w-[calc(min(94svh,900px)*9/19)] -translate-x-1/2 -translate-y-1/2 md:h-[min(76svh,780px)] md:w-[calc(min(76svh,780px)*3/4)]"
        >
          <motion.div style={{ x: xSalida, scale: escalaSalida, rotate: giroSalida, opacity: opacidadSalida }} className="h-full w-full">
          <Phone slot="hero-movil" className="h-full w-full">
            {/* galería de los últimos diseños, dibujada al tamaño final de la pantalla */}
            <div className="absolute inset-0">
              <GaleriaDisenos avance={avance} desfase={desfaseGaleria} />
            </div>

            {/* pantalla en azul liso: la cubre el barrido de abajo arriba (el formulario ahora está en la sección siguiente) */}
            <motion.div
              style={{ maskImage: cortina, WebkitMaskImage: cortina }}
              className="absolute inset-0 bg-azul"
              aria-hidden
            >
              {/* pila descendente con las portadas de los últimos seis diseños (solo escritorio) */}
              <PilaDisenos pausaSi={pausarPila} />
            </motion.div>
          </Phone>
          </motion.div>
        </motion.div>

        {/* textos de relleno a la izquierda (se sustituirán): titular arriba y explicación abajo */}
        <motion.h2
          ref={titularRef}
          style={{ opacity: opacidadTexto, y: subeTexto, ...(dispMovil ? { top: dispMovil.titular, bottom: "auto" } : {}) }}
          className="pointer-events-none absolute bottom-[58%] left-6 right-6 z-10 text-[clamp(30px,3.2vw+14px,60px)] font-black leading-[1.02] tracking-[-0.045em] text-ink md:right-auto md:bottom-auto md:top-[15%] md:left-[6%] md:w-[min(46%,560px)]"
        >
          Aquí irá el titular de esta sección
        </motion.h2>
        <motion.p
          ref={textoRef}
          style={{ opacity: opacidadTexto, y: subeTexto, ...(dispMovil ? { top: dispMovil.texto } : {}) }}
          className="pointer-events-none absolute left-6 right-[58%] top-[56%] z-10 font-serif text-[12px] leading-snug text-gris md:right-auto md:top-auto md:bottom-[15%] md:left-[6%] md:w-[min(40%,440px)] md:text-[19px] md:leading-snug"
        >
          Texto de relleno: aquí irá la explicación de esta sección. Más adelante me dirás qué poner. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </motion.p>
      </div>
    </section>
  );
}
