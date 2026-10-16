# Fontes de dados encontradas no projeto

## Catálogo e regras oficiais

| Fonte | Uso pretendido | Status inicial |
|---|---|---|
| Bandai One Piece Card Game oficial | catálogo, imagens permitidas, texto das cartas, produtos, banlist e anúncios | Prioridade 1; validar termos e método de acesso |

## Meta competitivo

| Fonte | Uso pretendido | Status inicial |
|---|---|---|
| Limitless TCG | decks, participação no meta e resultados | Avaliar API/exportação/termos antes de automatizar |
| Site oficial Bandai | banlist e decks recomendados | Fonte oficial |

## Mercado secundário

| Fonte | Uso pretendido | Observação |
|---|---|---|
| Liga One Piece | referência brasileira e floor local | Não assumir API pública; começar por importação autorizada/CSV |
| TCGPlayer | preços e liquidez internacional | Preferir API/parceria; regras comerciais podem restringir scraping |
| eBay | vendas concluídas e itens raros | Usar API oficial ou exportação autorizada |
| TCG Stacked | ranking/top 100 | Fonte complementar; validar licença e metodologia |
| Guardian TCG | preços/rankings | Fonte complementar; validar licença e metodologia |

## Política do MVP

1. O seed e os testes usam dados manuais.
2. A próxima fonte será definida pelo usuário: scraping de link configurado no servidor ou CSV auditável. Coleta e verificação oficial são etapas distintas; nenhum conector real está habilitado.
3. Nenhum scraper entra em produção sem revisão de termos, robots, limites e direito de reutilização.
4. Cada observação armazena fonte, data, moeda, região, condição, idioma, tipo de preço, amostra e referência externa.
5. Anúncio e venda concluída nunca são agregados como se fossem o mesmo dado.

## Recorte de 15/10/2026

Contratos ativos aceitam somente BRL; precificação de mercado correta será trabalhada depois. Não converter nem reetiquetar dados estrangeiros legados.

Criação/edição de cartas por usuários será uma proposta com carta canônica, impressão e controle de versão. A fonte oficial e o validador pertencem à configuração do servidor. O usuário não fornece aprovação, evidência ou URL arbitrária para o backend consultar. Sem fonte, verificação indisponível ou divergência, não publicar nem substituir o catálogo. Resultado verified precisa de evidência vinculada ao conteúdo e ainda deve passar pela política de persistência/publicação.

Nesta entrega existem apenas os contratos e a política pura, sem endpoints, formulários ou gravações de propostas. O link de scraping, a fonte oficial, identificadores, licença/método de acesso e conflitos serão definidos antes de implementar o adapter. Consulte [o fluxo futuro](diagrams/card-verification-flow.mmd).
