import Boards from "./board.js";
import Tiles from "./tile.js";
import Pieces from "./pieces.js";
import { PieceData, PieceTypes } from "./pieceData.js";
const mod = (a, b) => { return (a % b + b) % b; };
const floor = Math.floor;
class MovementService {
    static getPossibleMovesFunction(boardIndex, tileID, pieceType, hasCrossed, hasMoved) {
        return MovementService.PossibleMovesFunctions[pieceType](boardIndex, tileID, hasCrossed, hasMoved);
    }
    static getPossibleAttacksFunction(boardIndex, tileID, playerID, pieceType, hasCrossed, hasMoved) {
        const possibleAttacksFunction = MovementService.PossibleAttacksFunctions[pieceType];
        return possibleAttacksFunction(boardIndex, tileID, playerID, hasCrossed, hasMoved);
    }
    static getPossibleTilesFunction(boardIndex, tileID, pieceType, hasCrossed, hasMoved) {
        return MovementService.PossibleTilesFunctions[pieceType](boardIndex, tileID, hasCrossed, hasMoved);
    }
    static getMoatIDs(boardIndex, sector0ID, sector1ID) {
        const columnCount = Boards.ColumnCounts[boardIndex];
        const columnsPerPlayer = Boards.ColumnCountPerPlayers[boardIndex];
        const rowCount = Boards.RowCounts[boardIndex];
        const maxRowID = (rowCount - 1) * columnCount;
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
        const columnCount = Boards.ColumnCounts[boardIndex];
        const columnsPerPlayer = Boards.ColumnCountPerPlayers[boardIndex];
        const rowCount = Boards.RowCounts[boardIndex];
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
MovementService.PossibleTilesFunctions = [];
var MoveFuncs;
(function (MoveFuncs) {
    MoveFuncs[MoveFuncs["moveIn"] = 0] = "moveIn";
    MoveFuncs[MoveFuncs["moveRight"] = 1] = "moveRight";
    MoveFuncs[MoveFuncs["moveInRight"] = 2] = "moveInRight";
    MoveFuncs[MoveFuncs["moveInLeft"] = 3] = "moveInLeft";
})(MoveFuncs || (MoveFuncs = {}));
function getMoatIDs(boardIndex, tileID) {
    const columnCount = Boards.ColumnCounts[boardIndex];
    const columnsPerPlayer = Boards.ColumnCountPerPlayers[boardIndex];
    const rowCount = Boards.RowCounts[boardIndex];
    const moatID = (rowCount - 1) * columnCount + floor(mod(tileID, columnCount) / columnsPerPlayer) * columnsPerPlayer;
    return [moatID, moatID + columnsPerPlayer - 1];
}
function crossedBorders(boardIndex, tile0ID, tile1ID) {
    const columnCount = Boards.ColumnCounts[boardIndex];
    const columnsPerPlayer = Boards.ColumnCountPerPlayers[boardIndex];
    const rowCount = Boards.RowCounts[boardIndex];
    const sector0ID = floor(mod(tile0ID, columnCount) / columnsPerPlayer);
    const sector1ID = floor(mod(tile1ID, columnCount) / columnsPerPlayer);
    if (sector0ID === sector1ID)
        return [undefined, undefined];
    const row0 = floor(tile0ID / columnCount);
    const row1 = floor(tile1ID / columnCount);
    const moatRow = rowCount - 1;
    const creekRow = rowCount - 3;
    const avg = (row0 + row1) / 2;
    const loopsAround = tile0ID === 0 || tile1ID === 0;
    const moatID = columnCount * (rowCount - 1) + Math.max((+loopsAround) * sector0ID, (+loopsAround) * sector0ID) * columnsPerPlayer;
    return [avg >= moatRow ? moatID : undefined, avg >= creekRow ? moatID : undefined];
}
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
    const newTileID = Math.round(columnCount * (mod(tileID / columnCount + 0.5 * isCrossed, 1) + isCrossed * (1 + 2 * flooredDR) + flooredDR));
    if (newTileID < Boards.TileIndices[boardIndex].length)
        return newTileID;
};
MovementService.MoveFunctions[MoveFuncs.moveRight] = (boardIndex, tileID, amount) => {
    const columnCount = Boards.ColumnCounts[boardIndex];
    return Math.round(mod(tileID + amount, columnCount) + floor(tileID / columnCount) * columnCount);
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
    return Math.round(mod(tileT - rowDelta + moveT, columnCount) + (maxRow - moveR) * columnCount);
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
    return Math.round(mod(tileT + rowDelta - moveT, columnCount) + (maxRow - moveR) * columnCount);
};
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
MovementService.PossibleMovesFunctions[PieceTypes.Knight] = (boardIndex, tileID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const frontCheck = (moveFuncIndex, pathLength, startTileID, sign) => {
        let lastTileID = startTileID;
        for (let i = 1; i <= pathLength; i++) {
            const nextTileID = MovementService.MoveFunctions[moveFuncIndex](boardIndex, startTileID, sign * i);
            if (nextTileID === undefined || reachableTileIDs.indexOf(nextTileID) !== -1) {
                lastTileID = startTileID;
                continue;
            }
            const [moatID, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
            if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false) {
                lastTileID = startTileID;
                continue;
            }
            if (creekID !== undefined && PieceData[PieceTypes.Knight].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false) {
                lastTileID = startTileID;
                continue;
            }
            lastTileID = nextTileID;
        }
        return lastTileID !== startTileID ? lastTileID : undefined;
    };
    const backFrontSidesCheck = (moveFunc0Index, moveFunc1Index, path0Length, path1Length) => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTile0ID = frontCheck(moveFunc0Index, path0Length, tileID, i);
            if (lastTile0ID === undefined)
                continue;
            for (let j = -1; j <= 1; j += 2) {
                let lastTile1ID = frontCheck(moveFunc1Index, path1Length, lastTile0ID, j);
                if (lastTile1ID === undefined || lastTile1ID === lastTile0ID)
                    continue;
                const nextTileIndex = Boards.TileIndices[boardIndex][lastTile1ID];
                const nextPieceIndex = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex !== undefined)
                    continue;
                reachableTileIDs.push(lastTile1ID);
            }
        }
    };
    backFrontSidesCheck(MoveFuncs.moveRight, MoveFuncs.moveIn, 2, 1);
    backFrontSidesCheck(MoveFuncs.moveIn, MoveFuncs.moveRight, 2, 1);
    return reachableTileIDs;
};
MovementService.PossibleMovesFunctions[PieceTypes.Bishop] = (boardIndex, tileID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const backFrontCheck = (moveFuncIndex, pathLength) => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTileID = tileID;
            for (let j = 1; j < pathLength; j++) {
                const nextTileID = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i * j);
                if (nextTileID === undefined)
                    break;
                const [_, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
                if (creekID !== undefined && PieceData[PieceTypes.Queen].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false)
                    break;
                const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex !== undefined)
                    break;
                if (reachableTileIDs.indexOf(nextTileID) === -1)
                    reachableTileIDs.push(nextTileID);
                lastTileID = nextTileID;
            }
        }
    };
    const inLeftPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInLeft](boardIndex);
    backFrontCheck(MoveFuncs.moveInLeft, inLeftPathLength);
    const inRightPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInRight](boardIndex);
    backFrontCheck(MoveFuncs.moveInRight, inRightPathLength);
    return reachableTileIDs;
};
MovementService.PossibleMovesFunctions[PieceTypes.Rook] = (boardIndex, tileID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const backFrontCheck = (moveFuncIndex, pathLength) => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTileID = tileID;
            for (let j = 1; j < pathLength; j++) {
                const nextTileID = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i * j);
                if (nextTileID === undefined)
                    break;
                const [moatID, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
                if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false)
                    break;
                if (creekID !== undefined && PieceData[PieceTypes.Queen].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false)
                    break;
                const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex !== undefined)
                    break;
                if (reachableTileIDs.indexOf(nextTileID) === -1)
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
MovementService.PossibleMovesFunctions[PieceTypes.Queen] = (boardIndex, tileID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const backFrontCheck = (moveFuncIndex, pathLength) => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTileID = tileID;
            for (let j = 1; j < pathLength; j++) {
                const nextTileID = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i * j);
                if (nextTileID === undefined)
                    break;
                const [moatID, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
                if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false)
                    break;
                if (creekID !== undefined && PieceData[PieceTypes.Queen].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false)
                    break;
                const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex !== undefined)
                    break;
                if (reachableTileIDs.indexOf(nextTileID) === -1)
                    reachableTileIDs.push(nextTileID);
                lastTileID = nextTileID;
            }
        }
    };
    const rightPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveRight](boardIndex);
    backFrontCheck(MoveFuncs.moveRight, rightPathLength);
    const inPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveIn](boardIndex);
    backFrontCheck(MoveFuncs.moveIn, inPathLength);
    const inLeftPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInLeft](boardIndex);
    backFrontCheck(MoveFuncs.moveInLeft, inLeftPathLength);
    const inRightPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInRight](boardIndex);
    backFrontCheck(MoveFuncs.moveInRight, inRightPathLength);
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
                continue;
            if (Tiles.AttackedBy[nextTileIndex].length !== 0)
                continue;
            const [moatID, creekID] = crossedBorders(boardIndex, tileID, nextTileID);
            if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false)
                continue;
            if (creekID !== undefined && PieceData[PieceTypes.King].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false)
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
MovementService.PossibleAttacksFunctions[PieceTypes.Pawn] = (boardIndex, tileID, playerID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const playerIndex = Boards.PlayerIndices[boardIndex][playerID];
    const sign = 1 - 2 * +(hasCrossed || false);
    const frontCheck = (moveFuncIndex) => {
        const nextTileID = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, sign * 1);
        if (nextTileID === undefined || reachableTileIDs.indexOf(nextTileID) !== -1)
            return;
        const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
        const nextPieceIndex = Tiles.Occupations[nextTileIndex];
        if (nextPieceIndex === undefined || Pieces.PlayerIndices[nextPieceIndex] === playerIndex)
            return;
        const [_, creekID] = crossedBorders(boardIndex, tileID, nextTileID);
        if (creekID !== undefined && PieceData[PieceTypes.Pawn].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false && hasCrossed === false)
            return;
        reachableTileIDs.push(nextTileID);
    };
    frontCheck(MoveFuncs.moveInLeft);
    frontCheck(MoveFuncs.moveInRight);
    return reachableTileIDs;
};
MovementService.PossibleAttacksFunctions[PieceTypes.Knight] = (boardIndex, tileID, playerID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const playerIndex = Boards.PlayerIndices[boardIndex][playerID];
    const frontCheck = (moveFuncIndex, pathLength, startTileID, sign) => {
        let lastTileID = startTileID;
        for (let i = 1; i <= pathLength; i++) {
            const nextTileID = MovementService.MoveFunctions[moveFuncIndex](boardIndex, startTileID, sign * i);
            if (nextTileID === undefined || reachableTileIDs.indexOf(nextTileID) !== -1) {
                lastTileID = startTileID;
                continue;
            }
            ;
            const [moatID, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
            if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false) {
                lastTileID = startTileID;
                continue;
            }
            if (creekID !== undefined && PieceData[PieceTypes.Knight].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false) {
                lastTileID = startTileID;
                continue;
            }
            lastTileID = nextTileID;
        }
        return lastTileID !== startTileID ? lastTileID : undefined;
    };
    const backFrontSidesCheck = (moveFunc0Index, moveFunc1Index, path0Length, path1Length) => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTile0ID = frontCheck(moveFunc0Index, path0Length, tileID, i);
            if (lastTile0ID === undefined)
                continue;
            for (let j = -1; j <= 1; j += 2) {
                let lastTile1ID = frontCheck(moveFunc1Index, path1Length, lastTile0ID, j);
                if (lastTile1ID === undefined || lastTile1ID === lastTile0ID)
                    continue;
                const nextTileIndex = Boards.TileIndices[boardIndex][lastTile1ID];
                const nextPieceIndex = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex === undefined || Pieces.PlayerIndices[nextPieceIndex] === playerIndex)
                    continue;
                reachableTileIDs.push(lastTile1ID);
            }
        }
    };
    backFrontSidesCheck(MoveFuncs.moveRight, MoveFuncs.moveIn, 2, 1);
    backFrontSidesCheck(MoveFuncs.moveIn, MoveFuncs.moveRight, 2, 1);
    return reachableTileIDs;
};
MovementService.PossibleAttacksFunctions[PieceTypes.Bishop] = (boardIndex, tileID, playerID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const playerIndex = Boards.PlayerIndices[boardIndex][playerID];
    const backFrontCheck = (moveFuncIndex, pathLength) => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTileID = tileID;
            for (let j = 1; j < pathLength; j++) {
                const nextTileID = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i * j);
                if (nextTileID === undefined)
                    break;
                const [_, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
                if (creekID !== undefined && PieceData[PieceTypes.Rook].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false)
                    break;
                const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex === undefined) {
                    lastTileID = nextTileID;
                    continue;
                }
                if (Pieces.PlayerIndices[nextPieceIndex] === playerIndex)
                    break;
                if (reachableTileIDs.indexOf(nextTileID) === -1)
                    reachableTileIDs.push(nextTileID);
                break;
            }
        }
    };
    const inLeftPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInLeft](boardIndex);
    backFrontCheck(MoveFuncs.moveInLeft, inLeftPathLength);
    const inRightPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInRight](boardIndex);
    backFrontCheck(MoveFuncs.moveInRight, inRightPathLength);
    return reachableTileIDs;
};
MovementService.PossibleAttacksFunctions[PieceTypes.Rook] = (boardIndex, tileID, playerID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const playerIndex = Boards.PlayerIndices[boardIndex][playerID];
    const backFrontCheck = (moveFuncIndex, pathLength) => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTileID = tileID;
            for (let j = 1; j < pathLength; j++) {
                const nextTileID = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i * j);
                if (nextTileID === undefined)
                    break;
                const [moatID, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
                if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false)
                    break;
                if (creekID !== undefined && PieceData[PieceTypes.Rook].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false)
                    break;
                const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex === undefined) {
                    lastTileID = nextTileID;
                    continue;
                }
                if (Pieces.PlayerIndices[nextPieceIndex] === playerIndex)
                    break;
                if (reachableTileIDs.indexOf(nextTileID) === -1)
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
MovementService.PossibleAttacksFunctions[PieceTypes.Queen] = (boardIndex, tileID, playerID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const playerIndex = Boards.PlayerIndices[boardIndex][playerID];
    const backFrontCheck = (moveFuncIndex, pathLength) => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTileID = tileID;
            for (let j = 1; j < pathLength; j++) {
                const nextTileID = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i * j);
                if (nextTileID === undefined)
                    break;
                const [moatID, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
                if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false)
                    break;
                if (creekID !== undefined && PieceData[PieceTypes.Rook].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false)
                    break;
                const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex === undefined) {
                    lastTileID = nextTileID;
                    continue;
                }
                if (Pieces.PlayerIndices[nextPieceIndex] === playerIndex)
                    break;
                if (reachableTileIDs.indexOf(nextTileID) === -1)
                    reachableTileIDs.push(nextTileID);
                break;
            }
        }
    };
    const rightPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveRight](boardIndex);
    backFrontCheck(MoveFuncs.moveRight, rightPathLength);
    const inPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveIn](boardIndex);
    backFrontCheck(MoveFuncs.moveIn, inPathLength);
    const inLeftPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInLeft](boardIndex);
    backFrontCheck(MoveFuncs.moveInLeft, inLeftPathLength);
    const inRightPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInRight](boardIndex);
    backFrontCheck(MoveFuncs.moveInRight, inRightPathLength);
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
            if (Tiles.AttackedBy[nextTileIndex].length !== 0)
                continue;
            const [moatID, creekID] = crossedBorders(boardIndex, tileID, nextTileID);
            if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false)
                continue;
            if (creekID !== undefined && PieceData[PieceTypes.King].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false)
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
MovementService.PossibleTilesFunctions[PieceTypes.Pawn] = (boardIndex, tileID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const sign = 1 - 2 * +(hasCrossed || false);
    const frontCheck = (moveFuncIndex) => {
        const nextTileID = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, sign * 1);
        if (nextTileID === undefined)
            return;
        const [_, creekID] = crossedBorders(boardIndex, tileID, nextTileID);
        if (creekID !== undefined && PieceData[PieceTypes.Pawn].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false && hasCrossed === false)
            return;
        reachableTileIDs.push(nextTileID);
    };
    frontCheck(MoveFuncs.moveInLeft);
    frontCheck(MoveFuncs.moveInRight);
    return reachableTileIDs;
};
MovementService.PossibleTilesFunctions[PieceTypes.Knight] = (boardIndex, tileID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const frontCheck = (moveFuncIndex, pathLength, startTileID, sign) => {
        let lastTileID = startTileID;
        for (let i = 1; i <= pathLength; i++) {
            const nextTileID = MovementService.MoveFunctions[moveFuncIndex](boardIndex, startTileID, sign * i);
            if (nextTileID === undefined || reachableTileIDs.indexOf(nextTileID) !== -1) {
                lastTileID = startTileID;
                continue;
            }
            ;
            const [moatID, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
            if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false) {
                lastTileID = startTileID;
                continue;
            }
            if (creekID !== undefined && PieceData[PieceTypes.Knight].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false) {
                lastTileID = startTileID;
                continue;
            }
            lastTileID = nextTileID;
        }
        return lastTileID !== startTileID ? lastTileID : undefined;
    };
    const backFrontSidesCheck = (moveFunc0Index, moveFunc1Index, path0Length, path1Length) => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTile0ID = frontCheck(moveFunc0Index, path0Length, tileID, i);
            if (lastTile0ID === undefined)
                continue;
            for (let j = -1; j <= 1; j += 2) {
                let lastTile1ID = frontCheck(moveFunc1Index, path1Length, lastTile0ID, j);
                if (lastTile1ID === undefined || lastTile1ID === lastTile0ID)
                    continue;
                reachableTileIDs.push(lastTile1ID);
            }
        }
    };
    backFrontSidesCheck(MoveFuncs.moveRight, MoveFuncs.moveIn, 2, 1);
    backFrontSidesCheck(MoveFuncs.moveIn, MoveFuncs.moveRight, 2, 1);
    return reachableTileIDs;
};
MovementService.PossibleTilesFunctions[PieceTypes.Bishop] = (boardIndex, tileID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const backFrontCheck = (moveFuncIndex, pathLength) => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTileID = tileID;
            for (let j = 1; j < pathLength; j++) {
                const nextTileID = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i * j);
                if (nextTileID === undefined)
                    break;
                const [_, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
                if (creekID !== undefined && PieceData[PieceTypes.Bishop].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false)
                    break;
                if (reachableTileIDs.indexOf(nextTileID) === -1)
                    reachableTileIDs.push(nextTileID);
                const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex !== undefined)
                    break;
                lastTileID = nextTileID;
            }
        }
    };
    const inLeftPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInLeft](boardIndex);
    backFrontCheck(MoveFuncs.moveInLeft, inLeftPathLength);
    const inRightPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInRight](boardIndex);
    backFrontCheck(MoveFuncs.moveInRight, inRightPathLength);
    return reachableTileIDs;
};
MovementService.PossibleTilesFunctions[PieceTypes.Rook] = (boardIndex, tileID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const backFrontCheck = (moveFuncIndex, pathLength) => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTileID = tileID;
            for (let j = 1; j < pathLength; j++) {
                const nextTileID = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i * j);
                if (nextTileID === undefined)
                    break;
                const [moatID, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
                if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false)
                    break;
                if (creekID !== undefined && PieceData[PieceTypes.Rook].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false)
                    break;
                if (reachableTileIDs.indexOf(nextTileID) === -1)
                    reachableTileIDs.push(nextTileID);
                const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex = Tiles.Occupations[nextTileIndex];
                console.log("nextPieceIndex !== undefined:", nextPieceIndex !== undefined, "nextTileID:", nextTileID);
                if (nextPieceIndex !== undefined)
                    break;
                lastTileID = nextTileID;
            }
        }
    };
    const inPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveIn](boardIndex);
    backFrontCheck(MoveFuncs.moveIn, inPathLength);
    const rightPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveRight](boardIndex);
    backFrontCheck(MoveFuncs.moveRight, rightPathLength);
    return reachableTileIDs;
};
MovementService.PossibleTilesFunctions[PieceTypes.Queen] = (boardIndex, tileID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const backFrontCheck = (moveFuncIndex, pathLength) => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTileID = tileID;
            for (let j = 1; j < pathLength; j++) {
                const nextTileID = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i * j);
                if (nextTileID === undefined)
                    break;
                const [moatID, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
                if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false)
                    break;
                if (creekID !== undefined && PieceData[PieceTypes.Queen].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false)
                    break;
                if (reachableTileIDs.indexOf(nextTileID) === -1)
                    reachableTileIDs.push(nextTileID);
                const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex !== undefined)
                    break;
                lastTileID = nextTileID;
            }
        }
    };
    const inPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveIn](boardIndex);
    backFrontCheck(MoveFuncs.moveIn, inPathLength);
    const rightPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveRight](boardIndex);
    backFrontCheck(MoveFuncs.moveRight, rightPathLength);
    const inLeftPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInLeft](boardIndex);
    backFrontCheck(MoveFuncs.moveInLeft, inLeftPathLength);
    const inRightPathLength = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInRight](boardIndex);
    backFrontCheck(MoveFuncs.moveInRight, inRightPathLength);
    return reachableTileIDs;
};
MovementService.PossibleTilesFunctions[PieceTypes.King] = (boardIndex, tileID, hasCrossed, hasMoved) => {
    const reachableTileIDs = [];
    const backFrontCheck = (moveFuncIndex) => {
        for (let i = -1; i <= 1; i += 2) {
            const nextTileID = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i);
            if (nextTileID === undefined || reachableTileIDs.indexOf(nextTileID) !== -1)
                continue;
            const [moatID, creekID] = crossedBorders(boardIndex, tileID, nextTileID);
            if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false)
                continue;
            if (creekID !== undefined && PieceData[PieceTypes.King].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false)
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