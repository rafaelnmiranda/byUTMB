import type { NextConfig } from "next";

/**
 * Hosts autorizados a carregar os recursos de desenvolvimento do Next.
 *
 * Por padrão o Next só libera `localhost`. Ao abrir o dev server pelo IP da rede
 * — que é como se testa no celular — os chunks de JavaScript voltam 403 e a
 * página aparece sem nenhuma interatividade: os filtros e o seletor de dias
 * simplesmente não respondem ao toque.
 *
 * Os padrões abaixo cobrem as faixas de rede local mais comuns. Se a sua rede
 * usar outra, exporte `DEV_ORIGIN` com o IP antes de subir o servidor:
 *
 *     DEV_ORIGIN=192.0.2.42 npm run dev
 *
 * Vale só em desenvolvimento; em produção esta configuração é ignorada.
 */
const devOrigins = [
  "192.168.*.*", // rede doméstica típica
  "10.*.*.*", // redes corporativas e parte dos roteadores
  "172.20.10.*", // hotspot pessoal do iPhone
  ...(process.env.DEV_ORIGIN ? [process.env.DEV_ORIGIN] : []),
];

const nextConfig: NextConfig = {
  allowedDevOrigins: devOrigins,
  images: {
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
