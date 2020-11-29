import Boards from "./board.js";
import Pieces from "./pieces.js";
import Tiles from "./tile.js";
class Rules {
    static isTilePassable(playerID, boardIndex, tileID, nextTileIDs) {
        let tileIsPassable = true;
        let nextTileIsPassable = true;
        const tileIndex = Boards.Tiles[boardIndex][tileID];
        const pieceIndex = Tiles.Occupations[tileIndex];
        if (pieceIndex) {
            const tilePlayerIndex = Pieces.PlayerIndices[pieceIndex];
            if (Pieces.PlayerIndices[tilePlayerIndex] === )
                ;
        }
        if (Tiles.)
            ;
    }
}
//# sourceMappingURL=rules.js.map