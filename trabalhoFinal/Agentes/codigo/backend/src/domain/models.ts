export type Role = 'user' | 'admin';
export type FavoriteType = 'time' | 'campeonato';

export interface User {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  role: Role;
  criadoEm: Date;
}

export interface Favorite {
  id: string;
  usuarioId: string;
  tipo: FavoriteType;
  itemExternoId: number;
  criadoEm: Date;
}
