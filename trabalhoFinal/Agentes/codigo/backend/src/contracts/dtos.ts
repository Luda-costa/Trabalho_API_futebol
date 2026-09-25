export interface Paginated<T> {
  items: T[];
  pagina: number;
  limite: number;
  total: number;
}

export interface CampeonatoDto {
  id: number;
  codigo: string | null;
  nome: string;
  tipo: string | null;
  emblema: string | null;
  area: string | null;
}

export interface TimeResumoDto {
  id: number | null;
  nome: string | null;
  escudo: string | null;
}

export interface TimeDto {
  id: number;
  nome: string;
  nomeCurto: string | null;
  tla: string | null;
  escudo: string | null;
  fundacao: number | null;
  estadio: string | null;
}

export interface PlacarDto {
  vencedor: string | null;
  duracao: string | null;
  golsCasa: number | null;
  golsFora: number | null;
}

export interface PartidaDto {
  id: number;
  dataUtc: string;
  status: string;
  rodada: number | null;
  casa: TimeResumoDto;
  fora: TimeResumoDto;
  placar: PlacarDto;
}

export interface UsuarioPublicoDto {
  id: string;
  nome: string;
  email: string;
  role: 'user' | 'admin';
  criadoEm: string;
}

export interface FavoritoDto {
  id: string;
  tipo: 'time' | 'campeonato';
  itemExternoId: number;
  criadoEm: string;
}
