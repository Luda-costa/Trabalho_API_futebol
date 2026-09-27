# plan.md — Plataforma de Acompanhamento de Campeonatos de Futebol

> Documento produzido pelo agente **Arquiteto de Software**, a partir do `spec.md` (PO) e da documentação pública da football-data.org (API v4). Acompanha este plano o arquivo `openapi.yaml`, que é o contrato formal e a fonte de verdade técnica exigida pela regra principal do projeto. Nenhum requisito de negócio foi alterado; pontos não definidos pelo PO (seção 10 do spec.md) foram tratados como **decisões técnicas assumidas**, explicitadas na seção 11 deste documento, e permanecem sujeitos à validação do PO.

---

## 1. Visão Geral

O sistema é uma aplicação web composta por:

- **Frontend** (SPA em React) — consome exclusivamente a API interna do backend. Nunca acessa a football-data.org diretamente e nunca recebe a chave de API externa.
- **Backend (BFF)** — API RESTful em Node.js com JavaScript e Express, responsável por autenticação/RBAC, persistência de dados internos (usuários e favoritos) e por toda a integração com a football-data.org, incluindo a transformação dos dados externos em schemas internos.
- **API externa (football-data.org, v4)** — fonte somente leitura de campeonatos, times e partidas. Acessada apenas pelo backend, com timeout, retry, circuit breaker e Correlation ID.
- **Arquivos JSON locais** — persistem apenas os dados internos de usuários e favoritos, por se tratar de um projeto local, pequeno e voltado a estudo. Dados esportivos não são persistidos como fonte de verdade (ver seção 7.3), apenas eventualmente cacheados em memória.

Princípio arquitetural central: **separação estrita entre dados internos e dados externos** (RNF-09), com o backend atuando como **Backend for Frontend (BFF)**: nenhuma resposta bruta da football-data.org chega ao cliente (RF-11, RF-12).

## 2. Arquitetura Proposta

Arquitetura em camadas (layered architecture) dentro de um backend único (monólito modular), adequada ao escopo acadêmico e suficiente para separar responsabilidades sem introduzir complexidade de microsserviços não justificada pelo projeto.

```
┌─────────────────────────────────────────────────────────────────┐
│                       Frontend (React SPA)                       │
└───────────────────────────────┬──────────────────────────────────┘
                                 │ HTTPS + JWT (Authorization: Bearer)
┌───────────────────────────────▼──────────────────────────────────┐
│                         Backend (BFF) — API                      │
│                                                                   │
│  Middlewares transversais:                                       │
│   Correlation-Id → Auth (JWT) → RBAC → Validação → Erros         │
│                                                                   │
│  ┌───────────────┐   ┌───────────────┐   ┌────────────────────┐  │
│  │ Routes/        │──▶│ Services      │──▶│ Repositories JSON   │ │
│  │ Controllers    │   │ (regra de     │   │ (dados internos:    │ │
│  │ (usuarios,     │   │  negócio)     │   │  usuários,          │ │
│  │  sessoes,      │   │               │   │  favoritos)         │ │
│  │  favoritos,    │   │               │   └─────────┬──────────┘ │
│  │  campeonatos,  │   │               │              │            │
│  │  times,        │   │               │      ┌───────▼───────┐    │
│  │  partidas,     │   │               │      │ Arquivos JSON  │    │
│  │  admin)        │   └───────┬───────┘      │ dados internos │    │
│  └───────────────┘           │               └────────────────┘   │
│                                │                                   │
│                        ┌───────▼────────────┐                      │
│                        │ Football-Data       │                      │
│                        │ Client (isolado)    │                      │
│                        │ - Timeout/Abort     │                      │
│                        │ - Retry+Backoff     │                      │
│                        │ - Circuit Breaker   │                      │
│                        │ - Mapper (DTO→BFF)  │                      │
│                        └───────┬────────────┘                      │
└────────────────────────────────┼──────────────────────────────────┘
                                  │ HTTPS + X-Auth-Token (server-side only)
                        ┌─────────▼──────────┐
                        │  football-data.org  │
                        │       API v4        │
                        └─────────────────────┘
```

