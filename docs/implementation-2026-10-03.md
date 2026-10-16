# Entrega técnica — 03/10/2026

## Resultado e escopo

Lote autorizado: correções da auditoria, frontend centralizado, botão de conta no topo esquerdo, aba Login, sessão por cookie e eventos de entrada/saída. Dependências instaladas com lockfile congelado. A sessão opaca existente já permite revogação no servidor; não foi acrescentado JWT nem analytics de uso.

O projeto permanece na Sprint 1. O plano para concluir o MVP em três ciclos e as ferramentas pendentes estão em [development-status.md](development-status.md).

## Causas e correções

| Problema observado | Causa | Correção |
|---|---|---|
| Seed não compilava com o schema atual | Upsert usava uma chave composta que deixou de ser única. | Chave `externalKey`, transação para todas as gravações e checagem de tipos do seed. Promo P-088 vinculada ao set P; impressões demonstrativas explicitamente aprovadas. |
| Lentes incorretas no cliente | Seleção pública não incluía a relação; o contrato preenchia defaults. | Selecionar e serializar lentes persistidas; exigir os campos no contrato. Teste da lente primária passa a verificar o valor, não a posição no array. |
| Cookie antigo continuava válido na troca de conta | Revogação do token anterior filtrava o usuário do login novo. | Revogar o token apresentado independentemente do usuário e preservar sessões de outros dispositivos. |
| Dados privados podiam reaparecer após expiração/troca | Requisições e cache não estavam vinculados à geração da sessão. | Cancelamento e remoção das consultas pessoais antigas; identidade e geração impedem resposta tardia de alterar nova sessão, inclusive login novamente na mesma conta. |
| Preço fictício, moeda errada e recomendações vencidas sem sinalização | Fallback de referência para preço atual/zero, formatação BRL fixa e ausência de contexto/validade. | Campos separados para moeda, observação, condição e tipo; preço atual de fonte autorizada MARKET/NM; ausência permanece nula; validade/expiração explícitas. |
| Margem/oferta aparentavam ter dados suficientes | Referência não registra condição/tipo comparáveis; oferta era fixa. | Margem e oferta indisponíveis quando não há contexto. Formatação monetária inválida tem fallback e não derruba a tela. |
| Dados de catálogo não aprovados podiam ser públicos | Leitura não aplicava o gate de publicação. | Listagem, detalhe e oportunidades exigem impressões aprovadas. Não há aprovação automática de dados reais existentes. |
| Busca e botões não concluíam uma jornada | Busca não disparava navegação; ações não tinham destino; catálogo limitado a 50. | Catálogo paginado, filtros, detalhe, modal de análise e expansão de oportunidades até 100. Limites de busca UI/API alinhados em 80 caracteres. |
| Instalação dependia de scripts bloqueados | Prisma/esbuild necessitam componentes de build; política de scripts ausente. | Allowlist compatível com pnpm 10.15: Prisma engines, Prisma e esbuild; Scarf bloqueado. Sem alteração de versões no lockfile. |

## Arquivos alterados e motivo

- `apps/api/prisma/seed.ts`, `apps/api/tsconfig.seed.json`, `apps/api/package.json`: seed alinhado ao schema, compilação e comando `test:unit` separado da integração PostgreSQL.
- `apps/api/src/modules/auth/auth.service.ts`: revogação correta, lentes reais e logs de login/logout/expiração com resultado e razões categóricas nas falhas, sem PII/credenciais.
- `apps/api/src/modules/users/users.repository.ts` e `users.service.ts`: seleção e serialização das lentes públicas.
- `apps/api/src/modules/cards/cards.controller.ts`, `cards.service.ts`, `dto/list-cards.dto.ts`: envelope de paginação, ordem estável, filtros, detalhe e publicação.
- `apps/api/src/modules/home/home.service.ts`, `dto/home-query.dto.ts`: observação autorizada, moeda/contexto/validade, limite de oportunidades e remoção de totais pessoais fictícios.
- `packages/contracts/src/index.ts`: contratos explícitos de usuário, catálogo, detalhe e oportunidades.
- `apps/mobile/app/login.tsx`, `app/(tabs)/sign-in.tsx`, `app/(tabs)/_layout.tsx`: formulário centralizado, campo Usuário (e-mail), aba Login e espera pela restauração da sessão.
- `apps/mobile/app/catalog.tsx`, `app/cards/[id].tsx`, `src/screens/CatalogScreen.tsx`, `CardDetailScreen.tsx`: busca, paginação, impressão e navegação para detalhe.
- `apps/mobile/src/components/AccountButton.tsx`, `AccountLayout.tsx`: botão no topo esquerdo e conteúdo com largura máxima de 1100 px.
- `apps/mobile/src/components/CardImage.tsx`, `OpportunityCard.tsx`, `src/screens/HomeScreen.tsx`, `ProfileScreen.tsx`: fallback de imagem, ações funcionais, moedas reais, recomendações vencidas e centralização.
- `apps/mobile/src/providers/SessionProvider.tsx`, `src/lib/session-cache.ts`, `api.ts`, `profile.ts`: proteção do cache/sessão, novas consultas públicas e formatação segura.
- `apps/api/test/auth-profile.http.test.ts`, `users.http.test.ts`, `users.database.test.ts`, `catalog-market.test.ts`, `session-cache.test.ts`, `profile-summary.test.ts`: cobertura das correções e ajuste da expectativa de lente primária.
- `pnpm-workspace.yaml`: política de scripts de dependências.
- `README.md`, `docs/debugging.md`, `development-status.md`, `roadmap.md` e este relatório: execução Windows, diagnóstico, evidências e plano do MVP.

