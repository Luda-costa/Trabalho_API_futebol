# Status da implementação

| Épico | Situação | Observação |
|---|---|---|
| E01 Infra/config/erros | Implementado | Correlation ID, logger com redaction e error handler padronizado. A comparação final com o schema `Error` do OpenAPI depende do contrato oficial. |
| E02 Persistência | Implementado | Persistência simples em `usuarios.json` e `favoritos.json`, sem PostgreSQL, Prisma ou Docker. |
| E03 Auth/RBAC | Implementado | Cadastro, sessão JWT, middleware de autenticação e RBAC. Senhas armazenadas somente como hash bcrypt. |
| E04 Cliente externo/resiliência | Implementado | `fetch` dedicado, timeout/AbortController, retry apenas em timeout/5xx, backoff+jitter, circuit breaker e cache TTL. |
| E05 BFF/rotas esportivas | Implementado | Mappers e rotas de campeonatos, times e partidas. DTOs devem ser comparados com o OpenAPI oficial. |
| E06 Favoritos/idempotência | Implementado | POST/GET/DELETE, isolamento por usuário, duplicidade e Idempotency-Key; persistência em JSON. |
| E07 Admin | Implementado | Listagem e alteração de papel protegidas por `admin`. |
| E08 Frontend SPA | Implementado | Cadastro, login, campeonatos, times/partidas, favoritos e admin; frontend chama apenas o BFF. |
| E09 Testes/QA | Parcialmente implementado | Há testes de RBAC, JWT, mappers, favoritos, armazenamento JSON, retry, timeout e circuit breaker. Auditoria final contra o OpenAPI está pendente porque o arquivo não estava anexado. |

## Validação

- PostgreSQL, Prisma e Docker foram removidos do projeto.
- A persistência de usuários e favoritos usa apenas arquivos JSON locais.
- As regras de unicidade de e-mail e de favorito continuam sendo verificadas antes da gravação.
- O frontend continua consumindo somente o BFF.
