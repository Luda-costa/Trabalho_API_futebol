import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { UserRepository } from '../src/repositories/user-repository.js';

const [emailArgument, password, ...nameParts] = process.argv.slice(2);
const email = emailArgument?.trim().toLowerCase();
const name = nameParts.join(' ').trim() || 'Administrador';

if (!email || !password || password.length < 8) {
  console.error('Uso: npm run create-admin -- admin@email.com senha-com-8-caracteres "Nome"');
  process.exitCode = 1;
} else {
  const repository = new UserRepository();
  if (await repository.findByEmail(email)) {
    console.error('Já existe um usuário com esse e-mail.');
    process.exitCode = 1;
  } else {
    await repository.create({
      id: randomUUID(),
      nome: name,
      email,
      senhaHash: await bcrypt.hash(password, 12),
      role: 'admin',
      ativo: true,
      criadoEm: new Date().toISOString()
    });
    console.log('Administrador criado com sucesso.');
  }
}
