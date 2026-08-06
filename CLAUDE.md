# CLAUDE.md — contexto do projeto byUTMB

App iOS (SwiftUI) do evento **Paraty Brazil by UTMB** — trail running em Paraty/RJ.
Plano completo de retomada: **[`docs/PLANO_RETOMADA.md`](docs/PLANO_RETOMADA.md)**.

## Estrutura

- `byUTMB/Models/` — `Event`, `EventType`, `Weather*`, `Quote`, `AstronomyPicture`
- `byUTMB/Services/` — um `ObservableObject` por fonte de dados (Schedule, Weather, Quote, Astronomy)
- `byUTMB/Views/` — uma pasta por aba; `MainTabView` tem 5 abas; entrada é `SplashView`
- `byUTMB/Assets.xcassets` — logos (light/dark), cores UTMB, imagens de evento

O projeto usa **grupos sincronizados com o sistema de arquivos** (`objectVersion = 77`):
arquivos `.swift` novos dentro de `byUTMB/` entram no target automaticamente, **não é
preciso editar o `.pbxproj`** para adicionar arquivos.

## Fonte de dados

A programação vem de uma planilha pública do Google Sheets exportada em CSV
(`OnlineScheduleService.swift`). Colunas: `data, hora, titulo, descricao, local,
duracao, tipo, imagem`. `tipo` ∈ {esporte, entretenimento, ativacao}. `imagem` é o nome
de um asset local.

## Convenções

- Idioma da UI e dos comentários: **português (pt-BR)**
- Cores da marca vêm do asset catalog: `UTMBBlue`, `UTMBYellow`, `UTMBGreen`
  (⚠️ `byUTMBApp.swift` referencia com o case errado — ver plano §2.3)
- Views de erro seguem o padrão ícone + título + `error.localizedDescription` + botão
  "Tentar novamente"

## Armadilhas conhecidas (ler antes de mexer)

1. **Parser de CSV quebra em campos com aspas/vírgula** — plano §2.2
2. **Nomes de cores com case errado** — plano §2.3
3. **18 das 21 imagens do CSV não existem no asset catalog** — plano §2.4
4. **`Color.white`/`.black` fixos quebram dark mode** — plano §2.5
5. **Filtro de dia amarrado a 18–21 de setembro de 2025** — plano §2.6
6. **Chaves de API em texto claro em repo público** — plano §2.1 (revogar!)

## Build

Não há Xcode neste ambiente remoto (Linux). Compilação, testes e archive são feitos no
Mac. O workflow do GitHub Actions roda em `macos-latest` — mas **não há scheme
compartilhado** comitado, o que torna a CI frágil (plano §3.7).

Nunca comitar chaves de API. Nunca alterar o `DEVELOPMENT_TEAM` nem o
`PRODUCT_BUNDLE_IDENTIFIER` sem pedir confirmação.
