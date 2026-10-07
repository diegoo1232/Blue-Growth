"use client";

import { motion } from "motion/react";
import { ArrowRight, AtSign, Globe, Play, Send, Share2 } from "lucide-react";
import { DownloadButton } from "./hero";
import { Logo } from "./logo";
import { Phone, ScreenLight } from "./phone";

// Tarjeta oscura con el móvil que sobresale por arriba y por abajo. El móvil entra solo al aparecer
// en pantalla (se endereza) y después se balancea y flota sin parar, sin depender del scroll.
export function DownloadCta() {
  return (
    <section id="descarga" className="relative bg-niebla px-6 pb-24 pt-44 md:pb-28 md:pt-36">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto grid max-w-[1120px] rounded-[22px] bg-noche px-8 pb-12 pt-[300px] shadow-[0_40px_80px_-40px_rgb(20_22_27/0.6)] md:grid-cols-[1fr_1fr] md:px-14 md:py-16"
      >
        <div className="absolute -top-40 left-1/2 w-[200px] -translate-x-1/2 md:-top-24 md:left-[8%] md:w-[230px] md:translate-x-0">
          <motion.div
            initial={{ opacity: 0, rotate: -20, y: 140, x: -50 }}
            whileInView={{ opacity: 1, rotate: -6, y: 0, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flotar-suave">
              <div className="balancear">
                <Phone slot="descarga-movil">
                  <ScreenLight />
                </Phone>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="hidden md:block" />
        <div className="relative">
          <h2 className="text-[32px] font-medium leading-[1.05] tracking-[-0.03em] text-white md:text-[38px]">
            Descarga la app
            <br />
            en tu móvil
          </h2>
          <p className="mt-4 max-w-[240px] text-[13px] leading-relaxed text-white/65">
            Empieza a usarla hoy, de forma fácil y cómoda.
          </p>
          <DownloadButton className="mt-7" />
        </div>
      </motion.div>
    </section>
  );
}

const cols = [
  { t: "Recursos", l: ["Tutoriales", "Aprende", "Ayuda y soporte", "Blog"] },
  { t: "Empresa", l: ["Nosotros", "Empleo", "Privacidad", "Condiciones"] },
];

export function Footer() {
  return (
    <footer id="pie" className="bg-niebla px-6 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto grid max-w-[1120px] grid-cols-2 gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.6fr]"
      >
        <div className="col-span-2 md:col-span-1">
          <Logo />
        </div>
        {cols.map((c) => (
          <div key={c.t}>
            <p className="text-[13px] font-semibold text-ink">{c.t}</p>
            <ul className="mt-4 space-y-2.5 text-[12px] text-gris">
              {c.l.map((x) => (
                <li key={x}>
                  <a href="#" className="transition-colors hover:text-azul">
                    {x}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="col-span-2 md:col-span-1">
          <p className="text-[13px] font-semibold text-ink">Suscríbete a las novedades</p>
          <form className="mt-4 flex items-center gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Tu correo"
              aria-label="Tu correo electrónico"
              className="min-w-0 flex-1 border-b border-[#d5d8de] bg-transparent pb-2 text-[12px] text-ink outline-none transition-colors placeholder:text-gris focus:border-azul"
            />
            <button
              type="submit"
              aria-label="Suscribirme"
              className="grid size-8 place-items-center rounded-lg bg-azul text-white transition duration-300 hover:scale-110 hover:bg-[#1546d6]"
            >
              <ArrowRight className="size-4" />
            </button>
          </form>
          <div className="mt-6 flex gap-4 text-ink">
            {[Globe, AtSign, Send, Play, Share2].map((I, i) => (
              <a key={i} href="#" aria-label="Red social" className="transition duration-300 hover:-translate-y-0.5 hover:text-azul">
                <I className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </motion.div>
      <p className="mx-auto mt-12 max-w-[1120px] text-[12px] text-gris" data-slot-type="brand-name-compound">
        © 2026 BLUE GROWTH. Todos los derechos reservados.
      </p>
    </footer>
  );
}
