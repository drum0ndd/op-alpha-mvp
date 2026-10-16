# Referência de frontend — 15/10/2026

O protótipo foi reorganizado a partir da análise das capturas públicas de [Home](https://mugipocket.com/inv5-app-home.webp), [Mercado](https://mugipocket.com/inv5-app-market.webp) e [decks](https://mugipocket.com/mpl-deckgrid.jpg) do Mugipocket. Essas imagens servem para analisar composição; a identidade OP Alpha e seus componentes permanecem próprios. A referência anterior era uma tradução de HTML de dashboard financeiro e foi substituída pela jornada de catálogo/coleção.

## Aplicado neste corte

- Três destinos: Catálogo público, Coleção e Conta/Login.
- Cabeçalho com acesso à conta no topo esquerdo, marca e barra de ícones de lentes.
- Lentes em estado local: mudam nome/acento visual e não alteram permissões, dados, consultas ou preferências persistidas. Especialidades serão definidas depois.
- Busca próxima ao título, filtros set/idioma, total de resultados e paginação na URL.
- Grade mobile de duas colunas, três em telas médias e quatro em telas largas, com imagens sem corte.
- Conteúdo central com largura máxima de 1100 px, formulários com 480 px e componentes neutros de página/estados.
- Coleção separada dos dados de conta; quantidade, condição e custo informado somente em reais.
- Conta exibe identidade e saída; quando desconectado, o mesmo destino oferece login e criação de conta.
- Retorno do detalhe usa a pilha e tem fallback para catálogo; aliases anteriores preservam links existentes.
- Barra inferior considera a área segura nativa. Não adicionar destinos com ferramentas indisponíveis ao menu principal.

## Refinamento aprovado com as duas capturas fornecidas

Segmentação em pílula para as lentes, cantos de 24–32 px nas superfícies principais, destaque dourado com gradiente discreto, avatar com inicial e seções com mais espaço. Catálogo ganha destaque introdutório e grade com menos contornos; perfil, coleção e detalhe compartilham os mesmos componentes. Não são exibidos seguidores, rankings, cotações ou estatísticas fictícias.

`/scan` oferece foto local e confirmação manual de código/idioma/arte/coleção, seguida de quantidade/condição/custo BRL. A web usa seleção de arquivo; captura direta fica no aplicativo nativo. Reconhecimento automático não faz parte deste lote.

## Validação visual

Verificar 320/375/768/1024/1440 px, fonte ampliada, iOS/Android e teclado. Caminhos: catálogo → filtro/página → detalhe → voltar; login → coleção → recarga → logout; troca de lente mantendo filtros e dados. Exportar a web e passar TypeScript não substitui esse teste.

Na retomada de 15/10, a automação Chromium passou nessas cinco larguras e nos fluxos desktop/mobile de catálogo, sessão e cadastro assistido. As capturas foram inspecionadas; fonte ampliada, teclado e câmera/cookies nativos continuam pendentes. Resultados e comandos em [testing.md](testing.md).

Continuam pendentes OCR, feed social, análise de investimentos, preço justo e editor de decks. O formulário de criação/edição de novas cartas do catálogo aguarda a integração de fonte/validação; o cadastro assistido adiciona somente impressões já aprovadas à coleção pessoal.
