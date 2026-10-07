// Ilustración propia: edificio blanco de volúmenes volados con lamas (sustituible por foto).
type Vol = { x: number; y: number; w: number; h: number; d: number };

function Volumen({ v, rows, cols, id }: { v: Vol; rows: number; cols: number; id: string }) {
  const { x, y, w, h, d } = v;
  const pad = 14;
  const gw = (w - pad * 2) / cols;
  const gh = (h - pad * 2) / rows;
  return (
    <g>
      {/* sombra proyectada bajo el volumen */}
      <rect x={x + 6} y={y + h} width={w + d - 6} height={34} fill={`url(#sombra-${id})`} />
      {/* cara lateral */}
      <polygon points={`${x + w},${y} ${x + w + d},${y + d * 0.35} ${x + w + d},${y + h + d * 0.35} ${x + w},${y + h}`} fill="url(#lado)" />
      {/* techo */}
      <polygon points={`${x},${y} ${x + w},${y} ${x + w + d},${y + d * 0.35} ${x + d},${y + d * 0.35}`} fill="#fbfbfc" />
      {/* fachada */}
      <rect x={x} y={y} width={w} height={h} fill="url(#frente)" />
      {Array.from({ length: rows * cols }, (_, i) => {
        const cx = x + pad + (i % cols) * gw + 4;
        const cy = y + pad + Math.floor(i / cols) * gh + 4;
        return (
          <g key={i}>
            <rect x={cx} y={cy} width={gw - 8} height={gh - 8} fill="url(#vidrio)" />
            <rect x={cx} y={cy} width={gw - 8} height={6} fill="#9aa3b2" opacity="0.55" />
            <rect x={cx} y={cy} width={5} height={gh - 8} fill="#aab2bf" opacity="0.45" />
            <rect x={cx + (gw - 8) / 2 - 1} y={cy} width={2} height={gh - 8} fill="#eef1f5" />
          </g>
        );
      })}
      {/* lamas verticales delante del vidrio */}
      {Array.from({ length: cols * 2 + 1 }, (_, i) => (
        <rect key={`l${i}`} x={x + pad - 3 + (i * (w - pad * 2)) / (cols * 2)} y={y + pad - 4} width={4} height={h - pad * 2 + 8} fill="#ffffff" />
      ))}
      <rect x={x} y={y + h - 5} width={w} height={5} fill="#dfe2e8" />
    </g>
  );
}

export function Building({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 640"
      className={className}
      data-slot="hero-edificio"
      data-slot-type="hero-image"
      data-slot-spec="foto vertical 7:8, edificio claro sobre fondo blanco, recortada a la derecha"
      aria-hidden
    >
      <defs>
        <linearGradient id="vidrio" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#c6ccd6" />
          <stop offset="0.5" stopColor="#e3e7ed" />
          <stop offset="1" stopColor="#b8c0cc" />
        </linearGradient>
        <linearGradient id="frente" x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f1f2f5" />
        </linearGradient>
        <linearGradient id="lado" x1="0" x2="1">
          <stop offset="0" stopColor="#d9dde4" />
          <stop offset="1" stopColor="#eceef2" />
        </linearGradient>
        {["a", "b", "c"].map((k) => (
          <linearGradient key={k} id={`sombra-${k}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#8b93a1" stopOpacity="0.35" />
            <stop offset="1" stopColor="#8b93a1" stopOpacity="0" />
          </linearGradient>
        ))}
        <linearGradient id="fundido" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.97" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="fundidoIzq" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="0.18" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* núcleo trasero */}
      <rect x="250" y="0" width="210" height="640" fill="#f4f5f7" />
      <rect x="460" y="0" width="100" height="640" fill="#e4e7ec" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x="268" y={20 + i * 52} width="176" height="30" fill="url(#vidrio)" opacity="0.7" />
      ))}

      <Volumen id="a" v={{ x: 200, y: 30, w: 280, h: 170, d: 70 }} rows={2} cols={3} />
      <Volumen id="b" v={{ x: 90, y: 250, w: 320, h: 190, d: 70 }} rows={2} cols={3} />
      <Volumen id="c" v={{ x: 230, y: 480, w: 300, h: 150, d: 60 }} rows={2} cols={4} />

      <rect x="0" y="0" width="560" height="640" fill="url(#fundido)" />
      <rect x="0" y="0" width="560" height="640" fill="url(#fundidoIzq)" />
    </svg>
  );
}
