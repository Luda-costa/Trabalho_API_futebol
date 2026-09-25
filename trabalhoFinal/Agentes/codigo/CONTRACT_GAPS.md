# Pontos que precisam ser conferidos contra o OpenAPI oficial

Os arquivos fornecidos nesta conversa incluem o agente de desenvolvimento e o backlog executável, mas não incluem o conteúdo de `openapi.yaml`, `spec.md` ou `plan.md`.

Por isso, esta implementação usa apenas as rotas e comportamentos citados explicitamente no backlog e concentra as decisões que dependem do contrato nos pontos abaixo:

1. **Schemas de resposta esportivos**: `backend/src/contracts/dtos.ts` e `backend/src/mappers/football-data-mapper.ts`.
2. **Envelope de paginação**: atualmente `{ items, pagina, limite, total }`.
3. **Status codes assumidos**:
   - `POST /usuarios`: 201
   - `POST /sessoes`: 200
   - `POST /favoritos`: 201
   - `DELETE /favoritos/{id}`: 204
   - demais leituras/PATCH: 200
4. **Erros de validação/regra**: 400; autenticação: 401; autorização: 403; recurso inexistente: 404; falha externa definitiva: 502; erro interno: 500.
5. **Payloads assumidos**:
   - cadastro: `{ nome, email, senha }`
   - login: `{ email, senha }`
   - favorito: `{ tipo: "time" | "campeonato", itemExternoId }`
   - alteração admin: `{ role: "user" | "admin" }`
6. **Filtros esportivos**: `pagina`, `limite`, `temporada`, `status`, `dataInicio`, `dataFim`, `campeonatoId`.

Antes da entrega final, compare esses pontos com o `openapi.yaml` oficial. Se houver divergência, o OpenAPI deve prevalecer.
