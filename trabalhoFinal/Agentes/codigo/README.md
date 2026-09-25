# Plataforma de Acompanhamento de Campeonatos de Futebol

Implementação acadêmica em SDD, organizada como monorepo simples:

- `backend/`: API BFF em Node.js + TypeScript + Express.
- `backend/data/`: persistência local simples em arquivos JSON.
- `frontend/`: SPA em React + Vite + TypeScript.
- `CONTRACT_GAPS.md`: pontos que dependem da conferência com o OpenAPI oficial.

## Persistência em JSON

O projeto **não usa PostgreSQL, Prisma nem Docker**. Os dados internos são salvos em:

- `backend/data/usuarios.json`
- `backend/data/favoritos.json`

Os arquivos começam como `[]` e são atualizados automaticamente pela API. As senhas nunca são gravadas em texto puro: o arquivo de usuários guarda apenas `senhaHash`, gerado com bcrypt.

Essa solução é adequada para o projeto acadêmico e para execução em uma única instância do backend. Não é indicada para múltiplas instâncias concorrentes ou grande volume de dados.

## Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Não é necessário subir banco de dados ou executar migrations.

## Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Por padrão, a SPA usa `http://localhost:3000` como backend.

## Variáveis importantes

Backend:

- `DATA_DIR`: diretório dos JSONs; padrão `data`.
- `JWT_SECRET`
- `FOOTBALL_DATA_API_KEY`
- `FOOTBALL_DATA_BASE_URL`
- `PORT`
- `FOOTBALL_DATA_TIMEOUT_MS`
- `FOOTBALL_DATA_MAX_RETRIES`
- `CIRCUIT_FAILURE_THRESHOLD`
- `CIRCUIT_RESET_TIMEOUT_MS`
- `CACHE_TTL_MS`

## Usuário administrador

O cadastro público cria usuários com `role: "user"`. Como não foi adicionada nenhuma rota extra fora do contrato para promover o primeiro administrador, durante o desenvolvimento você pode parar a API e alterar manualmente o campo `role` de um usuário em `backend/data/usuarios.json` para `"admin"`.

Exemplo do trecho do usuário:

```json
{
  "id": "...",
  "nome": "Administrador",
  "email": "admin@exemplo.com",
  "senhaHash": "...",
  "role": "admin",
  "criadoEm": "2026-09-25T18:00:00.000Z"
}
```

## Observação SDD

O projeto foi montado a partir do backlog fornecido e posteriormente adaptado, por decisão da equipe, para persistência simples em JSON. Como o conteúdo do `openapi.yaml` oficial não estava anexado nesta etapa, revise `CONTRACT_GAPS.md` antes de considerar a implementação contratualmente final.
