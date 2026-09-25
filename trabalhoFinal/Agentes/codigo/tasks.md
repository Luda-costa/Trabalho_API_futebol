# tasks.md — Backlog Executável de Desenvolvimento

Este documento define o plano de execução detalhado do projeto **Plataforma de Acompanhamento de Campeonatos de Futebol**, derivado da especificação (`spec.md`), do plano arquitetural (`plan.md`) e do contrato `openapi.yaml`.

---

## 1. Objetivo da Iteração
Implementar e validar o Backend (BFF), o armazenamento interno de dados e a interface Frontend (SPA), garantindo 100% de conformidade com o contrato `openapi.yaml`, resiliência na integração externa com a `football-data.org` (timeout, retry, circuit breaker) e aplicando rigorosamente RBAC, JWT, Correlation ID e padronização de erros.

---

## 2. Épicos
- **E01**: Infraestrutura, Configurações e Erros Padronizados
- **E02**: Persistência e Modelo de Dados Interno
- **E03**: Autenticação, Usuários e RBAC
- **E04**: Cliente de Integração Externa e Resiliência (football-data.org)
- **E05**: Camada de Transformação BFF e Rotas Esportivas (Leitura)
- **E06**: Gestão de Favoritos e Idempotência
- **E07**: Módulo de Administração
- **E08**: Frontend (SPA)
- **E09**: Testes de Integração, Qualidade e Validação Final

---

## 3. Detalhamento de Tarefas por Épico

### Épico 01: Infraestrutura, Configurações e Erros Padronizados
- **TASK-01-01**: Configurar estrutura base do projeto Node.js/TypeScript, linter, formato de arquivos e variáveis de ambiente (`FOOTBALL_DATA_API_KEY`, `JWT_SECRET`, `PORT`, `DATA_DIR`).
  - *Requisitos:* RNF-09
- **TASK-01-02**: Criar Middleware de Correlation ID (`X-Correlation-Id`). Deve ler o header recebido ou gerar UUID v4 se ausente, anexando no contexto AsyncLocalStorage/request, no logger estruturado e no header de resposta HTTP.
  - *Requisitos:* RNF-06, CA-12
- **TASK-01-03**: Criar Middleware Centralizado de Tratamento de Erros e o schema `Error` em conformidade estrita com o OpenAPI (`code`, `message`, `correlationId`).
  - *Requisitos:* RNF-07, CA-13

### Épico 02: Persistência e Modelo de Dados Interno
- **TASK-02-01**: Configurar persistência local simples em arquivos JSON para os dados internos da aplicação.
  - *Requisitos:* RNF-09
- **TASK-02-02**: Criar `usuarios.json` e o repositório de usuários (`id`, `nome`, `email`, `senhaHash`, `role`, `criadoEm`), preservando unicidade de e-mail.
  - *Requisitos:* RF-01, RF-08, RNF-09
- **TASK-02-03**: Criar `favoritos.json` e o repositório de favoritos, impedindo duplicidade da combinação `usuarioId + tipo + itemExternoId`.
  - *Requisitos:* RF-04, RF-07, RN-02, RNF-09

### Épico 03: Autenticação, Usuários e RBAC
- **TASK-03-01**: Implementar `UsuarioRepository` e `UsuarioService` com suporte a hash seguro de senhas (bcrypt/argon2).
  - *Requisitos:* RF-01, CA-01
- **TASK-03-02**: Implementar Rota `POST /usuarios` para cadastro público de usuários.
  - *Requisitos:* RF-01, CA-01
- **TASK-03-03**: Implementar Rota `POST /sessoes` para autenticação de credenciais e emissão de JWT contendo `sub` e `role`.
  - *Requisitos:* RF-02, CA-02
- **TASK-03-04**: Implementar Middleware Centralizado de Autenticação JWT (`Authorization: Bearer <token>`).
  - *Requisitos:* RNF-01
- **TASK-03-05**: Implementar Middleware Declarativo de RBAC (`requireRole('admin' | 'user')`).
  - *Requisitos:* RF-08, RNF-02, CA-07

### Épico 04: Cliente de Integração Externa e Resiliência (football-data.org)
- **TASK-04-01**: Implementar `FootballDataClient` base utilizando `fetch` com inclusão do header `X-Auth-Token` e repasse do `X-Correlation-Id`.
  - *Requisitos:* RF-11, RNF-06
- **TASK-04-02**: Implementar gerenciamento de Timeout na chamada HTTP externa utilizando `AbortController`.
  - *Requisitos:* RNF-03, CA-10
