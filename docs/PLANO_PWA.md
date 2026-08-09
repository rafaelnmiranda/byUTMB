# Plano — Migração para PWA
## App **Paraty Brazil by UTMB**

> Decisão tomada em agosto/2026: **abandonar a distribuição via App Store e construir um
> PWA** (site instalável, adaptável a celular). O app iOS Swift foi removido do repositório
> em agosto/2026; backup em tag `backup/pre-ios-removal-*` e branch `backup/ios-completo-*`.

---

## 1. Premissas da decisão

| Premissa | Consequência |
|---|---|
| **Não haverá App Store** | Capacitor sai de cena. Sem carta de autorização da UTMB, sem review, sem US$ 99/ano, sem Mac obrigatório |
| iOS ≈ 15–20% do público no Brasil | Web atende 100% dos atletas, incluindo Android e internacionais |
| Programação muda durante o evento | Deploy em minutos, não em 24–48 h de review |
| Sinal ruim na serra de Paraty | Offline-first é requisito, não enfeite |
| Produção do evento é não-técnica | Google Sheets continua sendo o CMS |
| Push só via web push | Canal de conveniência; aviso crítico continua no WhatsApp |

**Premissas assumidas na ausência de resposta** (corrigir quando souber):
- Data da edição de 2026 **ainda não definida** → o app não pode ter datas hard-coded em
  lugar nenhum. Tudo deriva da planilha.
- Parcerias com restaurantes **ainda não fechadas** → o modelo de dados de cupons já nasce
  pronto, mas o recurso entra numa fase posterior, sem bloquear o v1.

---

## 2. Arquitetura

```
┌─────────────────┐     CSV      ┌──────────────────────────┐
│  Google Sheets  │ ───────────► │  Next.js (Vercel)        │
│  (produção edita)│  revalidate │  ─ parse no servidor      │
└─────────────────┘   a cada 5m  │  ─ HTML pronto            │
                                 │                          │
┌─────────────────┐   chave no   │  /api/weather  (proxy)   │
│  OpenWeatherMap │ ◄─ servidor ─│                          │
└─────────────────┘              └───────────┬──────────────┘
                                             │
                                    ┌────────▼─────────┐
                                    │  Service Worker  │  offline
                                    │  (celular)       │
                                    └──────────────────┘

┌─────────────────┐
│    Supabase     │ ◄── fase 3: atletas, parceiros, resgates, push subscriptions
└─────────────────┘
```

**Princípio central:** o celular do atleta nunca fala com o Google Sheets nem com a
OpenWeather. Tudo passa pelo servidor. Isso resolve de uma vez as chaves expostas (§2.1 do
plano antigo), o parse de CSV no cliente, e o CORS.

### Por que Next.js na Vercel

Não é preferência estética — cada peça mata um problema concreto do projeto:

| Recurso | Problema que resolve |
|---|---|
| Route Handlers (`/api/*`) | Chave da OpenWeather sai do código público |
| `revalidate` no `fetch` | Página instantânea + planilha sempre fresca, sem CSV no cliente |
| Rotas dinâmicas | URL por evento → compartilhável no WhatsApp |
| Deploy automático no push | Fecha o loop de build que hoje depende do seu Mac |
| Preview por branch | Você revisa no celular antes de ir para produção |
| Tier free | US$ 0 no volume de um evento |

---

## 3. Modelo de dados

### 3.1 Planilha (fase 1) — mantida como está, com 2 ajustes pedidos à produção

Colunas atuais: `data, hora, titulo, descricao, local, duracao, tipo, imagem`

| Ajuste | Motivo |
|---|---|
| `hora` sempre com 2 dígitos (`07:30`, não `7:30`) | Robustez de parse (o código tolera ambos, mas evita surpresa) |
| `imagem` passa a aceitar **URL** além de nome | Resolve as 18 imagens faltando sem inchar o build |

Colunas **novas**, opcionais e retrocompatíveis:

| Coluna | Uso |
|---|---|
| `destaque` | `sim` → aparece em "Agora / A seguir" na home |
| `link` | URL externa (regulamento, inscrição, resultado) |

> Regra de operação a combinar com a produção: **sem Enter dentro de uma célula.** Quebra
> de linha no meio de um campo é o único caso que ainda complica o parse de CSV.

### 3.2 Supabase (fase 3) — cupons e push

```sql
atletas (
  id uuid pk, email text unique, nome text,
  numero_peito text, criado_em timestamptz
)

parceiros (
  id uuid pk, slug text unique, nome text,
  desconto text,          -- "10%" ou "chopp cortesia"
  endereco text, maps_url text,
  condicoes text, ativo bool, criado_em timestamptz
)

resgates (
  id uuid pk,
  atleta_id uuid fk, parceiro_id uuid fk,
  criado_em timestamptz,
  unique (atleta_id, parceiro_id)   -- 1 uso por atleta por restaurante
)

push_subscriptions (
  id uuid pk, atleta_id uuid fk null,
  endpoint text unique, p256dh text, auth text,
  criado_em timestamptz
)
```