## Compatibilidade e limites

`GET /v1/cards` passa de array para `{items,page,limit,total,totalPages}`. Consumidores externos devem ajustar a leitura. A API e este frontend foram atualizados juntos. Impressões não aprovadas ficam ocultas, podendo deixar vazio um catálogo existente; a administração de aprovação continua pendente.

O seed cria dados sintéticos, acrescenta preços/recomendações a cada execução e não define senha para a conta demonstrativa. Não representa integração real de mercado nem importador CSV idempotente. Para testar login, crie sua própria conta pela interface.

A API, o frontend em modo dev e os containers não foram iniciados. Não foram executadas migrations/seeds, gravados dados em PostgreSQL, feitos commits ou pushes. A suíte integrada exige banco descartável e validação separada. O schema e as migrations não foram alterados.

Não houve verificação visual em navegador/dispositivo. Exportação web, tipos e testes HTTP não comprovam layout/cookies em iOS/Android, múltiplas abas ou persistência real. A leitura pessoal ainda carrega a coleção inteira; paginação/virtualização de holdings faz parte do plano seguinte.

## Validação

- `corepack pnpm --version`: **10.15.0**. `corepack pnpm install --frozen-lockfile --config.confirmModulesPurge=false`: passou, 995 pacotes, componentes Prisma/esbuild instalados, versões do lockfile preservadas.
- `corepack pnpm typecheck`: **6 successful, 6 total**, incluindo a checagem do seed e frontend.
- `corepack pnpm --filter @op-alpha/api test:unit`: **6 arquivos, 67 testes passaram**. Nest/Fastify usam persistência simulada; o cache usa QueryClient real, sem banco.
- `corepack pnpm build`: **4 successful, 4 total**. API compilada e frontend exportado pelo Expo: 962 módulos, bundle web de 1,7 MB, `Exported: dist`. Houve apenas avisos de conflito entre `NO_COLOR` e `FORCE_COLOR` na exportação.
- `git diff --check`: passou. Schema, migrations e lockfile sem alterações.

Trecho da suíte final:

```text
Test Files  6 passed (6)
     Tests  67 passed (67)
Build: 4 successful, 4 total
```

Cobertura: cadastro/sanitização (17), sessão/perfil/lentes/revogação/eventos (13), catálogo/mercado (23), cache/concorrência (8), custos/moeda (3) e health/Home (3). A validação PostgreSQL de `users.database.test.ts` não foi executada nem desativada; permanece no comando de integração e na suíte geral.

Durante a preparação houve bloqueios de permissão para registry/geração Prisma e incompatibilidade do pnpm global 11 com a configuração declarada. A instalação foi autorizada, sincronizada com Corepack/pnpm 10.15 e revalidada. Tipos de rotas do Expo foram regenerados pelo gerador instalado, sem edição manual. Não houve acesso ao banco para gerar o client.

## Executar e conferir

Comandos completos, variáveis e preparação estão em [README](../README.md#executar-no-windows--powershell). Use Node 22.13+ / 24, pnpm 10.15 e Docker Desktop.

1. Preserve `.env`; configure as credenciais locais e `DATABASE_URL`. Para web, `apps/mobile/.env.local` deve usar `EXPO_PUBLIC_API_URL=http://localhost:3333/v1`.
2. Prepare dependências, contratos, client Prisma e banco. `db:deploy` aplica migrations; `db:seed` é opcional e grava somente no banco local escolhido.
3. Terminal API: `pnpm --filter @op-alpha/api dev`. Terminal frontend: `pnpm --filter @op-alpha/mobile web`.
4. Abra `http://localhost:8081` e valide Login → cadastro → Ir para login → Perfil/Resumo → recarga → logout. Confira botão no topo esquerdo e conteúdo centralizado em 320/375/768/1024/1440 px.
5. Em Mercado, teste busca por código/nome, filtro de set, páginas, detalhe, Ver análise e Ver mais. Preço ausente, margem sem contexto e recomendação vencida devem permanecer explícitos.
6. Verifique `GET http://localhost:3333/v1/health/ready` e `GET /v1/cards?page=1&limit=2`. Um health simples não comprova conexão com o banco.

Deixe a revisão do diff e o commit para o responsável pelo repositório.
