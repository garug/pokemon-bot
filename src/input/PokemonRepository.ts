export interface PokemonFilters {
  user?: string;
  name?: string;
  shiny?: boolean;
}

export interface Pageable {
  page: number;
  size: number;
}

export interface Page<T> {
  content: T[];
  size: number;
  count: number;
  page: number;
}

export interface PokemonRepository {
  find(filters: PokemonFilters,  pageable: Pageable): Promise<Page<any>>;
  updateTiers(): Promise<any>;
}