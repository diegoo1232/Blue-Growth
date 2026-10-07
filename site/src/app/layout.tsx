import type { Metadata } from "next";
import { Great_Vibes, Lora, Poppins } from "next/font/google";
import { Providers } from "@/components/site/providers";
import "./globals.css";

// Titulares y texto de interfaz: Poppins (los pesos 800 y 900 dan el titular grueso y apretado)
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Texto de apoyo: serif cursiva
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  style: ["italic"],
});

// Firma caligráfica enorme y tenue del fondo de la portada
const script = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "BLUE GROWTH — Tu web profesional, más accesible",
  description:
    "Diseñamos sitios web profesionales, rápidos y accesibles para que tu negocio llegue a más personas. Agenda una reunión con BLUE GROWTH.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${poppins.variable} ${lora.variable} ${script.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
