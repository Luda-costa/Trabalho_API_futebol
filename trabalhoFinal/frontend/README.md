# Frontend da Plataforma de Futebol

SPA em React com Vite que consome exclusivamente o backend BFF deste projeto.

## Como executar

Mantenha o backend executando na porta 3000. Em outro terminal:

```powershell
cd trabalhoFinal\frontend
npm.cmd install
npm.cmd run dev
```

Acesse `http://localhost:5173`. Durante o desenvolvimento, o Vite encaminha requisições de `/api` para `http://localhost:3000`.

## Funcionalidades

- consulta de campeonatos, times e partidas;
- filtros e paginação;
- cadastro e login;
- autenticação armazenada durante a sessão do navegador;
- criação e remoção de favoritos;
- painel administrativo para ativar ou desativar usuários;
- páginas protegidas conforme autenticação e papel do usuário;
- estados de carregamento, erro e lista vazia;
- layout responsivo.

## Scripts

- `npm.cmd run dev`: servidor de desenvolvimento;
- `npm.cmd run build`: compilação de produção;
- `npm.cmd test`: testes automatizados;
- `npm.cmd run preview`: visualização local da compilação.
