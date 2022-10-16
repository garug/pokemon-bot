import { Namespace, Server } from "socket.io";

import { server } from "../../../app";
import { BattleEnergy, BattlePlayer } from "../BattlePlayer";
import { DiceMoves } from "../../dice/dice";
import { Match } from "../Match";
import { BattlePokemon } from "../BattlePokemon";
import { BattleDice } from "../BattleDice";
import { TurnPhase } from "../BattleTurn";

interface ServerToClientEvents {
    loadMatch(match: SocketMatch): void;

    message(message: string): void;
}

interface ClientToServerEvents {
    toggleDice(entry: string): void;

    toggleTarget(user: string, target: string): void;

    reroll(): void;

    endReroll(): void;

    endActions(): void;
}

interface SocketMatch {
    players: { [key in string]: SocketPlayer };

    expectors: string[];

    turn: SocketTurn;
}

interface SocketPlayer {
    pokemon: SocketPokemon[];

    energies: BattleEnergy;
}

interface SocketDice {
    pinned: boolean;

    activeFace: number;

    moves: DiceMoves;
}

interface SocketPokemon {
    id: string;

    number: number;

    hp: {
        current: number;
        total: number;
    };

    dice: SocketDice;

    targets: string[];
}

interface SocketTurn {
    reroll: number;

    player: string;

    phase: TurnPhase;
}

export type DiceRoom = Namespace<ClientToServerEvents, ServerToClientEvents>;

export default function createSocket(match: Match): DiceRoom {
    const options = {
        cors: {
            origin: "*",
        },
    };

    const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, options);

    console.log(io);

    // TODO utilizar match.id
    const room = io.of(`battles/abc`);

    room.on("connection", socket => {
        const socketMatch: () => SocketMatch = () => {
            return {
                players: {
                    [match.activePlayer.id]: createSocketPlayer(match.activePlayer),
                    [match.oddPlayer.id]: createSocketPlayer(match.oddPlayer),
                },
                expectors: [],
                turn: {
                    player: match.activePlayer.id,
                    reroll: match.activeTurn.rerolls,
                    phase: match.activeTurn.phase,
                },
            };
        };

        socket.emit("loadMatch", socketMatch());

        const updateMatch = () => room.emit("loadMatch", socketMatch());

        socket.on("reroll", () => {
            match.activeTurn.reroll();
            updateMatch();
        });

        socket.on("toggleDice", id => {
            const pokemon = match.activePlayer.pokemon.find(pokemon => pokemon.id === id)!;
            pokemon.dice.togglePinned();
            updateMatch();
        });

        socket.on("endReroll", () => {
            match.endReroll();
            updateMatch();
        });

        socket.on("toggleTarget", (user, target) => {
            const pokemon = match.activePlayer.pokemon.find(pokemon => pokemon.id === user)!;
            const pokemonTarget = match.oddPlayer.pokemon.find(pokemon => pokemon.id === target)!;
            // TODO e se o alvo for do próprio player?
            match.toggleTarget(pokemon, pokemonTarget);
            updateMatch();
        });

        socket.on("endActions", async () => {
            await match.endActions();
            match.newTurn();
            updateMatch();
        });
    });

    return room;
}

function createSocketPlayer(player: BattlePlayer): SocketPlayer {
    return {
        pokemon: player.pokemon.map(createSocketPokemon),
        energies: player.energies,
    };
}

function createSocketPokemon(pokemon: BattlePokemon): SocketPokemon {
    // TODO recuperar number real
    return {
        number: 4,
        id: pokemon.id,
        dice: createSocketDice(pokemon.dice),
        targets: pokemon.targets.map(p => p.id),
        hp: {
            current: pokemon.hp.current,
            total: pokemon.hp.total,
        },
    };
}

function createSocketDice(dice: BattleDice): SocketDice {
    return {
        activeFace: indexActiveFace(dice),
        moves: dice.moves,
        pinned: dice.pinned,
    };
}

function indexActiveFace(dice: BattleDice): number {
    return dice.moves.findIndex(move => move === dice.activeFace);
}




