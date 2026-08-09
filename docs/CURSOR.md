# Cursor — Paraty by UTMB

## Como abrir

1. **File → Open Workspace from File…**
2. Selecione **`byUTMB.code-workspace`** na raiz do repo

Não abra subpastas avulsas nem `Documents/byutmb` (projeto antigo separado).

## O que o workspace faz

- Raiz do repo visível (`web/`, `docs/`, etc.)
- Terminal novo abre em **`web/`** (onde roda `npm run dev`)
- `.next/` e `node_modules/` ocultos da busca

## Agent mode

Regras persistentes em `.cursor/rules/projeto-byutmb.mdc` — o Agent sabe que só
`web/` é código ativo.

## Rollback do iOS

Se precisar do app Swift de volta:

```bash
git checkout backup/ios-completo-20260809
# ou
tar -xzf ~/Desktop/byUTMB-ios-backup-20260809.tar.gz -C /Users/Rafael/byUTMB
```
