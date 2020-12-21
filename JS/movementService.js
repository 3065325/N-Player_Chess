import Boards from "./board.js";
import Tiles from "./tile.js";
import Pieces from "./pieces.js";
import { PieceTypes } from "./pieceData.js";
const mod = (a, b) => { return (a % b + b) % b; };
const floor = Math.floor;
function includesUnorderedTuple(array, tuple) {
    let tupleInstance = tuple;
    for (let i = 0; i < array.length; i++) {
        const index = tupleInstance.indexOf(array[i]);
        if (index === -1) {
            tupleInstance = tuple;
            continue;
        }
        tupleInstance.splice(index, 1);
        if (tuple.length === 0)
            return true;
    }
    return false;
}
function includesTuple(array, tuple) {
    let index = 0;
    const length = tuple.length;
    for (let i = 0; i < array.length; i++) {
        if (array[i] !== tuple[index]) {
            index = 0;
            continue;
        }
        if (index === length)
            return true;
    }
    return false;
}
class MovementService {
    static getPossibleMovesFunction(boardIndex, tileID, playerID, pieceType, isAttacking, hasCrossed, hasMoved) {
        return MovementService.PossibleMovesFunctions[pieceType](boardIndex, tileID, playerID, isAttacking, hasCrossed, hasMoved);
    }
    static getPossibleAttacksFunction(boardIndex, tileID, playerID, pieceType, hasCrossed, hasMoved) {
        const possibleAttacksFunction = MovementService.PossibleAttacksFunctions[pieceType];
        if (possibleAttacksFunction !== undefined)
            return possibleAttacksFunction(boardIndex, tileID, playerID, hasCrossed, hasMoved);
        return MovementService.PossibleMovesFunctions[pieceType](boardIndex, tileID, playerID, true, hasCrossed, hasMoved);
    }
    static getMoatIDs(boardIndex, sector0ID, sector1ID) {
        const columnCount = Boards.ColumnCounts[boardIndex];
        const rowCount = Boards.RowCounts[boardIndex];
        const playerCount = Boards.PlayerCounts[boardIndex];
        const maxRowID = (rowCount - 1) * columnCount;
        const columnsPerPlayer = columnCount / playerCount;
        const moatIDs = [];
        for (let i = sector0ID; i !== sector1ID; i = mod(i + 1, playerCount)) {
            const index = mod(i + 1, playerCount);
            moatIDs.push(maxRowID + index * columnsPerPlayer);
            moatIDs.push(maxRowID + mod(index * columnsPerPlayer - 1, columnCount));
        }
        return moatIDs;
    }
    static moatCanBridge(boardIndex, sectorID, fromLeft) {
        fromLeft = fromLeft || false;
        const rowCount = Boards.RowCounts[boardIndex];
        const columnCount = Boards.ColumnCounts[boardIndex];
        const columnsPerPlayer = columnCount / Boards.PlayerCounts[boardIndex];
        const playerIndex = Boards.PlayerIndices[boardIndex][sectorID];
        const sign = 2 * (+fromLeft) - 1;
        const tileID = (rowCount - 1) * columnCount + sectorID * columnsPerPlayer + (+fromLeft) * (columnsPerPlayer - 1);
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
MovementService.PossibleAttacksFunctions = [];
var MoveFuncs;
(function (MoveFuncs) {
    MoveFuncs[MoveFuncs["moveIn"] = 0] = "moveIn";
    MoveFuncs[MoveFuncs["moveRight"] = 1] = "moveRight";
    MoveFuncs[MoveFuncs["moveInRight"] = 2] = "moveInRight";
    MoveFuncs[MoveFuncs["moveInLeft"] = 3] = "moveInLeft";
})(MoveFuncs || (MoveFuncs = {}));
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
function possibleMovesUntilAmount(boardIndex, tileID, playerID, moveFuncType, isAttacking, amount) {
    const reachableTileIDs = [];
    const playerIndex = Boards.PlayerIndices[boardIndex][playerID];
    const moveFunc = MovementService.MoveFunctions[moveFuncType];
    const iterationAmount = Math.abs(amount);
    const sign = Math.sign(amount);
    for (let i = 1; i < iterationAmount; i++) {
        const nextTileID = moveFunc(boardIndex, tileID, sign * i);
        if (nextTileID === undefined)
            break;
        const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
        const nextPieceIndex = Tiles.Occupations[nextTileIndex];
        if (nextPieceIndex !== undefined && (Pieces.PlayerIndices[nextPieceIndex] === playerIndex || !isAttacking))
            break;
        if (reachableTileIDs.indexOf(nextTileID) === -1)
            reachableTileIDs.push(nextTileID);
        if (nextPieceIndex !== undefined)
            break;
    }
    return reachableTileIDs;
}
MovementService.PossibleMovesFunctions[PieceTypes.Pawn] = (boardIndex, tileID, playerID, isAttacking, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const sign = 1 - 2 * +(hasCrossed || false);
    let nextTileID = MovementService.MoveFunctions[MoveFuncs.moveIn](boardIndex, tileID, sign * 1);
    if (nextTileID === undefined)
        return reachableTileIDs;
    let nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
    let nextPieceIndex = Tiles.Occupations[nextTileIndex];
    if (nextPieceIndex !== undefined)
        return reachableTileIDs;
    reachableTileIDs.push(nextTileID);
    if (hasMoved)
        return reachableTileIDs;
    nextTileID = MovementService.MoveFunctions[MoveFuncs.moveIn](boardIndex, tileID, sign * 2);
    if (nextTileID === undefined)
        return reachableTileIDs;
    nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
    nextPieceIndex = Tiles.Occupations[nextTileIndex];
    if (nextPieceIndex !== undefined)
        return reachableTileIDs;
    reachableTileIDs.push(nextTileID);
    return reachableTileIDs;
};
MovementService.PossibleAttacksFunctions[PieceTypes.Pawn] = (boardIndex, tileID, playerID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const playerIndex = Boards.PlayerIndices[boardIndex][playerID];
    const sign = 1 - 2 * +(hasCrossed || false);
    let nextTileID = MovementService.MoveFunctions[MoveFuncs.moveInLeft](boardIndex, tileID, sign * 1);
    if (nextTileID !== undefined && nextTileID !== tileID) {
        const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
        const nextPieceIndex = Tiles.Occupations[nextTileIndex];
        if (nextPieceIndex === undefined || Pieces.PlayerIndices[nextPieceIndex] !== playerIndex)
            reachableTileIDs.push(nextTileID);
    }
    nextTileID = MovementService.MoveFunctions[MoveFuncs.moveInRight](boardIndex, tileID, sign * 1);
    if (nextTileID !== undefined && reachableTileIDs.indexOf(nextTileID) === -1) {
        const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
        const nextPieceIndex = Tiles.Occupations[nextTileIndex];
        if (nextPieceIndex === undefined || Pieces.PlayerIndices[nextPieceIndex] !== playerIndex)
            reachableTileIDs.push(nextTileID);
    }
};
export default MovementService;
//# sourceMappingURL=movementService.js.map