"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { Logo } from "./logo";

// Pie de página: marca, navegación, enlaces legales y derechos reservados.
// Los textos legales se abren en una ventana (la web es de una sola página, sin subpáginas). Son un BORRADOR general:
// los datos entre corchetes (titular, NIF, domicilio, correo) hay que rellenarlos y un profesional debe revisarlos.

type Legal = { id: string; titulo: string; actualizado: string; cuerpo: { h?: string; p: string }[] };

const TITULAR = "[Nombre o razón social del titular]";
const CORREO = "[correo de contacto]";

const LEGAL: Legal[] = [
  {
    id: "privacidad",
    titulo: "Política de privacidad",
    actualizado: "octubre de 2026",
    cuerpo: [
      { h: "1. Quién es el responsable", p: `El responsable del tratamiento de tus datos es ${TITULAR}, con NIF [NIF] y domicilio en [domicilio]. Puedes escribirnos a ${CORREO}.` },
      { h: "2. Qué datos recogemos", p: "Solo los que nos das al rellenar el formulario para agendar una reunión: nombre, correo electrónico, teléfono, tipo de web que necesitas, presupuesto aproximado y servicios que te interesan." },
      { h: "3. Para qué los usamos", p: "Para responder a tu solicitud, contactarte y prepararte una propuesta. No los usamos para enviarte publicidad si no lo has pedido, ni tomamos decisiones automatizadas con ellos." },
      { h: "4. Por qué podemos usarlos", p: "Porque nos lo pides tú al enviar el formulario (consentimiento) y para atender tu petición de información o presupuesto." },
      { h: "5. Cuánto tiempo los guardamos", p: "El tiempo necesario para atender tu solicitud y, después, durante los plazos legales en los que pudieran surgir responsabilidades. Pasado ese tiempo se eliminan o se anonimizan." },
      { h: "6. A quién se los comunicamos", p: "No cedemos tus datos a terceros salvo obligación legal. Pueden acceder a ellos proveedores que nos prestan servicios (alojamiento web, correo), que actúan siguiendo nuestras instrucciones y con las garantías exigidas por la ley." },
      { h: "7. Tus derechos", p: `Puedes pedir acceso, rectificación, supresión, oposición, limitación y portabilidad de tus datos escribiendo a ${CORREO}. Si crees que no hemos atendido bien tu petición, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).` },
    ],
  },
  {
    id: "aviso",
    titulo: "Aviso legal",
    actualizado: "octubre de 2026",
    cuerpo: [
      { h: "Titular del sitio", p: `Este sitio web pertenece a ${TITULAR}, con NIF [NIF], domicilio en [domicilio] y correo de contacto ${CORREO}. Nombre comercial: BLUE GROWTH.` },
      { h: "Propiedad intelectual", p: "Los textos, diseños, logotipos, imágenes y el código de esta web son de su titular o se usan con permiso. No se pueden copiar, distribuir ni transformar sin autorización por escrito." },
      { h: "Responsabilidad", p: "Hacemos lo posible por mantener la información correcta y actualizada, pero no garantizamos que esté libre de errores ni que el sitio esté siempre disponible. Los contenidos son informativos y no constituyen una oferta vinculante." },
      { h: "Enlaces", p: "Si enlazamos a páginas de terceros, no somos responsables de su contenido ni de sus políticas." },
      { h: "Ley aplicable", p: "Este aviso se rige por la legislación española. Para cualquier conflicto serán competentes los juzgados y tribunales que correspondan según la ley." },
    ],
  },
  {
    id: "cookies",
    titulo: "Política de cookies",
    actualizado: "octubre de 2026",
    cuerpo: [
      { h: "Qué son", p: "Las cookies son pequeños archivos que una web guarda en tu dispositivo para recordar información." },
      { h: "Cuáles usamos", p: "Esta web no usa cookies de seguimiento, de publicidad ni de analítica. Solo puede guardar datos técnicos imprescindibles para que funcione y que no requieren tu consentimiento." },
      { h: "Si cambia", p: "Si en el futuro añadimos herramientas de analítica o publicidad, te lo avisaremos y te pediremos permiso antes de activarlas. Podrás borrar o bloquear las cookies desde la configuración de tu navegador en cualquier momento." },
    ],
  },
  {
    id: "terminos",
    titulo: "Términos de uso",
    actualizado: "octubre de 2026",
    cuerpo: [
      { h: "Uso del sitio", p: "Al usar esta web aceptas utilizarla de forma lícita y sin dañar su funcionamiento ni el de otros usuarios." },
      { h: "Solicitudes de reunión", p: "Enviar el formulario no crea ninguna obligación ni contrato. Tras contactarte te presentaremos una propuesta y, solo si la aceptas, se formalizará por escrito." },
      { h: "Precios y plazos", p: "Los precios y plazos que se mencionen en la web son orientativos. Los definitivos son los de la propuesta que recibas." },
      { h: "Cambios", p: "Podemos actualizar estos términos y los demás textos legales. Siempre estará publicada la versión vigente." },
    ],
  },
];

