# OP Alpha — protótipo evolutivo

Aplicativo Expo/React Native, API NestJS/Fastify e PostgreSQL/Prisma em um monorepo. Node 22.13+ / 24, pnpm 10.15.0 e Docker Compose v2. Use `corepack pnpm` se o pnpm global tiver outra versão.

## Escopo atual

- Um único tipo de usuário; cadastro recebe apenas nome, e-mail e senha.
- Catálogo público como entrada, Coleção e Conta/Login. Lentes Colecionador/Investidor/Player são troca visual local na barra superior; não mudam permissões, dados ou preferências no servidor.
- Busca por nome/código, filtro de set/idioma, paginação, impressões aprovadas e detalhe. Set e idioma se referem à mesma impressão; uma impressão legada sem set usa o set canônico da carta.
- Coleção permite adicionar impressões aprovadas pelo cadastro assistido (`/scan`), com quantidade, condição e custo opcional BRL. Edição e remoção de registros ficam para a próxima etapa.
- Valores ativos somente em reais (BRL). Valores estrangeiros existentes não são convertidos nem renomeados; custo/preço indisponível continua nulo. Precificação real virá depois.
- Criação/edição de novas cartas do catálogo: contratos e política de verificação preparados, sem formulário, endpoint ou persistência de propostas. MyPCards é a fonte provisória principal; Liga One Piece é fallback. Acesso HTTP direto recebe desafio Cloudflare; integração aguarda método autorizado/API. Sem verificador, nenhuma carta é aprovada.

## Preparar no Windows

```powershell
Set-Location 'C:\Users\guidr\OneDrive\op-alpha'
if (!(Test-Path .env)) { New-Item -ItemType File -Path .env | Out-Null }
if (!(Test-Path apps/mobile/.env.local)) { New-Item -ItemType File -Path apps/mobile/.env.local | Out-Null }
corepack pnpm install --frozen-lockfile
corepack pnpm --filter @op-alpha/contracts build
corepack pnpm --filter @op-alpha/api prisma:generate
```

Preencha `.env` sem substituir credenciais de um banco/volume existente:

```dotenv
POSTGRES_USER=opalpha
POSTGRES_PASSWORD=SUA_SENHA_LOCAL
POSTGRES_DB=opalpha
POSTGRES_PORT=5432
DATABASE_URL=postgresql://opalpha:SENHA_CODIFICADA_PARA_URL@localhost:5432/opalpha?schema=public
PORT=3333
CORS_ORIGIN=http://localhost:8081
```

Os valores são exemplos. A senha da URL deve ser a mesma senha do PostgreSQL, codificada para URL. `.env` é privado; não o versione nem envie senhas pelo chat. Nesta pasta OneDrive, ele também pode ser sincronizado: `.gitignore` não impede sincronização. Se `apps/api/.env` existir, sua `DATABASE_URL` tem precedência sobre a raiz: mantenha as duas consistentes. Uma `DATABASE_URL` já definida no ambiente do terminal tem precedência sobre os arquivos. Para web local, `apps/mobile/.env.local` deve usar `EXPO_PUBLIC_API_URL=http://localhost:3333/v1`; o IP no exemplo mobile é apenas ilustrativo para dispositivo físico.

Abra Docker Desktop e execute somente contra seu banco local:

```powershell
corepack pnpm db:config
corepack pnpm db:up
corepack pnpm db:deploy
# Opcional: grava dados sintéticos no banco local, nunca em produção.
# corepack pnpm db:seed
```

`db:deploy` aplica migrations versionadas. A nova migration de usuário único remove o antigo `User.type`, seu CHECK e o enum sem recriar categorias. Aplique-a antes de iniciar a API atualizada. Migrations anteriores permanecem como histórico. A coluna contém apenas a classificação antiga; sua remoção foi autorizada e não deve excluir nomes, e-mails, hashes de senha, sessões ou holdings. O volume PostgreSQL é preservado; não use `down -v`.

O seed é demonstrativo: prepara catálogo/impressões e preços BRL, não valida fontes reais nem cria senha para a conta demonstrativa. Cadastre sua própria conta para testar login. Reexecutar acrescenta preços/recomendações; não é um importador de mercado idempotente.

## Executar

