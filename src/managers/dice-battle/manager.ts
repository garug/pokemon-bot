import createSocket, { DiceRoom } from "./socket/socket";
import { BattlePlayer } from "./BattlePlayer";
import { generateMatch } from "./utils";

interface Room {
    id: string;
    players: [string, string];
    expectors: string[];
    socket: DiceRoom;
}

const rooms = {};

export async function createRoom(player1: string, player2: string): Promise<Room> {
    // TODO criar instância de batalha real
    const match = await generateMatch();

    const socket = createSocket(match);

    const room: Room = {
        id: match.id,
        socket,
        players: [player1, player2],
        expectors: [],
    }

    rooms[match.id] = room;

    return room;
}

function loadBattlePlayer(id: string): BattlePlayer {
    return {
        id,
        pokemon: [],
        energies: {}
    }
}
