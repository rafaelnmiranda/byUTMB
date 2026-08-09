# Paraty Brazil by UTMB — PWA

Site instalável (PWA) do evento de trail running **Paraty Brazil by UTMB**, em Paraty/RJ.
Programação, parcerias, previsão do tempo e resgate de benefícios — atualizados via
Google Sheets, sem passar por loja de apps.

## Rodando

```bash
git clone https://github.com/rafaelnmiranda/byUTMB.git
cd byUTMB/web
npm install
cp .env.example .env.local   # e preencha as variáveis
npm run dev
```

## Cursor

Abra **`byUTMB.code-workspace`** na raiz do repo (não subpastas antigas).
Detalhes: [`docs/CURSOR.md`](docs/CURSOR.md).

## Documentação

- **[web/README.md](web/README.md)** — desenvolvimento, variáveis, deploy
- **[docs/PLANO_PWA.md](docs/PLANO_PWA.md)** — arquitetura e roteiro do PWA
- **[CLAUDE.md](CLAUDE.md)** — contexto para o Agent

> ⚠️ Há chaves de API em texto claro no **histórico** deste repositório público
> (OpenWeatherMap e NASA, do app iOS removido). Revogue-as se ainda estiverem ativas.

## Backup do app iOS

O código Swift foi removido em agosto/2026. Para restaurar:

- Tag Git: `backup/pre-ios-removal-20260809`
- Branch: `backup/ios-completo-20260809`
- Arquivo: `~/Desktop/byUTMB-ios-backup-20260809.tar.gz`
