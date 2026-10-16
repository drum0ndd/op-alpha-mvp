# Entrega técnica — 15/10/2026

Esta entrega aplica o recorte autorizado para o protótipo OP Alpha: catálogo como entrada, coleção de leitura, conta/login, um único tipo de usuário, lentes visuais locais e valores ativos somente em reais. O trabalho anterior e as alterações locais foram preservados. Nenhum commit foi criado.

## Diagnóstico e decisões

| Problema observado | Decisão aplicada | Motivo e limite |
|---|---|---|
| Tipos de usuário e preferências de lentes misturavam identidade com apresentação. | Cadastro/usuário público sem tipo ou lentes; seleção no `LensProvider` do frontend. | Uma conta pode usar todas as visões. A seleção muda ícone, nome e acento visual; reinicia ao recarregar e não muda dados/permissões. |
| O CHECK antigo exigia `type` junto com a senha, impedindo retirar apenas a constante do cadastro. | Nova migration remove CHECK, coluna e enum; schema e repository já não usam o campo. | Não reescreve migrations antigas nem apaga contas. Aplicar SQL continua pendente. |
| Auth dependia de detalhes do módulo Users, com acoplamento entre módulos. | Hash de senha e projeção pública compartilhados em `modules/identity`; AuthModule importado explicitamente. | Mantém um monólito modular, sem container adicional, repository genérico ou abstração de autenticação nova. |
| A navegação expunha ferramentas/lentes com responsabilidades futuras. | Catálogo, Coleção e Conta são as três abas; rotas antigas redirecionam. | Rotas simples, sem quebrar links anteriores. Coleção continua somente leitura. |
| Layout e estados estavam distribuídos entre telas com identidade de dashboard. | `ScreenFrame`, `LensBar`, `LoginForm` e `StateMessage`; conta no topo esquerdo, conteúdo central e grade de cartas. | Composição inspirada nas capturas públicas do Mugipocket, usando componentes e identidade próprios. Revisão visual em navegador/dispositivos ainda necessária. |
| Busca e filtros podiam se perder na navegação; set/idioma podiam corresponder a impressões diferentes. | Estado de busca/set/idioma/página na URL; backend aplica set e idioma à mesma impressão aprovada. | Retorno do detalhe conserva a busca. Impressão legada sem set usa o set da carta canônica. |
| Moedas diferentes poderiam aparecer em preço/custo ou entrar em totais. | Contratos de entrada somente BRL; leitura filtra BRL e oculta custos estrangeiros legados. | Não inventa câmbio nem renomeia moeda. Quantidade e impressão são preservadas; ausência de custo não vira zero. |
| Lentes persistidas afetavam a integração de sessão. | Removidos `PATCH /auth/lens`, `setLens` de sessão e novas gravações de UserLens pelo fluxo principal. | Sessão autentica identidade; interface controla lentes. Estruturas antigas de lentes permanecem inativas no banco. |
| A importação mantinha rede dentro da transação e podia sobrescrever revisão/publicação. | Fetch e parsing antes da transação; lock, revisão do cache e persistência dentro dela. | Importação obsoleta é rejeitada. Conteúdo idêntico preserva aprovação/vínculos; divergência exige revisão. Timeout transacional original de 120 s mantido; lote real ainda precisa de medição. |
| Criação/edição de cartas depende de fontes ainda não definidas. | Contratos estritos e política pura de verificação, sem endpoint/formulário/tabela nova. | Conforme escolha do usuário, prepara o fluxo futuro. Sem fonte oficial/validador, retorna indisponível; não aprova automaticamente. |
| Verificação precisava se referir à proposta exata. | Evidência exige fonte configurada, digest da proposta normalizada e cobertura dos campos; edição carrega versão esperada. | Evita reutilizar uma evidência para conteúdo diferente. Persistência, concorrência e autorização de publicação ainda serão implementadas. |
| O ambiente local impedia validar persistência. | Diagnóstico sanitizado do `.env`, Compose e conexão, sem imprimir credenciais. | PostgreSQL retornou `ECONNREFUSED`; Compose não tinha as variáveis obrigatórias. Nenhum serviço foi iniciado e nenhum dado foi escrito. |

Não foram instaladas dependências neste lote. Foram mantidos Expo/React Native, NestJS/Fastify, Prisma/PostgreSQL, Zod e a sessão opaca existente. JWT não foi acrescentado: a sessão atual já permite revogação no servidor e token em cookie HttpOnly.

## Arquivos e responsabilidades

Os caminhos abaixo são relativos à raiz do repositório; o diff contém também alterações anteriores a esta entrega.

