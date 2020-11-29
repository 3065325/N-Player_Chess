import Boards from "./board.js";
import Pieces from "./pieces.js";
import Tiles from "./tile.js";

class Rules {
    public static isTilePassable(playerID: number, boardIndex: number, tileID: number, nextTileIDs?: number): [boolean, boolean] {
        let tileIsPassable: boolean = true;
        let nextTileIsPassable: boolean = true; 

        const tileIndex: number = Boards.Tiles[boardIndex][tileID];
        const pieceIndex: number | undefined = Tiles.Occupations[tileIndex];
        if (pieceIndex) {
            const tilePlayerIndex: number = Pieces.PlayerIndices[pieceIndex];
            if (Pieces.PlayerIndices[tilePlayerIndex] ===)
        }

        if (Tiles.)
    }
} 