- **TASK-04-03**: Implementar mecanismo de Retry com Exponential Backoff (com Jitter) exclusivo para Timeouts e status HTTP 5xx temporários.
  - *Requisitos:* RNF-04, CA-10
- **TASK-04-04**: Implementar Circuit Breaker para a API externa contendo os 3 estados (`CLOSED`, `OPEN`, `HALF_OPEN`).
  - *Requisitos:* RNF-05, CA-11
- **TASK-04-05**: Implementar Cache Efêmero em memória com TTL curto no `FootballDataClient` para mitigar o rate-limit (10 req/min) da API externa.
  - *Requisitos:* RNF-09 (Resiliência)

### Épico 05: Camada de Transformação BFF e Rotas Esportivas (Leitura)
- **TASK-05-01**: Implementar `Mappers` (DTO → BFF) para converter payloads brutos da football-data.org nos schemas `Campeonato`, `Time` e `Partida` do OpenAPI.
  - *Requisitos:* RF-12, CA-09
- **TASK-05-02**: Implementar Controller/Service e Rota `GET /campeonatos` e `GET /campeonatos/{id}`.
  - *Requisitos:* RF-03, RF-10, CA-03, CA-08
- **TASK-05-03**: Implementar Controller/Service e Rotas `GET /campeonatos/{id}/times` e `GET /campeonatos/{id}/partidas`.
  - *Requisitos:* RF-03, RF-10, CA-03, CA-08
- **TASK-05-04**: Implementar Controller/Service e Rotas `GET /times` e `GET /times/{id}`.
  - *Requisitos:* RF-03, RF-10, CA-03, CA-08
- **TASK-05-05**: Implementar Controller/Service e Rotas `GET /partidas` e `GET /partidas/{id}`.
  - *Requisitos:* RF-03, RF-10, CA-03, CA-08

### Épico 06: Gestão de Favoritos e Idempotência
- **TASK-06-01**: Implementar Middleware de Idempotency Key (`Idempotency-Key`) para garantir tratamento de reenvios em operações de criação.
  - *Requisitos:* RNF-08
- **TASK-06-02**: Implementar Controller/Service e Rota `POST /favoritos` com validação de duplicidade por usuário.
  - *Requisitos:* RF-04, RF-07, RN-01, RN-02, RNF-08, CA-04, CA-05
- **TASK-06-03**: Implementar Controller/Service e Rota `GET /favoritos` retornando estritamente os favoritos do usuário autenticado.
  - *Requisitos:* RF-06, RN-03, CA-06
- **TASK-06-04**: Implementar Controller/Service e Rota `DELETE /favoritos/{id}` garantindo que o usuário só possa remover seus próprios favoritos.
  - *Requisitos:* RF-05, RN-03

### Épico 07: Módulo de Administração
- **TASK-07-01**: Implementar Controller/Service e Rotas Admin `GET /admin/usuarios` e `PATCH /admin/usuarios/{id}` protegidas por RBAC exclusivo para `admin`.
  - *Requisitos:* RF-08, RF-09, RN-04, RNF-02, CA-07

### Épico 08: Frontend (SPA)
- **TASK-08-01**: Implementar estrutura da SPA e cliente de API consumindo **exclusivamente** o Backend (BFF).
  - *Requisitos:* RF-11, RF-12
- **TASK-08-02**: Implementar telas de Cadastro, Login e persistência local do Token JWT.
  - *Requisitos:* RF-01, RF-02
- **TASK-08-03**: Implementar visões públicas de Campeonatos, Times e Partidas com suporte a filtros e paginação.
  - *Requisitos:* RF-03, RF-10
- **TASK-08-04**: Implementar painel do usuário para visualização e gerenciamento (adicionar/remover) de Favoritos.
  - *Requisitos:* RF-04, RF-05, RF-06
- **TASK-08-05**: Implementar Painel Administrativo visível e acessível apenas para usuários com papel `admin`.
  - *Requisitos:* RF-08, RF-09

### Épico 09: Testes de Integração, Qualidade e Validação Final
- **TASK-09-01**: Criar testes automatizados para fluxos de Autenticação e RBAC (401 vs 403).
  - *Requisitos:* RF-02, RF-08, RNF-01, RNF-02
- **TASK-09-02**: Criar testes automatizados de resiliência do `FootballDataClient` (Timeout, Retry, Circuit Breaker simulado).
  - *Requisitos:* RNF-03, RNF-04, RNF-05
- **TASK-09-03**: Criar testes automatizados para regras de Favorito (bloqueio de duplicados e controle de propriedade).
  - *Requisitos:* RF-06, RF-07, RN-02, RN-03