- Interface e rotas: `apps/mobile/app/(tabs)/*`, `app/index.tsx`, `app/login.tsx`, `app/catalog.tsx`, `app/register.tsx` e `app/cards/[id].tsx`. Telas em `src/screens/{CatalogScreen,CardDetailScreen,CollectionScreen,AccountScreen}.tsx`; telas antigas mantêm compatibilidade.
- Apresentação: `apps/mobile/src/components/{ScreenFrame,LensBar,LoginForm,StateMessage,AccountLayout,AccountButton,CardImage}.tsx` e `providers/{AppProviders,LensProvider,SessionProvider}.tsx`. O estado de lente está separado do estado de sessão.
- Cliente e valores: `apps/mobile/src/lib/{api,profile,session-cache}.ts`; contratos em `packages/contracts/src/index.ts`. Preservam credenciais de cookie, cancelamento/isolamento de cache e valores monetários desconhecidos.
- Identidade: `apps/api/src/modules/{auth,users,identity}/*`; contrato de usuário único, projeção segura e dependências explícitas.
- Banco: `apps/api/prisma/schema.prisma`, `prisma/migrations/20261015000000_remove_user_type/migration.sql` e `prisma/seed.ts`. O seed não cria preferências de lentes para o fluxo novo e não foi executado.
- Leitura de catálogo e preços: `apps/api/src/modules/cards/*`, `modules/home/*` e descrição Swagger em `src/main.ts`.
- Fluxo futuro: `packages/contracts/src/card-submission.ts` e `apps/api/src/integrations/catalog/card-submission.policy.ts`.
- Ingestão: `apps/api/src/jobs/catalog-sync.ts`, `src/integrations/catalog/catalog.repository.ts` e seus testes.
- Verificações: `apps/api/test/{auth-profile.http,users.http,users.database,catalog-market,catalog-import,card-submission.policy,currency-contracts,mobile-api-client,profile-summary,session-cache}.test.ts`.
- Orientação futura: README, `docs/{architecture,debugging,development-status,roadmap,data-sources,frontend-reference}.md` e os três diagramas em `docs/diagrams`. O diagrama da revisão anterior é histórico; `prototype-architecture.mmd` representa as decisões vigentes.

## Migration e configuração local

O SQL autorizado é:

```sql
BEGIN;
ALTER TABLE "User" DROP CONSTRAINT "User_registration_complete";
ALTER TABLE "User" DROP COLUMN "type";
DROP TYPE "UserType";
COMMIT;
```

Não usa CASCADE. Uma dependência inesperada provoca erro e rollback. Usuários, nomes, e-mails, hashes de senha, sessões, holdings e estruturas antigas de lentes são preservados. Os valores antigos da classificação removida só poderão ser recuperados por backup.

**A migration foi criada, mas não aplicada.** A verificação de conexão local retornou `ECONNREFUSED`. O Compose apontou `POSTGRES_USER` ausente; a inspeção sem valores também identificou `POSTGRES_PASSWORD` e `POSTGRES_DB` ausentes/vazios. `POSTGRES_PORT` é opcional com fallback 5432. `DATABASE_URL` existia e era consistente entre raiz e API, mas isso não configura o container por si só.

