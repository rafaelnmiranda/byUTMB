# Paraty Brazil by UTMB — PWA

Site instalável (PWA) do evento **Paraty Brazil by UTMB**.
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
| `npm run images:optimize` | Converte JPG/PNG de `public/images/` para WebP |

> O service worker só é registrado em produção (`npm run build && npm run start`),
> para não atrapalhar o hot reload.

## Testar no celular

O dev server já escuta na rede local e imprime o endereço ao subir:

```
- Network:  http://192.168.0.42:3000
```

Abra esse endereço no celular, com os dois aparelhos no mesmo Wi-Fi.

**Se a página abrir mas nada responder ao toque** — filtros e seletor de dias
inertes — é o Next bloqueando os chunks de JavaScript para hosts que não sejam
`localhost`. As faixas de rede local comuns já estão liberadas em
[`next.config.ts`](next.config.ts); se a sua for diferente, informe o IP:

```bash
DEV_ORIGIN=192.0.2.42 npm run dev
```

Para um teste mais fiel ao que o atleta vai ver, use a build de produção — sem
HMR, sem bloqueio de origem e com o desempenho real:

```bash
npm run build && npm run start
```

Em qualquer um dos dois, por HTTP puro o Safari **não registra o service
worker**, então offline e "Adicionar à Tela de Início" não funcionam. Para isso é
preciso HTTPS: `npm run dev -- --experimental-https` ou um deploy de preview.

## Variáveis de ambiente

Veja [`.env.example`](.env.example). Nenhuma chave entra no Git.

| Variável | Obrigatória | Uso |
|---|---|---|
| `SCHEDULE_CSV_URL` | recomendada | Planilha da programação em CSV. Sem ela o app sobe com a programação vazia |
| `PARTNERS_CSV_URL` | opcional | Aba `parceiros` em CSV. Se omitida, deriva da mesma planilha da programação |
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

**Benefícios de parceiros:** o catálogo fica em `/onde-comer`. O resgate presencial
é `/p/{slug}?k=…` (QR impresso). Regras e operação:
[`../docs/RESGATE_BENEFICIOS.md`](../docs/RESGATE_BENEFICIOS.md). Admin: `/admin/qrs`
(impressão) e `/admin/resgates` (métricas agregadas).

### Colunas da planilha

`data, hora, titulo, descricao, local, hora_final, tipo, imagem` e, opcionalmente,
`link` e `destaque`.

- `data`: `2025-09-18` ou `18/09/2025`
- `hora`: `07:30` ou `7:30`
- `hora_final`: `18:00` ou `18:00:00`; **vazio = só horário de início**
  (largadas, limites de chegada…)
- `duracao`: formato antigo em segundos, ainda aceito para compatibilidade
- `tipo`: `esporte`, `entretenimento` ou `ativacao` (acento e maiúscula toleradas)
- Horários são interpretados no fuso de Paraty e exibidos nele, qualquer que seja o
  fuso do aparelho

Uma linha malformada é descartada sem derrubar a página — o total descartado fica em
`Schedule.skipped`.

**Regra de operação:** evite Enter dentro de uma célula. O parser aguenta, mas a
planilha fica difícil de revisar.

## Ícones

Arquivos em `public/icons/` (`icon-192.png`, `icon-512.png`, `maskable-512.png`,
`apple-touch-icon.png`). Para regenerar a partir de um PNG 1024×1024:

```bash
npm i -D sharp
node -e "const s=require('sharp');const src='caminho/para/icon-1024.png';\
[192,512].forEach(n=>s(src).resize(n,n).png().toFile('public/icons/icon-'+n+'.png'));\
s(src).resize(180,180).png().toFile('public/icons/apple-touch-icon.png');"
npm uninstall sharp
```

## Deploy

Vercel, com a raiz do projeto apontada para `web/`. Cada push gera um preview; a
branch principal vai para produção.
