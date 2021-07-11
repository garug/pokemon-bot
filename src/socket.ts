import { createServer, Server as HttpServer } from "http";
import socketIO, { Server } from "socket.io";
import Battle, { InBattlePokemon, Player, Turn } from "./Battle";
import { Express } from "express";
import { activeBattles } from "./battle-manager";

let io: Server;

export function publicTurns(turns: Turn[]) {
  return turns.map((t) => t.events);
}

export function publicPokemon(pokemon: InBattlePokemon) {
  return {
    id: pokemon.originalPokemon.id,
    name: pokemon.originalPokemon.name,
    number: pokemon.originalPokemon.number,
    hp: pokemon.hp,
    totalHp: pokemon.totalHp,
  };
}

export function personalPokemon(pokemon: InBattlePokemon) {
  return {
    ...publicPokemon(pokemon),
  };
}

export function actionsOf(player: Player) {
  return {
    moves: player.inBattle.originalPokemon.moves.map((m) => m.name),
    pokemon: player.pokemon.map((p) => personalPokemon(p)),
  };
}

export default function createSocket(server: HttpServer) {
  const options = {
    cors: {
      origin: "*",
    },
  };
  io = new Server(server, options);

  io.on("connection", (socket) => {
    socket.data.battles = [];
    socket.on("connect-battle", (connectId) => {
      const battle = activeBattles.find((e) => {
        return (
          e.p1.name === connectId ||
          e.p2.name === connectId ||
          e.visitorKey === connectId
        );
      });

      if (!battle) {
        socket.emit("roomNotFind");
        return;
      }

      socket.join(battle.id);
      socket.join(connectId);

      socket.emit("events", publicTurns(battle.turns));

      const emitPlayer = (player: "p1" | "p2") => {
        return {
          inBattle: publicPokemon(battle[player].inBattle),
          pokemon: battle[player].alreadyUsed.map((p) => publicPokemon(p)),
        };
      };

      socket.emit("p1", emitPlayer("p1"));
      socket.emit("p2", emitPlayer("p2"));
      socket.emit("battle", battle.id);

      const handlePlayer = (player: "p1" | "p2") => {
        socket.data.battles.push({
          id: battle.id,
          player: battle[player],
        });
        socket.emit("actions", actionsOf(battle[player]));
        socket.emit("identity", player);
      };

      if (battle.p1.name === connectId) handlePlayer("p1");

      if (battle.p2.name === connectId) handlePlayer("p2");
    });

    function handleMove(payload: any) {
      const player = socket.data.battles.find((b: any) => b.id === payload.id)
        .player as Player;
      const battle = activeBattles.find((e) => e.id === payload.id) as Battle;
      const move = player.inBattle.originalPokemon.moves.find(
        (move) => move.name.toLowerCase() === payload.value.toLowerCase()
      );

      if (move) {
        battle.registerAction(player, move);
        if (battle.waitingOther(player)) battle.rollTurn();
        else {
          // TODO start counter
          socket.emit("waiting");
        }
      } else {
        socket.emit("event", "Your pokemon didn't learn this move.");
      }
    }

    function handleChange(payload: any) {
      const player = socket.data.battles.find((b: any) => b.id === payload.id)
        .player as Player;
      const battle = activeBattles.find((e) => e.id === payload.id) as Battle;
      const pokemon = player.pokemon.find(
        (p) =>
          p.originalPokemon.name.toLowerCase() === payload.value.toLowerCase()
      ) as InBattlePokemon;

      if (player.inBattle.hp <= 0) {
        player.changeActivePokemon(pokemon);
        return;
      }

      battle.registerAction(player, pokemon);
      if (battle.waitingOther(player)) battle.rollTurn();
      else {
        // TODO start counter
        socket.emit("waiting");
      }
    }

    socket.on("registerTurn", (payload) => {
      if (payload.type === "move") handleMove(payload);
      else if (payload.type === "change") handleChange(payload);
    });
  });
}

export function useSocket() {
  return io;
}
