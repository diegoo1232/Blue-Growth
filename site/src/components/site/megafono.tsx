"use client";

import { motion, type MotionValue } from "motion/react";

// Megáfono vectorial PROPIO (dibujado para este proyecto, no calcado de ningún logo ajeno): bocina, cuerpo, asa y tres
// ondas de sonido. Va dentro de la tablet, centrado en vertical, y SALE por su borde derecho, como si saliera de ella.
// Solo se ve en escritorio (la tablet); en móvil, donde hay teléfono, no se muestra.
//
// Se coloca respecto a la tablet (porcentajes de su ancho), así escala con ella. Va fuera de las capas que recortan la
// pantalla (por eso se pasa a la carcasa como "adorno") para poder sobresalir del marco.
const AZUL_OSCURO = "#0a2a9a"; // más oscuro que el azul de la pantalla (#1d5bff)

export function Megafono({ opacidad }: { opacidad?: MotionValue<number> }) {
  return (
    <motion.svg
      viewBox="0 0 170 110"
      aria-hidden
      focusable="false"
      style={opacidad ? { opacity: opacidad } : undefined}
      className="pointer-events-none absolute right-[-16%] top-1/2 z-40 hidden w-[60%] -translate-y-1/2 -rotate-[8deg] drop-shadow-[0_20px_24px_rgba(10,42,154,0.30)] md:block"
    >
      {/* cuerpo trasero */}
      <rect x="6" y="40" width="26" height="30" rx="7" fill={AZUL_OSCURO} />
      {/* bocina */}
      <path d="M32 40 L96 10 Q104 7 104 16 V94 Q104 103 96 100 L32 70 Z" fill={AZUL_OSCURO} />
      {/* asa */}
      <path d="M44 72 H62 L68 98 Q69 103 64 103 H55 Q50 103 49 98 Z" fill={AZUL_OSCURO} />
      {/* ondas de sonido */}
      <g fill="none" stroke={AZUL_OSCURO} strokeWidth="7" strokeLinecap="round">
        <path d="M116 38 Q124 55 116 72" />
        <path d="M128 26 Q142 55 128 84" />
        <path d="M140 14 Q160 55 140 96" opacity="0.55" />
      </g>
    </motion.svg>
  );
}
