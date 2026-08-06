# Paraty Brazil by UTMB — app iOS

App oficial do evento de trail running **Paraty Brazil by UTMB**, em Paraty/RJ.
SwiftUI, iOS. Cinco abas: Programação, Informações, Previsão do tempo, Astronomia e
Mensagem do dia.

A programação é carregada em tempo real de uma planilha do Google Sheets publicada em
CSV, o que permite à produção do evento atualizar horários sem publicar uma nova versão
do app.

## Rodando

Requer Xcode 16 ou superior.

```bash
git clone https://github.com/rafaelnmiranda/byUTMB.git
cd byUTMB
open byUTMB.xcodeproj
```

Selecione o scheme `byUTMB` e rode em um simulador de iPhone.

## Documentação

- **[docs/PLANO_RETOMADA.md](docs/PLANO_RETOMADA.md)** — auditoria do estado atual, bugs
  conhecidos, melhorias, plano de testes e roteiro de publicação na App Store
- **[CLAUDE.md](CLAUDE.md)** — contexto e convenções para trabalhar com o Claude Code

> ⚠️ Há chaves de API em texto claro no histórico deste repositório público
> (OpenWeatherMap e NASA). Elas precisam ser revogadas — ver plano §2.1.
