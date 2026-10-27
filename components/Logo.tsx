export function Mark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect x="16" y="6" width="32" height="52" rx="8" fill="currentColor" />
      <path d="M28 23v18l14-9z" fill="#09090c" />
    </svg>
  );
}

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-volt"><Mark className="h-7 w-7" /></span>
      <span className="text-[1.05rem] tracking-tight">
        <span className="font-semibold">Cena</span>{" "}
        <span className="font-display italic text-soft text-[1.2rem]">Pronta</span>
      </span>
    </div>
  );
}
