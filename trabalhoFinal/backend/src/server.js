import { createApp } from './app.js';
import { env, validateEnvironment } from './config/env.js';

validateEnvironment();

const app = createApp();
app.listen(env.port, () => {
  console.log(`API disponível em http://localhost:${env.port}/api`);
  console.log(`Documentação disponível em http://localhost:${env.port}/api/docs`);
});
