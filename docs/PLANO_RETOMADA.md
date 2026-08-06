# Plano de Retomada — App **Paraty Brazil by UTMB** (iOS)

> Documento de retomada gerado em **agosto/2026**, a partir de auditoria completa do
> código no branch `main` (último commit real: `043df22 Initial Commit`, abril/2025).
> Objetivo: relembrar o que existe, o que está quebrado, o que melhorar, e como
> testar e publicar na App Store.

---

## 1. O que já está feito

### 1.1 Estrutura do projeto

```
byUTMB.xcodeproj          Xcode 16 (objectVersion 77, grupos sincronizados com o disco*)
byUTMB/
  byUTMBApp.swift         @main → SplashView
  Models/                 Event, EventData, Weather, Quote, AstronomyPicture
  Services/               OnlineSchedule, Weather, Quote, Astronomy
  Views/
    SplashView            Splash animado (4 s) → MainTabView
    MainTabView           TabView com 5 abas
    Schedule/             OnlineScheduleView + Row + DetailView
    Information/          InformationView (sobre, local, site, contato)
    Weather/              WeatherView (atual + previsão 5 dias)
    Astronomy/            AstronomyView (NASA APOD + fullscreen)
    Quotes/               QuoteView (frase do dia + tradução + share)
    Components/LogoView   Logo que troca em dark mode
  Assets.xcassets         Logos, cores UTMB, 3 imagens de evento, AppIcon 1024
byUTMBTests/              1 teste vazio (framework Swift Testing)
byUTMBUITests/            2 testes de template (launch + performance)
.github/workflows/        Workflow "Xcode - Build and Analyze" (template do GitHub)
```

\* **Grupos sincronizados com o sistema de arquivos** (`PBXFileSystemSynchronizedRootGroup`):
qualquer `.swift` novo dentro de `byUTMB/` entra no target automaticamente. Isso significa
que **dá para editar/criar arquivos pelo Claude Code sem mexer no `.pbxproj`** — vantagem
grande para trabalhar remoto.

### 1.2 Configuração de build atual

| Chave | Valor | Observação |
|---|---|---|
| `PRODUCT_BUNDLE_IDENTIFIER` | `ParatyBrazil.byUTMB` | Não segue reverse-DNS; ver §3.6 |
| `MARKETING_VERSION` | `1.0` | |
| `CURRENT_PROJECT_VERSION` | `1` | Build number |
| `IPHONEOS_DEPLOYMENT_TARGET` | **18.1** | Muito alto; ver §3.5 |
| `TARGETED_DEVICE_FAMILY` | `1,2` | iPhone **e iPad** |
| `SWIFT_VERSION` | `5.0` | |
| `DEVELOPMENT_TEAM` | `YNYZ3J355Z` | Conta de desenvolvedor já configurada |
| `CODE_SIGN_STYLE` | `Automatic` | |
| Info.plist | Gerado (`GENERATE_INFOPLIST_FILE = YES`) | Sem arquivo físico |

### 1.3 As 5 abas

1. **Programação** — lê uma planilha do Google Sheets publicada em CSV, filtra por dia
   (segmented picker Quinta/Sexta/Sábado/Domingo) e por tipo (Esporte / Entretenimento /
   Ativação), com pull-to-refresh e tela de erro com "Tentar novamente".
2. **Informações** — próximo evento, texto "sobre" expansível, link do Google Maps,
   site oficial, e-mail e WhatsApp.
3. **Previsão** — OpenWeatherMap, coordenadas fixas de Paraty (-23.2178, -44.7131),
   clima atual + mín/máx do dia + previsão de 5 dias expansível.
4. **Astronomia** — NASA APOD (foto astronômica do dia) com visualização fullscreen.
5. **Mensagem** — ZenQuotes (frase do dia) + tradução via `lingva.ml` + botão compartilhar.

### 1.4 Fonte de dados da programação (verificada e no ar)

`https://docs.google.com/spreadsheets/d/1tsRN2gHLSVr59h3YCTWAXQuVXN8Kc2wqRENCtPTeR_0/export?format=csv`

- **31 eventos**, colunas: `data, hora, titulo, descricao, local, duracao, tipo, imagem`
- Distribuição: 18/09 → 9 · 19/09 → 10 · 20/09 → 7 · 21/09 → 5
- Tipos: esporte 17 · entretenimento 11 · ativacao 3
- **21 nomes de imagem distintos** referenciados

