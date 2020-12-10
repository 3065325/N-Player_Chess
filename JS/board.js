import Players from "./player.js";
import Tiles from "./tile.js";
import Pieces from "./pieces.js";
class Boards {
    static createBoard(playerCount, rowCount, columnsPerPlayer) {
        rowCount = rowCount || 2 * playerCount;
        columnsPerPlayer = columnsPerPlayer || 8;
        const columnCount = columnsPerPlayer * playerCount;
        const nextIndex = Boards.IndexStack.pop() || Boards.Counter++;
        Boards.PlayerCounts[nextIndex] = playerCount;
        Boards.ColumnCounts[nextIndex] = columnCount;
        Boards.RowCounts[nextIndex] = rowCount;
        let tempArray = new Array(playerCount);
        const colorIncrement = 360 / playerCount;
        for (let i = 0; i < playerCount; i++) {
            tempArray[i] = Players.createPlayer(nextIndex, `Team ${i + 1}`, `hsl(${i * colorIncrement}, 55%, 40%)`);
        }
        Boards.PlayerIndices[nextIndex] = tempArray;
        tempArray = new Array(columnCount * rowCount);
        for (let i = 0; i < tempArray.length; i++) {
            tempArray[i] = Tiles.createTile(nextIndex);
        }
        Boards.TileIndices[nextIndex] = tempArray;
        let tempMap = new Map();
        for (let i = 0; i < playerCount; i++) {
            tempMap.set(i, true);
        }
        Boards.MoatIDs[nextIndex] = tempMap;
        return nextIndex;
    }
    static removeBoard(boardIndex) {
        if (boardIndex < 1 || boardIndex > Boards.Counter)
            return;
        Boards.IndexStack.push(boardIndex);
        delete Boards.PlayerCounts[boardIndex];
        delete Boards.ColumnCounts[boardIndex];
        delete Boards.RowCounts[boardIndex];
        delete Boards.PlayerIndices[boardIndex];
        delete Boards.TileIndices[boardIndex];
        delete Boards.MoatIDs[boardIndex];
    }
    static setPiece(pieceType, playerID, boardIndex, tileID) {
        const playerIndex = Boards.PlayerIndices[boardIndex][playerID];
        const pieceIndex = Pieces.createPiece(pieceType, playerIndex);
        Players.Pieces[playerIndex].push(pieceIndex);
        const tileIndex = Boards.TileIndices[boardIndex][tileID];
        Tiles.Occupations[tileIndex] = pieceIndex;
        return pieceIndex;
    }
}
Boards.PlayerCounts = [];
Boards.ColumnCounts = [];
Boards.RowCounts = [];
Boards.PlayerIndices = [];
Boards.TileIndices = [];
Boards.MoatIDs = [];
Boards.Counter = 0;
Boards.IndexStack = [];
export default Boards;
//# sourceMappingURL=board.js.map