// Logotipo provisional: brote de dos hojas dentro de un cuadrado azul.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap ${className}`}
      data-slot-type="brand-name"
    >
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
        <rect width="24" height="24" rx="7" fill="var(--azul)" />
        <path
          d="M12 18v-6m0 0c0-3 2-5 5-5 0 3-2 5-5 5Zm0 1c0-2.4-1.6-4-4-4 0 2.4 1.6 4 4 4Z"
          fill="none"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[13px] font-bold tracking-tight min-[360px]:text-[15px]">BLUE GROWTH</span>
    </span>
  );
}
