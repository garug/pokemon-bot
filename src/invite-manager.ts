import { User } from "discord.js";
import { v4 } from "uuid";
import Repository, { OwnedPokemon } from "./models/OwnedPokemon";
import { moves } from "./lib/moves";
import Pokemon from "./Pokemon";
import Battle from "./Battle";
import { activeBattles } from "./battle-manager";

export class InviteBattle {
  id: string;
  created_at: Date;
  challenger: User;
  challenged: User;

  constructor(challenger: User, challenged: User) {
    this.id = v4();
    this.created_at = new Date();
    this.challenger = challenger;
    this.challenged = challenged;
  }
}

export const currentInvites: InviteBattle[] = [];

export async function acceptInvite(invite: InviteBattle) {
  const [p1Pokemon, p2Pokemon] = await Promise.all([
    Repository.find({ user: invite.challenger.id }).limit(6),
    Repository.find({ user: invite.challenged.id }).limit(6),
  ]);

  function battleTeam(pokemon: OwnedPokemon[]) {
    return pokemon.map((p) => {
      return new Pokemon({
        id: p.id,
        name: p.name,
        number: p.id_dex,
        level: 1,
        attributes: p.attributes,
        moves,
        types: ["normal"],
      });
    }) as unknown as [Pokemon, Pokemon, Pokemon, Pokemon, Pokemon, Pokemon];
  }

  const p1 = battleTeam(p1Pokemon);
  const p2 = battleTeam(p2Pokemon);

  const challengerKey = v4();

  const battle = new Battle(
    {
      id: challengerKey,
      name: invite.challenger.username,
      pokemon: p1,
    },
    {
      id: invite.id,
      name: invite.challenged.username,
      pokemon: p2,
    }
  );

  activeBattles.push(battle);

  battle.events.subscribe((event) => {
    if (event.id === "start") {
      invite.challenger.send(
        `${invite.challenged} accept your challenge! [Access battle](${process.env.FRONTEND_URL}/batalhas/${challengerKey})`
      );
    }
  });

  return battle;
}
