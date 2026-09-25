import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { idempotency } from '../middlewares/idempotency.js';
import {
  activeInput,
  competitionMatchesQuery,
  competitionQuery,
  credentials,
  favoriteInput,
  matchesQuery,
  pagination,
  userInput
} from './schemas.js';

export function createRouter(controllers) {
  const router = Router();

  router.post('/usuarios', validate(userInput), controllers.users.register);
  router.post('/sessoes', validate(credentials), controllers.auth.login);

  router.get('/campeonatos', validate(competitionQuery, 'query'), controllers.sports.listCompetitions);
  router.get('/campeonatos/:id', controllers.sports.getCompetition);
  router.get('/campeonatos/:id/times', controllers.sports.listCompetitionTeams);
  router.get('/campeonatos/:id/partidas', validate(competitionMatchesQuery, 'query'), controllers.sports.listCompetitionMatches);
  router.get('/times', validate(pagination, 'query'), controllers.sports.listTeams);
  router.get('/times/:id', controllers.sports.getTeam);
  router.get('/partidas', validate(matchesQuery, 'query'), controllers.sports.listMatches);
  router.get('/partidas/:id', controllers.sports.getMatch);

  router.get('/favoritos', authenticate, validate(pagination, 'query'), controllers.favorites.list);
  router.post('/favoritos', authenticate, validate(favoriteInput), idempotency, controllers.favorites.create);
  router.delete('/favoritos/:id', authenticate, controllers.favorites.remove);

  router.get('/admin/usuarios', authenticate, requireRole('admin'), validate(pagination, 'query'), controllers.admin.listUsers);
  router.patch('/admin/usuarios/:id', authenticate, requireRole('admin'), validate(activeInput), controllers.admin.setUserActive);

  return router;
}
