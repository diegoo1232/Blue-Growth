import {
  Bell,
  Droplets,
  Fan,
  Globe,
  Home,
  Lock,
  Minus,
  Plus,
  Power,
  Search,
  Settings2,
  ShoppingBag,
  Sun,
} from "lucide-react";

// Carcasa de dispositivo dibujada con CSS. La pantalla se pasa como hijo.
// En pantallas pequeñas (< 768 px) es un MÓVIL (9:19, isla arriba); desde 768 px (escritorio) es una TABLET vertical
// (3:4, marco más fino, esquinas más suaves y cámara arriba en el centro). Es UNA sola pieza con dos aspectos, así
// todas las tablets de la página son idénticas y no se duplica el contenido de la pantalla.
export function Phone({
  children,
  className = "",
  slot,
}: {
  children: React.ReactNode;
  className?: string;
  slot: string;
}) {
  return (
    <div
      data-slot={slot}
      data-slot-type="app-screen"
      className={`relative aspect-[9/19] rounded-[2.6rem] md:aspect-[3/4] md:rounded-[1.9rem] bg-gradient-to-b from-[#c9ccd3] via-[#8d929c] to-[#c9ccd3] p-[3px] shadow-[0_40px_80px_-20px_rgb(20_22_27/0.45),0_18px_30px_-12px_rgb(20_22_27/0.25)] ${className}`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[2.45rem] bg-[#0e0f13] p-[7px] md:rounded-[1.75rem] md:p-[10px]">
        <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-[#1a1c23] text-white md:rounded-[1.1rem]">
          {/* isla */}
          <div className="absolute left-1/2 top-2 z-10 h-[18px] w-[34%] -translate-x-1/2 rounded-full bg-black md:hidden" />
          {children}
        </div>
        {/* Aro del borde por ENCIMA de la pantalla: tapa la unión entre la pantalla y el marco negro. Sin él, al
            escalar el teléfono con decimales asomaba un hilo claro del fondo entre ambos. Solapa 1 px a propósito. */}
        <div
          className="pointer-events-none absolute inset-0 z-20 rounded-[2.45rem] border-[8px] border-[#0e0f13] md:rounded-[1.75rem] md:border-[11px]"
          aria-hidden
        />
        {/* tablet: cámara frontal arriba en el centro del marco */}
        <span className="absolute left-1/2 top-[3px] z-30 hidden size-[5px] -translate-x-1/2 rounded-full bg-[#2c2f38] md:block" aria-hidden />
      </div>
    </div>
  );
}

const Toggle = ({ on = true }: { on?: boolean }) => (
  <span
    className={`relative inline-block h-[14px] w-[24px] rounded-full ${on ? "bg-azul" : "bg-white/15"}`}
  >
    <span
      className={`absolute top-[2px] size-[10px] rounded-full bg-white ${on ? "right-[2px]" : "left-[2px]"}`}
    />
  </span>
);

const TabBar = () => (
  <div className="absolute inset-x-0 bottom-0 flex items-center justify-around border-t border-white/5 bg-[#16181e] px-4 pb-4 pt-3 text-white/40">
    <Home className="size-[15px] text-azul" />
    <Settings2 className="size-[15px]" />
    <Bell className="size-[15px]" />
  </div>
);

// Pantalla 1 — panel de la web de un cliente, con gráfica de visitas.
export function ScreenHome() {
  return (
    <div className="flex h-full flex-col px-[9%] pt-[16%] text-[8px] leading-tight">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 gap-[2px]">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="size-[3px] rounded-[1px] bg-white/60" />
          ))}
        </div>
        <span className="size-[18px] rounded-full bg-gradient-to-br from-[#9db7ff] to-azul" />
      </div>
      <p className="mt-3 text-[15px] font-semibold tracking-tight">Hola de nuevo</p>
      <p className="text-white/45">Lunes, 5 de octubre</p>

      <div className="mt-3 rounded-xl bg-white/[0.06] p-2.5">
        <div className="flex justify-between">
          <p className="font-medium">
            Visitas
            <br />
            de tu web
          </p>
          <div className="text-right">
            <p className="text-white/45">Hoy</p>
            <p className="text-[10px] font-semibold">
              1,2 <span className="text-white/45">k</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/45">Mes</p>
            <p className="text-[10px] font-semibold">
              34 <span className="text-white/45">k</span>
            </p>
          </div>
        </div>
        <svg viewBox="0 0 120 34" className="mt-2 w-full">
          <defs>
            <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#1d5bff" stopOpacity="0.45" />
              <stop offset="1" stopColor="#1d5bff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 22 C10 10 18 26 28 18 S44 6 54 16 S70 28 80 14 S98 8 108 18 S116 20 120 12 V34 H0Z"
            fill="url(#area)"
          />
          <path
            d="M0 22 C10 10 18 26 28 18 S44 6 54 16 S70 28 80 14 S98 8 108 18 S116 20 120 12"
            fill="none"
            stroke="#5f8bff"
            strokeWidth="1.6"
          />
        </svg>
        <div className="mt-1 flex justify-between text-[6px] text-white/35">
          {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/[0.06] p-2">
          <div className="flex items-start justify-between">
            <Globe className="size-[14px] text-white/80" />
            <Toggle />
          </div>
          <p className="mt-2 font-medium">Blog</p>
          <p className="text-white/45">Activo</p>
        </div>
        <div className="rounded-xl bg-white/[0.06] p-2">
          <div className="flex items-start justify-between">
            <ShoppingBag className="size-[14px] text-white/80" />
            <Toggle on={false} />
          </div>
          <p className="mt-2 font-medium">Tienda</p>
          <p className="text-white/45">Desactivada</p>
        </div>
      </div>

      <div className="mt-2 rounded-xl bg-white/[0.06] p-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Search className="size-[12px]" /> Posición SEO
          </span>
          <Toggle />
        </div>
        <div className="relative mt-2 h-[3px] rounded-full bg-white/10">
          <div className="absolute inset-y-0 left-0 w-[62%] rounded-full bg-azul" />
          <span className="absolute left-[62%] top-1/2 size-[8px] -translate-1/2 rounded-full bg-white" />
        </div>
      </div>
      <TabBar />
    </div>
  );
}

// Pantalla 2 — una habitación con el dial de temperatura.
export function ScreenRoom({
  room = "Salón",
  value = 22,
  unit = "°C",
  label = "Temperatura",
  pct = 0.68,
}: {
  room?: string;
  value?: number;
  unit?: string;
  label?: string;
  pct?: number;
}) {
  const r = 38;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex h-full flex-col px-[9%] pt-[16%] text-[8px] leading-tight">
      <div className="flex gap-1.5">
        {["Salón", "Cocina", "Dormitorio"].map((t) => (
          <span
            key={t}
            className={`rounded-full px-2 py-1 ${t === room ? "bg-azul" : "bg-white/[0.06] text-white/50"}`}
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-[14px] font-semibold tracking-tight">{room}</p>
          <p className="text-white/45">4 dispositivos activos</p>
        </div>
        <span className="grid size-[20px] place-items-center rounded-full bg-white">
          <Power className="size-[10px] text-ink" />
        </span>
      </div>
      <p className="mt-3 text-white/45">{label}</p>
      <div className="relative mx-auto mt-2 w-[78%]">
        <svg viewBox="0 0 100 100" className="w-full -rotate-90">
          <defs>
            <linearGradient id={`dial-${room}`} x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#7ec8ff" />
              <stop offset="1" stopColor="#1d5bff" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth="9" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={`url(#dial-${room})`}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${c * pct} ${c}`}
          />
        </svg>
        <div className="absolute inset-[22%] grid place-items-center rounded-full bg-[#22252d] shadow-[inset_0_2px_8px_rgb(0_0_0/0.5)]">
          <p className="text-[20px] font-semibold">
            {value}
            <span className="text-[9px] text-white/50">{unit}</span>
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="flex-1 rounded-xl bg-white/[0.06] px-2 py-2">
          <span className="flex items-center gap-1.5">
            <Droplets className="size-[11px] text-[#7ec8ff]" /> Humedad 46 %
          </span>
        </span>
        <span className="grid size-[24px] place-items-center rounded-lg bg-white/[0.06]">
          <Minus className="size-[10px]" />
        </span>
        <span className="grid size-[24px] place-items-center rounded-lg bg-white/[0.06]">
          <Plus className="size-[10px]" />
        </span>
      </div>
      <TabBar />
    </div>
  );
}

// Pantalla 3 — dormitorio con regulador de luz y colores.
export function ScreenLight() {
  const colores = ["#ff7a7a", "#ffb35c", "#ffe066", "#7be3a4", "#7ec8ff", "#1d5bff", "#a78bfa"];
  return (
    <div className="flex h-full flex-col px-[9%] pt-[16%] text-[8px] leading-tight">
      <div className="flex gap-1.5">
        {["Dormitorio", "Baño", "Estudio"].map((t, i) => (
          <span
            key={t}
            className={`rounded-full px-2 py-1 ${i === 0 ? "bg-azul" : "bg-white/[0.06] text-white/50"}`}
          >
            {t}
          </span>
        ))}
      </div>
      <p className="mt-3 text-[14px] font-semibold tracking-tight">Dormitorio</p>
      <div className="mt-1 flex gap-3 text-white/45">
        <span className="text-white">Luz</span>
        <span>Clima</span>
        <span>Persianas</span>
      </div>
      <div className="relative mt-3 flex items-center">
        <div>
          <p className="text-white/45">Intensidad</p>
          <p className="text-[22px] font-semibold">
            64<span className="text-[9px] text-white/50">%</span>
          </p>
        </div>
        <svg viewBox="0 0 100 100" className="ml-auto w-[62%]">
          <defs>
            <linearGradient id="luz" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#7ec8ff" />
              <stop offset="1" stopColor="#1d5bff" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth="16" />
          <path d="M50 10 A40 40 0 1 1 18 74" fill="none" stroke="url(#luz)" strokeWidth="16" />
          <circle cx="18" cy="74" r="6" fill="#fff" />
          <Sun x="40" y="40" width="20" height="20" color="#fff" />
        </svg>
      </div>
      <div className="mt-4 flex justify-between">
        {colores.map((c) => (
          <span key={c} className="size-[11px] rounded-full" style={{ background: c }} />
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-azul py-2 font-medium">
          <Fan className="size-[11px]" /> Modo noche
        </span>
        <span className="grid size-[26px] place-items-center rounded-lg bg-white/[0.06]">
          <Lock className="size-[11px]" />
        </span>
      </div>
      <TabBar />
    </div>
  );
}
