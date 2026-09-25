# Plataforma de Acompanhamento de Campeonatos de Futebol

Implementação acadêmica em SDD, organizada como monorepo simples:

- `backend/`: API BFF em Node.js + TypeScript + Express + Prisma/PostgreSQL.
- `frontend/`: SPA em React + Vite + TypeScript.
- `CONTRACT_GAPS.md`: pontos que dependem da conferência com o OpenAPI oficial.

## Backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## PostgreSQL por Docker

Na raiz:

```bash
docker compose up -d db
```

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

- `DATABASE_URL`
- `JWT_SECRET`
- `FOOTBALL_DATA_API_KEY`
- `FOOTBALL_DATA_BASE_URL`
- `PORT`
- `FOOTBALL_DATA_TIMEOUT_MS`
- `FOOTBALL_DATA_MAX_RETRIES`
- `CIRCUIT_FAILURE_THRESHOLD`
- `CIRCUIT_RESET_TIMEOUT_MS`
- `CACHE_TTL_MS`

## Observação SDD

O projeto foi montado a partir do backlog fornecido. Como o conteúdo do `openapi.yaml` oficial não estava anexado nesta etapa, revise `CONTRACT_GAPS.md` antes de considerar a implementação contratualmente final.