---

## 2. 🔴 Problemas críticos (corrigir antes de qualquer coisa)

### 2.1 SEGURANÇA — duas chaves de API expostas em repositório **público**

O repositório `rafaelnmiranda/byUTMB` é **público** e contém, em texto claro:

| Arquivo | Chave |
|---|---|
| `byUTMB/Services/WeatherService.swift:10` | `apiKey` do OpenWeatherMap |
| `byUTMB/Services/AstronomyService.swift:9` | `api_key` da NASA |

**Ação imediata, nesta ordem:**
1. **Revogar e gerar novas chaves** nos painéis do OpenWeatherMap e da NASA. Remover do
   código não basta — elas estão no histórico do Git e já podem ter sido raspadas por bots.
2. Mover as novas chaves para fora do código (§4.1).
3. Decidir sobre o histórico: ou aceitar (já revogadas, risco zero) ou tornar o repo
   privado. Reescrever histórico (`git filter-repo`) só vale a pena se o repo continuar
   público **e** você quiser limpeza cosmética.

> Nota realista: chave em app iOS **sempre** é extraível do binário. O que resolve de
> verdade é chave com escopo/quota restrita, ou um proxy simples (Supabase Edge Function,
> Cloudflare Worker) que guarda a chave no servidor. Ver §4.1.

### 2.2 BUG — parser de CSV quebra em campos com vírgula

`OnlineScheduleService.swift:46` faz `row.components(separatedBy: ",")`. O CSV do Google
Sheets usa aspas para campos que contêm vírgula. **4 dos 31 eventos** têm vírgula na
descrição:

- `Podcast Montanhista`
- `UTMB EXPO` (19/09)
- `Largada / Start UTSB110`
- `Largada / Start 7KM`

Nesses casos as colunas deslocam: o **local** vira pedaço da descrição, a **duração** vira
texto (cai no default de 3600 s), o **tipo** vira o número da duração (cai em
`entretenimento` — então a largada da UTSB110 aparece como entretenimento) e a **imagem**
vira o nome do tipo. O `guard columns.count >= 8` não pega isso porque sobram colunas, não
faltam.

**Correção:** parser de CSV que respeita aspas (§4.2). Só isso já conserta 4 eventos.

### 2.3 BUG — nome de cor errado, splash com fundo preto

`byUTMBApp.swift:12-14` declara:

```swift
static let utmbBlue  = Color("utmbBlue")
static let utmbYellow = Color("utmbYellow")
static let utmbGreen  = Color("utmbGreen")
```

Mas os assets se chamam **`UTMBBlue`**, **`UTMBYellow`**, **`UTMBGreen`** (maiúsculas).
Nomes de asset catalog são **case-sensitive** — as três cores não resolvem. Resultado:
fundo do splash e os `.tint()` dos botões saem na cor de fallback, não no azul UTMB.

**Correção:** usar os símbolos gerados pelo Xcode 15+ (`Color.utmbBlue`, sem string) — o
compilador passa a acusar erro se o asset sumir. Ver §4.3.

### 2.4 BUG — 18 das 21 imagens de evento não existem

O CSV pede 21 imagens; o `Assets.xcassets` só tem **3**:

| No app ✅ | Faltando ❌ |
|---|---|
| `expo_main` · `start_ptr20` · `training_mombora` | `activation_hoka`, `activation_yopp`, `autographs_main`, `awards_ceremony`, `briefing_cover`, `closing_ceremony`, `elite_athletes`, `film_caicara`, `film_trail_stories`, `kids_race`, `kit_retrieval`, `opening_official`, `podcast_cover`, `show_bandamarcial`, `start_7km`, `start_ptr35`, `start_ptr55`, `start_utsb110` |

`Image("nome_inexistente")` renderiza vazio: o detalhe do evento fica com um bloco branco
de 200 pt no topo em 27 dos 31 eventos.

**Duas saídas** (a segunda é melhor):
- **A.** Adicionar as 18 imagens ao asset catalog (aumenta o binário, exige redeploy do app
  para trocar foto).
- **B.** Trocar a coluna `imagem` da planilha por **URL** e usar `AsyncImage` + cache. Aí a
  produção troca imagem sem release. Recomendado. Fallback: placeholder com a cor/ícone do
  tipo do evento quando não houver imagem.

### 2.5 BUG — dark mode quebrado