Os arquivos `.env` e `apps/api/.env` estão ignorados e não rastreados no Git. Não foram alterados pelo agente. Como a pasta está no OneDrive, podem ser sincronizados; `.gitignore` não impede isso. O Compose publica PostgreSQL em `127.0.0.1`; a API escuta `0.0.0.0` e seu acesso pela rede depende do firewall. Isso não constitui auditoria completa de segurança. Não colocar senha/URL privada em variáveis `EXPO_PUBLIC_*`: elas entram no aplicativo distribuído, conforme a [documentação do Expo](https://docs.expo.dev/guides/environment-variables/#security-considerations).

Preencher as variáveis com as credenciais do banco local escolhido, manter DATABASE_URL consistente e aplicar a migration **antes** de iniciar a API atualizada. Uma DATABASE_URL já definida no ambiente do terminal tem precedência sobre os arquivos `.env`. Alterar `.env` não troca a senha de um volume PostgreSQL já existente. Não apagar o volume para resolver conexão.

## Comandos e resultados registrados

As verificações abaixo não executaram seeds/migrations nem gravaram dados em PostgreSQL. Nest/Fastify, hash de senha e cliente HTTP são exercitados com persistência simulada.

| Comando | Resultado |
|---|---|
| `git status --short` | Alterações locais identificadas e preservadas. |
| `corepack pnpm --filter @op-alpha/contracts build` | Passou. |
| `corepack pnpm --filter @op-alpha/api prisma:generate` | Prisma Client 7.9.1 regenerado sem User.type; não aplica SQL. |
| `corepack pnpm typecheck` | Passou: 6 tarefas de 6, incluindo API, seed, contratos e mobile. |
| `corepack pnpm --filter @op-alpha/api test:unit` | Passou: 10 arquivos, 132 testes, 51,78 s na execução registrada. |
| `node node_modules/vitest/vitest.mjs run test/catalog-import.test.ts` em `apps/api` | Após ajuste final do timeout: 1 arquivo, 18 testes passaram. |
| `corepack pnpm build` | Passou: 4 tarefas de 4 (2 em cache); API compilada e web exportada, 2 min 23 s. |
| `git diff --check` | Passou; apenas avisos de normalização LF/CRLF do Git no Windows. |
| `docker compose --env-file .env -f infra/docker-compose.yml ps --format json` | Bloqueado por variável obrigatória ausente. Não iniciou serviço. |
| Consulta de conexão `SELECT 1` | `ECONNREFUSED`; não modifica dados. |

Também foi usado o gerador oficial instalado do Expo Router para atualizar declarações de rotas; arquivos gerados não foram editados manualmente. Tentativas restritas no Windows apresentaram `EPERM realpath` e falhas de resolução de tipos transitivos por junctions. As mesmas verificações passaram com a execução autorizada fora do sandbox, sem afrouxar TypeScript ou instalar dependências.

Trechos-chave da suíte completa e do último teste focal:

```text
Test Files  10 passed (10)
Tests       132 passed (132)
Duration    51.78s

test/catalog-import.test.ts (18 tests)
Test Files  1 passed (1)
Tests       18 passed (18)

Tasks:      4 successful, 4 total
Cached:     2 cached, 4 total
Exported:   dist
```

Os 132 testes incluem contratos BRL, cliente HTTP mobile, limpeza/corridas de cache, paginação/filtros do catálogo, verificação de propostas, reimportação, cadastro e autenticação HTTP. Não equivalem a testes visuais ou integração PostgreSQL.

## Autenticação: o que foi comprovado

| Camada | Evidência | Limite |
|---|---|---|
| API HTTP | Cadastro → login → auth/me → logout; scrypt, cookie, origem/header, expiração, revogação e isolamento com persistência simulada. | Não prova comportamento transacional ou persistência do banco real. |
| Cliente HTTP | `credentials: include`, `X-Op-Client: 1`, distinção 401/503, cancelamento e validação do contrato. | Não prova armazenamento/envio de cookies pelo navegador ou plataforma nativa. |
| Sessão/cache | Limpeza de dados pessoais e proteção contra resposta de conta anterior. | Múltiplas abas, reinício real e cookies iOS/Android precisam de jornada integrada. |
| Migration | SQL e schema preparados; teste PostgreSQL atualizado para verificar remoção física/preservação. | Teste PostgreSQL não executado; migration não aplicada. |

Portanto, login e frontend estão conectados no código e cobertos em testes HTTP/cliente, mas **não foram classificados como 100% integrados**. Sessão usa token opaco, hash no banco, cookie HttpOnly/SameSite=Lax, Secure em produção, expiração e revogação. Eventos de login/logout/expiração não carregam credenciais ou identificadores pessoais. Produção com múltiplas instâncias exige revisar rate limiting compartilhado e configuração de proxy.

## Como executar e validar depois de preparar o banco

Na raiz, com Docker Desktop disponível e `.env` preenchido:

```powershell
corepack pnpm db:config
corepack pnpm db:up
corepack pnpm db:deploy
```

Em terminais separados na raiz:

```powershell
corepack pnpm --filter @op-alpha/api dev
```

```powershell
corepack pnpm --filter @op-alpha/mobile web
```

Abrir `http://localhost:8081`. Na web local, `apps/mobile/.env.local` deve conter `EXPO_PUBLIC_API_URL=http://localhost:3333/v1`; API deve permitir a origem exata via CORS_ORIGIN. README contém preparação completa e exemplo sem credenciais reais.

Validar catálogo → busca/filtro/página → detalhe → voltar → cadastro → login → coleção → recarga → logout. A troca de lente deve manter filtros/dados e não disparar persistência no servidor. Conferir layout em 320/375/768/1024/1440 px, teclado, fonte ampliada e áreas seguras nativas.

## Pendências e próximos ciclos

1. Concluir a fundação atual: disponibilizar o PostgreSQL local, aplicar migrations, executar integração em banco descartável com autorização e validar sessão/layout em web e dispositivos. Nenhum serviço foi iniciado por esta entrega.
2. Coleção utilizável: adicionar/editar/remover holdings, paginação/virtualização e testes de isolamento entre contas. Há um único tipo de usuário, podendo existir várias contas.
3. Catálogo confiável: receber link/método de scraping e fonte oficial, implementar adapter, submissão/revisão persistida, controle de versão e política de publicação. `verified` é evidência de conteúdo e não publica sozinho.

Precificação correta, especialidades das lentes, decks, watchlist, Alpha Engine, scanner, alertas e analytics continuam no backlog. O roadmap de três ciclos e seus critérios estão em [development-status.md](development-status.md).
