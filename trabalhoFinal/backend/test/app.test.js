import assert from 'node:assert/strict';
import test from 'node:test';

process.env.JWT_SECRET = 'segredo-de-teste-com-tamanho-suficiente';
const { createApp } = await import('../src/app.js');

class MemoryUsers {
  constructor() { this.items = []; }
  async findByEmail(email) { return this.items.find((item) => item.email === email) ?? null; }
  async findById(id) { return this.items.find((item) => item.id === id) ?? null; }
  async create(user) {
    if (await this.findByEmail(user.email)) return null;
    this.items.push(user);
    return user;
  }
  async list({ page, pageSize }) {
    const start = (page - 1) * pageSize;
    return { items: this.items.slice(start, start + pageSize), total: this.items.length };
  }
  async updateActive() { return null; }
}

class MemoryFavorites {
  async listByUser() { return { items: [], total: 0 }; }
}

const unusedFootballClient = { get: async () => ({ competitions: [] }) };

async function withServer(callback) {
  const app = createApp({ users: new MemoryUsers(), favorites: new MemoryFavorites(), football: unusedFootballClient });
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    await callback(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test('cadastra usuário sem expor senha e devolve correlation id', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: 'Usuário Teste', email: 'teste@example.com', senha: 'senha-segura' })
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.email, 'teste@example.com');
    assert.equal(body.role, 'user');
    assert.equal(body.ativo, true);
    assert.equal('senha' in body, false);
    assert.equal('senhaHash' in body, false);
    assert.match(response.headers.get('x-correlation-id'), /^[0-9a-f-]{36}$/i);
  });
});

test('retorna erro padronizado para entrada inválida', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: 'A', email: 'invalido', senha: '123' })
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.code, 'DADOS_INVALIDOS');
    assert.equal(body.error.correlationId, response.headers.get('x-correlation-id'));
  });
});

test('serve a interface Swagger e o contrato OpenAPI', async () => {
  await withServer(async (baseUrl) => {
    const docsResponse = await fetch(`${baseUrl}/api/docs/`);
    const docsHtml = await docsResponse.text();
    assert.equal(docsResponse.status, 200);
    assert.match(docsHtml, /swagger-ui/i);

    const contractResponse = await fetch(`${baseUrl}/api/openapi.yaml`);
    const contract = await contractResponse.text();
    assert.equal(contractResponse.status, 200);
    assert.match(contract, /^openapi: 3\.0\.3/m);
  });
});
