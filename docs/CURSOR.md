# Cursor — Paraty by UTMB

## Como abrir

1. No Finder, **duplo clique** em `byUTMB.code-workspace`  
   — ou **File → Open…** (`Cmd+O`) e selecione esse arquivo
2. Confirme que a barra de título mostra **Paraty by UTMB** (não só o JSON do arquivo)

Não abra subpastas avulsas nem `Documents/byutmb` (projeto antigo separado).

### Erro: `cwd "/Users/Rafael/byUTMB/byUTMB" does not exist`

**Correção imediata:** a pasta `byUTMB/` na raiz foi recriada como ponte — recarregue a
janela (**Cmd+Shift+P** → `Developer: Reload Window`) e abra um terminal novo.

**Correção definitiva:**

1. **File → Close Window**
2. Duplo clique em `/Users/Rafael/byUTMB/byUTMB.code-workspace` no Finder
3. Terminal novo deve abrir em `.../byUTMB/web`

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
