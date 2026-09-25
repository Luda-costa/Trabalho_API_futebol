# Status da implementação

| Épico | Situação | Observação |
|---|---|---|
| E01 Infra/config/erros | Implementado | Correlation ID, logger com redaction e error handler padronizado. A comparação final com o schema `Error` do OpenAPI depende do contrato oficial. |
| E02 Persistência | Implementado | PostgreSQL + Prisma, `usuarios` e `favoritos` com unicidade composta. |
| E03 Auth/RBAC | Implementado | Cadastro, sessão JWT, middleware de autenticação e RBAC. |
| E04 Cliente externo/resiliência | Implementado | `fetch` dedicado, timeout/AbortController, retry apenas em timeout/5xx, backoff+jitter, circuit breaker e cache TTL. |
| E05 BFF/rotas esportivas | Implementado | Mappers e rotas de campeonatos, times e partidas. DTOs devem ser comparados com o OpenAPI oficial. |
| E06 Favoritos/idempotência | Implementado | POST/GET/DELETE, isolamento por usuário, duplicidade e Idempotency-Key. |
| E07 Admin | Implementado | Listagem e alteração de papel protegidas por `admin`. |
| E08 Frontend SPA | Implementado | Cadastro, login, campeonatos, times/partidas, favoritos e admin; frontend chama apenas o BFF. |
| E09 Testes/QA | Parcialmente implementado | Há testes de RBAC, JWT, mappers, favoritos, retry, timeout e circuit breaker. Auditoria final contra o OpenAPI está pendente porque o arquivo não estava anexado. |

## Validação executada neste ambiente

- Parser TypeScript aplicado a todos os `.ts` e `.tsx` do projeto: nenhum erro sintático encontrado.
- `package.json` do backend e frontend validados como JSON.
- Tentativa de `npm install` não concluiu dentro do limite do ambiente, portanto build e suíte Vitest completas precisam ser executadas localmente após instalar as dependências.
