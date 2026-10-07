import { EscenaTelefono } from "@/components/site/escena-telefono";
import { Hero } from "@/components/site/hero";
import { Pie } from "@/components/site/pie";
import { SeccionReunion } from "@/components/site/reunion";

// Tres secciones: 1) portada, 2) escena en la que el teléfono crece y su pantalla acaba en azul liso,
// 3) ficha oscura con el formulario para agendar una reunión. (La versión anterior, con el formulario en un
// panel aparte, está guardada en respaldos/2026-10-05-formulario-simple.)
export default function Home() {
  return (
    <main className="flex-1 overflow-x-clip">
      <Hero />
      <EscenaTelefono />
      <SeccionReunion />
      <Pie />
    </main>
  );
}
