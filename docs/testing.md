# Testes do protótipo

Execute na raiz com Node 22.13+ / 24 e `corepack pnpm`. Os testes não usam produção.

**Distribuição:** por solicitação do usuário em 16/10/2026, `apps/api/test`, `apps/mobile/e2e` e `scripts/test-process.test.mjs` ficam apenas no ambiente local e na branch `dev` local, sem publicação. Os comandos desta página documentam a suíte local; não funcionam integralmente em um clone público sem esses arquivos. O workflow público executa somente tipos e build.

## Comandos

```powershell
corepack pnpm typecheck
corepack pnpm --filter @op-alpha/api test:unit
corepack pnpm exec playwright install chromium
corepack pnpm test:app
```

`test:unit` compila a API e executa a suíte em memória. `test:app` cria PostgreSQL 17 descartável, aplica as migrations versionadas, insere fixtures sintéticas e executa integração SQL e navegador. `test:database` e `test:browser` selecionam uma dessas etapas, mantendo o mesmo isolamento. Não é preciso configurar TEST_DATABASE_URL manualmente.

Pré-requisitos: Docker Desktop disponível, Chromium instalado e portas 5433, 3334 e 8082 livres. O runner aborta se encontrar portas ocupadas ou um projeto Compose `opalpha-tests` existente. Ele nunca reutiliza servidores de desenvolvimento.

## Isolamento

`scripts/test-environment.mjs` fixa a única URL permitida: banco `opalpha_test` em 127.0.0.1:5433, com credenciais públicas e descartáveis. O runner substitui DATABASE_URL/TEST_DATABASE_URL nos processos filhos antes do Prisma; variáveis privadas do `.env` não determinam o alvo. As fixtures e suítes SQL também rejeitam outra URL.

`infra/docker-compose.test.yml` usa tmpfs, sem volume persistente. O runner encerra somente o projeto que criou no bloco finally. Em sinais tratados, ele interrompe a árvore do comando ativo antes de desmontar o banco e impede novos comandos durante o encerramento. `scripts/test-process.test.mjs` verifica filho/neto Node descartáveis antes da suíte. Em encerramento forçado do processo ou queda de energia, a limpeza não é garantida: verifique o projeto de teste e, se ele for o recurso remanescente, use `docker compose -p opalpha-tests -f infra/docker-compose.test.yml down`. Não execute `down -v` no ambiente de desenvolvimento.

## Cobertura

- API/SQL: cadastro, e-mail normalizado concorrente, remoção física do tipo legado, paginação de 53 cartas públicas, impressões não publicadas, ordenação repetível, filtros na mesma impressão e parâmetros inválidos.
- HTTP em memória: sessão, revogação, isolamento de conta, falhas de persistência, criação de lote, proprietário derivado da sessão, publicação obrigatória, entrada estrita e BRL.
- Chromium desktop e viewport Pixel 7: rotas públicas/protegidas, aliases, erros de detalhe, troca visual de lente, páginas/limites, filtros, retorno/recarga, cadastro/login/logout, coleção assistida com seleção local de foto e sessão revogada durante o preenchimento.

Relatório HTML local: `playwright-report/index.html`. Falhas retêm screenshot/trace em `test-results/browser`. São artefatos ignorados pelo Git. O workflow `.github/workflows/ci.yml` verifica tipos e build em pushes para dev/master/main e pull requests; não executa os casos privados. A execução remota depende da publicação no GitHub.

## Evidências da retomada — 15/10/2026

Branch `dev`, Windows/PowerShell, sem commit/push. O banco de desenvolvimento foi preservado.

| Verificação | Resultado observado |
|---|---|
| `corepack pnpm test:app` | 13 testes PostgreSQL e 14 cenários de navegador passaram; as quatro migrations foram aplicadas no banco descartável. |
| `corepack pnpm test:browser`, após o ajuste de expiração | 16 cenários passaram, 8 desktop e 8 mobile, incluindo 401 durante inclusão. |
| `corepack pnpm typecheck` | 6 tarefas passaram. |
| `node --test scripts/test-process.test.mjs` | 1 teste passou; filho e neto descartáveis foram encerrados no Windows. Também passou dentro do runner. |
| `node --check` dos scripts e `git diff --check` | Sem erros de sintaxe ou whitespace. |
| Limpeza | Container `opalpha-tests-postgres-1` e rede `opalpha-tests_default` removidos ao final das duas suítes, com código 0. |

A suíte unit/HTTP já havia passado antes da pausa: **141 testes em 10 arquivos**. Não foi repetida nesta retomada porque o backend permaneceu igual. O frontend exportou com sucesso como parte da execução de navegador. As larguras 320, 375, 768, 1024 e 1440 px passaram sem transbordamento horizontal; capturas de catálogo e coleção foram geradas para inspeção.

Correções verificadas no lote completo:

- Estilos em array no filho de `Link asChild` causavam tela branca em produção web; `CatalogHero` aplica `StyleSheet.flatten` antes de entregar o estilo ao link.
- `accessibilityState` não expunha seleção dos controles no React Native Web instalado; lentes/rádios também usam `aria-selected`/`aria-checked`.
- `ScanScreen` agora usa `session.expire(userId)` ao receber 401 da inclusão, sem esperar o polling; `collection.spec.ts` revoga a sessão real durante o preenchimento e verifica o retorno ao login.
- `scripts/test-app.mjs` guardava a limpeza do banco, mas não encerrava explicitamente o filho em sinais tratados. `test-process.mjs` encerra somente a árvore criada pela suíte e o runner bloqueia novas etapas durante o shutdown.

O helper de processos foi executado no Windows; o ramo POSIX foi revisado, mas depende da execução futura em Linux/CI para confirmação. A interrupção forçada pelo sistema operacional continua sujeita à limpeza manual descrita acima.

## Verificação antes da publicação — 16/10/2026

`corepack pnpm typecheck` passou nas seis tarefas; `corepack pnpm --filter @op-alpha/api test:unit` passou novamente com **141 testes em 10 arquivos**. `git diff --check` não encontrou erros de whitespace. Os 13 testes PostgreSQL e 16 cenários de navegador permanecem como evidência da execução de 15/10; não foram repetidos porque o código da aplicação não mudou nesta preparação.

Arquivos privados `.env`, código Prisma gerado, tipos Expo gerados, dependências e relatórios locais foram confirmados fora do conjunto versionado. A verificação de padrões de chaves/tokens/URLs de banco encontrou somente placeholders e as credenciais públicas do banco descartável. Isso não substitui uma auditoria de segurança.

O usuário solicitou publicação na `main` remota a partir da `master` local, preservando o commit inicial do GitHub e mantendo `dev` somente local. Para impedir exposição dos casos por commits antigos, o snapshot público parte do histórico remoto; o commit completo com testes foi preservado na `dev` local. A execução do workflow no GitHub será uma evidência separada.

## Limites de plataforma e integração

Emulação mobile no Chromium não comprova câmera/cookies/permissões em iOS ou Android nativos. A suíte não acessa MyPCards/Liga, não importa preços e não valida OCR ou análises das lentes. Banco de desenvolvimento não é migrado pelo runner. As contas e cartas de teste são sintéticas e desaparecem com o container.
