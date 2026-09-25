# spec.md — Plataforma de Acompanhamento de Campeonatos de Futebol

## 1. Contexto e Objetivo

Este documento é a especificação funcional do projeto acadêmico em SDD (Specification-Driven Development) para uma **Plataforma de Acompanhamento de Campeonatos de Futebol**.

O sistema permitirá que usuários se cadastrem, façam login, consultem campeonatos, times e partidas, e marquem times/campeonatos como favoritos. Os dados esportivos (campeonatos, times, partidas) são obtidos da API externa **football-data.org**, sendo sempre acessados pelo backend (padrão BFF — Backend for Frontend) e transformados antes de chegar ao frontend — nunca o JSON externo bruto é repassado ao cliente.

Conforme a regra principal do projeto, **nenhum código será escrito antes da conclusão dos requisitos e do contrato OpenAPI/Swagger**. Este `spec.md` é o artefato que precede e fundamenta esse contrato.

## 2. Atores

| Ator | Descrição |
|---|---|
| **Visitante** | Usuário não autenticado. Pode consultar campeonatos, times e partidas, mas não pode favoritar. |
| **Usuário comum** | Usuário autenticado (via JWT). Pode consultar dados esportivos e gerenciar apenas seus próprios favoritos. |
| **Administrador** | Usuário autenticado com papel `admin` (RBAC). Possui acesso a pelo menos uma operação exclusiva de administração. |
| **Sistema externo (football-data.org)** | Fonte de dados esportivos consumida pelo backend. Não é um ator interativo do sistema, mas uma dependência externa. |

## 3. Escopo e Fora de Escopo

### Dentro do escopo
- Cadastro e login de usuários.
- Autenticação via JWT e autorização via RBAC (usuário comum / admin).
- Consulta de campeonatos, times e partidas (dados vindos da football-data.org, via backend).
- Favoritar/desfavoritar times e campeonatos.
- Listagem dos favoritos do próprio usuário.
- Paginação e/ou filtros nas rotas de listagem.
- Ao menos uma rota exclusiva de administrador.
- Contrato OpenAPI/Swagger documentando rotas, esquemas e erros.
- Tratamento de timeout, retry com backoff exponencial, e (como padrões avançados prioritários) Circuit Breaker e Correlation ID na integração com a API externa.

### Fora de escopo
- Edição de dados esportivos (campeonatos, times, partidas) pelo sistema — esses dados são somente leitura, provenientes da football-data.org.
- Comentários, chat, redes sociais ou qualquer interação entre usuários.
- Notificações (push, e-mail, etc.).
- Pagamentos ou qualquer funcionalidade comercial.
- Aplicativos mobile nativos (o escopo é web/API).
- Definição de estrutura de pastas, bibliotecas específicas ou tarefas de desenvolvimento (fora do papel do PO).

## 4. Histórias de Usuário

| ID | História |
|---|---|
| **US-01** | Como visitante, quero consultar campeonatos, times e partidas sem precisar de login, para conhecer o sistema antes de me cadastrar. |
| **US-02** | Como visitante, quero me cadastrar informando meus dados básicos, para poder acessar funcionalidades exclusivas de usuário autenticado. |
| **US-03** | Como usuário cadastrado, quero fazer login e receber um token JWT, para acessar recursos protegidos da plataforma. |
| **US-04** | Como usuário comum, quero favoritar um time ou campeonato, para acompanhá-lo com mais facilidade. |
| **US-05** | Como usuário comum, quero remover um favorito, para manter minha lista atualizada. |
| **US-06** | Como usuário comum, quero listar meus favoritos, para visualizar rapidamente o que acompanho. |
| **US-07** | Como usuário comum, quero que o sistema impeça favoritos duplicados, para não ter itens repetidos na minha lista. |
| **US-08** | Como usuário comum, quero ter certeza de que só posso ver e gerenciar meus próprios favoritos, e não os de outros usuários. |
| **US-09** | Como administrador, quero executar uma operação exclusiva de administração (ex.: gerenciar/remover usuários ou moderar dados internos), para manter a integridade da plataforma. |
| **US-10** | Como usuário (visitante ou comum), quero paginar ou filtrar listas grandes de campeonatos/times/partidas, para navegar com mais eficiência. |
| **US-11** | Como mantenedor do sistema, quero que erros da API externa (timeout, 5xx temporário) sejam tratados com retry e backoff, para aumentar a resiliência da integração. |
| **US-12** | Como mantenedor do sistema, quero que respostas de erro sejam padronizadas e documentadas no contrato, para facilitar o consumo previsível da API pelo frontend. |

## 5. Requisitos

### 5.1 Requisitos Funcionais (RF)