Decisões arquiteturais chave:
- **Sem Saga**: não há transação distribuída nem coreografia de eventos entre serviços — descartado corretamente pelo PO/Arquiteto por falta de fluxo real que justifique.
- **Sem Client Credentials/OAuth entre serviços**: a autenticação de usuário é própria (JWT emitido pelo backend); a chave da football-data.org é uma credencial simples de servidor (`X-Auth-Token`), não um fluxo OAuth — não há justificativa para Client Credentials aqui.
- **Cliente externo isolado**: toda a lógica de acesso à football-data.org vive em um único módulo (`football-data-client`), nunca chamado diretamente por controllers.

## 3. Componentes e Responsabilidades

| Componente | Responsabilidade |
|---|---|
| **Routes/Controllers** | Mapear rotas HTTP RESTful, validar formato de entrada (schema), delegar a services, nunca conter regra de negócio. |
| **Middleware de Autenticação (JWT)** | Validar token, popular contexto da requisição com `userId` e `role`. Centralizado, não duplicado por rota (RNF-01). |
| **Middleware de Autorização (RBAC)** | Verificar `role` exigido pela rota (`user`/`admin`) de forma declarativa e centralizada (RNF-02). |
| **Middleware de Correlation ID** | Ler `X-Correlation-Id` da requisição ou gerar um (UUID v4) se ausente; anexar ao contexto, aos logs e ao header de resposta (RNF-06). |
| **Middleware de Erros** | Capturar exceções e traduzi-las para o formato de erro padronizado (RNF-07), incluindo `correlationId`. |
| **Services (Usuários, Sessões, Favoritos, Esportivo)** | Regras de negócio: hashing de senha, emissão de JWT, checagem de duplicidade de favorito (RN-02), checagem de propriedade (RN-03), orquestração de chamadas ao cliente externo + mapeamento. |
| **Repositories (Usuários, Favoritos)** | Leitura e escrita dos arquivos JSON de dados internos por meio de `node:fs/promises`. Não conhecem HTTP nem football-data.org e centralizam o acesso aos arquivos. |
| **Football-Data Client** | Único ponto de chamada à API externa. Implementa timeout (`AbortController`), retry com backoff exponencial, circuit breaker, e adiciona o `X-Auth-Token` lido de variável de ambiente. |
| **Mapper/Transformer (BFF)** | Converte o payload bruto da football-data.org nos schemas internos (`Campeonato`, `Time`, `Partida`) definidos no OpenAPI. Único lugar onde o formato externo é conhecido. |
| **Armazenamento JSON** | Persistência local de `usuarios` e `favoritos` em arquivos separados. A escrita é serializada no processo e feita por arquivo temporário seguido de substituição, reduzindo o risco de corrupção. Dados esportivos não são persistidos localmente (ver 7.3). |

## 4. Contrato OpenAPI

O contrato completo está em `openapi.yaml` (OpenAPI 3.0), que deve ser revisado e aprovado antes de qualquer implementação, conforme regra principal do projeto. Resumo dos recursos:

| Método | Rota | Autenticação | Papel | Descrição |
|---|---|---|---|---|
| POST | `/usuarios` | Não | — | Cadastro de usuário (RF-01) |
| POST | `/sessoes` | Não | — | Login; retorna JWT (RF-02) |
| GET | `/campeonatos` | Não | — | Lista campeonatos (paginação/filtro) |
| GET | `/campeonatos/{id}` | Não | — | Detalhe de um campeonato |
| GET | `/campeonatos/{id}/partidas` | Não | — | Partidas de um campeonato (filtros) |
| GET | `/campeonatos/{id}/times` | Não | — | Times de um campeonato |
| GET | `/times` | Não | — | Lista times (paginação/filtro) |
| GET | `/times/{id}` | Não | — | Detalhe de um time |
| GET | `/partidas` | Não | — | Lista partidas (filtros de data/competição/time) |
| GET | `/partidas/{id}` | Não | — | Detalhe de uma partida |
| GET | `/favoritos` | Sim | user | Lista os favoritos do usuário autenticado (RF-06) |
| POST | `/favoritos` | Sim | user | Cria favorito (time ou campeonato) (RF-04, RF-07) |
| DELETE | `/favoritos/{id}` | Sim | user | Remove favorito próprio (RF-05) |
| GET | `/admin/usuarios` | Sim | **admin** | Rota exclusiva de administração (RF-09) — ver decisão 11.5 |
| PATCH | `/admin/usuarios/{id}` | Sim | **admin** | Ativa/desativa (bane) um usuário — operação exclusiva de admin |

