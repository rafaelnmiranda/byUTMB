import Image from "next/image";

/** `dark` = logo branco (fundo navy/escuro). `light` = logo colorido (fundo claro). */
export type LogoVariant = "light" | "dark";

const ASSETS: Record<LogoVariant, string> = {
  light: "/logo-color.png",
  dark: "/logo-white.png",
};

/**
 * Logo oficial Nu apresenta · Paraty Brazil by UTMB.
 *
 * A variante é escolhida explicitamente pelo componente pai — não pelo tema CSS —
 * para evitar piscadas e logos errados ao alternar claro/escuro.
 */
export function Logo({
  className = "h-9",
  variant = "light",
  priority = false,
}: {
  className?: string;
  variant?: LogoVariant;
  priority?: boolean;
}) {
  return (
    <Image
      src={ASSETS[variant]}
      alt="Nu apresenta Paraty Brazil by UTMB"
      width={640}
      height={358}
      priority={priority}
      className={`w-auto ${className}`}
    />
  );
}
