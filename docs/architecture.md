# Arquitetura evolutiva — OP Alpha

Decisões vigentes em 15/10/2026. Este arquivo é a referência para evoluções futuras. Diagramas editáveis: [arquitetura atual](diagrams/prototype-architecture.mmd), [fluxo futuro de verificação](diagrams/card-verification-flow.mmd) e [mapa da revisão anterior](diagrams/review-requirements-2026-10-15.mmd). O último é histórico: a decisão posterior retirou tipos de conta e lentes persistidas do escopo ativo.

## Estrutura mantida

Monorepo com um aplicativo Expo, uma API NestJS/Fastify e PostgreSQL/Prisma. pnpm/Turborepo são ferramentas de construção; não representam novos serviços. Contratos públicos ficam em `packages/contracts`. Não introduzir microsserviços, CQRS, filas, repositories genéricos ou novas bibliotecas apenas para ampliar a quantidade de camadas.

- Frontend: rotas pequenas → telas → componentes visuais e hooks → cliente HTTP. `ScreenFrame` contém apresentação e estilos neutros; `AccountLayout` acrescenta acesso protegido à coleção. `SessionProvider` controla autenticação/cache; `LensProvider` controla somente a seleção visual.
- Backend: controllers HTTP → serviços/casos de uso → Prisma ou repositories específicos. Funções de política concentram regras quando há uma regra real a compartilhar. `modules/identity` fornece senha/projeção pública para Auth/Users, evitando imports cruzados de seus detalhes.
- Integração: provider obtém/normaliza dados; o caso de uso valida proveniência e persiste. Rede, retries e parsing ficam fora da transação. Transação mantém lock, checagem de revisão e gravações.

## Escopo ativo

Um único usuário público: `id`, `name`, `email`, `createdAt`. Cadastro recebe `name`, `email`, `password`; não aceita tipo, papel, lente ou aprovação. Colecionador/Investidor/Player são um swap local de ícone, nome e destaque na barra superior. Não mudam permissões, filtros da API, query keys ou dados e não são persistidos. A seleção reinicia ao recarregar o aplicativo.

Navegação principal: Catálogo (`/`), Coleção (`/collection`) e Conta/Login (`/account`); detalhe público em `/cards/:id`, cadastro em `/register` e identificação assistida em `/scan`. `/login`, `/catalog`, antigas abas e telas permanecem aliases de compatibilidade. Query/set/idioma/página ficam na URL do catálogo. Coleção permite leitura e inclusão; edição/remoção ficam pendentes.

O módulo Collection contém um caso de uso de inclusão, sem repository genérico. Recebe o proprietário do SessionGuard, valida o contrato compartilhado e verifica publicação da impressão na transação antes de criar o lote. A foto fica apenas no frontend e não participa do contrato. Lotes da mesma impressão permanecem separados, preservando condição e custo de cada aquisição. Nenhuma tabela nova foi necessária.

`ScanScreen` coordena foto/busca/seleção; `HoldingForm` concentra os campos e validação de entrada. `CatalogCardTile`, `CatalogHero` e `SectionHeader` isolam apresentação reutilizável. Tokens definem escala de cantos e espaçamento; o tema mantém preto/dourado. O cadastro de uma impressão existente na coleção é diferente da criação/edição futura de uma carta do catálogo.

Índices, recomendações e peculiaridades das lentes não integram a jornada principal. A API legada de Home e os modelos existentes ficam preservados para uma evolução posterior; não interpretar schema ou endpoints legados como um produto completo.

## Dinheiro e identidade de cartas

Contratos ativos aceitam apenas BRL; a interface formata `R$`. Observações estrangeiras legadas não são convertidas nem reetiquetadas. A leitura pública de preços filtra BRL; referências estrangeiras ficam indisponíveis. Holdings preservam quantidades e impressão, mas custos em outra moeda saem como `null` na API e não participam de totais. Um custo ausente não vira zero.

