import Boards from "./board.js";
import Tiles from "./tile.js";
import Pieces from "./pieces.js";
const mod = (a, b) => { return (a % b + b) % b; };
const floor = Math.floor;
var MoveFuncs;
(function (MoveFuncs) {
    MoveFuncs[MoveFuncs["moveIn"] = 0] = "moveIn";
    MoveFuncs[MoveFuncs["moveRight"] = 1] = "moveRight";
    MoveFuncs[MoveFuncs["moveInRight"] = 2] = "moveInRight";
    MoveFuncs[MoveFuncs["moveInLeft"] = 3] = "moveInLeft";
})(MoveFuncs || (MoveFuncs = {}));
class MovementService {
    static getPossibleMovesFunction(boardIndex, tileID, playerID, pieceType) {
        if (pieceType)
            return this.PossibleMovesFunctions[pieceType](boardIndex, tileID, playerID);
        const tileIndex = Boards.TileIndices[boardIndex][tileID];
        const pieceIndex = Tiles.Occupations[tileIndex];
        if (pieceIndex === undefined)
            return [];
        pieceType = Pieces.PieceTypes[pieceIndex];
        return this.PossibleMovesFunctions[pieceType](boardIndex, tileID, playerID);
    }
    static getMoatIDs(boardIndex, sector1ID, sector2ID) {
        const columnCount = Boards.ColumnCounts[boardIndex];
        const rowCount = Boards.RowCounts[boardIndex];
        const playerCount = Boards.PlayerCounts[boardIndex];
        const maxRowID = (rowCount - 1) * columnCount;
        const columnsPerPlayer = columnCount / playerCount;
        const moatIDs = [];
        for (let i = mod(sector1ID + 1, playerCount); i !== mod(sector2ID + 1, playerCount); i = mod(i + 1, playerCount)) {
            moatIDs.push(maxRowID + i * columnsPerPlayer);
        }
        return moatIDs;
    }
    static moatCanBridge(boardIndex, sectorID, fromLeft) {
        fromLeft = fromLeft || false;
        const rowCount = Boards.RowCounts[boardIndex];
        const columnCount = Boards.ColumnCounts[boardIndex];
        const columnsPerPlayer = columnCount / Boards.PlayerCounts[boardIndex];
        const playerIndex = Boards.PlayerIndices[boardIndex][sectorID];
        const sign = 2 * +fromLeft - 1;
        const tileID = (rowCount - 1) * columnCount + sectorID * columnsPerPlayer + +fromLeft * (columnsPerPlayer - 1);
        for (let i = 1; i < columnsPerPlayer + 1; i++) {
            const nextTileID = MovementService.MoveFunctions[MoveFuncs.moveRight](boardIndex, tileID, sign * i);
            if (nextTileID === undefined)
                continue;
            const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
            const nextPieceIndex = Tiles.Occupations[nextTileIndex];
            if (nextPieceIndex === undefined)
                continue;
            const nextPlayerIndex = Pieces.PlayerIndices[nextPieceIndex];
            if (playerIndex === nextPlayerIndex)
                return false;
        }
        return true;
    }
    static moveTileOccupant(boardIndex, oldTileID, newTileID) {
        const oldTileIndex = Boards.TileIndices[boardIndex][oldTileID];
        const newTileIndex = Boards.TileIndices[boardIndex][newTileID];
        const pieceIndex = Tiles.Occupations[oldTileIndex];
        Tiles.Occupations[oldTileIndex] = undefined;
        Tiles.Occupations[newTileIndex] = pieceIndex;
    }
}
MovementService.MoveFunctions = [];
MovementService.MaxPathLengthFunctions = [];
MovementService.PossibleMovesFunctions = [];
MovementService.MoveFunctions[MoveFuncs.moveIn] = (boardIndex, tileID, amount) => {
    const columnCount = Boards.ColumnCounts[boardIndex];
    const diffRatio = tileID / columnCount - amount;
    const isCrossed = floor(0.5 * Math.sign(diffRatio));
    const flooredDR = floor(diffRatio);
    const newTileID = columnCount * (mod(tileID / columnCount + 0.5 * isCrossed, 1) + isCrossed * (1 + 2 * flooredDR) + flooredDR);
    if (newTileID < Boards.TileIndices[boardIndex].length)
        return newTileID;
};
MovementService.MoveFunctions[MoveFuncs.moveRight] = (boardIndex, tileID, amount) => {
    const columnCount = Boards.ColumnCounts[boardIndex];
    return mod(tileID + amount, columnCount) + floor(tileID / columnCount) * columnCount;
};
MovementService.MoveFunctions[MoveFuncs.moveInRight] = (boardIndex, tileID, amount) => {
    const columnCount = Boards.ColumnCounts[boardIndex];
    const rowCount = Boards.RowCounts[boardIndex];
    const maxRow = rowCount - 1;
    const tileT = mod(tileID, columnCount);
    const tileR = floor(tileID / columnCount);
    const rowDelta = rowCount - (tileR + 1);
    const moveT = mod(rowDelta + amount + maxRow, 2 * maxRow + 1) - maxRow;
    const moveR = Math.abs(moveT);
    return mod(tileT - rowDelta + moveT, columnCount) + (maxRow - moveR) * columnCount;
};
MovementService.MoveFunctions[MoveFuncs.moveInLeft] = (boardIndex, tileID, amount) => {
    const columnCount = Boards.ColumnCounts[boardIndex];
    const rowCount = Boards.RowCounts[boardIndex];
    const maxRow = rowCount - 1;
    const tileT = tileID % columnCount;
    const tileR = floor(tileID / columnCount);
    const rowDelta = rowCount - (tileR + 1);
    const moveT = mod(rowDelta + amount + maxRow, 2 * maxRow + 1) - maxRow;
    const moveR = Math.abs(moveT);
    return mod(tileT + rowDelta - moveT, columnCount) + (maxRow - moveR) * columnCount;
};
MovementService.MaxPathLengthFunctions[MoveFuncs.moveIn] = (boardIndex) => {
    return 2 * Boards.RowCounts[boardIndex] - 1;
};
MovementService.MaxPathLengthFunctions[MoveFuncs.moveRight] = (boardIndex) => {
    return Boards.ColumnCounts[boardIndex] - 1;
};
MovementService.MaxPathLengthFunctions[MoveFuncs.moveInRight] = (boardIndex) => {
    return 2 * (Boards.RowCounts[boardIndex] - 1);
};
MovementService.MaxPathLengthFunctions[MoveFuncs.moveInLeft] = (boardIndex) => {
    return 2 * (Boards.RowCounts[boardIndex] - 1);
};
export default MovementService;
//# sourceMappingURL=movementService.js.map