import { FootballDataClient } from './clients/football-data-client.js';
import { AdminController } from './controllers/admin-controller.js';
import { AuthController } from './controllers/auth-controller.js';
import { FavoriteController } from './controllers/favorite-controller.js';
import { SportsController } from './controllers/sports-controller.js';
import { UserController } from './controllers/user-controller.js';
import { FavoriteRepository } from './repositories/favorite-repository.js';
import { UserRepository } from './repositories/user-repository.js';
import { AdminService } from './services/admin-service.js';
import { AuthService } from './services/auth-service.js';
import { FavoriteService } from './services/favorite-service.js';
import { SportsService } from './services/sports-service.js';
import { UserService } from './services/user-service.js';

export function createContainer(overrides = {}) {
  const users = overrides.users ?? new UserRepository();
  const favorites = overrides.favorites ?? new FavoriteRepository();
  const football = overrides.football ?? new FootballDataClient();

  return {
    controllers: {
      users: new UserController(new UserService(users)),
      auth: new AuthController(new AuthService(users)),
      favorites: new FavoriteController(new FavoriteService(favorites, football)),
      admin: new AdminController(new AdminService(users)),
      sports: new SportsController(new SportsService(football))
    }
  };
}
