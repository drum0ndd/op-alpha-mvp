# Roadmap técnico do MVP

**Situação em 15/10/2026:** protótipo de catálogo, coleção e identidade com escopo simplificado. Consulte [evidências, entregas e plano atual em três ciclos](development-status.md). As seis sprints abaixo são a decomposição histórica do backlog; não representam o escopo ativo desta versão. Há um único usuário e as lentes são apenas apresentação local.

## Sprint 0 — fundação (entregue neste scaffold)

- monorepo;
- banco PostgreSQL;
- Prisma schema;
- API modular, versionada e documentada;
- Home por lente;
- front-end React Native baseado no protótipo;
- fontes catalogadas e política de ingestão.

## Sprint 1 — catálogo e identidade

- autenticação;
- CRUD administrativo de sets/cartas/variantes;
- busca paginada;
- importador CSV idempotente;
- testes de integração com PostgreSQL.

## Sprint 2 — Colecionador

- holdings CRUD;
- progresso por set;
- wishlist;
- custo estimado para completar;
- galeria e filtros.

## Sprint 3 — Investidor

- custo médio;
- desempenho e concentração;
- histórico de preços;
- watchlist e preço-alvo;
- Alpha Engine v0 offline/job.

## Sprint 4 — Player

- deck CRUD e validação de quantidades;
- versões do deck;
- registro de partidas;
- meta snapshot manual/CSV;
- recomendações explicáveis de teste.

## Sprint 5 — robustez

- logs estruturados e tracing;
- rate limiting;
- backup/restore testado;
- cache e fila;
- política LGPD;
- observabilidade e SLOs.