Convenções aplicadas: recursos no plural, sem verbos (RF-03); paginação via `page`/`pageSize` (ou `limit`/`offset`) e filtros via query string (RF-10, RNF conforme spec); todas as respostas de erro seguem o schema `Error` (seção 9); headers documentados: `Authorization`, `X-Correlation-Id`, `Idempotency-Key` (apenas em `POST /favoritos`).

## 5. Modelo de Dados

### 5.1 Dados internos (persistidos em JSON)

**`data/usuarios.json`**
| Campo | Tipo | Observação |
|---|---|---|
| id | UUID | Gerado pelo backend. |
| nome | string | |
| email | string | Único, comparado de forma normalizada. |
| senhaHash | string | Nunca exposto na API. |
| role | enum(`user`,`admin`) | RBAC |
| ativo | boolean | Controlado pela rota administrativa. |
| criadoEm | timestamp | ISO 8601. |

**`data/favoritos.json`**
| Campo | Tipo | Observação |
|---|---|---|
| id | UUID | Gerado pelo backend. |
| usuarioId | UUID | Referência lógica a um usuário existente. |
| tipo | enum(`TIME`,`CAMPEONATO`) | |
| itemExternoId | string | ID do recurso na football-data.org. |
| criadoEm | timestamp | ISO 8601. |

Regra de unicidade: antes de inserir, o repository deve rejeitar outra entrada com a mesma combinação `usuarioId + tipo + itemExternoId`. Essa validação implementa RN-02/RF-07 sem depender de banco relacional.

Os arquivos contêm arrays JSON e são criados vazios na inicialização caso não existam. Como o sistema é local e executado em uma única instância Node.js, não há suporte a múltiplos processos escrevendo simultaneamente. Dentro do processo, as escritas devem ser enfileiradas e realizadas de forma atômica por arquivo temporário seguido de substituição.

### 5.2 Dados externos (não persistidos como fonte de verdade)

`Campeonato`, `Time` e `Partida` são schemas de **resposta** do BFF, montados a partir da football-data.org em tempo de requisição (ou de um cache efêmero — ver 7.3), e **não** são gravados nos arquivos JSON. Isso implementa RNF-09 (separação lógica) sem duplicar a fonte de dados esportivos.

## 6. Segurança JWT/RBAC

- Login (`POST /sessoes`) emite um JWT assinado (HS256 ou RS256) contendo `sub` (id do usuário) e `role`, com expiração curta (ex.: 1h) — sem refresh token no MVP, por não haver requisito explícito.
- Toda rota protegida passa por um middleware único de autenticação (RNF-01); nenhuma verificação de token é duplicada em controllers.
- RBAC é resolvido por um middleware/decorator declarativo (`requireRole('admin')`) aplicado na definição da rota, nunca dentro da lógica de negócio (RNF-02).
- Senhas armazenadas com hash + salt (ex.: bcrypt/argon2), nunca em texto plano.
- A chave de API da football-data.org (`API_KEY_FOOTBALL`) e o segredo do JWT (`JWT_SECRET`) ficam **apenas** em variáveis de ambiente do backend; o frontend nunca as recebe.

## 7. Integração Externa e BFF

### 7.1 Endpoints externos utilizados (football-data.org v4)

Confirmados na documentação pública (`https://docs.football-data.org/general/v4/`), nenhum endpoint foi inventado:

