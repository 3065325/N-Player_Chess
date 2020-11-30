import Boards from "./board.js";
import Pieces from "./pieces.js";
import Tiles from "./tile.js";

class Rules {
    public static isTilePassable(playerID: number, boardIndex: number, tileID: number): boolean {
        const tileIndex: number = Boards.TileIndices[boardIndex][tileID];
        const pieceIndex: number | undefined = Tiles.Occupations[tileIndex];
        if (!pieceIndex) return true;

        const playerIndex: number = Boards.PlayerIndices[boardIndex][playerID];
        const tilePlayerIndex: number = Pieces.PlayerIndices[pieceIndex];
        
        if (playerIndex === tilePlayerIndex) return false;

        return true;
    }
} 