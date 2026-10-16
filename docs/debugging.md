# Diagnóstico local

Leia README, arquitetura e `git status --short`; preserve alterações locais e não imprima credenciais, cookies, senhas ou corpos de autenticação. Use Node 22.13+ / 24 e pnpm 10.15.0 (`corepack pnpm`).

## PostgreSQL e .env

Compose exige `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB`; `POSTGRES_PORT` tem fallback 5432. `DATABASE_URL` deve corresponder aos mesmos dados, com senha codificada para URL. Em volume existente, alterar `.env` não altera a senha do PostgreSQL. Preserve as credenciais originais e não use `down -v` para solucionar conexão.

Se `apps/api/.env` existir, sua DATABASE_URL tem precedência na API/Prisma executados em apps/api; mantenha-a consistente com a raiz. Uma DATABASE_URL já definida no ambiente do terminal tem precedência sobre ambos os arquivos. No frontend web configure apenas `EXPO_PUBLIC_API_URL=http://localhost:3333/v1`; nunca coloque credenciais em variáveis EXPO_PUBLIC.

`.env` ignorado no Git continua sendo texto simples e pode ser sincronizado pelo OneDrive. O Compose limita PostgreSQL a 127.0.0.1; a API escuta 0.0.0.0 para permitir dispositivos de desenvolvimento, e o acesso pela rede depende do firewall. Preencher configuração não equivale a uma auditoria de segurança nem executa SQL; db:deploy altera o banco indicado por DATABASE_URL.

- `required variable POSTGRES_USER is missing`: completar variáveis do Compose na raiz; uma DATABASE_URL isolada não configura o container.
- `ECONNREFUSED`: o processo do banco não está ouvindo no host/porta configurados; abrir Docker Desktop e iniciar o banco local escolhido.
- Erro de autenticação: conferir credenciais reais do volume, não apenas exemplos.
- `corepack pnpm db:config` valida configuração sem exibir credenciais; `db:up` inicia o serviço; `db:deploy` aplica migrations e altera o banco. Somente as duas últimas operações têm efeito no serviço/dados.
- `GET /v1/health` confirma processo; `/v1/health/ready` confirma conexão. Readiness não comprova que todas as migrations ou jornadas do usuário passaram.

## Schema e migration de usuário único

`20261015000000_remove_user_type` retira CHECK, coluna User.type e enum UserType, sem CASCADE, numa transação. Nenhuma conta/senha/sessão é apagada. Migrations anteriores não devem ser editadas. Os valores antigos dessa classificação só podem ser recuperados por backup.

Aplique a migration antes de iniciar o código novo. Sem isso, o antigo CHECK pode rejeitar cadastro sem type; esse erro de versão do banco não deve ser contornado reintroduzindo tipos de usuário na interface. Depois de mudar o schema, `corepack pnpm --filter @op-alpha/api prisma:generate` gera o cliente sem acessar o banco; não aplica SQL.

## Instalação e resolução de módulos

- `Cannot find module`: instalar o lockfile existente, compilar contratos e gerar Prisma. Não atualizar versões para corrigir resolução local.
- Scripts de dependências aprovados: Prisma engines, Prisma e esbuild; Scarf bloqueado, conforme pnpm-workspace.yaml.
- `EPERM realpath` ou tipos transitivos virando any no sandbox Windows: a resolução de junctions pode estar restrita. Comparar a mesma checagem em contexto com permissões adequadas; não acrescentar any, desabilitar strict ou desativar verificações para ocultar o problema. Sandbox restringe a execução do agente; não é um serviço da aplicação.
- Rotas Expo antigas: o gerador oficial as atualiza ao iniciar o frontend; para checagem sem servidor, usar o gerador instalado. Não editar .expo/types manualmente.

## Sessão

Frontend/API no mesmo site, CORS_ORIGIN exato, credentials:include e X-Op-Client:1. Cookie HttpOnly/SameSite=Lax, Secure em produção com HTTPS. CORS sozinho não resolve cookies em sites distintos.

Verificar login, identidade em auth/me, recarga, expiração, troca de conta e logout sem copiar o token para logs. API retorna apenas id/name/email/createdAt; type e preferências de lentes não existem no contrato atual. PATCH auth/lens foi retirado; as lentes são somente interface.

- 400: entrada inválida; cadastro com type/lenses agora é inválido.
- 401: credencial/sessão inválida; o cliente apresenta login.
- 403: origem/header não permitido.
- 429: limite local de tentativas; produção com múltiplas instâncias/proxy exige política própria.
- 503: banco/serviço indisponível. O cliente não deve tratar isso como logout bem-sucedido nem como 401.

## Catálogo e dinheiro

GET /cards retorna página com metadados. Set/idioma filtram impressões aprovadas; a carta pode ter reimpressão em outro produto. Catálogo vazio não deve ser preenchido por seed em produção. Valores antigos estrangeiros são ocultos na leitura monetária e não convertidos; BRL ausente continua indisponível.

A política futura de propostas falha fechada sem fonte oficial/validator configurado. Nenhum endpoint de scraping ou edição foi ativado. Divergência na reimportação requer revisão e preserva o anterior; cache obsoleto bloqueia a escrita.

## Limites da verificação

A suíte test:unit usa Nest/Fastify reais com persistência simulada e cliente/cache testados em memória. TEST_DATABASE_URL e banco descartável migrado são obrigatórios para test:integration. A aplicação da migration, a jornada real de navegador e os cookies em iOS/Android devem ser registrados separadamente. Nenhum teste usa produção.