| Uso interno | Endpoint externo | Observação |
|---|---|---|
| `GET /campeonatos` | `GET /v4/competitions` | filtro `areas` disponível |
| `GET /campeonatos/{id}` | `GET /v4/competitions/{id}` | aceita id numérico ou código (ex.: `PL`) |
| `GET /campeonatos/{id}/times` | `GET /v4/competitions/{id}/teams` | |
| `GET /campeonatos/{id}/partidas` | `GET /v4/competitions/{id}/matches` | filtros `dateFrom`, `dateTo`, `status`, `matchday`, `stage`, `group`, `season` |
| `GET /times` | `GET /v4/teams` | filtros `limit`, `offset` |
| `GET /times/{id}` | `GET /v4/teams/{id}` | |
| `GET /partidas` | `GET /v4/matches` | consulta cross-competição |
| `GET /partidas/{id}` | `GET /v4/matches/{id}` | |

Autenticação com a football-data.org via header `X-Auth-Token`, enviado apenas pelo `Football-Data Client` do backend.

### 7.2 Transformação BFF

O cliente externo retorna o payload bruto para um **Mapper**, que produz os schemas internos definidos no OpenAPI (`Campeonato`, `Time`, `Partida`), removendo/renomeando campos irrelevantes ou instáveis da API externa. O controller nunca vê o payload bruto — apenas o schema já transformado. Isso satisfaz RF-11/RF-12 e CA-09.

### 7.3 Cache (decisão associada à OA-07)

Dado o rate limit do plano gratuito da football-data.org (**10 requisições/minuto**, conforme documentação pública), recomenda-se um **cache efêmero em memória (TTL curto, ex.: 60s para listagens, 5–10 min para dados de competição pouco voláteis)** no Football-Data Client, para reduzir chamadas repetidas e mitigar o risco de estourar o limite. Isso é uma decisão técnica de resiliência, não uma fonte de verdade persistente — tratada em detalhe na seção 11.

## 8. Resiliência

- **Timeout**: cada chamada ao Football-Data Client usa `AbortController` com timeout configurável (ex.: 5s), conforme RNF-03.
- **Retry com backoff exponencial**: aplicado **apenas** a timeout e erros 5xx elegíveis (nunca a 4xx); ex.: 3 tentativas, atraso base 300ms, multiplicador 2x, com jitter (RNF-04, restrição do spec).
- **Circuit Breaker**: por dependência externa (football-data.org), com os três estados exigidos:
  - `CLOSED`: opera normalmente, contando falhas consecutivas.
  - `OPEN`: acima de um limiar de falhas (ex.: 5 falhas consecutivas), todas as chamadas falham rápido (fail-fast) sem tentar a rede, por uma janela de tempo (ex.: 30s).
  - `HALF_OPEN`: após a janela, permite uma chamada de teste; sucesso volta a `CLOSED`, falha retorna a `OPEN`.
- **Correlation ID**: gerado (UUID v4) se não vier em `X-Correlation-Id`; propagado nos logs internos e reenviado como header à football-data.org e na resposta ao cliente (RNF-06, CA-12).
- **Idempotency Key** (RNF-08 / OA-04): aplicável apenas em `POST /favoritos`, a única operação de criação identificada no spec como sensível a duplicidade por reenvio (o cadastro de usuário já é protegido pela unicidade de e-mail, e RN-02 já impede duplicidade lógica; a Idempotency Key evita que um reenvio de rede crie ambiguidade de resposta, não duplicidade de dado). Nenhuma outra operação de criação foi identificada como necessitando desse padrão — a confirmar com o PO.

## 9. Erros e Observabilidade

Formato padronizado de erro (RNF-07), documentado no OpenAPI como schema `Error`:

```json
{
  "error": {
    "code": "FAVORITO_DUPLICADO",
    "message": "Este item já está nos seus favoritos.",
    "correlationId": "b1f0b6b2-..."
  }
}
```

Códigos de status HTTP recomendados: `400` (validação), `401` (não autenticado), `403` (RBAC negado), `404` (recurso inexistente), `409` (favorito duplicado), `502`/`503` (falha da football-data.org, incl. circuit breaker `OPEN`), `500` (erro interno).