- `OnlineScheduleView.swift:59` → `.background(Color.white)` fixo
- `InformationView.swift:143` → `.background(Color.white)` fixo
- `InformationView.swift:26` → `.foregroundColor(.black)` fixo

Em dark mode: texto preto sobre fundo branco dentro de uma tela escura, ou texto branco do
sistema sobre `Color.white`. Trocar por `Color(.systemBackground)` /
`Color(.secondarySystemGroupedBackground)` e deixar o texto em `.primary`.

### 2.6 BUG — filtro de dia amarrado a setembro/2025

`OnlineScheduleView.swift:124`:

```swift
let eventDay = calendar.component(.day, from: event.date) - 18
```

Só funciona nos dias 18–21. E os rótulos `["Quinta","Sexta","Sábado","Domingo"]` e o texto
`"18 a 21 de setembro 2025"` (linha 19) estão hard-coded. **Para a edição de 2026 o app
mostra a aba de programação vazia.** Precisa derivar os dias da própria planilha (§4.4).

### 2.7 RISCO — `DateFormatter` sem locale fixo

`OnlineScheduleService.swift:49-51` usa formato fixo `"yyyy-MM-dd HH:mm"` sem
`locale = Locale(identifier: "en_US_POSIX")`. É requisito documentado da Apple para
formatos fixos: em aparelhos com calendário não-gregoriano (tailandês, japonês) ou região
com preferências diferentes, o parse falha e **o evento some silenciosamente**. Some
também 6 eventos com hora de 1 dígito (`7:30`, `6:00`, `8:30`, `7:00`, `9:00`) — o ICU
costuma tolerar isso, mas não é garantido; melhor normalizar na planilha (`07:30`) **e**
tornar o parser tolerante.

---

## 3. Melhorias de arquitetura e produto

### 3.1 Concorrência: migrar para `async/await`

Os 4 services usam `URLSession.dataTask` + `DispatchQueue.main.async` + `DispatchGroup`.
Funciona, mas é verboso e não é checado pelo compilador. Com Swift 6 / iOS 17+:

- `class X: ObservableObject` → `@Observable @MainActor final class X`
- `dataTask(with:)` → `try await URLSession.shared.data(from:)`
- `DispatchGroup` no `WeatherService` → `async let` + `try await (a, b)`
- Some o `[weak self]` em todo lugar, some o risco de atualizar UI fora da main thread.

### 3.2 Sem cache offline — problema real em Paraty

Nenhum dos serviços persiste nada. Sem sinal (e o sinal na serra de Paraty é ruim), a aba
Programação mostra "Erro ao carregar". **Guardar o último CSV baixado** em
`FileManager.default.urls(for: .cachesDirectory)` e exibi-lo com um aviso
"exibindo dados de <horário>" é a melhoria de maior impacto para o atleta no dia do evento.

### 3.3 `NavigationView` está deprecado

Todas as 4 telas usam `NavigationView` → migrar para `NavigationStack`. No iPad,
`NavigationView` vira split view e a programação aparece numa coluna estreita com um painel
vazio ao lado — feio e provavelmente motivo de rejeição visual.

### 3.4 Abas fora do escopo do evento

**Astronomia** (NASA APOD) e **Mensagem do dia** (ZenQuotes) não têm relação com trail
running. Riscos:

- **Guideline 4.2 (Minimum Functionality):** conteúdo genérico de terceiros repackaged é
  exatamente o que a Apple olha com má vontade. Não é rejeição garantida, mas é ruído.