Em um terminal na raiz:

```powershell
corepack pnpm --filter @op-alpha/api dev
```

Em outro terminal na raiz:

```powershell
corepack pnpm --filter @op-alpha/mobile web
```

Frontend: `http://localhost:8081`. API: `http://localhost:3333/v1`. Swagger: `http://localhost:3333/v1/docs`.

Rotas principais: `/` (Catálogo), `/collection`, `/account`, `/cards/:id`, `/register`, `/scan`. `/login`, `/catalog` e antigas abas redirecionam para os destinos atuais. Os grupos do Expo Router, como `/(tabs)/account`, são organização interna das rotas. Busca, set, idioma e página ficam na URL do catálogo.

O cadastro assistido permite selecionar foto na web e selecionar/capturar no dispositivo. Não há OCR ou reconhecimento automático. A foto fica apenas na memória local da tela; a impressão deve ser confirmada no catálogo aprovado. `POST /v1/users/me/holdings` usa a sessão como proprietário, aceita quantidade/condição/custo unitário BRL e cria um lote separado. Sem custo informado, o valor permanece nulo. A foto não é transmitida à API. Alterações de permissões nativas exigem uma nova build do aplicativo.

## Conta e sessão

`POST /v1/users`: `{name,email,password}`; campos extras são rejeitados. Nome tem 1–100 caracteres, e-mail é normalizado, senha tem 12–128 caracteres. Cadastro não autentica; depois use o login.

`POST /v1/auth/login` recebe `{email,password}`. `GET /v1/auth/me` restaura a identidade e `POST /v1/auth/logout` revoga o cookie. Usuário público: `{id,name,email,createdAt}`. A antiga rota `PATCH /v1/auth/lens` foi retirada; a barra de lentes não chama a API.

Senha usa scrypt com salt aleatório. Sessão opaca de sete dias, token armazenado como hash, cookie HttpOnly/SameSite=Lax e Secure em produção. As mutações usam `X-Op-Client: 1`; o cliente envia `credentials: include`. Use frontend e API no mesmo site e configure `CORS_ORIGIN` com a origem exata. Login, recarga, expiração durante cadastro e revogação no logout passaram no Chromium com PostgreSQL real descartável. Cookies em iOS/Android e concorrência entre múltiplas abas ainda precisam de validação específica.

Há proteção contra respostas antigas e limpeza do cache pessoal ao sair/trocar de conta. Eventos `auth.login`, `auth.logout` e `auth.session_expired` não incluem credenciais ou identificadores pessoais. Não há JWT adicional nem analytics de comportamento.

## Verificar

Sem gravações em banco:

```powershell
corepack pnpm typecheck
corepack pnpm build
Invoke-RestMethod http://localhost:3333/v1/health/ready
Invoke-RestMethod 'http://localhost:3333/v1/cards?page=1&limit=2&language=EN'
```

Health simples confirma processo; readiness confirma acesso ao PostgreSQL. Por solicitação do responsável, os casos de teste e suas fixtures de execução permanecem somente no computador de desenvolvimento; não são distribuídos no GitHub. Os scripts `test:*` exigem esse conjunto local e não representam uma suíte disponível em um clone público. O workflow publicado verifica tipos e build. Consulte [evidências e limites dos testes locais](docs/testing.md).

Jornada manual: catálogo público → filtros/página → detalhe → voltar preservando busca → criar conta → login → coleção → recarga → logout. Troque lentes: apenas identificação/destaque devem mudar, sem request extra ou alteração dos filtros. Confira 320/375/768/1024/1440 px e o inset inferior de dispositivos nativos.

## Referências de manutenção

- [Arquitetura e decisões atuais](docs/architecture.md)
- [Diagramas para inspeção e orientação futura](docs/diagrams/prototype-architecture.mmd)
- [Fluxo futuro de verificação de cartas](docs/diagrams/card-verification-flow.mmd)
- [Roadmap e estágio](docs/development-status.md)
- [Diagnóstico](docs/debugging.md)
- [Entrega de 15/10/2026](docs/implementation-2026-10-15.md)

Relatórios de setembro e de 03/10 permanecem históricos; seus contratos e critérios podem ter sido substituídos pelas decisões atuais.