RLS ligado em tudo. O atleta só lê/escreve o que é dele; a leitura de `parceiros` é
pública; o relatório de resgates só pela `service_role`.

---

## 4. Telas e rotas

| Rota | Tela | Notas |
|---|---|---|
| `/` | Home | "Acontecendo agora" + "A seguir" + atalhos. É o que o atleta quer ver ao abrir |
| `/programacao` | Programação | Filtro por dia e tipo, dias **derivados da planilha** |
| `/programacao/[slug]` | Detalhe do evento | **URL própria, compartilhável.** Botão "adicionar ao calendário" (.ics) |
| `/informacoes` | Informações | Sobre, local, site, e-mail, WhatsApp |
| `/previsao` | Previsão | Via `/api/weather` |
| `/parceiros` | Restaurantes parceiros | Fase 3 |
| `/p/[slug]` | **Resgate de cupom** | Alvo do QR impresso na mesa. Fase 3 |
| `/minha-conta` | Identificação do atleta | Magic link. Fase 3 |
| `/api/weather` | Proxy | Chave server-side |
| `/api/push/*` | Inscrição e envio | Fase 4 |

**Removidas da v1:** Astronomia (NASA) e Mensagem do Dia (ZenQuotes). Não ajudam o atleta,
e a ZenQuotes ainda exigiria atribuição visível que o app nunca teve.

---

## 5. Offline — requisito, não enfeite

O app iOS atual não tem cache nenhum: sem sinal, a programação vira "Erro ao carregar".
O PWA vai fazer melhor.

**Estratégia por tipo de conteúdo:**

| Conteúdo | Estratégia | Comportamento sem sinal |
|---|---|---|
| Shell (HTML/CSS/JS) | Precache na instalação | Abre normalmente |
| Programação | *Stale-while-revalidate* | Mostra a última versão + "atualizado às HH:mm" |
| Imagens | Cache-first, com teto | As já vistas continuam |
| Previsão | Network-first, 10 min | Mostra última leitura com carimbo de horário |

Service worker escrito à mão (~50 linhas). Não vale trazer dependência para isso — a
superfície é pequena e o controle importa mais que a conveniência.

**Detalhe que faz diferença no dia:** todo dado servido do cache mostra
*"atualizado às 07:14"*. Atleta com informação velha e ciente disso está bem servido;
atleta com informação velha achando que é atual é um problema.

---

## 6. Push notification

**Como funciona:** VAPID + Web Push nativo, com a lib `web-push` no Node. Sem Firebase,
sem OneSignal, sem custo.

**A restrição do iOS:** só funciona depois que o atleta faz *Adicionar à Tela de Início*
pelo Safari. Não há contorno. No Android funciona no Chrome sem instalar.

**Consequência de produto:** push é canal de **conveniência**, nunca de emergência.

| ✅ Serve para | ❌ Não serve para |
|---|---|
| "Seu briefing começa em 30 min" | Mudança de percurso |
| "Resultados da PTR20 no ar" | Cancelamento por chuva |
| "Cerimônia de premiação às 17h" | Qualquer coisa de segurança |

Aviso crítico continua em WhatsApp e alto-falante na arena. Um push que chega em metade do
público é pior que inútil numa emergência: cria a ilusão de que todos foram avisados.

---

## 7. Cupons para restaurantes parceiros

### 7.1 O fluxo — quem escaneia é o atleta

Decisão de desenho mais importante do recurso, e é contraintuitiva:

```
  Restaurante                     Atleta
  ───────────                     ──────
  QR impresso na mesa   ──────►   escaneia com a câmera
  (papel plastificado)            │
                                  ▼
                          /p/casa-do-fogo
                                  │
                                  ▼
                        servidor grava o resgate
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │ ✅ Desconto liberado     │
                    │ Rafael Miranda · #1247  │
                    │ Casa do Fogo · 10%      │
                    │ 19/09  20:14:33  ⟳      │  ← relógio ao vivo
                    │ código: 7K2M            │
                    └─────────────────────────┘
                          garçom olha a tela
```

**Por que assim:** o restaurante não precisa de app, cadastro, tablet, treinamento de
garçom nem do próprio wi-fi. Só de um papel colado no balcão. Restaurante pequeno de centro
histórico não opera um sistema seu — mas cola um QR sem reclamar.

O relógio ao vivo derruba o print compartilhado no grupo do WhatsApp, e o resgate fica
gravado no servidor para auditoria.

### 7.2 Identificação do atleta

Uma vez só, **antes do evento**, por magic link (Supabase Auth). A sessão persiste no
navegador. No restaurante é só escanear — ninguém quer fazer login com 3 de sinal enquanto
o garçom espera.

