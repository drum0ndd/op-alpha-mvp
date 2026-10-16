# Acordos de trabalho com IA

## Controle das mudanças

- Por padrão, investigue e proponha; não implemente automaticamente.
- Antes de alterar arquivos, apresente:
  1. Diagnóstico e evidências.
  2. Arquivos que pretende modificar.
  3. Menor correção proposta.
  4. Riscos e plano de validação.
- Aguarde minha aprovação explícita.
- A aprovação vale apenas para o escopo apresentado.
- Se precisar ampliar o escopo, pare e consulte.
- Não altere este arquivo para flexibilizar as próprias restrições.

## Diagnóstico

- Leia o git status antes de trabalhar.
- Preserve alterações locais.
- Diferencie fatos observados de hipóteses.
- Apresente arquivos e linhas relevantes.
- Não execute scripts desconhecidos antes de inspecioná-los.
- Testes que gravem dados exigem banco descartável e aprovação.
- Não exponha segredos ou dados pessoais em comandos e logs.

## Ações que exigem aprovação específica

- Instalar ou atualizar dependências.
- Aplicar migrations, executar seeds ou modificar dados.
- Iniciar, parar ou reconfigurar serviços e containers.
- Fazer chamadas externas que alterem estado.
- Fazer commits, pushes ou deploys.
- Excluir arquivos ou volumes.
- Alterar autenticação, permissões ou infraestrutura.

## Implementação autorizada

- Faça mudanças pequenas e focadas.
- Não misture correção de bug com refatoração não solicitada.
- Não edite arquivos gerados manualmente.
- Não remova funcionalidades ou desative testes para eliminar erros.
- Não use produção para testes.

## Evidências e entrega

- Durante o trabalho, informe descobertas e falhas relevantes.
- Ao terminar, apresente:
  - Causa identificada.
  - Arquivos alterados e motivo.
  - Comandos executados.
  - Resultados dos testes e trechos-chave dos logs.
  - Verificações não realizadas e pendências.
- Não declare sucesso apenas porque compilou.
- Deixe a revisão do diff e o commit para mim.

## Documentação

- Consulte README.md para execução.
- Consulte docs/architecture.md antes de mudanças estruturais.
- Consulte docs/debugging.md para diagnóstico.
- Se uma documentação estiver ausente ou desatualizada, informe.