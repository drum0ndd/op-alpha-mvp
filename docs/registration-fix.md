# Correção do cadastro — 14/09/2026

## Diagnóstico e alterações

- A porta `localhost:3333` recusava conexão. `pnpm build` reproduziu 14 erros na API: import de `CollectionModule` sem arquivo correspondente e cliente Prisma gerado incompatível com o schema atual.
- Removida somente a referência ao módulo inexistente em `AppModule`. Os módulos de autenticação e cadastro e as proteções existentes foram mantidos.
- Os scripts `dev` e `build` da API agora geram o cliente Prisma antes de iniciar/compilar. Isso não aplica migrations nem modifica dados.
- O cadastro do frontend não enviava `X-Op-Client: 1`, exigido pelo guard global. A requisição antiga foi reproduzida com resposta 403. O cabeçalho foi acrescentado e falhas de rede agora recebem mensagem em português.
- O PostgreSQL existente estava saudável, mas as migrations `20260913000000_user_registration` e `20260913010000_identity_catalog_sync` estavam pendentes. Ambas foram aplicadas com `prisma migrate deploy`, sem reset, seed ou recriação de volume.

## Validação

- `pnpm build`: passou nos quatro pacotes, incluindo API e exportação web Expo.
- `pnpm --filter @op-alpha/api test`: 20 testes passaram; 3 testes de integração foram pulados por falta de `TEST_DATABASE_URL`. Acrescentada cobertura do guard real e do preflight CORS nos testes HTTP existentes.
- Teste adicional com API real em `localhost:3333` e banco configurado: `SELECT 1` passou e `GET /v1/health/ready` retornou 200 com `database: connected`.
- `OPTIONS /v1/users`: 204, autorizando a origem `http://localhost:8081` e o cabeçalho `x-op-client`.
- `POST /v1/users`: 201 para colecionador e investidor. Conferidos no banco hash scrypt e lente primária correspondente; senha/hash ausentes na resposta.
- E-mail duplicado normalizado: 409. Senha inválida: 400. Requisição antiga sem cabeçalho: 403.
- Somente os dois usuários temporários criados pela verificação foram removidos ao final; nenhum registro preexistente foi excluído.
- `git diff --check`: passou. Alterações locais anteriores foram preservadas.

## Pendências

- `pnpm typecheck` falha em código preexistente da Home: valores `number | null` em `MarketIndexCard.tsx`, `OpportunityCard.tsx` e `HomeScreen.tsx`. Esses componentes não foram alterados nesta correção.
- Não houve teste visual em navegador ou dispositivo físico; a validação foi por HTTP, banco real, compilação e testes automatizados.
- O Compose atual exige `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB`, mas o `.env` local não contém todas essas variáveis. A consulta Compose falhou por ausência de `POSTGRES_USER`. O contêiner existente foi utilizado sem recriação; antes de usar `pnpm db:up`, alinhar essas variáveis às credenciais originais do volume.
