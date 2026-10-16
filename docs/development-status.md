# Estágio de desenvolvimento — 15/10/2026

O protótipo está na fundação de catálogo e identidade (Sprint 1 do backlog original), com escopo reduzido por decisão do usuário. Há um único tipo de usuário. Lentes são somente apresentação local. O fato de haver tabelas de decks/watchlist/recomendações não significa que suas ferramentas foram concluídas.

## Entregas deste corte

| Domínio | Estado |
|---|---|
| Interface | Catálogo público, coleção com inclusão assistida e Conta/Login; lentes em pílula, superfícies arredondadas, mais espaço entre seções e identidade preto/dourado; rotas antigas como aliases. |
| Identidade | Contrato único, senha scrypt, sessão/cookies, login/logout e cache protegido. Sem persistência de lentes. O usuário confirmou aplicação da migration local; as quatro migrations também passaram no banco descartável da automação. |
| Coleção | `/scan`: foto local opcional, busca pelo código, confirmação de impressão aprovada, quantidade, condição e custo unitário BRL. Sessão determina proprietário. Sem OCR, edição ou remoção ainda. |
| Catálogo | Leitura paginada e detalhe de impressões aprovadas. Set e idioma devem corresponder à mesma impressão. |
| Dinheiro | Apenas BRL nos contratos e na interface. Custos estrangeiros legados permanecem armazenados, mas não entram na leitura monetária nem em totais. |
| Ingestão | Fixture JSON e persistência transacional; fetch/validação fora da transação; cache obsoleto e divergência de conteúdo impedem escrita. Nenhum scraper real ativo. |
| Criação/edição de cartas | Contratos estritos e política de verificação com digest/evidência. Sem formulários/endpoints ou persistência de propostas; usuário confirmou esse recorte. |

## Roadmap em três ciclos

| Ciclo | Escopo | Critério de conclusão |
|---|---|---|
| 1 — Protótipo simples e identidade | Este layout/rotas, BRL, conta única, migration e validação integrada de sessão. | Fluxo catálogo → cadastro → login → recarga → logout passa em banco descartável e web/native. Troca de lente não altera dados ou permissões. |
| 2 — Coleção utilizável | CRUD de holdings a partir de impressões já válidas, quantidade/condição/custo BRL, paginação/virtualização e testes de isolamento. | Duas contas operam suas cartas sem acesso cruzado; custos desconhecidos continuam ausentes. |
| 3 — Entrada confiável de catálogo | Receber link/método de scraping e fonte oficial, implementar o adapter necessário e a submissão/revisão de cartas, controlar versão e persistir somente após verificação/política de publicação. | Evidência corresponde à proposta, reimportação não duplica nem despublica conteúdo revisado e falhas preservam o catálogo. |

O ciclo 1 está em fechamento e a inclusão assistida antecipa parte do ciclo 2. Restam validação nativa de sessão/câmera e as demais operações da coleção. O ciclo 3 aguarda acesso autorizado à fonte/API. Decks, wishlist/watchlist, preços de mercado corretos, Alpha Engine, alertas, partidas e analytics ficam no backlog posterior. Fontes externas não devem bloquear a navegação básica do protótipo.

As especialidades desejadas foram registradas: Colecionador — raridades, coleção, personagem e artes; Investidor — histórico BRL e análise de compra/venda do acervo e mercado; Player — combinações/decks, meta observado e cenários por expansão. O lote visual aprovado mantém as lentes como troca local. Essas análises exigem dados e critérios próprios; não gerar rankings, previsões ou recomendações a partir das fixtures.

## Pendências e validação

O relatório [implementation-2026-10-15.md](implementation-2026-10-15.md) registra o corte anterior, quando PostgreSQL local estava inacessível. A automação atual e suas evidências estão em [testing.md](testing.md). O lote foi preparado na branch local `dev`. Em 16/10/2026, o usuário autorizou o commit na `master` local e a publicação na `main` do GitHub; `dev` permanece sem publicação. O login não deve ser classificado como 100% validado em todas as plataformas sem jornadas nos dispositivos nativos.

Retomada concluída no escopo web: 13 testes PostgreSQL passaram; após o ajuste de expiração, 16 cenários Chromium desktop/mobile passaram. Checagem de tipos e encerramento de processos de teste também passaram. A suíte unit anterior permanece com 141 testes aprovados. A Sprint 1 ainda depende da validação nativa para cumprir integralmente seu critério; edição/remoção da coleção, integração de catálogo e análises das lentes permanecem futuras.

Guia de evolução: [architecture.md](architecture.md). Diagramas originais da revisão e a arquitetura atual foram guardados em `docs/diagrams`; o arquivo de revisão anterior é histórico, e a orientação vigente é a arquitetura do protótipo.
