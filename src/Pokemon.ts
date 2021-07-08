import Move from "./lib/moves";

export type Attribute =
  | "attack"
  | "defense"
  | "hp"
  | "sp_attack"
  | "sp_defense"
  | "speed";

interface Attributes {
  hp: number;
  attack: number;
  defense: number;
  sp_attack: number;
  sp_defense: number;
  speed: number;
}

interface PokemonOptions {
  name: string;
  level: number;
  attributes: Attributes;
  moves: [Move, Move, Move, Move];
  types: [string, string?];
}

export default class Pokemon {
  name: string;
  level: number;
  hp: number;
  base_stats: Attributes;
  moves: [Move, Move, Move, Move];
  types: [string, string?];

  constructor(opt: PokemonOptions | Pokemon) {
    if (opt instanceof Pokemon) {
      this.base_stats = { ...opt.base_stats };
      this.hp = opt.hp;
    } else {
      this.base_stats = opt.attributes;
      this.hp = 1;
    }
    this.name = opt.name;
    this.level = opt.level;
    this.moves = opt.moves;
    this.types = opt.types;
  }
}
