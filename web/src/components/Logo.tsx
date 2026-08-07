import Image from "next/image";

/**
 * Logo oficial do evento.
 *
 * Duas artes: a colorida para fundo claro e a branca para fundo escuro. A troca
 * é feita por CSS a partir de `data-theme`, sem JavaScript — assim o logo já sai
 * certo na primeira pintura.
 */
export function Logo({ className = "h-9", onNavy = false }: { className?: string; onNavy?: boolean }) {
  if (onNavy) {
    return (
      <Image
        src="/logo-white.png"
        alt="Paraty Brazil by UTMB"
        width={640}
        height={277}
        priority
        className={`w-auto ${className}`}
      />
    );
  }

  return (
    <>
      <Image
        src="/logo-color.png"
        alt="Paraty Brazil by UTMB"
        width={640}
        height={453}
        className={`w-auto dark:hidden ${className}`}
      />
      <Image
        src="/logo-white.png"
        alt=""
        aria-hidden
        width={640}
        height={277}
        className={`hidden w-auto dark:block ${className}`}
      />
    </>
  );
}
