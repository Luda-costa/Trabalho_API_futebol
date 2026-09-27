# Backend da Plataforma de Futebol

API BFF local construída com Node.js, JavaScript e Express. Usuários e favoritos são persistidos em arquivos JSON; campeonatos, times e partidas vêm da football-data.org e são transformados antes da resposta.

## Execução

1. Copie as variáveis descritas em `../.env.example` para `../.env`.
2. Mantenha a chave da football-data.org em `API_KEY_FOOTBALL`.
3. Defina também um `JWT_SECRET` local.
4. Dentro de `backend`, execute `npm install` e `npm run dev`.

A API usa o prefixo `http://localhost:3000/api`, conforme o `openapi.yaml`.

## Swagger

Com o servidor em execução, a documentação interativa fica disponível em:

```text
http://localhost:3000/api/docs
```

O contrato OpenAPI bruto também pode ser consultado em:

```text
http://localhost:3000/api/openapi.yaml
```

Na interface Swagger, use o botão **Authorize** e informe o JWT retornado por `POST /sessoes` para testar as rotas protegidas.

## Administrador

O cadastro público sempre cria usuários com papel `user`. Para criar um administrador local:

```bash
npm run create-admin -- admin@email.com senha-segura "Administrador"
```

## Organização

- `controllers`: entrada e saída HTTP;
- `services`: regras de negócio;
- `repositories`: persistência JSON;
- `clients`: integração com a football-data.org;
- `mappers`: transformação BFF;
- `middlewares`: autenticação, RBAC, validação, idempotência, correlation ID e erros;
- `data`: arquivos JSON criados automaticamente em execução.

O armazenamento JSON pressupõe uma única instância local do processo Node.js.
