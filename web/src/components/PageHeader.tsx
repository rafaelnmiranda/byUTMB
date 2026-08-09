import { BrandBar } from "./BrandBar";

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
    <>
      <BrandBar />

      {/* Conteúdo da página: sobe levemente sobre o navy, como na home */}
      <header className="bg-screen-gradient relative z-10 -mt-2 px-4 pb-4 pt-5">
        <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-utmb-navy dark:text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-utmb-navy-deep/75 dark:text-foreground/80">{subtitle}</p>
        )}

        <span aria-hidden className="mt-3 block h-1 w-10 rounded-full bg-utmb-yellow" />

        {children}
      </header>
    </>
  );
}

/** Carimbo de frescor: o atleta precisa saber se está vendo dado de cache. */
export function UpdatedAt({ time }: { time: string }) {
  return <p className="px-4 pb-4 text-center text-xs text-muted/80">Atualizado às {time}</p>;
}
