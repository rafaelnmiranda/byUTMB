import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

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
    <header className="px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
      {/* Faixa da marca: logo à esquerda, controle de tema à direita */}
      <div className="mb-3 flex items-center justify-between">
        <Logo className="h-7" />
        <ThemeToggle />
      </div>

      <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-foreground">
        {title}
      </h1>
      {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}

      {/* Régua amarela curta — assinatura visual da marca */}
      <span aria-hidden className="mt-3 block h-1 w-10 rounded-full bg-utmb-yellow" />

      {children}
    </header>
  );
}

/** Carimbo de frescor: o atleta precisa saber se está vendo dado de cache. */
export function UpdatedAt({ time }: { time: string }) {
  return <p className="px-4 pb-4 text-center text-xs text-muted/80">Atualizado às {time}</p>;
}
