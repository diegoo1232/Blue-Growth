"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
} from "motion/react";
import { AlertCircle, Check, ChevronDown, Search } from "lucide-react";
import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { avisoTelefono, filtrarPaises, listaPaises, paisPorDefecto } from "./prefijos";

const ease = [0.22, 1, 0.36, 1] as const;

const FRASE = "todo bajo control ·";
const VELOCIDAD = 60; // píxeles por segundo cuando la página está quieta
const EMPUJE_SCROLL = 900; // píxeles extra que añade recorrer la sección con el scroll

// Opciones del formulario (se cambian aquí, en un solo sitio)
const OTRA = "Otra diferente"; // al elegirla aparece un campo para que el cliente escriba lo que busca
const TIPOS_WEB = ["Página corporativa", "Landing page", "Portafolio", "Blog o medio digital", OTRA];
const PRESUPUESTOS = ["Menos de 500 €", "Entre 500 y 1.500 €", "Entre 1.500 y 3.000 €", "Entre 3.000 y 6.000 €", "Más de 6.000 €"];
const SERVICIOS = [
  "Diseño y desarrollo de la web",
  "Posicionamiento SEO y analítica",
  "Mantenimiento y soporte continuo",
];

type Datos = {
  nombre: string;
  correo: string;
  pais: string; // código ISO del país del prefijo, p. ej. "ES"
  telefono: string; // número sin prefijo
  tipoWeb: string;
  otroTipo: string; // lo que escribe el cliente cuando elige "Otra diferente"
  presupuesto: string;
  servicios: string[];
};
type Errores = Partial<Record<keyof Datos, string>>;

const vacio: Datos = { nombre: "", correo: "", pais: "ES", telefono: "", tipoWeb: "", otroTipo: "", presupuesto: "", servicios: [] };

// Seguridad de entrada: longitudes máximas y limpieza de lo que se escribe (nunca se confía en lo que llega).
const MAX = { nombre: 80, correo: 120, telefono: 20, otroTipo: 150 } as const;
// Quita caracteres de control y las marcas < > que se usan para inyectar código; recorta espacios y longitud.
const limpiar = (v: string, max: number) =>
  v.replace(/[\u0000-\u001f\u007f<>]/g, "").replace(/\s+/g, " ").slice(0, max);
const MIN_SEGUNDOS = 3; // un humano tarda más que esto en rellenar el formulario; un bot, no
const ESPERA_ENTRE_ENVIOS_MS = 30_000;

function validar(d: Datos): Errores {
  const e: Errores = {};
  if (d.nombre.trim().length < 2) e.nombre = "Escribe tu nombre.";
  if (d.correo.length > MAX.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.correo.trim())) e.correo = "Escribe un correo válido, por ejemplo nombre@correo.com.";
  const avisoTel = avisoTelefono(d.telefono, d.pais as never, true);
  if (avisoTel) e.telefono = avisoTel;
  if (!d.tipoWeb) e.tipoWeb = "Elige el tipo de web.";
  else if (d.tipoWeb === OTRA && d.otroTipo.trim().length < 3) e.otroTipo = "Cuéntanos qué tipo de web buscas.";
  if (!d.presupuesto) e.presupuesto = "Elige un rango de presupuesto.";
  if (d.servicios.length === 0) e.servicios = "Marca al menos un servicio.";
  return e;
}

// ---------- piezas del formulario ----------

// Densidad del formulario: normal (sección propia) o compacto (dentro de la pantalla del teléfono)
const Densidad = createContext(false);
const alto = (compacto: boolean) => (compacto ? "h-[46px] max-md:h-[42px]" : "h-[52px]");

const campo =
  "w-full min-w-0 text-ellipsis rounded-[18px] border bg-black/[0.14] px-4 text-[13px] text-white md:px-5 md:text-[14px] placeholder:text-white/85 outline-none transition-colors duration-200 focus:bg-black/[0.22] focus-visible:ring-2 focus-visible:ring-white";

