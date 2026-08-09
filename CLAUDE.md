# CLAUDE.md — contexto do projeto byUTMB

Evento **Paraty Brazil by UTMB** — trail running em Paraty/RJ.

Repositório **PWA-only**. Todo o código ativo está em **`web/`**.

Contexto da arquitetura e roteiro: [`docs/PLANO_PWA.md`](docs/PLANO_PWA.md).
Desenvolvimento: [`web/README.md`](web/README.md).
Cursor: [`docs/CURSOR.md`](docs/CURSOR.md).

## Stack

Next.js 16 (App Router) · React 19 · Tailwind 4 · TypeScript · Vitest

## Fonte de dados

A programação vem de uma planilha pública do Google Sheets exportada em CSV.
Colunas: `data, hora, titulo, descricao, local, hora_final, tipo, imagem` (+ `link`,
`destaque` opcionais). Parceiros em aba `parceiros`.

## Convenções

- Idioma da UI e dos comentários: **português (pt-BR)**
- Prefixos web internos: `byutmb-*` (minúsculas)
- Comandos npm/node: sempre em `web/`
- Views de erro: ícone + título + mensagem + botão "Tentar novamente"

## Armadilhas conhecidas

1. **Parser CSV** — linha malformada é descartada, não derruba a página (`src/lib/csv.ts`)
2. **Horários** — fuso de Paraty; aceita `7:30` e `07:30`
3. **Service worker** — só em produção (`npm run build && npm run start`)
4. **Chaves de API** — nunca commitar; ficam em `.env.local` / Vercel
5. **Imagens em produção** — upload via `/admin/imagens` só funciona em localhost; deploy exige commit das imagens

## Build e testes

```bash
cd web
npm run dev      # desenvolvimento
npm test         # testes
npm run build    # produção
```

Deploy: Vercel, raiz do projeto = `web/`.