- **ZenQuotes** exige atribuição visível no plano gratuito ("Inspirational quotes provided
  by ZenQuotes API" com link). Hoje o app não tem essa atribuição — risco jurídico e de
  review.
- **`lingva.ml`** é instância comunitária que cai com frequência; a tradução vai falhar
  silenciosamente (o código não trata erro em `translateQuote`). Se quiser manter, use o
  framework **Translation** da Apple (iOS 17.4+), que é offline e grátis.

**Minha recomendação:** cortar as duas abas na v1.0 e substituir por algo do evento —
percursos/GPX, ranking/resultados, mapa da Expo, lista de patrocinadores. Menos superfície
de review, mais valor.

### 3.5 `IPHONEOS_DEPLOYMENT_TARGET = 18.1` corta usuários à toa

Nada no código exige 18.1. Baixar para **iOS 17.0** (ou 16.0) amplia bastante a base — em
evento com público internacional isso importa. `NavigationStack`, `@Observable` e
`AsyncImage` já existem em 17.0.

### 3.6 Bundle ID fora do padrão

`ParatyBrazil.byUTMB` não é reverse-DNS. Funciona, mas é a hora de trocar — **depois de
publicado, o bundle ID é imutável**. Sugestão: `world.utmb.paraty` ou
`br.com.paratybrazil.app`.

### 3.7 CI genérica

`.github/workflows/objective-c-xcode.yml` é o template padrão do GitHub (usa Ruby para
adivinhar o scheme, e `xcpretty`). Além disso **não existe scheme compartilhado** —
`xcschememanagement.plist` está em `xcuserdata/Rafael.xcuserdatad/`, ou seja, o scheme é
local da sua máquina. Marque "Shared" no scheme do Xcode e comite
`byUTMB.xcodeproj/xcshareddata/xcschemes/byUTMB.xcscheme`. Sem isso, CI e Xcode Cloud ficam
frágeis. Workflow melhor em §4.6.

### 3.8 Sem testes de verdade

`byUTMBTests` tem um `@Test func example()` vazio. O parser de CSV é o candidato óbvio a
teste — ver §5.

### 3.9 Só português

O evento é internacional (a própria planilha tem títulos bilíngues: "Largada / Start
PTR55"). Vale um `Localizable.xcstrings` com pt-BR + en. O Xcode 16 tem "String Catalog"
que extrai as strings automaticamente.

---

## 4. Como ajustar — receitas prontas

### 4.1 Tirar as chaves do código

**Opção simples (1 h)** — `.xcconfig` fora do Git:

```
// Config/Secrets.xcconfig   ← adicionar ao .gitignore
OPENWEATHER_API_KEY = suachavenova
NASA_API_KEY = suachavenova
```

No `Info.plist` (custom keys) → `OpenWeatherAPIKey = $(OPENWEATHER_API_KEY)`; ler com
`Bundle.main.object(forInfoDictionaryKey:)`. Comitar um `Secrets.example.xcconfig`.
Continua extraível do binário, mas some do repositório público.

**Opção certa (meio dia)** — proxy no Supabase (você já tem MCP do Supabase configurado):
uma Edge Function `weather` que guarda a chave em secret e devolve o JSON. O app chama a
função. A chave nunca sai do servidor, e você ganha cache e rate limit de graça.

### 4.2 Parser de CSV correto

```swift
// Services/CSVParser.swift  — puro, sem dependência de rede: fácil de testar
enum CSVParser {
    /// Divide uma linha de CSV respeitando aspas duplas e o escape "" .
    static func fields(in line: String) -> [String] {
        var fields: [String] = []
        var current = ""
        var inQuotes = false
        var iterator = line.makeIterator()
        var pending: Character?

        while let char = pending ?? iterator.next() {
            pending = nil
            switch (char, inQuotes) {
            case ("\"", true):
                if let next = iterator.next() {
                    if next == "\"" { current.append("\"") }   // "" escapado
                    else { inQuotes = false; pending = next }
                } else { inQuotes = false }
            case ("\"", false):
                inQuotes = true
            case (",", false):
                fields.append(current); current = ""
            default:
                current.append(char)
            }
        }
        fields.append(current)
        return fields
    }
}
```

> Um CSV com quebra de linha **dentro** de aspas ainda quebraria o
> `components(separatedBy: .newlines)`. Hoje a planilha não tem nenhum, mas se a produção
> escrever uma descrição com Enter, quebra. Ou você parseia o arquivo inteiro em vez de
> linha a linha, ou combina com a regra de operação "nada de Enter na descrição".

### 4.3 Cores tipadas

```swift
// Deletar as 3 constantes de byUTMBApp.swift e usar os símbolos gerados:
Color.utmbBlue      // gerado a partir de UTMBBlue.colorset pelo Xcode 15+
```

Se preferir manter constantes, ao menos acerte o case: `Color("UTMBBlue")`.

### 4.4 Dias derivados dos dados

```swift
private var eventDays: [Date] {
    let cal = Calendar.current
    return Array(Set(service.events.map { cal.startOfDay(for: $0.date) })).sorted()
}

private var filteredEvents: [Event] {
    guard selectedDay < eventDays.count else { return [] }
    let day = eventDays[selectedDay]
    return service.events.filter {
        Calendar.current.isDate($0.date, inSameDayAs: day)
            && selectedTypes.contains($0.type)
    }
}
```

Rótulo do picker: `day.formatted(.dateTime.weekday(.abbreviated).locale(.init(identifier: "pt_BR")))`.
E o subtítulo "18 a 21 de setembro" também sai do primeiro/último dia.

### 4.5 Service com async/await (modelo para os 4)

```swift
@Observable @MainActor
final class OnlineScheduleService {
    private(set) var events: [Event] = []
    private(set) var isLoading = false
    private(set) var error: Error?
    private(set) var lastUpdated: Date?

    private let url = URL(string: "https://docs.google.com/.../export?format=csv")!

    func load() async {
        isLoading = true; error = nil
        defer { isLoading = false }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let csv = String(decoding: data, as: UTF8.self)
            events = ScheduleCSVMapper.events(from: csv)   // função pura, testável
            lastUpdated = .now
            try? Cache.save(data, as: "schedule.csv")
        } catch {
            if let cached = Cache.load("schedule.csv") {     // §3.2
                events = ScheduleCSVMapper.events(from: cached)
            } else {
                self.error = error
            }
        }
    }
}
```

Remova também os 8 `print()` com emoji do `OnlineScheduleService` — vira `Logger` do
OSLog ou nada.

### 4.6 Workflow de CI decente

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
jobs:
  build-test:
    runs-on: macos-15
    steps:
      - uses: actions/checkout@v4
      - run: sudo xcode-select -s /Applications/Xcode_16.app
      - name: Build & Test
        run: |
          xcodebuild test \
            -project byUTMB.xcodeproj \
            -scheme byUTMB \
            -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest' \
            CODE_SIGNING_ALLOWED=NO
```

Requer o scheme compartilhado (§3.7).

---

## 5. Como testar

### 5.1 Testes unitários (Swift Testing, já no projeto)

O truque é **separar a lógica pura da rede**. Depois de extrair `CSVParser` e
`ScheduleCSVMapper`, os testes ficam triviais e rápidos:

```swift
import Testing
@testable import byUTMB

@Suite("Parser da programação")
struct ScheduleParsingTests {

    @Test("Campo entre aspas com vírgula não desloca as colunas")
    func quotedComma() {
        let line = #"2025-09-18,11:00,Podcast Montanhista,"Episódio inaugural, ao vivo.",EXPO,3600,entretenimento,podcast_cover"#
        let f = CSVParser.fields(in: line)
        #expect(f.count == 8)
        #expect(f[3] == "Episódio inaugural, ao vivo.")
        #expect(f[4] == "EXPO")
        #expect(f[6] == "entretenimento")
    }

    @Test("Hora com um dígito é aceita", arguments: ["7:30", "07:30"])
    func singleDigitHour(hora: String) {
        let e = ScheduleCSVMapper.event(from: ["2025-09-19", hora, "Treinão", "d", "EXPO", "1800", "ativacao", "img"])
        #expect(e != nil)
    }

    @Test("Duração vazia cai no padrão de 1 h")
    func emptyDuration() {
        let e = ScheduleCSVMapper.event(from: ["2025-09-18","16:00","Abertura","d","EXPO","","esporte","img"])
        #expect(e?.duration == 3600)
    }

    @Test("Tipo desconhecido não derruba o parse")
    func unknownType() {
        let e = ScheduleCSVMapper.event(from: ["2025-09-18","16:00","X","d","EXPO","3600","banana","img"])
        #expect(e?.type == .entretenimento)
    }

    @Test("A planilha real inteira produz 31 eventos")
    func fullFixture() throws {
        let csv = try String(contentsOf: Bundle.module.url(forResource: "schedule_fixture", withExtension: "csv")!)
        #expect(ScheduleCSVMapper.events(from: csv).count == 31)
    }
}
```

> Grave o CSV atual como fixture (`byUTMBTests/Resources/schedule_fixture.csv`) para o
> teste rodar offline e servir de regressão quando a produção mexer na planilha.

### 5.2 Testes de UI

Os dois testes de UI atuais são template (launch + performance). Vale um fluxo real:
abrir → esperar a lista → tocar num evento → conferir título → voltar. Mas UI test que
depende de rede é instável; melhor injetar um `ScheduleService` fake via
`ProcessInfo.processInfo.arguments.contains("-UITest")`.

### 5.3 Testes manuais — checklist antes de submeter

- [ ] Dark mode em todas as 5 abas (§2.5)
- [ ] Modo avião: cada aba mostra erro tratado, não tela em branco nem crash
- [ ] Dynamic Type no tamanho máximo (Ajustes → Acessibilidade → Texto maior)
- [ ] VoiceOver: navegar a lista da programação
- [ ] iPad (retrato e paisagem) — ou desabilite iPad (§6.2)
- [ ] Rotação no iPhone (o app permite landscape)
- [ ] Pull-to-refresh na Programação e na Previsão
- [ ] Links de Informações: Maps, site, `mailto:`, WhatsApp — todos abrem
- [ ] Rodar em **device físico**, não só simulador (AsyncImage e rede se comportam diferente)

### 5.4 TestFlight

1. Archive → Distribute → App Store Connect → Upload
2. **Internal Testing** (até 100 pessoas da equipe, sem review): valida na hora
3. **External Testing** (até 10.000): passa por uma review leve, ~1 dia. Use com a
   equipe do evento e alguns atletas.
4. Fique 1–2 semanas em TestFlight antes de submeter à App Store.

---

## 6. Como subir para a App Store

### 6.1 Pré-requisitos de conta

- [x] Apple Developer Program ativo (team `YNYZ3J355Z` já está no projeto)
- [ ] **Autorização de marca da UTMB** — ver §6.7. Trate isso como bloqueador nº 1.
- [ ] Contratos "Paid Apps"/"Free Apps" aceitos em App Store Connect → Business

### 6.2 Decisões de projeto (fazer **antes** de criar o app no App Store Connect)

| Decisão | Por quê |
|---|---|
| Bundle ID definitivo | Imutável depois de publicado (§3.6) |
| iPhone-only ou universal? | `TARGETED_DEVICE_FAMILY = "1"` dispensa screenshots e QA de iPad |
| Deployment target | 17.0 recomendado (§3.5) |
| Nome do app na loja | Máx. 30 caracteres — ex.: "Paraty Brazil by UTMB" |

### 6.3 Configuração do target

- [ ] `MARKETING_VERSION = 1.0`, `CURRENT_PROJECT_VERSION` incrementando a cada upload
- [ ] `ITSAppUsesNonExemptEncryption = false` no Info.plist — o app só usa HTTPS padrão,
      então é isento; sem essa chave, cada build no TestFlight pede a pergunta de
      compliance manualmente
- [ ] App Icon: já existe o 1024 com variantes light/dark/tinted ✅
- [ ] Launch screen: gerada (`INFOPLIST_KEY_UILaunchScreen_Generation = YES`) ✅
- [ ] Considerar substituir o `SplashView` de **4 segundos** por launch screen nativa +
      1 s no máximo. 4 s de espera antes de qualquer conteúdo é UX ruim e chama atenção
      do revisor.
- [ ] `PrivacyInfo.xcprivacy`: o app não usa SDKs de terceiros nem "required reason APIs"
      óbvias, então provavelmente não é exigido — **confirme com o Xcode** (ele acusa no
      upload se faltar).

### 6.4 App Store Connect — ficha do app

- [ ] Nome, subtítulo (30 car.), descrição, texto promocional
- [ ] **Keywords** (100 caracteres, separadas por vírgula): trail running, corrida,
      montanha, Paraty, UTMB, ultramaratona…
- [ ] Categoria: **Sports** (primária) · Travel (secundária)
- [ ] Classificação etária (questionário) → deve dar 4+
- [ ] **URL de política de privacidade — obrigatória para todo app.** Você não tem uma;
      precisa publicar uma página (mesmo simples: "este app não coleta dados pessoais").
- [ ] URL de suporte (pode ser a página de contato do paraty.utmb.world)
- [ ] **Privacy Nutrition Labels**: o app hoje não coleta nada — declare "Data Not
      Collected". Se adicionar analytics/push depois, atualize.
- [ ] **Screenshots**: iPhone 6.9" é o tamanho obrigatório atual (1320×2868 ou 1290×2796);
      iPad 13" se mantiver suporte a iPad. *Confirme os tamanhos vigentes no App Store
      Connect na hora — a Apple mudou essa regra recentemente.*

### 6.5 Submissão

1. Xcode → Product → Archive (destino "Any iOS Device")
2. Organizer → Distribute App → App Store Connect → Upload
3. Esperar o processamento (~15 min) e checar e-mail de warnings
4. App Store Connect → versão 1.0 → escolher o build
5. **App Review Information**: notas para o revisor (§6.7) + conta de teste se houver login
   (não há)
6. Submit for Review → normalmente 24–48 h

### 6.6 Timing — atenção especial neste app

O app é de um evento com data. Dois cuidados:

- **Não submeta na véspera.** Rejeição + reenvio pode custar 3–5 dias. Mire em ter a v1.0
  aprovada **4 semanas antes** do evento.
- **Conteúdo vazio fora da temporada é motivo de rejeição** (Guideline 4.2). Se o revisor
  abrir o app em fevereiro e a programação estiver vazia, ele pode rejeitar. Garanta que a
  planilha sempre tenha a próxima edição, ou que a aba mostre um estado "Programação da
  edição 2026 em breve — veja aqui o que já está confirmado" com conteúdo útil.

### 6.7 ⚠️ Marca UTMB — o maior risco de rejeição

O app usa o nome "UTMB", o logo oficial e fotos do evento. A Guideline **5.2.1
(Intellectual Property)** manda o revisor rejeitar apps que usam marca de terceiro sem
autorização. Como você é (presumivelmente) organizador do Paraty Brazil by UTMB, isso se
resolve — mas **precisa estar documentado**:

- [ ] Carta/e-mail da UTMB World Series autorizando o uso da marca no app
- [ ] Conta de desenvolvedor idealmente no nome da entidade organizadora (conta de
      **Organization** com D-U-N-S), não pessoa física — o nome do desenvolvedor aparece
      na loja e "Rafael Miranda" publicando um app "by UTMB" acende o alerta
- [ ] Anexar essa autorização nas **App Review Notes** já na primeira submissão, com um
      texto curto: quem você é, qual sua relação com o evento, e o link da autorização

Resolver isso agora evita perder uma semana em ping-pong com o review.

---

## 7. Roteiro sugerido

### Fase 0 — Segurança (hoje, 30 min)
1. Revogar chaves NASA + OpenWeatherMap
2. Decidir: repo privado ou aceitar o histórico

### Fase 1 — Correções (1–2 dias)
3. Parser de CSV com aspas (§4.2) + testes (§5.1)
4. Nomes das cores (§4.3)
5. Dark mode (§2.5)
6. Dias derivados dos dados (§4.4)
7. `locale = en_US_POSIX` no DateFormatter
8. Chaves via xcconfig (§4.1)
9. Imagens: placeholder decente + decidir A ou B (§2.4)

### Fase 2 — Base técnica (2–3 dias)
10. Scheme compartilhado + CI que roda testes (§3.7, §4.6)
11. `NavigationStack` (§3.3)
12. Services em async/await + `@Observable` (§3.1)
13. Cache offline da programação (§3.2)
14. Deployment target → 17.0 (§3.5)

### Fase 3 — Produto (3–5 dias)
15. Decidir sobre Astronomia/Mensagem (§3.4)
16. Splash de 4 s → 1 s
17. Atualizar conteúdo para a edição de 2026 (datas, textos, planilha)
18. Localização pt-BR + en (§3.9)
19. Acessibilidade: Dynamic Type + VoiceOver

### Fase 4 — Loja (1–2 semanas, em paralelo)
20. **Autorização da UTMB** (§6.7) — começar já, é o que demora
21. Política de privacidade publicada
22. Bundle ID definitivo + ficha no App Store Connect
23. Screenshots
24. TestFlight interno → externo
25. Submeter, com 4 semanas de folga antes do evento

---

## 8. Trabalhando com Claude Code neste projeto

O que dá e o que não dá no ambiente remoto (Linux, sem Xcode):

| Dá para fazer remoto ✅ | Precisa do seu Mac ❌ |
|---|---|
| Escrever e refatorar Swift | Compilar (`xcodebuild`) |
| Criar arquivos novos (grupos sincronizados!) | Rodar testes e simulador |
| Editar assets JSON, workflows, docs | Archive / upload |
| Editar `.pbxproj` (build settings) | Marcar scheme como Shared |
| Validar o CSV da planilha via rede | Screenshots |

**Fluxo prático:** peça as mudanças aqui → elas vão para o branch → você dá `git pull` no
Mac, abre o Xcode, compila e testa → reporta o erro de compilação de volta aqui. O CI do
GitHub (§4.6) fecha esse loop: o build roda em macOS e você vê o erro sem sair do
navegador.
