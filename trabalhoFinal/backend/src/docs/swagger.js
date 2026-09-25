import { readFileSync } from 'node:fs';
import path from 'node:path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import { backendRoot } from '../config/env.js';

export const openApiPath = path.resolve(backendRoot, '../Agentes/openapi.yaml');
const openApiDocument = YAML.parse(readFileSync(openApiPath, 'utf8'));

export function registerSwagger(app) {
  app.get('/api/openapi.yaml', (_req, res) => {
    res.type('application/yaml').sendFile(openApiPath);
  });

  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customSiteTitle: 'Plataforma de Futebol — API',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true
      }
    })
  );
}
