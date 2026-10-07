"use client";

import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Formulario } from "./contacto";
import { ENCOGE_SALIDA, GIRO_SALIDA } from "./escena-telefono";
import { acumular, control3, EVENTO_SINCRONIZAR, intencionMinima, modoSalto, salida3 } from "./estado-telefonos";
import { Phone } from "./phone";

const ease = [0.22, 1, 0.36, 1] as const;
const tramo = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

// Tercera sección: ficha oscura con el formulario para agendar la reunión y, a un lado, el móvil inclinado que
// sobresale por arriba (estructura de la sección de descarga de "Diseño pagina web 17").
//
// El móvil tiene la misma animación automática de entrada y salida que el de la escena anterior (encoge 15 %,
// gira un poco, se desplaza hasta salir de la pantalla y se desvanece al final), pero por el lado IZQUIERDO:
// entra desde la izquierda. No sigue al scroll: una vez disparada se completa sola. Y nunca se ve a la vez que el
// otro móvil (ver `estado-telefonos`): este entra solo cuando el otro ya se ha ido, y al subir sale antes de que
// el otro vuelva.
// Su diseño es el mismo que el del móvil de la escena (marco, isla, esquinas, sombra) y su pantalla va vacía, en
// azul liso, en móvil y en escritorio.
export function SeccionReunion() {
  const seccion = useRef<HTMLElement>(null);
  const caja = useRef<HTMLDivElement>(null); // contenedor del móvil, sin transformar: sirve para medir
  const marco = useRef<HTMLDivElement>(null); // hueco del móvil al tamaño en que se ve
  // Para que sea IDÉNTICO al móvil de la escena anterior (mismas proporciones de borde, isla, esquinas y sombra), se
  // dibuja al mismo tamaño base que aquel y se reduce por escala, igual que hace él.
  const [medida, setMedida] = useState<{ base: number; escala: number } | null>(null);
  const salida = salida3;
  const recorrido = useMotionValue(400); // hasta dónde se desplaza a la izquierda para quedar fuera de la pantalla
  const ultimo = useRef(0); // última posición del scroll, para saber si se baja o se sube
  const acum = useRef(0); // lo scrolleado de verdad en la dirección actual (sensibilidad)
  const quiere = useRef(false);
  const ir = (visible: boolean, inmediato = false) => {
    quiere.current = visible;
    control3.querer(visible, inmediato || modoSalto.activo);
  };

  useEffect(() => {
    ultimo.current = window.scrollY; // la página puede abrirse ya a mitad de recorrido (el navegador restaura el scroll)
    const medir = () => {
      const base = document.querySelector<HTMLElement>('[data-slot="hero-movil"]')?.offsetWidth;
      const visto = marco.current?.offsetWidth;
      if (base && visto) setMedida({ base, escala: visto / base });
      const c = caja.current?.getBoundingClientRect();
      if (c) recorrido.set(c.right + c.width * 0.15 + 80); // todo el móvil, ya encogido y girado, queda fuera
    };
    medir();
    document.fonts?.ready.then(medir);
    const arriba = seccion.current?.getBoundingClientRect().top ?? 9999;
    ir(arriba < window.innerHeight * 0.7, true); // si la página se abre más abajo, arranca ya en su estado
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Al acabar un salto por enlace, el estado se ajusta al instante a la posición real
  useEffect(() => {
    const sincronizar = () => {
      const arriba = seccion.current?.getBoundingClientRect().top ?? 9999;
      ir(arriba < window.innerHeight * 0.7, true);
    };
    window.addEventListener(EVENTO_SINCRONIZAR, sincronizar);
    return () => window.removeEventListener(EVENTO_SINCRONIZAR, sincronizar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // La dirección del scroll decide: bajando y llegando a la sección entra; subiendo y alejándose sale.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => {
    const dv = v - ultimo.current;
    if (Math.abs(dv) < 1) return;
    ultimo.current = v;
    const movido = acumular(acum, dv);
    const arriba = seccion.current?.getBoundingClientRect().top ?? 9999;
    const vh = window.innerHeight;
    if (!quiere.current && dv > 0 && arriba < vh * 0.7 && movido >= intencionMinima()) ir(true);
    // Al subir sale en cuanto la sección empieza a alejarse. En móvil la sección está adelantada un 20 % de la pantalla
    // (-mt-[20svh]), así que se cuenta desde antes; si no, se quedaba a la vista de más y retrasaba el regreso del otro móvil.
    else if (quiere.current && dv < 0 && -movido >= intencionMinima() && arriba > vh * (window.innerWidth < 768 ? 0.5 : 0.8)) ir(false);
  });

  const x = useTransform([salida, recorrido], ([s, d]: number[]) => -d * s);
  const escala = useTransform(salida, (s) => 1 - ENCOGE_SALIDA * s);
  const giro = useTransform(salida, (s) => -GIRO_SALIDA * s);
  const opacidad = useTransform(salida, (s) => 1 - tramo(s, 0.7, 1));
  // MÓVIL: la ficha entera (fondo oscuro y formulario) solo se ve cuando su teléfono está dentro. Así, al estar más
  // subida, su borde no asoma por abajo mientras todavía se ve el otro teléfono (nunca dos secciones a la vez).
  const opacidadFicha = useTransform(salida, (s) => 1 - tramo(s, 0.3, 0.9));

  return (
    <section ref={seccion} id="reunion" className="relative px-6 pb-24 pt-44 max-md:-mt-[35svh] md:pb-28 md:pt-36">
      {/* La opacidad de la ficha solo se aplica en móvil (< 768 px), y la decide el CSS por el ancho de pantalla: así
          nunca se queda "en móvil" por un dato guardado que no se actualizó al cambiar el tamaño de la ventana. */}
      <motion.div className="max-md:[opacity:var(--ficha-op)]" style={{ "--ficha-op": opacidadFicha } as never}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1, ease }}
        className="relative mx-auto grid max-md:grid-cols-[minmax(0,1fr)] max-w-[1180px] rounded-[22px] bg-noche px-6 pb-10 pt-[300px] shadow-[0_40px_80px_-40px_rgb(20_22_27/0.6)] md:grid-cols-[300px_1fr] md:gap-10 md:px-12 md:py-14"
      >
        <div
          ref={caja}
          className="absolute -top-40 left-1/2 w-[200px] -translate-x-1/2 md:-top-24 md:left-[40px] md:w-[230px] md:translate-x-0"
        >
          <motion.div style={{ x, scale: escala, rotate: giro, opacity: opacidad }}>
            {/* inclinación en reposo; después flota y se balancea sin parar */}
            <div style={{ rotate: "-6deg" }}>
              <div className="flotar-suave">
                <div className="balancear">
                  <div ref={marco} className="relative aspect-[9/19] w-full">
                    <div
                      className={medida ? "absolute left-0 top-0" : "w-full"}
                      style={medida ? { width: medida.base, transform: `scale(${medida.escala})`, transformOrigin: "top left" } : undefined}
                    >
                      <Phone slot="reunion-movil">
                        {/* pantalla vacía en azul liso, igual que el otro móvil (en móvil y en escritorio) */}
                        <div className="absolute inset-0 bg-azul" aria-hidden />
                      </Phone>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="hidden md:block" />
        <div className="relative min-w-0">
          <Formulario columnas />
        </div>
      </motion.div>
      </motion.div>
    </section>
  );
}
