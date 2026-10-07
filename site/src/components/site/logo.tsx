// Logotipo oficial de Blue Growth, vectorizado a partir del original (public/marca/). Se pinta con CSS "máscara":
// toma el color del texto de donde se use (blanco sobre el azul, oscuro sobre el blanco), así que sirve para cualquier fondo.
// `completo` añade la línea "VENEZUELA"; sin ella se ve solo el nombre (cabecera). `alto` es la altura en px del dibujo.
export function Logo({ className = "", completo = false, alto }: { className?: string; completo?: boolean; alto?: number }) {
  const ratio = completo ? 879 / 235 : 879 / 178;
  const h = alto ?? (completo ? 58 : 22);
  const archivo = completo ? "/marca/blue-growth-logo.svg" : "/marca/blue-growth-wordmark.svg";
  return (
    <span
      role="img"
      aria-label={completo ? "Blue Growth Venezuela" : "Blue Growth"}
      data-slot-type="brand-name"
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        height: h,
        width: Math.round(h * ratio),
        WebkitMaskImage: `url(${archivo})`,
        maskImage: `url(${archivo})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
      }}
    />
  );
}
