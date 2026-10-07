// Funciones que se ejecutan en el mismo fotograma en que Lenis mueve el scroll, justo después.
// Sirve para colocar elementos que deben ir clavados al scroll sin quedarse un fotograma atrás.
export const despuesDeMoverScroll = new Set<() => void>();
