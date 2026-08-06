# Paraty Brazil by UTMB — PWA

Site instalável (PWA) do evento. Substitui o app iOS nativo que está em `../byUTMB`.
Contexto da decisão e roteiro: [`../docs/PLANO_PWA.md`](../docs/PLANO_PWA.md).

Next.js 16 (App Router) · React 19 · Tailwind 4 · TypeScript · Vitest

## Rodando

```bash
npm install
cp .env.example .env.local   # e preencha as variáveis
npm run dev
```

| Comando | O quê |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm test` | Testes do parser e da formatação |
| `npm run lint` | ESLint |

> O service worker só é registrado em produção (`npm run build && npm run start`),
> para não atrapalhar o hot reload.

## Variáveis de ambiente

Veja [`.env.example`](.env.example). Nenhuma chave entra no Git.

| Variável | Obrigatória | Uso |
|---|---|---|
| `SCHEDULE_CSV_URL` | recomendada | Planilha da programação em CSV. Sem ela o app sobe com a programação vazia |
| `OPENWEATHER_API_KEY` | opcional | Previsão do tempo. Sem ela, só a aba Previsão fica indisponível |
| `NEXT_PUBLIC_SITE_URL` | recomendada | Metadados e URLs absolutas dos links compartilhados |

## Como os dados chegam

```
Google Sheets (produção edita)
        │  CSV
        ▼
  src/lib/schedule.ts     fetch no servidor, revalida a cada 5 min
        │                 parse via src/lib/csv.ts (RFC 4180)
        ▼
   páginas pré-renderizadas → navegador recebe HTML pronto
        │
        ▼
   public/sw.js           cache para funcionar sem sinal
```

O celular do atleta nunca fala com o Google Sheets nem com a OpenWeatherMap — as
chaves ficam no servidor.

### Colunas da planilha

`data, hora, titulo, descricao, local, duracao, tipo, imagem` e, opcionalmente,
`link` e `destaque`.

- `data`: `2025-09-18` ou `18/09/2025`
- `hora`: `07:30` ou `7:30`
- `duracao`: em segundos; vazio vira 1 h
- `tipo`: `esporte`, `entretenimento` ou `ativacao` (acento e maiúscula toleradas)
- Horários são interpretados no fuso de Paraty e exibidos nele, qualquer que seja o
  fuso do aparelho

Uma linha malformada é descartada sem derrubar a página — o total descartado fica em
`Schedule.skipped`.

**Regra de operação:** evite Enter dentro de uma célula. O parser aguenta, mas a
planilha fica difícil de revisar.

## Ícones

Gerados a partir do ícone do app iOS. Para refazer:

```bash
npm i -D sharp
node -e "const s=require('sharp');const src='../byUTMB/Assets.xcassets/AppIcon.appiconset/1024.png';\
[192,512].forEach(n=>s(src).resize(n,n).png().toFile('public/icons/icon-'+n+'.png'));\
s(src).resize(180,180).png().toFile('public/icons/apple-touch-icon.png');"
npm uninstall sharp
```

## Deploy

Vercel, com a raiz do projeto apontada para `web/`. Cada push gera um preview; a
branch principal vai para produção.
