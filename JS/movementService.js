import Boards from "./board.js";
import Tiles from "./tile.js";
import Pieces from "./pieces.js";
import { PieceTypes } from "./pieceData.js";
const mod = (a, b) => { return (a % b + b) % b; };
const floor = Math.floor;
function containsUnorderedTuple(array, tuple) {
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
    static getPossibleMovesFunction(boardIndex, tileID, pieceType, hasCrossed, hasMoved) {
        return MovementService.PossibleMovesFunctions[pieceType](boardIndex, tileID, hasCrossed, hasMoved);
    }
    static getPossibleAttacksFunction(boardIndex, tileID, playerID, pieceType, hasCrossed, hasMoved) {
        const possibleAttacksFunction = MovementService.PossibleAttacksFunctions[pieceType];
        return possibleAttacksFunction(boardIndex, tileID, playerID, hasCrossed, hasMoved);
    }
    static getMoatIDs(boardIndex, sector0ID, sector1ID) {
        const columnCount = Boards.ColumnCounts[boardIndex];
        const rowCount = Boards.RowCounts[boardIndex];
        const playerCount = Boards.PlayerCounts[boardIndex];
        const maxRowID = (rowCount - 1) * columnCount;
        const columnsPerPlayer = columnCount / playerCount;
        const moatIDTuples = [];
        for (let i = 0; i < mod(sector1ID - sector0ID, columnsPerPlayer); i++) {
            const v1 = MovementService.MoveFunctions[MoveFuncs.moveRight](boardIndex, maxRowID, (1 + sector0ID + i) * columnsPerPlayer - 1);
            const v2 = MovementService.MoveFunctions[MoveFuncs.moveRight](boardIndex, maxRowID, (1 + sector0ID + i) * columnsPerPlayer);
            moatIDTuples.push([v1, v2]);
        }
        return moatIDTuples;
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
    return 2 * Boards.RowCounts[boardIndex];
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
function getMoatID(boardIndex, tileID, getRight) {
    if (getRight === undefined)
        getRight = false;
    const rowCount = Boards.RowCounts[boardIndex];
    const columnCount = Boards.ColumnCounts[boardIndex];
    const columnsPerPlayer = columnCount / Boards.PlayerCounts[boardIndex];
    return (rowCount - 1) * columnCount + floor(mod(tileID, columnCount) / columnsPerPlayer) * columnsPerPlayer + (columnsPerPlayer - 1) * (+getRight);
}
function getMoatIDTuple(boardIndex, moatID, toRight) {
    if (toRight === undefined)
        toRight = false;
    return [MovementService.MoveFunctions[MoveFuncs.moveRight](boardIndex, moatID, -1 * (+!toRight)), MovementService.MoveFunctions[MoveFuncs.moveRight](boardIndex, moatID, 1 * (+toRight))];
}
MovementService.PossibleMovesFunctions[PieceTypes.Pawn] = (boardIndex, tileID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const sign = 1 - 2 * +(hasCrossed || false);
    for (let i = 1; i <= 1 + +!hasMoved; i++) {
        const nextTileID = MovementService.MoveFunctions[MoveFuncs.moveIn](boardIndex, tileID, sign * i);
        if (nextTileID === undefined)
            break;
        const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
        const nextPieceIndex = Tiles.Occupations[nextTileIndex];
        if (nextPieceIndex !== undefined)
            break;
        reachableTileIDs.push(nextTileID);
    }
    return reachableTileIDs;
};
MovementService.PossibleMovesFunctions[PieceTypes.Rook] = (boardIndex, tileID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const backFrontCheck = (moveFuncIndex, pathLength) => {
        for (let i = -1; i <= 1; i += 2) {
            const isFront = i > 0;
            const moatID = getMoatID(boardIndex, tileID, isFront);
            let lastTileID = tileID;
            for (let j = 1; j < pathLength; j++) {
                const nextTileID = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i * j);
                if (nextTileID === undefined || reachableTileIDs.indexOf(nextTileID) !== -1)
                    continue;
                const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex !== undefined)
                    break;
                const moatIDTuple = getMoatIDTuple(boardIndex, moatID, isFront);
                if (containsUnorderedTuple([lastTileID, nextTileID], moatIDTuple) && Boards.MoatIDsBridged[boardIndex].get(moatID + (+isFront)) === false)
                    break;
                reachableTileIDs.push(nextTileID);
                lastTileID = nextTileID;
            }
        }
    };
    const rightPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveRight](boardIndex);
    backFrontCheck(MoveFuncs.moveRight, rightPathLength);
    const inPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveIn](boardIndex);
    backFrontCheck(MoveFuncs.moveIn, inPathLength);
    return reachableTileIDs;
};
MovementService.PossibleMovesFunctions[PieceTypes.King] = (boardIndex, tileID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const backFrontCheck = (moveFuncIndex) => {
        for (let i = -1; i <= 1; i += 2) {
            const nextTileID = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i);
            if (nextTileID === undefined || reachableTileIDs.indexOf(nextTileID) !== -1)
                continue;
            const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
            const nextPieceIndex = Tiles.Occupations[nextTileIndex];
            if (nextPieceIndex !== undefined)
                break;
            const isFront = i > 0;
            const moatID = getMoatID(boardIndex, tileID, isFront);
            const moatIDTuple = getMoatIDTuple(boardIndex, moatID, isFront);
            if (containsUnorderedTuple([tileID, nextTileID], moatIDTuple) && Boards.MoatIDsBridged[boardIndex].get(moatID + (+isFront)) === false)
                break;
            reachableTileIDs.push(nextTileID);
        }
    };
    backFrontCheck(MoveFuncs.moveIn);
    backFrontCheck(MoveFuncs.moveRight);
    backFrontCheck(MoveFuncs.moveInLeft);
    backFrontCheck(MoveFuncs.moveInRight);
    return reachableTileIDs;
};
function crossesCreek(boardIndex, tile0ID, tile1ID) {
    const columnCount = Boards.ColumnCounts[boardIndex];
    const rowCount = Boards.RowCounts[boardIndex];
    const row0 = floor(tile0ID / columnCount);
    const row1 = floor(tile1ID / columnCount);
}
MovementService.PossibleAttacksFunctions[PieceTypes.Pawn] = (boardIndex, tileID, playerID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const playerIndex = Boards.PlayerIndices[boardIndex][playerID];
    const sign = 1 - 2 * +(hasCrossed || false);
    const frontCheck = (moveFuncIndex) => {
        const nextTileID = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, sign);
        if (nextTileID === undefined || nextTileID === tileID)
            return;
        const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
        const nextPieceIndex = Tiles.Occupations[nextTileIndex];
        if (nextPieceIndex === undefined || Pieces.PlayerIndices[nextPieceIndex] === playerIndex)
            return;
        reachableTileIDs.push(nextTileID);
    };
    frontCheck(MoveFuncs.moveInLeft);
    frontCheck(MoveFuncs.moveInRight);
    return reachableTileIDs;
};
MovementService.PossibleAttacksFunctions[PieceTypes.Rook] = (boardIndex, tileID, playerID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const playerIndex = Boards.PlayerIndices[boardIndex][playerID];
    const backFrontCheck = (moveFuncIndex, pathLength) => {
        for (let i = -1; i <= 1; i += 2) {
            for (let j = 1; j < pathLength; j++) {
                const nextTileID = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i * j);
                if (nextTileID === undefined || reachableTileIDs.indexOf(nextTileID) !== -1)
                    continue;
                const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex === undefined)
                    continue;
                if (Pieces.PlayerIndices[nextPieceIndex] === playerIndex)
                    break;
                reachableTileIDs.push(nextTileID);
                break;
            }
        }
    };
    const rightPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveRight](boardIndex);
    backFrontCheck(MoveFuncs.moveRight, rightPathLength);
    const inPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveIn](boardIndex);
    backFrontCheck(MoveFuncs.moveIn, inPathLength);
    return reachableTileIDs;
};
MovementService.PossibleAttacksFunctions[PieceTypes.King] = (boardIndex, tileID, playerID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const playerIndex = Boards.PlayerIndices[boardIndex][playerID];
    const backFrontCheck = (moveFuncIndex) => {
        for (let i = -1; i <= 1; i += 2) {
            const nextTileID = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i);
            if (nextTileID === undefined || reachableTileIDs.indexOf(nextTileID) !== -1)
                continue;
            const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
            const nextPieceIndex = Tiles.Occupations[nextTileIndex];
            if (nextPieceIndex === undefined || Pieces.PlayerIndices[nextPieceIndex] === playerIndex)
                continue;
            reachableTileIDs.push(nextTileID);
        }
    };
    backFrontCheck(MoveFuncs.moveIn);
    backFrontCheck(MoveFuncs.moveRight);
    backFrontCheck(MoveFuncs.moveInLeft);
    backFrontCheck(MoveFuncs.moveInRight);
    return reachableTileIDs;
};
export default MovementService;
//# sourceMappingURL=movementService.js.map