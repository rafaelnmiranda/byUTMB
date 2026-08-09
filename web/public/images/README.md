# Imagens do app

Fotos servidas em `/images/…` e referenciadas pela planilha com **nome curto** (sem URL).

## Parceiros (`partners/`)

Uma pasta por parceiro. Nome da pasta = parte antes de `_logo` / `_cover` na planilha.

```
partners/
  pupuspancparty/
    logo.png      → vira logo.webp
    cover.jpg     → vira cover.webp
  fugu/
    logo.png
    cover.jpg
```

| Planilha | Arquivo esperado |
|----------|------------------|
| `pupuspancparty_logo` | `partners/pupuspancparty/logo.*` |
| `pupuspancparty_cover` | `partners/pupuspancparty/cover.*` |

**Capas ainda faltando**: fugu, thaiparaty, quintaldavovo, hoka, mombora, coqueiro, housewhey, yopp — coloque `cover.jpg` na pasta e rode `npm run images:optimize`.  
`pupuspancparty`, `fugu`, `miracolo`, `bananadaterra`, `thaiparaty`, `quintaldavovo`, `hoka`, `mombora`, `coqueiro`, `housewhey`, `yopp`

## Eventos (`events/`)

Um arquivo por linha da coluna `imagem`:

```
events/
  expo_main.jpg
  start_ptr108.png
  podcast_cover.jpg
```

| Planilha | Arquivo |
|----------|---------|
| `expo_main` | `events/expo_main.*` |
| `start_ptr108` | `events/start_ptr108.*` |

## Admin web (`/admin/imagens`)

Painel oculto para ver o que falta e enviar fotos direto para `public/images/`:

1. Abra [http://localhost:3000/admin/imagens](http://localhost:3000/admin/imagens)
2. Senha padrão em dev: `byutmb2026` (ou `ADMIN_PASSWORD` no `.env.local`)
3. Filtre por **Faltando**, clique no item e escolha o arquivo

O upload grava `.webp` otimizado na pasta certa. **Só funciona em localhost** — na Vercel o disco é read-only; use o admin local, faça commit das imagens e deploy.

Alternativas futuras em produção: Vercel Blob ou S3.

## Otimizar manualmente

Depois de colocar PNG/JPG:

```bash
cd web
npm run images:optimize
```

Gera `.webp` redimensionado. Pode apagar o original ou mantê-lo como backup local.

## URL externa

Se a planilha tiver `https://…`, o app usa a URL direto (Drive, site do restaurante, etc.).