Carta canônica e impressão são entidades distintas. Código identifica a carta; idioma, arte/variante e produto identificam a impressão. Holding, watchlist e preço referem-se à impressão; DeckCard refere-se à carta. Idioma de uma impressão não determina sua moeda: qualquer carta pode ter custo registrado em reais.

## Remoção do tipo legado

Após autorização explícita, a nova migration `20261015000000_remove_user_type` remove o CHECK `User_registration_complete`, a coluna `User.type` e o enum `UserType`, dentro de uma transação e sem CASCADE. O schema e o cadastro não têm mais tipo nem constante de compatibilidade. Migrations antigas permanecem como histórico. O SQL não apaga usuários, hashes de senha, sessões, holdings, `User.preferredLens` ou `UserLens`.

A remoção física de `User.type` ocorre somente ao aplicar a migration no banco alvo. A classificação antiga não pode ser reconstruída sem backup; essa perda de metadado foi autorizada. Campos de lentes antigos permanecem inativos no banco sem novos escritores do fluxo principal; sua eliminação física futura deve ter migration própria. Não reescrever uma migration aplicada nem apagar contas/registros para simplificar a modelagem.

## Criação/edição futura e fontes

Nesta entrega, o usuário autorizou somente contratos e preparação do fluxo. `card-submission.ts` distingue CREATE de EDIT, exige versão esperada na edição e rejeita preço, URL/fonte arbitrária, papel ou flag de publicação enviados pelo cliente. Não existem formulários, endpoints ou tabelas de propostas implementados.

`verifyCardSubmission` recebe uma política configurada no servidor. Sem fonte, fonte desabilitada ou validador, retorna `unavailable`; falha de rede/validação não produz aprovação. Evidência deve corresponder à fonte configurada e ao digest da proposta normalizada, cobrindo os campos pertinentes. `verified` é resultado de verificação de conteúdo, não autorização automática de publicação nem persistência já implementada.

Fluxo futuro: link de coleta autorizado/configurado → adapter/parser → normalização → verificação em fonte oficial confiável → evidência vinculada à proposta → controle de versão/identidade/publicação → transação. O termo bypass do pedido corresponde a essa passagem pela verificação, sem opção de ignorar validação pelo cliente.

A fonte de scraping e a fonte oficial podem ser diferentes. O usuário definiu MyPCards como fonte provisória principal e Liga One Piece como fallback, somente BRL. São marketplaces, não prova de validação oficial pela Bandai. O acesso HTTP direto recebeu desafio Cloudflare; ainda faltam método autorizado/API e adapters com tratamento de indisponibilidade/identidade/conflitos. O provider Bandai permanece bloqueado; não foi ativado scraping ou fetch de URLs arbitrárias fornecidas pelo cliente.

## Ingestão existente

O provider atual usa fixture JSON sintética. O pipeline obtém um snapshot do cache, faz fetch/validação sem transação aberta, adquire lock na persistência e rejeita revisão obsoleta. Reimportação idêntica preserva publicação e vínculos canônicos; conteúdo divergente requer revisão e mantém o anterior. Novas impressões externas não são publicadas automaticamente. Importações sintéticas são demonstrações, não prova de validação oficial.

## Gatilhos de evolução

1. Coleção utilizável: implementar CRUD autorizado, paginação/virtualização e testes de isolamento. Separar resumo agregado da listagem quando houver necessidade concreta.
2. Fonte real: implementar apenas o adapter necessário, testes de parser/evidência, conflitos e reimportação PostgreSQL. Medir lote/tempo e então decidir batching.
3. Jobs que precisem sobreviver a reinício ou concorram com a API: worker e fila durável no mesmo produto/repositório.
4. Múltiplas instâncias: rate limiting compartilhado e política explícita de proxies confiáveis.
5. Mais dados/lentidão medida: índices, cursor e busca textual; cache após medição.
6. Necessidade comprovada de implantação/equipe independente: avaliar extração de serviço.

Antes de um beta persistente, concluir jornadas web/native, integração PostgreSQL, backup/restore e diagnóstico operacional. O login não deve ser declarado 100% integrado apenas com testes em memória ou build.
