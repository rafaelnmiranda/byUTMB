export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-1 px-4 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h1>
      {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      {children}
    </header>
  );
}

/** Carimbo de frescor: o atleta precisa saber se está vendo dado de cache. */
export function UpdatedAt({ time }: { time: string }) {
  return (
    <p className="px-4 pb-4 text-center text-xs text-muted/80">Atualizado às {time}</p>
  );
}
