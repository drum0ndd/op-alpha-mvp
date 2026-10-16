# Auditoria full-stack — 12/09/2026

## Diagnóstico

Git inicialmente limpo; nenhuma instrução AGENTS.md encontrada. Monorepo pnpm/Turbo com NestJS/Fastify, Prisma/PostgreSQL 17 e Expo/React Native. A aplicação era um scaffold de catálogo/Home: não havia controllers, DTOs, serviços, repositórios, formulários ou testes de cadastro/login. User tinha apenas identidade básica, e as lentes COLLECTOR/INVESTOR/PLAYER não eram tipos de conta. Compose continha senha literal e porta fixa; o carregamento de .env dependia do diretório de execução. Os testes existentes eram placeholders e os layouts tinham larguras fixas e linhas sem quebra.

## Implementação

- Novo domínio `apps/api/src/modules/users`: controller HTTP/Swagger, serviço de validação/hash e repositório Prisma com seleção explícita de campos públicos.
- Contratos Zod compartilhados para entrada, tipos e resposta. Pacote agora emite JavaScript para consumo da API compilada.
- POST /v1/users para colecionador/investidor. Normalização de e-mail, rejeição de campos extras, limites, hash scrypt assíncrono com salt aleatório e limite de concorrência para memória. Resposta sanitizada novamente pelo schema público.
- Migration aditiva com enum UserType, campos opcionais apenas para preservar contas legadas, constraint de completude e índice único sobre lower(btrim(email)). Inserção de usuário/lente é transacional por nested write. Conflitos P2002 retornam 409 sem janela de corrida baseada em pré-consulta.
- Filtro global para erros sem SQL/stack/credenciais; indisponibilidade conhecida retorna 503. Pool com timeout de conexão de cinco segundos. Health separado em liveness e readiness.
- Home com userId arbitrário retorna 401 antes da consulta, pois não existe autenticação. Home pública e lentes permanecem.
- Compose parametrizado, bind localhost, volume preservado, healthcheck e restart. README/.env.example e scripts de migrations/deploy documentados.
- Tela `/register` com tipos, validação, loading, erro da API e sucesso, labels, teclado e formulário de largura máxima 480. Link disponível inclusive quando a Home falha.
- Home limitada a 1100 px; seções/atalhos/carteira quebram linhas; cards cabem na largura disponível e imagens mantêm proporção; alvos das lentes têm 44 px. Correções de ColorValue e paths do TypeScript 6.
- .turbo ignorado e testes não cacheados para não reaproveitar resultado de um banco diferente.

Nenhum framework, ORM, banco ou biblioteca principal foi substituído. Nenhum arquivo foi movido ou dado existente removido.

## Contrato e operação

O README contém exemplos completos de requisição/resposta, limites, códigos de erro e comandos. Cadastro retorna 201 com id/name/email/type/createdAt. Erros: `{statusCode, message}`, sendo message um array na validação e string nos demais casos. 400 para entrada inválida, 409 para duplicidade, 401 para dados pessoais sem autenticação, 500 para falha inesperada, 503 para indisponibilidade/saturação. Não há fluxo de autorização que use 403 nem login implementado.

## Evidências

| Verificação | Resultado |
|---|---|
| pnpm --filter @op-alpha/api prisma:generate | Passou |
| prisma validate | Passou |
| pnpm typecheck / pnpm lint | Passaram; lint é tsc, conforme convenção existente |
| pnpm test | 17 passaram; 3 de PostgreSQL pulados sem TEST_DATABASE_URL |
| pnpm build | API, contratos, tokens e exportação web passaram |
| git diff --check | Passou |
| Compose YAML | Parsing estático passou; configuração revisada |
| pnpm db:config | Bloqueado: Docker não acessível nesta distribuição WSL |
| prisma migrate status | P1001 em localhost:5432, também fora do sandbox |
| Inicialização API | Passou fora do sandbox; sandbox bloqueava listen com EPERM |
| Inicialização Expo | Servidor web iniciou; DevTools falhou por libnss3.so ausente |
| HTTP real health / Swagger / register web | 200 / 200 / 200 |
| HTTP real POST /users inválido | 400 com mensagens de validação |
| HTTP real POST /users com banco indisponível | 503 sem detalhes internos |
| Readiness indisponível | Primeira consulta real revelou 500; corrigido para 503 e coberto por teste |

A suíte HTTP usa Nest/Fastify reais e repositório simulado. Verifica os dois tipos, a derivação do hash, normalização, ausência de senha/hash, oito entradas inválidas, 409 de constraint, falhas de serviço/banco e indisponibilidade. Outros três testes verificam readiness e bloqueio de dados pessoais. A integração opcional verifica persistência real, lente primária e concorrência, removendo apenas os registros do próprio teste. Placeholders mobile/tokens/contratos não foram contabilizados como testes.

## Responsividade: alcance da verificação

Revisão de código para 320, 375, 768, 1024 e 1440 px nas telas Home/Coleção/Carteira/Player (compartilham HomeScreen), Watchlist, navegação e cadastro. Formulário fluido, cards com largura limitada ao viewport, wrap e imagens proporcionais foram implementados. **Não houve verificação visual em navegador nem screenshots**, pois não há ferramenta de navegador instalada/disponível. HTTP 200 e exportação web não comprovam ausência de sobreposição visual. Não existem tabelas, modais ou tela de login neste scaffold.

## Pendências e riscos

1. Ativar integração Docker Desktop/WSL, configurar variáveis locais e executar db:config, db:up e db:deploy. Não foi possível aplicar migrations ou criar usuários reais com o banco indisponível. Comandos para teste em banco separado estão no README.
2. A migration para sem remover dados caso existam e-mails legados duplicados ignorando caixa/espaços. A resolução exige decisão sobre identidade; contas antigas não recebem tipo/senha automaticamente.
3. Preencher POSTGRES_* no .env existente: ele foi preservado. Credenciais de volumes existentes devem ser mantidas; alterar .env não muda a senha armazenada no banco.
4. Verificar visualmente os cinco tamanhos, teclado/foco/contraste e o fluxo de sucesso com API + banco reais.
5. Login/sessões/recuperação de senha continuam fora do scaffold. O 401 em Home com userId é uma mudança de segurança documentada; o frontend atual não envia esse parâmetro.
6. Busca, ações de cards/atalhos e Watchlist já eram demonstrações/placeholders; não foram transformados em CRUD. Valores de mercado/carteira continuam demonstrativos. Seed acrescenta observações/recomendações a cada execução, comportamento existente documentado.
7. Limite de hashes é por processo; não substitui política de proteção contra abuso na infraestrutura antes de exposição pública. Até quatro hashes podem consumir aproximadamente 512 MiB além do processo.

O diff é incremental e concentrado em identidade, configuração, documentação, testes e layout. Não há alterações preexistentes descartadas, volumes removidos, migração destrutiva ou commit automático.