- **TASK-09-04**: Executar auditoria do contrato OpenAPI em relação a todos os endpoints e payloads implementados.
  - *Requisitos:* RF-13, CA-14

---

## 4. Dependências e Ordem de Execução

```
[Épico 01: Infra & Erros] ──▶ [Épico 02: Persistência JSON]
                                       │
                                       ▼
                            [Épico 03: Auth & RBAC]
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
[Épico 04: Resiliência External Client]                [Épico 06: Favoritos & Idempotência]
            │                                                     │
            ▼                                                     ▼
[Épico 05: BFF Mappers & Rotas Esportivas]             [Épico 07: Modulo Admin]
            │                                                     │
            └──────────────────────────┬──────────────────────────┘
                                       ▼
                            [Épico 08: Frontend SPA]
                                       │
                                       ▼
                            [Épico 09: Testes & QA]
```

---

## 5. Definition of Done (DoD)

Uma tarefa é considerada concluída se e somente se:
1. Respeita estritamente o contrato OpenAPI sem alterar campos ou status codes não documentados.
2. Contém validação de entrada de dados adequada.
3. Propaga o `X-Correlation-Id` e utiliza o formato de erro padronizado em falhas.
4. Não vaza informações sensíveis (segredos, senhas ou tokens) em respostas ou logs.
5. Possui suite de testes unitários ou de integração cobrindo os cenários principais e de exceção.

---

## 6. Matriz de Rastreabilidade (Requisito ➔ Tarefa)

| Requisito | Descrição Curta | Tarefas Relacionadas |
|---|---|---|
| **RF-01** | Cadastro de usuários | TASK-02-02, TASK-03-01, TASK-03-02, TASK-08-02 |
| **RF-02** | Login e emissão de JWT | TASK-03-03, TASK-08-02, TASK-09-01 |
| **RF-03** | Rotas RESTful esportivas | TASK-05-02, TASK-05-03, TASK-05-04, TASK-05-05, TASK-08-03 |
| **RF-04** | Favoritar time/campeonato | TASK-02-03, TASK-06-02, TASK-08-04 |
| **RF-05** | Remover favorito | TASK-06-04, TASK-08-04 |
| **RF-06** | Listar favoritos próprios | TASK-06-03, TASK-08-04, TASK-09-03 |
| **RF-07** | Impedir favorito duplicado | TASK-02-03, TASK-06-02, TASK-09-03 |
| **RF-08** | Sistema RBAC (user/admin) | TASK-02-02, TASK-03-05, TASK-07-01, TASK-08-05, TASK-09-01 |
| **RF-09** | Rota exclusiva admin | TASK-07-01, TASK-08-05 |
| **RF-10** | Paginação e filtros | TASK-05-02, TASK-05-03, TASK-05-04, TASK-05-05, TASK-08-03 |
| **RF-11** | Acesso externo via BFF apenas | TASK-04-01, TASK-08-01 |
| **RF-12** | Transformação de JSON externo | TASK-05-01, TASK-08-01 |
| **RF-13** | Contrato OpenAPI | TASK-09-04 |
| **RNF-01** | Autenticação via JWT Middleware | TASK-03-04, TASK-09-01 |
| **RNF-02** | RBAC em Middleware Centralizado | TASK-03-05, TASK-07-01, TASK-09-01 |
| **RNF-03** | Timeout com AbortController | TASK-04-02, TASK-09-02 |
| **RNF-04** | Retry com Backoff Exponencial | TASK-04-03, TASK-09-02 |
| **RNF-05** | Circuit Breaker | TASK-04-04, TASK-09-02 |
| **RNF-06** | Correlation ID | TASK-01-02, TASK-04-01 |
| **RNF-07** | Schema de Erro Padronizado | TASK-01-03 |
| **RNF-08** | Idempotency Key | TASK-06-01, TASK-06-02 |
| **RNF-09** | Separação de Dados | TASK-01-01, TASK-02-01, TASK-02-02, TASK-02-03, TASK-04-05 |

---

## 7. Riscos e Mitigações

1. **Exceder o limite de requisições da API da football-data.org (10 req/min no plano gratuito)**:
   - *Mitigação:* Implementar a TASK-04-05 (cache em memória com TTL curto) antes do desenvolvimento da interface no frontend.
2. **Exposição inadvertida de segredos do servidor no cliente**:
   - *Mitigação:* Isolar estritamente o cliente de API no backend (`FootballDataClient`) e validar no code review que o frontend consome apenas rotas relativas do backend.
3. **Incompatibilidade ou divergência entre o backend e o OpenAPI**:
   - *Mitigação:* Executar a auditoria automatizada/manual contida na TASK-09-04 antes da liberação final do projeto.