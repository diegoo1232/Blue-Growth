import { motionValue } from "motion/react";

// 0 = portada con su degradado azul; 1 = portada totalmente blanca.
// Lo calcula la portada a partir del scroll y lo leen otras piezas (p. ej. el texto gigante de la escena).
export const blanqueo = motionValue(0);

// Progreso de la transición automática de la escena del teléfono: 0 = estado "portada" (teléfono pequeño con la
// galería y las etiquetas), 1 = estado "destino" (teléfono a la derecha con los textos). La escena lo anima por tiempo y
// la portada lo lee para desvanecerse: así NUNCA se ven a la vez la portada y la sección siguiente.
export const progresoEscena = motionValue(0);
