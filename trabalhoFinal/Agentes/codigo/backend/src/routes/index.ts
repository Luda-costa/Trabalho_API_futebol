import { Router } from 'express';
import { listUsers, updateUser } from '../controllers/admin-controller.js';
import { createFavorite, deleteFavorite, listFavorites } from '../controllers/favorites-controller.js';
import { createSession } from '../controllers/session-controller.js';
import { sportsController } from '../controllers/sports-controller.js';
import { createUser } from '../controllers/user-controller.js';
import { authenticate } from '../middlewares/auth.js';
import { idempotency } from '../middlewares/idempotency.js';
import { requireRole } from '../middlewares/require-role.js';

export const router = Router();

router.post('/usuarios', createUser);
router.post('/sessoes', createSession);

router.get('/campeonatos', sportsController.listCompetitions);
router.get('/campeonatos/:id', sportsController.getCompetition);
router.get('/campeonatos/:id/times', sportsController.listCompetitionTeams);
router.get('/campeonatos/:id/partidas', sportsController.listCompetitionMatches);
router.get('/times', sportsController.listTeams);
router.get('/times/:id', sportsController.getTeam);
router.get('/partidas', sportsController.listMatches);
router.get('/partidas/:id', sportsController.getMatch);

router.post('/favoritos', authenticate, idempotency, createFavorite);
router.get('/favoritos', authenticate, listFavorites);
router.delete('/favoritos/:id', authenticate, deleteFavorite);

router.get('/admin/usuarios', authenticate, requireRole('admin'), listUsers);
router.patch('/admin/usuarios/:id', authenticate, requireRole('admin'), updateUser);