Esse onboarding antecipado é o mesmo momento de pedir *Adicionar à Tela de Início* e a
permissão de push. **Um fluxo, três objetivos** — e é o cupom que dá ao atleta o motivo
concreto para instalar, o que por sua vez destrava o push no iOS. Disparar isso pelo e-mail
de confirmação de inscrição.

### 7.3 O ativo real é o relatório

Ao fim do evento: quantos atletas cada restaurante recebeu, em que dias e horários. É o que
renova a parceria no ano seguinte e o que permite **cobrar** pela parceria em vez de
implorar por ela. Um cupom estático em PDF custaria quase o mesmo e jogaria isso fora.

### 7.4 Fora do código (tem lead time — começar cedo)

- [ ] Fechar restaurantes; definir o desconto de cada um
- [ ] Condições claras: validade, 1 uso por atleta, não cumulativo, direito de recusa
- [ ] Base legal LGPD para guardar nome/e-mail (resolvida pela política de privacidade)
- [ ] Imprimir e distribuir os QR codes (gerados pelo próprio sistema)

---

## 8. Fases

### v1 — O site (o que precisa existir)
1. Scaffold Next.js + Tailwind ✅
2. Camada de dados: CSV do Sheets, parser com aspas, tipos, slugs
3. Home "Acontecendo agora / A seguir"
4. Programação com filtros derivados dos dados
5. Detalhe do evento com URL própria + `.ics`
6. Informações
7. Previsão via proxy
8. Manifest + ícones + service worker offline
9. Deploy na Vercel

### v1.1 — Onboarding
10. Identificação do atleta (magic link)
11. Banner "Adicionar à Tela de Início" (instruções por navegador)
12. Pedido de permissão de push no momento certo — depois de entregar valor, nunca de cara

### v1.2 — Cupons
13. Supabase: tabelas + RLS
14. `/parceiros` e `/p/[slug]`
15. Gerador de QR para impressão
16. Painel de relatório de resgates

### v1.3 — Push
17. VAPID, inscrição, envio
18. Agendamento a partir da planilha ("30 min antes de evento com `destaque=sim`")

### Contínuo
19. Localização pt-BR / en (a planilha já tem títulos bilíngues)
20. Acessibilidade: contraste, foco, leitor de tela

---

## 9. Deploy e configuração

**Domínio:** o ideal é um subdomínio do site oficial (ex.: `app.paraty.utmb.world`) — pega
carona na confiança da marca. Se depender da UTMB e demorar, sobe em domínio próprio ou no
`*.vercel.app` e migra depois; DNS é trivial de trocar.

**Variáveis de ambiente** (Vercel → Settings → Environment Variables):

```
SCHEDULE_CSV_URL           # URL do CSV publicado do Google Sheets
OPENWEATHER_API_KEY        # chave NOVA (a antiga está queimada — §2.1)
NEXT_PUBLIC_SITE_URL       # para metadata e URLs absolutas

# fase 3+
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT
```

Nenhuma delas entra no Git. `.env.example` documenta os nomes.

**Distribuição no evento:** QR code no número de peito, nos banners da Expo, no e-mail de
confirmação de inscrição, no grupo de WhatsApp e no rodapé do site oficial. É a vantagem
que o app nativo nunca teve — o atleta chega no conteúdo em 2 segundos, sem instalar nada.

---

## 10. App iOS (removido)

O código Swift foi **removido do repositório** em agosto/2026. Textos, cores da marca,
schema do CSV e navegação já foram migrados para o PWA em `web/`.

**Backup para restaurar:** tag `backup/pre-ios-removal-*`, branch `backup/ios-completo-*`,
ou tarball `~/Desktop/byUTMB-ios-backup-*.tar.gz`.

O que **continua valendo**:

- **Revogar chaves da NASA e da OpenWeatherMap** se ainda estiverem ativas — estão no
  histórico Git de um repositório público.
- **Política de privacidade** — exigência da LGPD assim que cupons guardarem nome e e-mail.

O que **morreu com a decisão**: App Store, bundle ID, TestFlight, CI Xcode — custo de loja
eliminado.

---

## 11. Riscos

| Risco | Mitigação |
|---|---|
| Atleta não adiciona à tela de início → push não alcança | Cupom como isca; push nunca é canal crítico |
| Planilha malformada pela produção no dia do evento | Parser tolerante (linha ruim é ignorada, não derruba a página) + validação que avisa |
| Google Sheets fora do ar | Cache do servidor + cache do service worker: o conteúdo sobrevive |
| Sinal ruim na arena | Offline-first desde o v1 |
| Print de cupom compartilhado | Relógio ao vivo + registro server-side + unique por atleta |
| Restaurante não honra o desconto | Condições escritas e acordo assinado antes de publicar |