| ID | Requisito |
|---|---|
| **RF-01** | O sistema deve permitir cadastro de novos usuários. |
| **RF-02** | O sistema deve permitir login de usuários cadastrados, retornando um JWT válido. |
| **RF-03** | O sistema deve expor rotas RESTful para consulta de campeonatos, times e partidas, com recursos nomeados no plural e sem verbos na URI (ex.: `GET /campeonatos`, não `GET /getCampeonatos`). |
| **RF-04** | O sistema deve permitir que um usuário autenticado favorite um time ou um campeonato. |
| **RF-05** | O sistema deve permitir que um usuário autenticado remova um favorito próprio. |
| **RF-06** | O sistema deve permitir que um usuário autenticado liste apenas seus próprios favoritos. |
| **RF-07** | O sistema não deve permitir a criação de um favorito duplicado (mesmo tipo + mesmo item) para o mesmo usuário. |
| **RF-08** | O sistema deve implementar RBAC com pelo menos dois papéis: usuário comum e admin. |
| **RF-09** | O sistema deve expor ao menos uma rota exclusiva para o papel admin. |
| **RF-10** | O sistema deve suportar paginação e/ou filtros via query parameters nas rotas de listagem (campeonatos, times, partidas e, quando aplicável, favoritos). |
| **RF-11** | O sistema deve buscar dados esportivos (campeonatos, times, partidas) na football-data.org exclusivamente pelo backend (BFF), nunca diretamente pelo frontend. |
| **RF-12** | O sistema deve transformar o JSON retornado pela football-data.org antes de expô-lo ao frontend, nunca retornando a resposta externa bruta. |
| **RF-13** | O sistema deve documentar todas as rotas, esquemas de request/response e erros em um contrato OpenAPI/Swagger, produzido antes da implementação. |

### 5.2 Requisitos Não Funcionais (RNF)

| ID | Requisito |
|---|---|
| **RNF-01** | Toda rota protegida deve exigir autenticação via JWT, validada por um middleware de autenticação. |
| **RNF-02** | O controle de acesso por papel (RBAC) deve ser aplicado via middleware/autorização, de forma centralizada e não duplicada em cada rota. |
| **RNF-03** | Toda chamada do backend à football-data.org deve ter timeout configurado, implementado com `AbortController`. |
| **RNF-04** | Em caso de timeout ou erro 5xx temporário na chamada à football-data.org, o backend deve aplicar retry com exponential backoff. |
| **RNF-05** | O backend deve implementar o padrão Circuit Breaker para a integração com a football-data.org, como padrão avançado prioritário. |
| **RNF-06** | Todas as requisições devem propagar um Correlation ID (gerado ou recebido), como padrão avançado prioritário, para fins de rastreabilidade entre chamadas internas e externas. |
| **RNF-07** | Erros da API devem seguir um formato padronizado (ex.: código, mensagem, correlation id) e esse formato deve estar documentado no contrato OpenAPI. |
| **RNF-08** | Caso exista alguma operação de criação sensível à duplicidade por reenvio de requisição, essa operação deve suportar Idempotency Key. *(Ver questão em aberto OA-04 sobre qual(is) operação(ões) se enquadra(m).)* |
| **RNF-09** | Dados internos (usuários, favoritos) e dados externos (campeonatos, times, partidas) devem ser modelados e persistidos de forma logicamente separada. |

## 6. Regras de Negócio (RN)

| ID | Regra |
|---|---|
| **RN-01** | Usuários podem favoritar times e campeonatos. |
| **RN-02** | Um mesmo favorito não pode ser duplicado para o mesmo usuário (mesma combinação usuário + tipo de item + item). |
| **RN-03** | Usuários comuns só podem visualizar, criar e remover seus próprios favoritos — nunca os de outro usuário. |
| **RN-04** | Deve existir ao menos uma operação exclusiva de administrador, não acessível a usuários comuns. |

## 7. Critérios de Aceitação (CA)

| ID | Relacionado a | Critério |
|---|---|---|
| **CA-01** | RF-01 | Dado um cadastro com dados válidos, quando enviado, então o usuário é criado e uma resposta de sucesso é retornada. |
| **CA-02** | RF-02 | Dado um login com credenciais válidas, quando enviado, então um JWT válido é retornado; com credenciais inválidas, um erro padronizado de autenticação é retornado. |
| **CA-03** | RF-03 | Dada uma requisição a uma rota de consulta (campeonatos/times/partidas), quando feita sem autenticação, então os dados são retornados normalmente (rotas públicas de leitura). |
| **CA-04** | RF-04, RN-01 | Dado um usuário autenticado, quando ele favorita um time ou campeonato válido, então o favorito é persistido e associado a ele. |
| **CA-05** | RF-07, RN-02 | Dado um usuário que já favoritou um item, quando ele tenta favoritar o mesmo item novamente, então o sistema recusa a operação com um erro padronizado (sem duplicar o registro). |
| **CA-06** | RF-06, RN-03 | Dado um usuário autenticado, quando ele lista seus favoritos, então apenas os favoritos dele são retornados, nunca os de outros usuários. |
| **CA-07** | RF-09, RN-04 | Dada uma tentativa de acesso a uma rota admin por um usuário comum, então o acesso é negado (403); dado um acesso por um usuário admin, então a operação é executada. |
| **CA-08** | RF-10 | Dada uma listagem com muitos itens, quando parâmetros de paginação/filtro são informados na query string, então o resultado retornado respeita esses parâmetros. |
| **CA-09** | RF-11, RF-12 | Dada uma consulta de dado esportivo, quando o backend consulta a football-data.org, então o frontend nunca recebe o JSON externo no formato original, apenas a versão transformada pelo BFF. |
| **CA-10** | RNF-03, RNF-04 | Dado um cenário de timeout ou erro 5xx da football-data.org, quando isso ocorre, então o backend aborta a chamada via `AbortController` e tenta novamente com backoff exponencial, respeitando um número máximo de tentativas. |
| **CA-11** | RNF-05 | Dado um número de falhas consecutivas acima de um limiar na integração externa, quando esse limiar é atingido, então o Circuit Breaker abre e novas chamadas passam a falhar rapidamente (fail-fast) até a recuperação. |
| **CA-12** | RNF-06 | Dada qualquer requisição ao sistema, então um Correlation ID está presente na resposta (e nos logs), seja reaproveitado do cliente ou gerado pelo backend. |
| **CA-13** | RNF-07 | Dado qualquer erro retornado pela API, então ele segue o formato padronizado definido no contrato OpenAPI. |
| **CA-14** | RF-13 | Dado o contrato OpenAPI, então ele existe e está completo antes do início da implementação de código. |

