# Como atualizar a programação

A programação do app vem de uma planilha do Google Sheets. **Não é preciso mexer em
código nem publicar nada**: alterou a planilha, o app pega sozinho em até 5 minutos.

**Planilha:**
<https://docs.google.com/spreadsheets/d/1Tn6sLvxj5kEQD9l8hZb9BP8dxz1sQzKp/edit>

## Colunas

| Coluna | Obrigatória | O que preencher |
|---|---|---|
| `data` | ✅ | `2026-09-17` ou `17/09/2026` |
| `hora` | ✅ | `07:30` (aceita `7:30`). Horário de Paraty |
| `titulo` | ✅ | Nome do evento como aparece na lista |
| `descricao` | | Texto da tela de detalhe. Pode ter vírgula |
| `local` | | `EXPO`, `ARENA`, `FAZENDA BANANAL`… |
| `duracao` | | **Em segundos.** Vazio = 1 hora |
| `tipo` | | `esporte`, `entretenimento` ou `ativacao` |
| `imagem` | | Reservada para uso futuro |
| `link` | | URL do botão "Saiba mais" |
| `destaque` | | `sim` para marcar como principal |

### Durações mais usadas

| Duração | Segundos |
|---|---|
| 30 min | `1800` |
| 1 hora | `3600` |
| 1h30 | `5400` |
| 3 horas | `10800` |
| 11 horas (Expo o dia todo) | `39600` |

## Regras que evitam dor de cabeça

1. **Não use Enter dentro de uma célula.** O app aguenta, mas a planilha fica ilegível.
2. **Não renomeie nem reordene as colunas do cabeçalho.** Acento e maiúscula tanto faz.
3. **Não apague a primeira linha** (o cabeçalho).
4. Vírgula na descrição pode. Aspas também.
5. Uma linha com erro (data inválida, por exemplo) é **ignorada** — o resto da
   programação continua no ar. Isso protege o evento, mas significa que um evento
   pode sumir silenciosamente: confira no app depois de editar.

## Durante o evento

Mudou horário por chuva? Edite a célula e pronto. Em até 5 minutos todos os atletas
veem a alteração, sem precisar atualizar nada no celular.

Quem estiver sem sinal continua vendo a última versão que baixou, com o carimbo
"atualizado às HH:mm" na tela — então dá para saber se a informação é fresca.

## Trocar de edição

Para virar o ano, é só substituir as linhas pelas datas novas. **Não há nenhuma data
fixa no código**: os dias das abas, o intervalo no cabeçalho e as páginas de cada
evento saem todos da planilha.

O arquivo [`agenda-2026.csv`](agenda-2026.csv) tem a agenda oficial de 17 a 20 de
setembro de 2026 já no formato certo, com exemplos de entretenimento e ativação em
todos os dias. Para usar:

1. Abra a planilha
2. Arquivo → Importar → Fazer upload → `agenda-2026.csv`
3. Escolha **"Substituir planilha"**
4. Confira no app

> As linhas cujo texto começa com `[EXEMPLO]` são sugestões minhas para você ver como
> entretenimento e ativação aparecem no app. Troque pelo conteúdo real ou apague.

## Publicação da planilha

O app lê o CSV publicado. Se algum dia a programação parar de carregar, confirme em
**Arquivo → Compartilhar → Publicar na web** que a planilha continua publicada como
CSV, e que o link bate com a variável `SCHEDULE_CSV_URL` do app.