Observabilidade: logs estruturados (JSON) incluindo `correlationId`, rota, status, latência e, para chamadas externas, o estado do circuit breaker no momento da chamada.

## 10. Tecnologias e Riscos

**Stack definida** (compatível com o escopo local e acadêmico):
- Backend: Node.js com JavaScript, ES Modules e Express.
- Persistência: arquivos JSON separados para `usuarios` e `favoritos`, acessados exclusivamente pelos repositories com `node:fs/promises`.
- Autenticação: `jsonwebtoken` (ou equivalente) para JWT.
- Validação: biblioteca de schemas compatível com JavaScript, como Zod.
- Testes: Vitest ou Jest com Supertest para testes HTTP e de integração.
- Documentação: OpenAPI 3.0 (`openapi.yaml`), servido via Swagger UI.
- Frontend: React com Vite, consumindo apenas a API interna por `fetch`.

**Riscos**:
| Risco | Impacto | Mitigação |
|---|---|---|
| Rate limit da football-data.org (10 req/min no plano free) | Erros 429/indisponibilidade sob uso concorrente | Cache efêmero (7.3), circuit breaker, backoff |
| Dependência de disponibilidade externa | Indisponibilidade de dados esportivos | Circuit breaker fail-fast + mensagens de erro claras ao frontend |
| Corrupção ou disputa de escrita nos arquivos JSON | Perda ou inconsistência de usuários/favoritos | Escritas serializadas no processo e substituição atômica por arquivo temporário; uso limitado a uma instância local |
| Granularidade de dados de partida variar por plano (OA-02) | Campos do schema `Partida` podem precisar de ajuste | Mapper isola o formato externo; ajuste não deve vazar para o contrato interno sem nova revisão de OpenAPI |
| Vazamento acidental da chave externa | Risco de segurança/custo | Chave nunca sai do backend; revisão de código deve checar isso |
| Escopo de "rota admin" não fechado pelo PO (OA-05) | Retrabalho se PO decidir outra operação | Rota admin isolada em um controller próprio, fácil de trocar sem afetar o restante do contrato |

## 11. Decisões Técnicas Assumidas (a validar com o PO)

Estas são posições arquiteturais tomadas para poder desenhar um contrato concreto — nenhuma altera requisito, regra de negócio ou critério de aceitação do `spec.md`; todas devem ser confirmadas ou substituídas pelo PO.

1. **OA-04 (Idempotency Key)**: aplicada apenas em `POST /favoritos` (ver seção 8).
2. **OA-05 (rota admin)**: proposta como `GET /admin/usuarios` (listar usuários) e `PATCH /admin/usuarios/{id}` (ativar/desativar usuário). Escolhida por ser a operação administrativa mais comum e de baixo risco para um MVP acadêmico; o PO pode substituir por outra (ex.: remover favoritos de terceiros) sem impacto no restante da arquitetura.
3. **OA-06 (rate limit)**: documentado como 10 requisições/minuto no plano gratuito da football-data.org (fonte pública), refletido como restrição técnica na seção 7.3 e 10.
4. **OA-07 (cache)**: recomendado cache efêmero em memória com TTL curto no Football-Data Client. Não introduz uma "fonte de verdade" local para dados esportivos, preservando RNF-09.
5. **OA-01 e OA-02** (campos de cadastro e granularidade de partida) permanecem em aberto e devem ser fechados no próprio contrato OpenAPI (`openapi.yaml`) antes da implementação, onde os schemas `Usuario` (entrada) e `Partida` já trazem uma proposta mínima de campos para revisão do PO.
6. **Persistência local**: por decisão de escopo, usuários e favoritos serão armazenados em arquivos JSON, sem PostgreSQL, ORM ou migrations. Essa escolha é adequada apenas à execução local em uma única instância e mantém a separação lógica exigida pelo RNF-09.
7. **Stack de implementação**: o backend usará somente JavaScript em Node.js com Express; o frontend será desenvolvido em React com Vite.

---
*Este `plan.md` não implementa código, não define backlog detalhado e não inventou nenhum endpoint externo além dos documentados publicamente pela football-data.org v4.*