## 8. Restrições

- O contrato OpenAPI/Swagger deve ser definido e aprovado antes de qualquer implementação de código (regra principal do projeto).
- Rotas devem seguir convenções RESTful: recursos no plural, sem verbos na URI.
- Toda autenticação deve ser feita via JWT; toda autorização por papel, via RBAC.
- O sistema não deve expor diretamente o JSON bruto retornado pela football-data.org.
- Chamadas externas devem ter timeout (`AbortController`) e retry com backoff exponencial apenas para timeout e erros 5xx temporários (não para erros 4xx).
- Circuit Breaker e Correlation ID são padrões avançados de prioridade alta e devem constar no contrato/documentação.
- Idempotency Key só se aplica caso exista de fato uma operação de criação sensível à duplicidade (a ser confirmado — ver OA-04).
- Não há suposições sobre capacidades da football-data.org além do que está documentado publicamente por ela; qualquer capacidade não confirmada deve ser registrada como pergunta em aberto, não assumida.
- Este documento não define estrutura de pastas, bibliotecas, nem tarefas de desenvolvimento — isso está fora do papel do PO.

## 9. Matriz de Rastreabilidade

| História (US) | Requisitos (RF/RNF) | Regra de Negócio (RN) | Critério de Aceitação (CA) |
|---|---|---|---|
| US-01 | RF-03 | — | CA-03 |
| US-02 | RF-01 | — | CA-01 |
| US-03 | RF-02, RNF-01 | — | CA-02 |
| US-04 | RF-04 | RN-01 | CA-04 |
| US-05 | RF-05 | RN-01 | — |
| US-06 | RF-06 | RN-03 | CA-06 |
| US-07 | RF-07 | RN-02 | CA-05 |
| US-08 | RF-06, RNF-02 | RN-03 | CA-06 |
| US-09 | RF-08, RF-09, RNF-02 | RN-04 | CA-07 |
| US-10 | RF-10 | — | CA-08 |
| US-11 | RNF-03, RNF-04, RNF-05 | — | CA-10, CA-11 |
| US-12 | RNF-06, RNF-07 | — | CA-12, CA-13 |
| — | RF-11, RF-12 | — | CA-09 |
| — | RF-13 | — | CA-14 |

## 10. Perguntas em Aberto (OA)

| ID | Pergunta |
|---|---|
| **OA-01** | Quais campos exatos são obrigatórios no cadastro de usuário (nome, e-mail, senha, outros)? A disciplina/proposta não especifica. |
| **OA-02** | Qual é a granularidade dos dados de "partida" a serem expostos (apenas placar e data, ou também estatísticas detalhadas)? Depende do que a football-data.org disponibiliza no plano utilizado. |
| **OA-03** | Quais operações, além de favoritar, exigem paginação obrigatória vs. opcional? |
| **OA-04** | Existe alguma operação de criação sensível à duplicidade por reenvio de requisição (além da criação de favorito, que já é tratada por RN-02) que justifique o uso de Idempotency Key? Se sim, qual? |
| **OA-05** | Qual operação específica será a rota exclusiva de administrador (ex.: gerenciar usuários, remover favoritos de terceiros, forçar atualização de cache de dados externos)? |
| **OA-06** | Há um limite de requisições (rate limit) do plano gratuito da football-data.org que deva ser refletido como restrição técnica no contrato? |
| **OA-07** | O sistema deve armazenar cache local dos dados externos (campeonatos/times/partidas), ou sempre consultar a football-data.org em tempo real? Isso não foi definido na proposta original. |

---
*Documento produzido pelo agente PO. Nenhuma regra de negócio foi inventada além do que consta na proposta do projeto; itens não especificados foram registrados na seção 10 (Perguntas em Aberto).*
