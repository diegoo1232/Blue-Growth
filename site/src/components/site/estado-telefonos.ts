import { animate, motionValue, type MotionValue } from "motion/react";

// Coordinación de los dos teléfonos de la página (el de la escena fijada y el de la ficha del formulario):
// NUNCA se ven a la vez. Primero sale uno del todo y solo entonces entra el otro, tanto al bajar como al subir.
//
// Cada teléfono tiene un valor 0 = visible, 1 = fuera. Su lógica de scroll dice si "quiere" estar visible; la
// animación de entrada solo arranca cuando el otro ya está fuera del todo (y arranca sola en cuanto lo está).
// La salida arranca siempre al instante.

export const salida2 = motionValue(0); // teléfono de la escena (empieza visible)
export const salida3 = motionValue(1); // teléfono de la ficha del formulario (empieza fuera)

const FUERA = 0.999;

function crearControl(propia: MotionValue<number>, otra: MotionValue<number>) {
  let quiere = false;
  let anim: ReturnType<typeof animate> | null = null;
  let objetivo: 0 | 1 | null = null;
  let duracion = 0.875;
  let ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

  const aplicar = (inmediato = false) => {
    if (quiere && !inmediato && otra.get() < FUERA) return; // espera a que el otro se haya ido
    const nuevo: 0 | 1 = quiere ? 0 : 1;
    if (inmediato) {
      anim?.stop();
      objetivo = nuevo;
      propia.set(nuevo);
      return;
    }
    if (objetivo === nuevo) return; // ya va hacia allí
    anim?.stop();
    objetivo = nuevo;
    anim = animate(propia, nuevo, { duration: duracion, ease });
  };

  // cuando el otro termina de salir, entra este (si lo quiere)
  otra.on("change", (v) => {
    if (v >= FUERA && quiere) aplicar();
  });

  return {
    configurar(d: number, e: [number, number, number, number]) {
      duracion = d;
      ease = e;
    },
    querer(visible: boolean, inmediato = false) {
      quiere = visible;
      aplicar(inmediato);
    },
  };
}

export const control2 = crearControl(salida2, salida3);
export const control3 = crearControl(salida3, salida2);

// ---- Sensibilidad del scroll ----
// Un disparo (entrar, salir, volver…) solo ocurre si la persona ha scrolleado de verdad en esa dirección: al menos
// este tramo, contado desde el último cambio de sentido. Así un movimiento mínimo o un temblor del dedo no activa
// ninguna animación. En el teléfono (dedo) hace falta más recorrido que con la rueda del ratón.
const INTENCION_MOVIL = 70; // px
const INTENCION_ESCRITORIO = 30; // px
export const intencionMinima = () =>
  typeof window !== "undefined" && window.innerWidth < 768 ? INTENCION_MOVIL : INTENCION_ESCRITORIO;
// Suma el movimiento en la dirección actual (se reinicia al cambiar de sentido) y devuelve lo acumulado, con signo.
export function acumular(ref: { current: number }, dv: number) {
  if (Math.sign(dv) !== Math.sign(ref.current)) ref.current = 0;
  ref.current += dv;
  return ref.current;
}

// ---- Saltos por enlace ----
// Mientras el scroll lo provoca un enlace interno ("Agendar reunión"), la página recorre varias secciones de golpe y
// encadenar las animaciones (transición → salida de un teléfono → entrada del otro) dejaría la pantalla casi vacía
// unos 3 s. En ese caso los cambios de estado se aplican al instante.
export const modoSalto = { activo: false };
// Al terminar un salto se avisa con este evento para que cada pieza ajuste su estado a la posición real al instante.
export const EVENTO_SINCRONIZAR = "bluegrow:sincronizar";
