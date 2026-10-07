import type { NextConfig } from "next";

const dev = process.env.NODE_ENV !== "production";

// Política de contenido (CSP): el navegador solo ejecuta/carga lo que se enumera aquí.
// 'unsafe-inline' en scripts lo exige Next.js para arrancar la página sin servidor propio; en desarrollo
// además hace falta 'unsafe-eval' y el canal de recarga en vivo.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${dev ? " ws: wss:" : ""}`,
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  ...(dev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const cabeceras = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

// Exportación a archivos estáticos (HTML/CSS/JS) para un hosting normal como Hostinger: `EXPORTAR=1 npx next build` (carpeta .next-export).
// Se activa con EXPORTAR=1 y sale en otra carpeta (.next-export), así no toca el desarrollo ni el despliegue en Vercel.
// Un hosting estático no ejecuta `headers()`: las cabeceras de seguridad van en el archivo .htaccess de la exportación.
const exportar = process.env.EXPORTAR === "1";

const nextConfig: NextConfig = {
  poweredByHeader: false, // no anunciar qué tecnología usa la web
  productionBrowserSourceMaps: false, // no publicar el código fuente legible
  reactStrictMode: true,
  ...(exportar
    ? { output: "export" as const, distDir: ".next-export", images: { unoptimized: true } }
    : {
        async headers() {
          return [{ source: "/:path*", headers: cabeceras }];
        },
      }),
};

export default nextConfig;
