// Dibujos propios de dispositivos, en gris claro con volumen (sustituibles por fotos de producto).
const G = () => (
  <defs>
    <linearGradient id="dv-body" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stopColor="#ffffff" />
      <stop offset="1" stopColor="#cfd3da" />
    </linearGradient>
    <linearGradient id="dv-dark" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stopColor="#4a4f59" />
      <stop offset="1" stopColor="#1c1f25" />
    </linearGradient>
    <radialGradient id="dv-glass" cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stopColor="#ffffff" />
      <stop offset="0.6" stopColor="#e4e7ec" />
      <stop offset="1" stopColor="#b9bfc9" />
    </radialGradient>
    <radialGradient id="dv-shadow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#14161b" stopOpacity="0.22" />
      <stop offset="1" stopColor="#14161b" stopOpacity="0" />
    </radialGradient>
  </defs>
);

const Sombra = ({ cx = 50, cy = 86, rx = 30 }) => <ellipse cx={cx} cy={cy} rx={rx} ry={5} fill="url(#dv-shadow)" />;

export const devices = {
  camara: (
    <svg viewBox="0 0 100 100">
      <G />
      <Sombra cx={44} rx={26} />
      <rect x="14" y="30" width="12" height="34" rx="3" fill="url(#dv-body)" />
      <rect x="22" y="44" width="16" height="7" fill="#d4d8de" />
      <g transform="rotate(-14 60 42)">
        <rect x="32" y="30" width="56" height="26" rx="10" fill="url(#dv-body)" />
        <rect x="30" y="26" width="58" height="8" rx="4" fill="#f4f5f7" />
        <circle cx="84" cy="43" r="10" fill="url(#dv-dark)" />
        <circle cx="84" cy="43" r="4.5" fill="#3d6bff" opacity="0.7" />
      </g>
    </svg>
  ),
  robot: (
    <svg viewBox="0 0 100 100">
      <G />
      <Sombra rx={38} cy={74} />
      <ellipse cx="50" cy="62" rx="40" ry="14" fill="#2a2e36" />
      <ellipse cx="50" cy="56" rx="40" ry="16" fill="url(#dv-body)" />
      <ellipse cx="50" cy="52" rx="22" ry="7" fill="url(#dv-dark)" />
      <ellipse cx="50" cy="51" rx="8" ry="2.6" fill="#5f6672" />
      <path d="M14 58 Q50 76 86 58" stroke="#9aa1ad" strokeWidth="1.2" fill="none" />
    </svg>
  ),
  bombilla: (
    <svg viewBox="0 0 100 100">
      <G />
      <Sombra rx={14} cy={90} />
      <path d="M50 10 C30 10 22 26 26 40 C29 50 38 54 40 66 H60 C62 54 71 50 74 40 C78 26 70 10 50 10Z" fill="url(#dv-glass)" />
      <rect x="40" y="66" width="20" height="18" rx="3" fill="url(#dv-body)" />
      {[70, 75, 80].map((y) => (
        <rect key={y} x="39" y={y} width="22" height="1.6" fill="#a9afb9" />
      ))}
      <path d="M44 86 h12 l-3 4 h-6z" fill="#8d94a0" />
    </svg>
  ),
  router: (
    <svg viewBox="0 0 100 100">
      <G />
      <Sombra rx={40} cy={80} />
      {[18, 36, 64, 82].map((x, i) => (
        <rect key={x} x={x - 2.5} y={i % 3 === 0 ? 18 : 24} width="5" height={i % 3 === 0 ? 46 : 40} rx="2.5" fill="url(#dv-body)" />
      ))}
      <path d="M10 62 L90 62 L84 76 L16 76Z" fill="url(#dv-body)" />
      <path d="M10 62 L90 62 L88 58 L12 58Z" fill="#f7f8fa" />
      {[30, 38, 46].map((x) => (
        <circle key={x} cx={x} cy="69" r="1.3" fill="#3d6bff" />
      ))}
    </svg>
  ),
  termostato: (
    <svg viewBox="0 0 100 100">
      <G />
      <Sombra rx={28} cy={88} />
      <circle cx="50" cy="48" r="34" fill="url(#dv-body)" />
      <circle cx="50" cy="48" r="26" fill="url(#dv-dark)" />
      <path d="M32 58 A20 20 0 1 1 68 58" stroke="#3d6bff" strokeWidth="3" fill="none" strokeLinecap="round" />
      <text x="50" y="53" textAnchor="middle" fontSize="14" fontWeight="600" fill="#fff" fontFamily="inherit">21°</text>
    </svg>
  ),
  cerradura: (
    <svg viewBox="0 0 100 100">
      <G />
      <Sombra rx={20} cy={92} />
      <rect x="30" y="8" width="40" height="80" rx="10" fill="url(#dv-dark)" />
      <rect x="34" y="12" width="32" height="72" rx="8" fill="#2b2f37" />
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={42 + (i % 3) * 8} cy={26 + Math.floor(i / 3) * 9} r="2" fill="#8fa9ff" opacity="0.85" />
      ))}
      <rect x="40" y="58" width="20" height="16" rx="5" fill="url(#dv-body)" />
    </svg>
  ),
  sensor: (
    <svg viewBox="0 0 100 100">
      <G />
      <Sombra rx={30} cy={80} />
      <path d="M22 70 A28 30 0 0 1 78 70Z" fill="url(#dv-body)" />
      <ellipse cx="50" cy="70" rx="28" ry="6" fill="#d8dce2" />
      <circle cx="50" cy="50" r="10" fill="url(#dv-glass)" />
      <circle cx="50" cy="50" r="2.5" fill="#3d6bff" />
    </svg>
  ),
  altavoz: (
    <svg viewBox="0 0 100 100">
      <G />
      <Sombra rx={22} cy={92} />
      <rect x="30" y="14" width="40" height="74" rx="20" fill="url(#dv-body)" />
      <ellipse cx="50" cy="20" rx="16" ry="5" fill="#eef0f3" />
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={i} cx={36 + (i % 8) * 4} cy={34 + Math.floor(i / 8) * 9} r="0.9" fill="#a3a9b4" />
      ))}
    </svg>
  ),
};