const NAVEGACION = [
  { t: "Inicio", h: "#" },
  { t: "Nuestros diseños", h: "#contacto" },
  { t: "Agendar reunión", h: "#reunion" },
];

export function Pie() {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [abierto, setAbierto] = useState<Legal | null>(null);

  const abrir = (l: Legal) => {
    setAbierto(l);
    dialogo.current?.showModal();
  };

  return (
    <footer id="pie" className="border-t border-black/10 bg-white px-6 pb-10 pt-14">
      <div className="mx-auto grid max-w-[1120px] gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo completo alto={56} className="text-ink" />
          <p className="mt-4 max-w-[320px] font-serif text-[15px] leading-snug text-gris">
            Diseñamos webs rápidas, claras y accesibles para que tu negocio llegue a más personas.
          </p>
        </div>

        <nav aria-label="Navegación del pie">
          <p className="text-[13px] font-semibold text-ink">Navegación</p>
          <ul className="mt-4 space-y-2.5 text-[13px] text-gris">
            {NAVEGACION.map((n) => (
              <li key={n.t}>
                <a href={n.h} className="transition-colors hover:text-azul">
                  {n.t}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Información legal">
          <p className="text-[13px] font-semibold text-ink">Legal</p>
          <ul className="mt-4 space-y-2.5 text-[13px] text-gris">
            {LEGAL.map((l) => (
              <li key={l.id}>
                <button type="button" onClick={() => abrir(l)} className="cursor-pointer text-left transition-colors hover:text-azul">
                  {l.titulo}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mx-auto mt-12 flex max-w-[1120px] flex-col gap-2 border-t border-black/10 pt-6 text-[12px] text-gris md:flex-row md:items-center md:justify-between">
        <p data-slot-type="brand-name-compound">© {new Date().getFullYear()} BLUE GROWTH. Todos los derechos reservados.</p>
        <p>Hecho con cuidado, para que tu web trabaje por ti.</p>
      </div>

      <dialog
        ref={dialogo}
        onClose={() => setAbierto(null)}
        onClick={(e) => e.target === dialogo.current && dialogo.current?.close()}
        aria-labelledby="titulo-legal"
        className="m-auto w-[min(640px,calc(100vw-32px))] rounded-2xl bg-white p-0 text-ink shadow-[0_40px_80px_-30px_rgb(10_20_60/0.5)] backdrop:bg-black/50"
      >
        {abierto && (
          <div className="flex max-h-[min(80svh,640px)] flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-black/10 px-6 py-5">
              <div>
                <h2 id="titulo-legal" className="text-[20px] font-semibold tracking-tight">
                  {abierto.titulo}
                </h2>
                <p className="mt-1 text-[12px] text-gris">Última actualización: {abierto.actualizado}</p>
              </div>
              <button
                type="button"
                onClick={() => dialogo.current?.close()}
                aria-label="Cerrar"
                className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-niebla text-ink transition-colors hover:bg-black/10"
              >
                <X className="size-4" />
              </button>
            </div>
            <div data-lenis-prevent className="overflow-y-auto overscroll-contain px-6 py-5 text-[14px] leading-relaxed text-ink/80">
              {abierto.cuerpo.map((b, i) => (
                <div key={i} className={i ? "mt-5" : ""}>
                  {b.h && <h3 className="text-[14px] font-semibold text-ink">{b.h}</h3>}
                  <p className={b.h ? "mt-1" : ""}>{b.p}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </dialog>
    </footer>
  );
}
