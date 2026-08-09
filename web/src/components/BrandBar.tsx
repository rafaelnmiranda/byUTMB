import Link from "next/link";

import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

/** Faixa superior da marca, com a versão do logo adequada ao contraste do tema. */
export function BrandBar({
  logoClassName = "h-14 sm:h-16",
  className = "",
}: {
  logoClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-screen-gradient relative overflow-hidden px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] ${className}`}
    >
      <div className="relative flex items-center justify-between gap-3">
        <Link href="/" className="shrink-0 rounded-sm focus-visible:outline-offset-4">
          <Logo variant="light" className={`${logoClassName} dark:hidden`} priority />
          <Logo variant="dark" className={`hidden ${logoClassName} dark:block`} />
        </Link>
        <ThemeToggle />
      </div>
    </div>
  );
}