function Etiqueta({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  const compacto = useContext(Densidad);
  return (
    <label htmlFor={htmlFor} className={`${compacto ? "mb-1.5 max-md:mb-1" : "mb-2"} block text-[13px] font-medium text-white`}>
      {children}
    </label>
  );
}

function Error({ id, texto }: { id: string; texto?: string }) {
  return (
    <AnimatePresence initial={false}>
      {texto && (
        <motion.p
          id={id}
          role="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease }}
          className="flex items-center gap-1.5 overflow-hidden pt-1.5 text-[12px] font-medium text-white"
        >
          <AlertCircle className="size-3.5 shrink-0" aria-hidden /> {texto}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

const borde = (hayError: boolean) => (hayError ? "border-white border-2" : "border-white/35 focus:border-white");

function Seleccion({
  id,
  valor,
  onChange,
  placeholder,
  opciones,
  error,
}: {
  id: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder: string;
  opciones: string[];
  error?: string;
}) {
  const compacto = useContext(Densidad);
  return (
    <div className="relative">
      <select
        id={id}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${campo} ${alto(compacto)} ${borde(!!error)} cursor-pointer appearance-none pr-10 font-medium md:pr-12 ${valor ? "" : "text-white/85"}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {opciones.map((o) => (
          <option key={o} value={o} className="bg-white text-ink">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 md:right-5 -translate-y-1/2 fill-white text-white" aria-hidden />
    </div>
  );
}

function CampoTelefono({
  id,
  pais,
  numero,
  error,
  onPais,
  onNumero,
  onSalir,
}: {
  id: string;
  pais: string;
  numero: string;
  error?: string;
  onPais: (iso: string) => void;
  onNumero: (v: string) => void;
  onSalir?: () => void;
}) {
  const compacto = useContext(Densidad);
  const [abierto, setAbierto] = useState(false);
  const [consulta, setConsulta] = useState("");
  const [activo, setActivo] = useState(0);
  const caja = useRef<HTMLDivElement>(null);
  const buscador = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const listaId = `${id}-prefijos`;

  const actual = listaPaises().find((p) => p.iso === pais) ?? listaPaises()[0];
  const resultados = useMemo(() => filtrarPaises(consulta), [consulta]);

  const cerrar = (devolverFoco = true) => {
    setAbierto(false);
    setConsulta("");
    if (devolverFoco) caja.current?.querySelector<HTMLButtonElement>("button[aria-haspopup]")?.focus();
  };
  const elegir = (iso: string) => {
    onPais(iso);
    cerrar(false);
    document.getElementById(id)?.focus();
  };

  // al abrir: foco en el buscador y el país actual como opción activa
  useEffect(() => {
    if (!abierto) return;
    setActivo(Math.max(0, resultados.findIndex((p) => p.iso === pais)));
    buscador.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);
  useEffect(() => setActivo(0), [consulta]);
  // la opción activa siempre queda a la vista
  useEffect(() => {
    if (abierto) lista.current?.children[activo]?.scrollIntoView({ block: "nearest" });
  }, [activo, abierto]);
  // clic fuera = cerrar
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => {
      if (!caja.current?.contains(e.target as Node)) cerrar(false);
    };
    document.addEventListener("pointerdown", fuera);
    return () => document.removeEventListener("pointerdown", fuera);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  const teclas = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActivo((a) => Math.min(a + 1, resultados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActivo((a) => Math.max(a - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActivo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActivo(resultados.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (resultados[activo]) elegir(resultados[activo].iso);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      cerrar();
    } else if (e.key === "Tab") {
      cerrar(false);
    }
  };

  return (
    <div ref={caja} className="relative">
      <div
        className={`flex ${alto(compacto)} w-full items-stretch rounded-[18px] border bg-black/[0.14] transition-colors duration-200 focus-within:bg-black/[0.22] focus-within:ring-2 focus-within:ring-white ${borde(!!error)}`}
      >
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={abierto}
          aria-controls={abierto ? listaId : undefined}
          aria-label={`Prefijo telefónico: ${actual.nombre}, más ${actual.codigo}. Cambiar`}
          onClick={() => (abierto ? cerrar(false) : setAbierto(true))}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              setAbierto(true);
            }
          }}
          className="flex shrink-0 items-center gap-1.5 rounded-l-[16px] border-r border-white/35 pl-4 pr-3 text-[13px] font-semibold text-white outline-none transition-colors hover:bg-white/10 focus-visible:bg-white/15 md:pl-5 md:text-[14px]"
        >
          <span className="text-[11px] font-bold tracking-wider text-white/90">{actual.iso}</span>
          <span className="tabular-nums">+{actual.codigo}</span>
          <ChevronDown
            className={`size-3.5 transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
        <input
          id={id}
          type="tel"
          maxLength={MAX.telefono}
          autoComplete="tel-national"
          inputMode="tel"
          placeholder="Tu WhatsApp"
          value={numero}
          onChange={(e) => onNumero(e.target.value)}
          onBlur={onSalir}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="min-w-0 flex-1 rounded-r-[16px] bg-transparent px-4 text-[13px] text-white outline-none placeholder:text-white/85 md:text-[14px]"
        />
      </div>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease }}
            style={{ transformOrigin: "top left" }}
            className="absolute left-0 top-[calc(100%+8px)] z-30 w-[min(340px,100%)] overflow-hidden rounded-2xl bg-white text-ink shadow-[0_24px_60px_-12px_rgb(10_20_70/0.55)]"
          >
            <div className="relative border-b border-[#e7e9ee] p-2">
              <Search className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-gris" aria-hidden />
              <input
                ref={buscador}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls={listaId}
                aria-activedescendant={resultados[activo] ? `${listaId}-${resultados[activo].iso}` : undefined}
                aria-label="Buscar país o prefijo"
                placeholder="Busca un país o prefijo"
                autoComplete="off"
                value={consulta}
                onChange={(e) => setConsulta(e.target.value)}
                onKeyDown={teclas}
                className="h-10 w-full rounded-xl bg-[#f3f4f6] pl-9 pr-3 text-[13px] text-ink outline-none placeholder:text-gris focus-visible:ring-2 focus-visible:ring-azul"
              />
            </div>
            <ul ref={lista} id={listaId} role="listbox" aria-label="Prefijos telefónicos" className="max-h-[248px] overflow-y-auto overscroll-contain py-1">
              {resultados.map((p, i) => (
                <li
                  key={p.iso}
                  id={`${listaId}-${p.iso}`}
                  role="option"
                  aria-selected={p.iso === pais}
                  onPointerMove={() => setActivo(i)}
                  onClick={() => elegir(p.iso)}
                  className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-[13px] ${i === activo ? "bg-azul-claro" : ""}`}
                >
                  <span className="w-7 shrink-0 text-[11px] font-bold tracking-wider text-gris">{p.iso}</span>
                  <span className={`min-w-0 flex-1 truncate ${p.iso === pais ? "font-semibold" : ""}`}>{p.nombre}</span>
                  <span className="shrink-0 tabular-nums text-gris">+{p.codigo}</span>
                  {p.iso === pais && <Check className="size-4 shrink-0 text-azul" aria-hidden />}
                </li>
              ))}
              {resultados.length === 0 && <li className="px-4 py-6 text-center text-[13px] text-gris">Ningún país coincide.</li>}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Formulario({ compacto = false, columnas = false }: { compacto?: boolean; columnas?: boolean }) {
  const uid = useId();
  const [d, setD] = useState<Datos>(vacio);
  const [errores, setErrores] = useState<Errores>({});
  const [intentado, setIntentado] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [trampa, setTrampa] = useState(""); // campo invisible: solo los bots lo rellenan
  const abiertoEn = useRef(Date.now());
  const ultimoEnvio = useRef(0);
  const [aviso, setAviso] = useState("");
  const [telTocado, setTelTocado] = useState(false); // ya salió del campo del teléfono al menos una vez

  useEffect(() => {
    const iso = paisPorDefecto();
    setD((prev) => (prev.telefono ? prev : { ...prev, pais: iso }));
  }, []);

  const cambiar = <K extends keyof Datos>(k: K, v: Datos[K]) => {
    const lim = k === "nombre" ? MAX.nombre : k === "correo" ? MAX.correo : k === "telefono" ? MAX.telefono : k === "otroTipo" ? MAX.otroTipo : 200;
    const limpio = (typeof v === "string" ? limpiar(v, lim) : v) as Datos[K];
    const nuevo = { ...d, [k]: limpio };
    if (k === "tipoWeb" && limpio !== OTRA) nuevo.otroTipo = ""; // si cambia de opinión, no se arrastra el texto
    setD(nuevo);
    if (intentado) setErrores(validar(nuevo)); // tras el primer intento, los avisos se actualizan al escribir
  };

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    setAviso("");
    // Antirrobot: el campo trampa relleno o un envío instantáneo = bot. Se finge éxito sin hacer nada.
    if (trampa || Date.now() - abiertoEn.current < MIN_SEGUNDOS * 1000) {
      setEnviado(true);
      return;
    }
    if (Date.now() - ultimoEnvio.current < ESPERA_ENTRE_ENVIOS_MS) {
      setAviso("Ya enviaste una solicitud hace un momento. Espera unos segundos antes de volver a intentarlo.");
      return;
    }
    setIntentado(true);
    const err = validar(d);
    setErrores(err);
    if (Object.keys(err).length > 0) {
      const primero = Object.keys(err)[0];
      document.getElementById(primero === "servicios" ? `${uid}-servicios` : `${uid}-${primero}`)?.focus();
      return;
    }
    // Aún no hay servidor: los datos no se envían a ningún sitio (ver nota del proyecto).
    // Cuando se conecte uno, validar y limpiar OTRA VEZ en el servidor: la comprobación del navegador no es una defensa.
    ultimoEnvio.current = Date.now();
    setEnviado(true);
  };

  const id = (n: string) => `${uid}-${n}`;
  // Aviso del teléfono en vivo: si sobran dígitos, al instante; si faltan o el formato no encaja, al salir del campo
  const errorTelefono = errores.telefono ?? avisoTelefono(d.telefono, d.pais as never, telTocado || intentado) ?? undefined;

  return (
    <Densidad.Provider value={compacto}>
    <AnimatePresence mode="wait" initial={false}>
      {enviado ? (
        <motion.div
          key="ok"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease }}
          className={`flex ${compacto ? "min-h-[360px]" : "min-h-[420px]"} flex-col items-center justify-center text-center`}
          role="status"
        >
          <motion.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
            className="grid size-16 place-items-center rounded-full bg-white text-azul"
          >
            <Check className="size-8" strokeWidth={3} aria-hidden />
          </motion.span>
          <h3 className="mt-6 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-white">
            ¡Gracias, {d.nombre.trim().split(" ")[0]}!
          </h3>
          <p className="mt-3 max-w-[320px] font-serif text-[16px] italic leading-relaxed text-white">
            Hemos recibido tus datos. Nuestro equipo se pondrá en contacto contigo para agendar la reunión.
          </p>
          <button
            type="button"
            onClick={() => {
              setD(vacio);
              setErrores({});
              setIntentado(false);
              setEnviado(false);
            }}
            className="mt-7 rounded-full border border-white/70 px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-white hover:text-azul focus-visible:ring-2 focus-visible:ring-white"
          >
            Rellenar de nuevo
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={enviar}
          noValidate
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={columnas ? "grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-5 md:grid-cols-2" : compacto ? "space-y-3.5 max-md:space-y-2.5" : "space-y-5"}
        >
          <h3 className={`${columnas ? "md:col-span-2" : ""} max-w-[520px] font-extrabold leading-[1.12] tracking-[-0.035em] text-white ${compacto ? "text-[21px] max-md:text-[19px]" : "text-[26px] md:text-[28px]"}`}>
            Rellena tus datos para agendar una reunión.
          </h3>

          <div className="min-w-0 space-y-5 md:col-start-1 md:row-start-2">
          <div>
            <Etiqueta htmlFor={id("nombre")}>Nombre *</Etiqueta>
            <input
              id={id("nombre")}
              type="text"
              maxLength={MAX.nombre}
              autoComplete="name"
              placeholder="Escribe tu nombre"
              value={d.nombre}
              onChange={(e) => cambiar("nombre", e.target.value)}
              aria-invalid={!!errores.nombre}
              aria-describedby={errores.nombre ? id("nombre-error") : undefined}
              className={`${campo} ${alto(compacto)} ${borde(!!errores.nombre)}`}
            />
            <Error id={id("nombre-error")} texto={errores.nombre} />
          </div>

          <div>
            <Etiqueta htmlFor={id("correo")}>Correo electrónico *</Etiqueta>
            <input
              id={id("correo")}
              type="email"
              maxLength={MAX.correo}
              autoComplete="email"
              placeholder="Escribe tu mejor correo"
              value={d.correo}
              onChange={(e) => cambiar("correo", e.target.value)}
              aria-invalid={!!errores.correo}
              aria-describedby={errores.correo ? id("correo-error") : undefined}
              className={`${campo} ${alto(compacto)} ${borde(!!errores.correo)}`}
            />
            <Error id={id("correo-error")} texto={errores.correo} />
          </div>

          <div>
            <Etiqueta htmlFor={id("telefono")}>Teléfono de contacto *</Etiqueta>
            <CampoTelefono
              id={id("telefono")}
              pais={d.pais}
              numero={d.telefono}
              error={errorTelefono}
              onPais={(iso) => cambiar("pais", iso)}
              onNumero={(v) => cambiar("telefono", v)}
              onSalir={() => setTelTocado(true)}
            />
            <Error id={id("telefono-error")} texto={errorTelefono} />
          </div>

          </div>

          <div className="min-w-0 space-y-5 md:col-start-2 md:row-span-2 md:row-start-2">
          <div>
            <Etiqueta htmlFor={id("tipoWeb")}>¿Qué tipo de web necesitas? *</Etiqueta>
            <Seleccion
              id={id("tipoWeb")}
              valor={d.tipoWeb}
              onChange={(v) => cambiar("tipoWeb", v)}
              placeholder="Selecciona el tipo de web"
              opciones={TIPOS_WEB}
              error={errores.tipoWeb}
            />
            <Error id={id("tipoWeb-error")} texto={errores.tipoWeb} />
            <AnimatePresence initial={false}>
              {d.tipoWeb === OTRA && (
                <motion.div
                  key="otro"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease }}
                  className="overflow-hidden"
                >
                  <div className="pt-3">
                    <Etiqueta htmlFor={id("otroTipo")}>Cuéntanos qué tipo de web buscas *</Etiqueta>
                    <input
                      id={id("otroTipo")}
                      type="text"
                      maxLength={MAX.otroTipo}
                      autoComplete="off"
                      placeholder="Escribe lo que necesitas"
                      value={d.otroTipo}
                      onChange={(e) => cambiar("otroTipo", e.target.value)}
                      aria-invalid={!!errores.otroTipo}
                      aria-describedby={errores.otroTipo ? id("otroTipo-error") : undefined}
                      className={`${campo} ${alto(compacto)} ${borde(!!errores.otroTipo)}`}
                    />
                    <Error id={id("otroTipo-error")} texto={errores.otroTipo} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <Etiqueta htmlFor={id("presupuesto")}>¿Cuál es tu presupuesto aproximado? *</Etiqueta>
            <Seleccion
              id={id("presupuesto")}
              valor={d.presupuesto}
              onChange={(v) => cambiar("presupuesto", v)}
              placeholder="Selecciona tu presupuesto"
              opciones={PRESUPUESTOS}
              error={errores.presupuesto}
            />
            <Error id={id("presupuesto-error")} texto={errores.presupuesto} />
          </div>

          <fieldset aria-describedby={errores.servicios ? id("servicios-error") : undefined}>
            <legend className="mb-3 text-[13px] font-medium leading-snug text-white">
              ¿Qué servicio te gustaría contratar? Selecciona los que quieras. *
            </legend>
            <div id={id("servicios")} tabIndex={-1} className="space-y-3 outline-none">
              {SERVICIOS.map((s) => {
                const marcado = d.servicios.includes(s);
                return (
                  <label key={s} className="group flex cursor-pointer items-center gap-3 text-[13px] text-white">
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={() =>
                        cambiar("servicios", marcado ? d.servicios.filter((x) => x !== s) : [...d.servicios, s])
                      }
                      className="peer sr-only"
                    />
                    <span
                      className={`grid size-[26px] shrink-0 place-items-center rounded-[8px] border-2 bg-black/[0.14] text-azul transition duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-white peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-noche group-hover:border-white peer-checked:bg-white ${
                        errores.servicios ? "border-white" : "border-white/60"
                      }`}
                      aria-hidden
                    >
                      <motion.span
                        initial={false}
                        animate={{ scale: marcado ? 1 : 0.3, opacity: marcado ? 1 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 22 }}
                      >
                        <Check className="size-4" strokeWidth={3.5} />
                      </motion.span>
                    </span>
                    {s}
                  </label>
                );
              })}
            </div>
            <Error id={id("servicios-error")} texto={errores.servicios} />
          </fieldset>

          </div>

          <div className="min-w-0 space-y-5 md:col-start-1 md:row-start-3">
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              No rellenar este campo
              <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" value={trampa} onChange={(e) => setTrampa(e.target.value)} />
            </label>
          </div>
          {aviso && (
            <p role="alert" className="text-[12px] font-medium text-white">
              {aviso}
            </p>
          )}
          <button
            type="submit"
            className={`mt-2 ${alto(compacto)} w-full rounded-full bg-gradient-to-r from-[#c4e6ff] to-[#7fe6ff] text-[14px] font-semibold text-ink shadow-[0_14px_30px_-12px_rgb(0_0_0/0.45)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-12px_rgb(0_0_0/0.5)] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-noche active:translate-y-0`}
          >
            Enviar
          </button>

          <p className="font-serif text-[14px] italic leading-snug text-white max-md:text-[13px]">
            Nuestro equipo analizará tu caso y se pondrá en contacto contigo para presentarte una propuesta clara.
          </p>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
    </Densidad.Provider>
  );
}

// ---------- sección ----------

// Segunda y última sección: el texto gigante avanza siempre (también quieto) y acelera con el scroll,
// la línea ondulada se dibuja sola y debajo queda el panel con el formulario.
export function Contacto() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  // Cinta infinita: avance continuo por tiempo + empuje del scroll, en bucle sin saltos.
  const unidad = useRef<HTMLSpanElement>(null);
  const [ancho, setAncho] = useState(0);
  const tiempo = useMotionValue(0);
  const x = useMotionValue(0);
  useEffect(() => {
    const medir = () => setAncho(unidad.current?.offsetWidth ?? 0);
    medir();
    document.fonts?.ready.then(medir);
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);
  useAnimationFrame((_, delta) => {
    tiempo.set(tiempo.get() + (VELOCIDAD * Math.min(delta, 64)) / 1000);
    if (!ancho) return;
    x.set(-((tiempo.get() + scrollYProgress.get() * EMPUJE_SCROLL) % ancho));
  });

  // La línea ondulada se dibuja sola cuando la sección aparece en pantalla.
  const draw = useMotionValue(0.05);
  const enVista = useInView(ref, { amount: 0.2, once: true });
  useEffect(() => {
    if (!enVista) return;
    const a = animate(draw, 1, { duration: 2.4, delay: 0.2, ease: [0.45, 0, 0.2, 1] });
    return () => a.stop();
  }, [enVista, draw]);

  return (
    <section ref={ref} id="contacto" className="relative overflow-hidden bg-white pb-24 pt-6 md:pb-32 md:pt-10">
      <div className="relative">
        <motion.p
          style={{ x }}
          data-cinta
          className="relative z-0 whitespace-nowrap text-[96px] font-semibold leading-[0.9] tracking-[-0.055em] text-ink md:text-[200px]"
          aria-hidden
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
          className="pointer-events-none absolute inset-x-0 top-[calc(50%-120px)] z-10 h-[190px] w-full md:top-[calc(50%-190px)] md:h-[300px]"
          aria-hidden
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
      </div>

      <div className="relative z-20 mx-auto mt-10 w-full max-w-[640px] px-6 md:mt-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease }}
          className="relative rounded-[28px] bg-azul px-6 pb-9 pt-10 text-white shadow-[0_40px_80px_-30px_rgb(29_91_255/0.6)] md:px-10 md:pb-11 md:pt-12"
        >
          {/* pestaña de acento superior */}
          <span
            aria-hidden
            className="absolute left-1/2 top-0 h-3 w-[82%] -translate-x-1/2 rounded-b-xl bg-gradient-to-r from-[#c4e6ff] to-[#7fe6ff]"
          />
          <Formulario />
        </motion.div>
      </div>
    </section>
  );
}
