import { AppError } from '../errors/app-error.js';

export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(new AppError(400, 'DADOS_INVALIDOS', 'Dados da requisição inválidos.', result.error.issues));
    }

    if (source === 'query') req.validatedQuery = result.data;
    else req[source] = result.data;
    return next();
  };
}
