# Resgate leve de benefícios (parceiros)

Fluxo presencial para o Paraty Brazil by UTMB. O parceiro **não** usa sistema,
tablet nem digita código. O atleta ativa no celular e mostra a tela ao garçom.

## Regras de produto (v1)

1. **Sem cadastro.** Não pedimos e-mail, número de peito nem login nesta versão.
2. **Uso livre** durante a validade do evento (datas na planilha ou padrão do evento).
3. **Sem cupom falado.** O código verbal/copiável foi aposentado — evita WhatsApp e
   “fale UTMB10 no caixa”.
4. **QR físico por parceiro.** Cada estabelecimento tem URL assinada
   (`/p/{slug}?k=…`). O atleta escaneia no porta-conta, mesa ou caixa.
5. **Ativação de 3 minutos.** Depois de “Ativar benefício”, a comprovação expira
   sozinha. Relógio de Paraty + código visual em movimento dificultam print
   compartilhado — **não** são antifraude forte.
6. **Conferência humana.** O garçom compara o nome do estabelecimento na tela e
   vê o status “Válido agora”.

## Fallback sem sinal

Se o atleta não abrir a tela de ativação (sem rede e sem cache do PWA), o
responsável do salão **pode** aceitar a página do parceiro no catálogo
(`/onde-comer/{slug}`) conforme combinado previamente. Essa exceção fica no
material impresso do parceiro — não no app do atleta.

## Material operacional

Entregar a cada parceiro:

- cartões plastificados com o QR (reposição no admin `/admin/qrs`);
- folha com 3 passos: (1) indicar o QR (2) atleta ativa (3) conferir tela viva;
- contato UTMB para dúvidas;
- condições: validade, itens excluídos, não cumulativo, quem absorve o desconto.

Treinamento máximo ~5 minutos com gerente e equipe.

## Checklist de piloto (1 restaurante)

1. Imprimir a folha em `/admin/qrs` e plastificar o QR.
2. Treinar gerente/garçom (~5 min) com os 3 passos da folha.
3. Conta real: atleta avisa → escaneia → Ativar → garçom confere tela viva → desconto.
4. Testar sem Wi‑Fi do restaurante (dados móveis / cache do PWA).
5. Conferir contagem em `/admin/resgates`.
6. Anotar atritos (tempo, confusão de nome, fallback) antes de escalar.

## Checklist de validação em campo

Antes de distribuir os QRs:

- [ ] Safari iOS e Chrome Android: escanear QR → Ativar → tela viva 3 min → expirar
- [ ] Abrir `/onde-comer` com rede, depois ativar `/p/...` sem rede (cache)
- [ ] QR com `k` errado mostra “QR inválido”
- [ ] Fora da janela `validFrom`/`validTo` mostra “Fora da validade”
- [ ] Impressão A4 em `/admin/qrs` legível após plastificar
- [ ] Ativação aparece em `/admin/resgates`
- [ ] Treino de 5 min com a equipe do piloto

## Métricas

Cada ativação (toque em “Ativar benefício”) gera um evento **agregável**, sem
identidade do atleta: parceiro, instante. Relatório em `/admin/resgates`.

Em produção na Vercel o disco é efêmero — use `ACTIVATIONS_WEBHOOK_URL` para
persistir (planilha, Zapier, etc.) ou migre depois para Supabase.
