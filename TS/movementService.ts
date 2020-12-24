import Boards from "./board.js";
import Tiles from "./tile.js";
import Pieces from "./pieces.js";
import { PieceData, PieceTypes } from "./pieceData.js";
import Players from "./player.js";

const mod: (a: number, b: number) => number = (a, b) => { return (a % b + b) % b };
const floor: (x: number) => number = Math.floor;

// function containsUnorderedTuple(array: Array<any>, tuple: Array<any>): boolean {
//     let tupleInstance: Array<any> = tuple;

//     for (let i = 0; i < array.length; i++) {
//         const index: number = tupleInstance.indexOf(array[i]);
//         if (index === -1) { tupleInstance = tuple; continue; }

//         tupleInstance.splice(index, 1);
//         if (tuple.length === 0) return true;
//     }

//     return false;
// }

// function includesTuple(array: Array<any>, tuple: Array<any>): boolean {
//     let index = 0;

//     const length: number = tuple.length;
//     for (let i = 0; i < array.length; i++) {
//         if (array[i] !== tuple[index]) { index = 0; continue; }

//         if (index === length) return true;
//     }

//     return false;
// }

type MoveFunc = (boardIndex: number, tileID: number, amount: number) => number | undefined;
type PossibleMovesFunc = Array<(boardIndex: number, tileID: number, hasCrossed?: boolean, hasMoved?: boolean) => Array<number>>;
type PossibleAttacksFunc = Array<((boardIndex: number, tileID: number, playerID: number, hasCrossed?: boolean, hasMoved?: boolean) => Array<number>)>;
type PossibleTilesFunc = Array<(boardIndex: number, tileID: number, hasCrossed?: boolean, hasMoved?: boolean) => Array<number>>;

class MovementService {
    public static MoveFunctions: Array<MoveFunc> = [];
    public static MaxPathLengthFunctions: Array<(boardIndex: number) => number> = [];
    public static PossibleMovesFunctions: PossibleMovesFunc = [];
    public static PossibleAttacksFunctions: PossibleAttacksFunc = [];
    public static PossibleTilesFunctions: PossibleTilesFunc = [];

    public static getPossibleMovesFunction(boardIndex: number, tileID: number, pieceType: PieceTypes, hasCrossed?: boolean, hasMoved?: boolean): Array<number> {
        return MovementService.PossibleMovesFunctions[pieceType](boardIndex, tileID, hasCrossed, hasMoved);
    }

    public static getPossibleAttacksFunction(boardIndex: number, tileID: number, playerID: number, pieceType: PieceTypes, hasCrossed?: boolean, hasMoved?: boolean): Array<number> {
        const possibleAttacksFunction = MovementService.PossibleAttacksFunctions[pieceType];
        return possibleAttacksFunction(boardIndex, tileID, playerID, hasCrossed, hasMoved);
    }

    public static getPossibleTilesFunction(boardIndex: number, tileID: number, pieceType: PieceTypes, hasCrossed?: boolean, hasMoved?: boolean): Array<number> {
        return MovementService.PossibleTilesFunctions[pieceType](boardIndex, tileID, hasCrossed, hasMoved);
    }

    public static getMoatIDs(boardIndex: number, sector0ID: number, sector1ID: number): Array<[number | undefined, number | undefined]> {
        const columnCount: number = Boards.ColumnCounts[boardIndex];
        const columnsPerPlayer: number = Boards.ColumnCountPerPlayers[boardIndex];
        const rowCount: number = Boards.RowCounts[boardIndex];
        const maxRowID: number = (rowCount - 1) * columnCount;

        const moatIDTuples: Array<[number | undefined, number | undefined]> = [];
        for(let i = 0; i < mod(sector1ID - sector0ID, columnsPerPlayer); i++) {
            const v1: number | undefined = MovementService.MoveFunctions[MoveFuncs.moveRight](boardIndex, maxRowID, (1 + sector0ID + i)*columnsPerPlayer - 1);
            const v2: number | undefined = MovementService.MoveFunctions[MoveFuncs.moveRight](boardIndex, maxRowID, (1 + sector0ID + i)*columnsPerPlayer);

            moatIDTuples.push([v1, v2]);
        }

        return moatIDTuples;
    }

    private static moatCanBridge(boardIndex: number, sectorID: number, fromLeft?: boolean): boolean {
        fromLeft = fromLeft || false;

        const columnCount: number = Boards.ColumnCounts[boardIndex];
        const columnsPerPlayer: number = Boards.ColumnCountPerPlayers[boardIndex];
        const rowCount: number = Boards.RowCounts[boardIndex];
        const playerIndex: number = Boards.PlayerIndices[boardIndex][sectorID];

        const sign: number = 2 * (+fromLeft) - 1;
        const tileID: number = (rowCount - 1) * columnCount + sectorID * columnsPerPlayer + (+fromLeft) * (columnsPerPlayer - 1);
        for (let i = 1; i < columnsPerPlayer + 1; i++) {
            const nextTileID: number | undefined = MovementService.MoveFunctions[MoveFuncs.moveRight](boardIndex, tileID, sign * i);
            if (nextTileID === undefined) continue;

            const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
            const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
            if (nextPieceIndex === undefined) continue;

            const nextPlayerIndex: number = Pieces.PlayerIndices[nextPieceIndex];
            if (playerIndex === nextPlayerIndex) return false;
        }

        return true;
    }

    public static moveTileOccupant(boardIndex: number, oldTileID: number, newTileID: number): void {
        const oldTileIndex: number = Boards.TileIndices[boardIndex][oldTileID];
        const newTileIndex: number = Boards.TileIndices[boardIndex][newTileID];

        const pieceIndex: number | undefined = Tiles.Occupations[oldTileIndex];

        Tiles.Occupations[oldTileIndex] = undefined;
        Tiles.Occupations[newTileIndex] = pieceIndex;
    }
}

enum MoveFuncs {
    moveIn = 0,
    moveRight,
    moveInRight,
    moveInLeft
}

function getMoatIDs(boardIndex: number, tileID: number): [number, number] {
    const columnCount: number = Boards.ColumnCounts[boardIndex];
    const columnsPerPlayer: number = Boards.ColumnCountPerPlayers[boardIndex];
    const rowCount: number = Boards.RowCounts[boardIndex];

    const moatID: number = (rowCount - 1)*columnCount + floor(mod(tileID, columnCount)/columnsPerPlayer)*columnsPerPlayer;
    
    return [moatID, moatID + columnsPerPlayer - 1];
}

function crossedBorders(boardIndex: number, tile0ID: number, tile1ID: number): [number | undefined, number | undefined] {
    const columnCount: number = Boards.ColumnCounts[boardIndex];
    const columnsPerPlayer: number = Boards.ColumnCountPerPlayers[boardIndex];
    const rowCount: number = Boards.RowCounts[boardIndex];
    
    const sector0ID: number = floor(mod(tile0ID, columnCount)/columnsPerPlayer);
    const sector1ID: number = floor(mod(tile1ID, columnCount)/columnsPerPlayer);
    if (sector0ID === sector1ID) return [undefined, undefined];
    
    const row0: number = floor(tile0ID/columnCount);
    const row1: number = floor(tile1ID/columnCount);
    const moatRow: number = rowCount - 1;
    const creekRow: number = rowCount - 3;
    const avg: number = (row0 + row1)/2;

    const loopsAround: boolean = tile0ID === 0 || tile1ID === 0;
    const moatID: number = columnCount*(rowCount - 1) + Math.max((+loopsAround)*sector0ID, (+loopsAround)*sector0ID)*columnsPerPlayer;

    return [avg >= moatRow ? moatID : undefined, avg >= creekRow ? moatID : undefined];
}

////////////////////////////////
////////////////////////////////
//                            //
//    Path Length Functions   //
//                            //
////////////////////////////////
////////////////////////////////

MovementService.MaxPathLengthFunctions[MoveFuncs.moveIn] = (boardIndex: number): number => {
    return 2 * Boards.RowCounts[boardIndex];
}

MovementService.MaxPathLengthFunctions[MoveFuncs.moveRight] = (boardIndex: number): number => {
    return Boards.ColumnCounts[boardIndex] - 1;
}

MovementService.MaxPathLengthFunctions[MoveFuncs.moveInRight] = (boardIndex: number): number => {
    return 2 * (Boards.RowCounts[boardIndex] - 1);
}

MovementService.MaxPathLengthFunctions[MoveFuncs.moveInLeft] = (boardIndex: number): number => {
    return 2 * (Boards.RowCounts[boardIndex] - 1);
}

////////////////////////////////
////////////////////////////////
//                            //
//       Move Functions       //
//                            //
////////////////////////////////
////////////////////////////////

MovementService.MoveFunctions[MoveFuncs.moveIn] = (boardIndex: number, tileID: number, amount: number): number | undefined => {
    const columnCount: number = Boards.ColumnCounts[boardIndex];
    const diffRatio: number = tileID / columnCount - amount;
    const isCrossed: number = floor(0.5 * Math.sign(diffRatio));
    const flooredDR: number = floor(diffRatio);

    const newTileID: number = Math.round(columnCount * (mod(tileID / columnCount + 0.5 * isCrossed, 1) + isCrossed * (1 + 2 * flooredDR) + flooredDR));

    if (newTileID < Boards.TileIndices[boardIndex].length) return newTileID;
}

MovementService.MoveFunctions[MoveFuncs.moveRight] = (boardIndex: number, tileID: number, amount: number): number => {
    const columnCount: number = Boards.ColumnCounts[boardIndex];

    return Math.round(mod(tileID + amount, columnCount) + floor(tileID / columnCount) * columnCount);
}

MovementService.MoveFunctions[MoveFuncs.moveInRight] = (boardIndex: number, tileID: number, amount: number): number => {
    const columnCount: number = Boards.ColumnCounts[boardIndex];
    const rowCount: number = Boards.RowCounts[boardIndex];
    const maxRow: number = rowCount - 1;
    const tileT: number = mod(tileID, columnCount);
    const tileR: number = floor(tileID / columnCount);
    const rowDelta: number = rowCount - (tileR + 1);
    const moveT: number = mod(rowDelta + amount + maxRow, 2 * maxRow + 1) - maxRow;
    const moveR: number = Math.abs(moveT);

    return Math.round(mod(tileT - rowDelta + moveT, columnCount) + (maxRow - moveR) * columnCount);
}

MovementService.MoveFunctions[MoveFuncs.moveInLeft] = (boardIndex: number, tileID: number, amount: number): number => {
    const columnCount: number = Boards.ColumnCounts[boardIndex];
    const rowCount: number = Boards.RowCounts[boardIndex];
    const maxRow: number = rowCount - 1;
    const tileT: number = tileID % columnCount;
    const tileR: number = floor(tileID / columnCount);
    const rowDelta: number = rowCount - (tileR + 1);
    const moveT: number = mod(rowDelta + amount + maxRow, 2 * maxRow + 1) - maxRow;
    const moveR: number = Math.abs(moveT);

    return Math.round(mod(tileT + rowDelta - moveT, columnCount) + (maxRow - moveR) * columnCount);
}

////////////////////////////////
////////////////////////////////
//                            //
//  Possible Moves Functions  //
//                            //
////////////////////////////////
////////////////////////////////

MovementService.PossibleMovesFunctions[PieceTypes.Pawn] = (boardIndex: number, tileID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const sign: number = 1 - 2 * +(hasCrossed || false);

    for (let i = 1; i <= 1 + +!hasMoved; i++) {
        const nextTileID: number | undefined = MovementService.MoveFunctions[MoveFuncs.moveIn](boardIndex, tileID, sign * i);
        if (nextTileID === undefined) break;

        const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
        const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
        if (nextPieceIndex !== undefined) break;

        reachableTileIDs.push(nextTileID);
    }

    return reachableTileIDs;
}

MovementService.PossibleMovesFunctions[PieceTypes.Knight] = (boardIndex: number, tileID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const frontCheck = (moveFuncIndex: MoveFuncs, pathLength: number, startTileID: number, sign: number): number | undefined => {
        let lastTileID: number = startTileID;
        for (let i = 1; i <= pathLength; i++) {
            const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, startTileID, sign * i); //If a moat / creek tile is undefined the rook will jump right over it
            if (nextTileID === undefined || reachableTileIDs.indexOf(nextTileID) !== -1) { lastTileID = startTileID; continue; }

            const [moatID, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
            if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false) { lastTileID = startTileID; continue; }
            if (creekID !== undefined && PieceData[PieceTypes.Knight].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false) { lastTileID = startTileID; continue; }

            lastTileID = nextTileID;
        }

        return lastTileID !== startTileID ? lastTileID : undefined;
    }

    const backFrontSidesCheck = (moveFunc0Index: MoveFuncs, moveFunc1Index: MoveFuncs, path0Length: number, path1Length: number): void => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTile0ID: number | undefined = frontCheck(moveFunc0Index, path0Length, tileID, i);
            if (lastTile0ID === undefined) continue;

            for (let j = -1; j <= 1; j += 2) {
                let lastTile1ID: number | undefined = frontCheck(moveFunc1Index, path1Length, lastTile0ID, j);
                if (lastTile1ID === undefined || lastTile1ID === lastTile0ID) continue;

                const nextTileIndex: number = Boards.TileIndices[boardIndex][lastTile1ID];
                const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex !== undefined) continue;

                reachableTileIDs.push(lastTile1ID);
            }
        }
    }

    backFrontSidesCheck(MoveFuncs.moveRight, MoveFuncs.moveIn, 2, 1);
    backFrontSidesCheck(MoveFuncs.moveIn, MoveFuncs.moveRight, 2, 1);

    return reachableTileIDs;
}

MovementService.PossibleMovesFunctions[PieceTypes.Bishop] = (boardIndex: number, tileID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const backFrontCheck = (moveFuncIndex: MoveFuncs, pathLength: number): void => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTileID: number = tileID;
            for (let j = 1; j < pathLength; j++) {
                const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i*j);
                if (nextTileID === undefined) break;

                const [_, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
                if (creekID !== undefined && PieceData[PieceTypes.Queen].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false) break;

                const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex !== undefined) break;
                
                if (reachableTileIDs.indexOf(nextTileID) === -1) reachableTileIDs.push(nextTileID);

                lastTileID = nextTileID;
            }
        }
    }

    const inLeftPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInLeft](boardIndex);
    backFrontCheck(MoveFuncs.moveInLeft, inLeftPathLength);

    const inRightPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInRight](boardIndex);
    backFrontCheck(MoveFuncs.moveInRight, inRightPathLength);

    return reachableTileIDs;
}

MovementService.PossibleMovesFunctions[PieceTypes.Rook] = (boardIndex: number, tileID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const backFrontCheck = (moveFuncIndex: MoveFuncs, pathLength: number): void => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTileID: number = tileID;
            for (let j = 1; j < pathLength; j++) {
                const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i*j);
                if (nextTileID === undefined) break;

                const [moatID, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
                if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false) break;
                if (creekID !== undefined && PieceData[PieceTypes.Queen].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false) break;

                const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex !== undefined) break;
                
                if (reachableTileIDs.indexOf(nextTileID) === -1) reachableTileIDs.push(nextTileID);

                lastTileID = nextTileID;
            }
        }
    }

    const rightPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveRight](boardIndex);
    backFrontCheck(MoveFuncs.moveRight, rightPathLength);

    const inPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveIn](boardIndex);
    backFrontCheck(MoveFuncs.moveIn, inPathLength);

    return reachableTileIDs;
}

MovementService.PossibleMovesFunctions[PieceTypes.Queen] = (boardIndex: number, tileID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const backFrontCheck = (moveFuncIndex: MoveFuncs, pathLength: number): void => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTileID: number = tileID;
            for (let j = 1; j < pathLength; j++) {
                const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i*j);
                if (nextTileID === undefined) break;

                const [moatID, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
                if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false) break;
                if (creekID !== undefined && PieceData[PieceTypes.Queen].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false) break;

                const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex !== undefined) break;
                
                if (reachableTileIDs.indexOf(nextTileID) === -1) reachableTileIDs.push(nextTileID);

                lastTileID = nextTileID;
            }
        }
    }

    const rightPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveRight](boardIndex);
    backFrontCheck(MoveFuncs.moveRight, rightPathLength);

    const inPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveIn](boardIndex);
    backFrontCheck(MoveFuncs.moveIn, inPathLength);

    const inLeftPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInLeft](boardIndex);
    backFrontCheck(MoveFuncs.moveInLeft, inLeftPathLength);

    const inRightPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInRight](boardIndex);
    backFrontCheck(MoveFuncs.moveInRight, inRightPathLength);

    return reachableTileIDs;
}

MovementService.PossibleMovesFunctions[PieceTypes.King] = (boardIndex: number, tileID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const backFrontCheck = (moveFuncIndex: MoveFuncs): void => {
        for (let i = -1; i <= 1; i += 2) {
            const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i);
            if (nextTileID === undefined || reachableTileIDs.indexOf(nextTileID) !== -1) continue;

            const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
            const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
            if (nextPieceIndex !== undefined) continue;

            if (Tiles.AttackedBy[nextTileIndex].length !== 0) continue;

            const [moatID, creekID] = crossedBorders(boardIndex, tileID, nextTileID);
            if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false) continue;
            if (creekID !== undefined && PieceData[PieceTypes.King].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false) continue;

            reachableTileIDs.push(nextTileID);
        }
    }

    backFrontCheck(MoveFuncs.moveIn);
    backFrontCheck(MoveFuncs.moveRight);
    backFrontCheck(MoveFuncs.moveInLeft);
    backFrontCheck(MoveFuncs.moveInRight);

    return reachableTileIDs;
}

////////////////////////////////
////////////////////////////////
//                            //
// Possible Attacks Functions //
//                            //
////////////////////////////////
////////////////////////////////

MovementService.PossibleAttacksFunctions[PieceTypes.Pawn] = (boardIndex: number, tileID: number, playerID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const playerIndex: number = Boards.PlayerIndices[boardIndex][playerID];
    const sign: number = 1 - 2 * +(hasCrossed || false);

    const frontCheck = (moveFuncIndex: MoveFuncs): void => {
        const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, sign*1);
        if (nextTileID === undefined || reachableTileIDs.indexOf(nextTileID) !== -1) return;

        const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
        const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
        if (nextPieceIndex === undefined || Pieces.PlayerIndices[nextPieceIndex] === playerIndex) return;

        const [_, creekID] = crossedBorders(boardIndex, tileID, nextTileID);
        if (creekID !== undefined && PieceData[PieceTypes.Pawn].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false && hasCrossed === false) return;

        reachableTileIDs.push(nextTileID);
    }

    frontCheck(MoveFuncs.moveInLeft);
    frontCheck(MoveFuncs.moveInRight);

    return reachableTileIDs;
}

MovementService.PossibleAttacksFunctions[PieceTypes.Knight] = (boardIndex: number, tileID: number, playerID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const playerIndex: number = Boards.PlayerIndices[boardIndex][playerID];

    const frontCheck = (moveFuncIndex: MoveFuncs, pathLength: number, startTileID: number, sign: number): number | undefined => {
        let lastTileID: number = startTileID;
        for (let i = 1; i <= pathLength; i++) {
            const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, startTileID, sign * i); //If a moat / creek tile is undefined the rook will jump right over it
            if (nextTileID === undefined || reachableTileIDs.indexOf(nextTileID) !== -1) { lastTileID = startTileID; continue; };

            const [moatID, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
            if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false) { lastTileID = startTileID; continue; }
            if (creekID !== undefined && PieceData[PieceTypes.Knight].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false) { lastTileID = startTileID; continue; }

            lastTileID = nextTileID;
        }

        return lastTileID !== startTileID ? lastTileID : undefined;
    }

    const backFrontSidesCheck = (moveFunc0Index: MoveFuncs, moveFunc1Index: MoveFuncs, path0Length: number, path1Length: number): void => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTile0ID: number | undefined = frontCheck(moveFunc0Index, path0Length, tileID, i);
            if (lastTile0ID === undefined) continue;

            for (let j = -1; j <= 1; j += 2) {
                let lastTile1ID: number | undefined = frontCheck(moveFunc1Index, path1Length, lastTile0ID, j);
                if (lastTile1ID === undefined || lastTile1ID === lastTile0ID) continue;

                const nextTileIndex: number = Boards.TileIndices[boardIndex][lastTile1ID];
                const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex === undefined || Pieces.PlayerIndices[nextPieceIndex] === playerIndex) continue;

                reachableTileIDs.push(lastTile1ID);
            }
        }
    }

    backFrontSidesCheck(MoveFuncs.moveRight, MoveFuncs.moveIn, 2, 1);
    backFrontSidesCheck(MoveFuncs.moveIn, MoveFuncs.moveRight, 2, 1);

    return reachableTileIDs;
}

MovementService.PossibleAttacksFunctions[PieceTypes.Bishop] = (boardIndex: number, tileID: number, playerID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const playerIndex: number = Boards.PlayerIndices[boardIndex][playerID];

    const backFrontCheck = (moveFuncIndex: MoveFuncs, pathLength: number): void => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTileID: number = tileID;
            for (let j = 1; j < pathLength; j++) {
                const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i*j);
                if (nextTileID === undefined) break;

                const [_, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
                if (creekID !== undefined && PieceData[PieceTypes.Rook].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false) break;

                const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex === undefined) { lastTileID = nextTileID; continue; }

                if (Pieces.PlayerIndices[nextPieceIndex] === playerIndex) break;

                if (reachableTileIDs.indexOf(nextTileID) === -1) reachableTileIDs.push(nextTileID);
                break;
            }
        }
    }

    const inLeftPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInLeft](boardIndex);
    backFrontCheck(MoveFuncs.moveInLeft, inLeftPathLength);

    const inRightPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInRight](boardIndex);
    backFrontCheck(MoveFuncs.moveInRight, inRightPathLength);

    return reachableTileIDs;
}

MovementService.PossibleAttacksFunctions[PieceTypes.Rook] = (boardIndex: number, tileID: number, playerID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const playerIndex: number = Boards.PlayerIndices[boardIndex][playerID];

    const backFrontCheck = (moveFuncIndex: MoveFuncs, pathLength: number): void => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTileID: number = tileID;
            for (let j = 1; j < pathLength; j++) {
                const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i*j);
                if (nextTileID === undefined) break;

                const [moatID, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
                if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false) break;
                if (creekID !== undefined && PieceData[PieceTypes.Rook].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false) break;

                const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex === undefined) { lastTileID = nextTileID; continue; }

                if (Pieces.PlayerIndices[nextPieceIndex] === playerIndex) break;

                if (reachableTileIDs.indexOf(nextTileID) === -1) reachableTileIDs.push(nextTileID);
                break;
            }
        }
    }

    const rightPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveRight](boardIndex);
    backFrontCheck(MoveFuncs.moveRight, rightPathLength);

    const inPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveIn](boardIndex);
    backFrontCheck(MoveFuncs.moveIn, inPathLength);

    return reachableTileIDs;
}

MovementService.PossibleAttacksFunctions[PieceTypes.Queen] = (boardIndex: number, tileID: number, playerID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const playerIndex: number = Boards.PlayerIndices[boardIndex][playerID];

    const backFrontCheck = (moveFuncIndex: MoveFuncs, pathLength: number): void => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTileID: number = tileID;
            for (let j = 1; j < pathLength; j++) {
                const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i*j);
                if (nextTileID === undefined) break;

                const [moatID, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
                if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false) break;
                if (creekID !== undefined && PieceData[PieceTypes.Rook].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false) break;

                const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex === undefined) { lastTileID = nextTileID; continue; }

                if (Pieces.PlayerIndices[nextPieceIndex] === playerIndex) break;

                if (reachableTileIDs.indexOf(nextTileID) === -1) reachableTileIDs.push(nextTileID);
                break;
            }
        }
    }

    const rightPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveRight](boardIndex);
    backFrontCheck(MoveFuncs.moveRight, rightPathLength);

    const inPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveIn](boardIndex);
    backFrontCheck(MoveFuncs.moveIn, inPathLength);

    const inLeftPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInLeft](boardIndex);
    backFrontCheck(MoveFuncs.moveInLeft, inLeftPathLength);

    const inRightPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInRight](boardIndex);
    backFrontCheck(MoveFuncs.moveInRight, inRightPathLength);

    return reachableTileIDs;
}

MovementService.PossibleAttacksFunctions[PieceTypes.King] = (boardIndex: number, tileID: number, playerID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const playerIndex: number = Boards.PlayerIndices[boardIndex][playerID];

    const backFrontCheck = (moveFuncIndex: MoveFuncs): void => {
        for (let i = -1; i <= 1; i += 2) {
            const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i);
            if (nextTileID === undefined || reachableTileIDs.indexOf(nextTileID) !== -1) continue;

            const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
            const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
            if (nextPieceIndex === undefined || Pieces.PlayerIndices[nextPieceIndex] === playerIndex) continue;

            if (Tiles.AttackedBy[nextTileIndex].length !== 0) continue;

            const [moatID, creekID] = crossedBorders(boardIndex, tileID, nextTileID);
            if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false) continue;
            if (creekID !== undefined && PieceData[PieceTypes.King].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false) continue;

            reachableTileIDs.push(nextTileID);
        }
    }

    backFrontCheck(MoveFuncs.moveIn);
    backFrontCheck(MoveFuncs.moveRight);
    backFrontCheck(MoveFuncs.moveInLeft);
    backFrontCheck(MoveFuncs.moveInRight);

    return reachableTileIDs;
}

////////////////////////////////
////////////////////////////////
//                            //
//  Possible Tiles Functions  //
//                            //
////////////////////////////////
////////////////////////////////

MovementService.PossibleTilesFunctions[PieceTypes.Pawn] = (boardIndex: number, tileID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const sign: number = 1 - 2 * +(hasCrossed || false);

    const frontCheck = (moveFuncIndex: MoveFuncs): void => {
        const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, sign*1);
        if (nextTileID === undefined) return;

        const [_, creekID] = crossedBorders(boardIndex, tileID, nextTileID);
        if (creekID !== undefined && PieceData[PieceTypes.Pawn].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false && hasCrossed === false) return;

        reachableTileIDs.push(nextTileID);
    }

    frontCheck(MoveFuncs.moveInLeft);
    frontCheck(MoveFuncs.moveInRight);

    return reachableTileIDs;
}

MovementService.PossibleTilesFunctions[PieceTypes.Knight] = (boardIndex: number, tileID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const frontCheck = (moveFuncIndex: MoveFuncs, pathLength: number, startTileID: number, sign: number): number | undefined => {
        let lastTileID: number = startTileID;
        for (let i = 1; i <= pathLength; i++) {
            const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, startTileID, sign * i); //If a moat / creek tile is undefined the rook will jump right over it
            if (nextTileID === undefined || reachableTileIDs.indexOf(nextTileID) !== -1) { lastTileID = startTileID; continue; };

            const [moatID, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
            if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false) { lastTileID = startTileID; continue; }
            if (creekID !== undefined && PieceData[PieceTypes.Knight].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false) { lastTileID = startTileID; continue; }

            lastTileID = nextTileID;
        }

        return lastTileID !== startTileID ? lastTileID : undefined;
    }

    const backFrontSidesCheck = (moveFunc0Index: MoveFuncs, moveFunc1Index: MoveFuncs, path0Length: number, path1Length: number): void => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTile0ID: number | undefined = frontCheck(moveFunc0Index, path0Length, tileID, i);
            if (lastTile0ID === undefined) continue;

            for (let j = -1; j <= 1; j += 2) {
                let lastTile1ID: number | undefined = frontCheck(moveFunc1Index, path1Length, lastTile0ID, j);
                if (lastTile1ID === undefined || lastTile1ID === lastTile0ID) continue;

                reachableTileIDs.push(lastTile1ID);
            }
        }
    }

    backFrontSidesCheck(MoveFuncs.moveRight, MoveFuncs.moveIn, 2, 1);
    backFrontSidesCheck(MoveFuncs.moveIn, MoveFuncs.moveRight, 2, 1);

    return reachableTileIDs;
}

MovementService.PossibleTilesFunctions[PieceTypes.Bishop] = (boardIndex: number, tileID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const backFrontCheck = (moveFuncIndex: MoveFuncs, pathLength: number): void => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTileID: number = tileID;
            for (let j = 1; j < pathLength; j++) {
                const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i*j);
                if (nextTileID === undefined) break;

                const [_, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
                if (creekID !== undefined && PieceData[PieceTypes.Bishop].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false) break;

                if (reachableTileIDs.indexOf(nextTileID) === -1) reachableTileIDs.push(nextTileID);

                const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex !== undefined) break;

                lastTileID = nextTileID;
            }
        }
    }

    const inLeftPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInLeft](boardIndex);
    backFrontCheck(MoveFuncs.moveInLeft, inLeftPathLength);

    const inRightPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInRight](boardIndex);
    backFrontCheck(MoveFuncs.moveInRight, inRightPathLength);

    return reachableTileIDs;
}

MovementService.PossibleTilesFunctions[PieceTypes.Rook] = (boardIndex: number, tileID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const backFrontCheck = (moveFuncIndex: MoveFuncs, pathLength: number): void => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTileID: number = tileID;
            for (let j = 1; j < pathLength; j++) {
                const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i*j);
                if (nextTileID === undefined) break;

                const [moatID, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
                if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false) break;
                if (creekID !== undefined && PieceData[PieceTypes.Rook].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false) break;

                if (reachableTileIDs.indexOf(nextTileID) === -1) reachableTileIDs.push(nextTileID);

                const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
                console.log("nextPieceIndex !== undefined:", nextPieceIndex !== undefined, "nextTileID:", nextTileID);
                if (nextPieceIndex !== undefined) break;

                lastTileID = nextTileID;
            }
        }
    }

    const inPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveIn](boardIndex);
    backFrontCheck(MoveFuncs.moveIn, inPathLength);

    const rightPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveRight](boardIndex);
    backFrontCheck(MoveFuncs.moveRight, rightPathLength);

    return reachableTileIDs;
}

MovementService.PossibleTilesFunctions[PieceTypes.Queen] = (boardIndex: number, tileID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const backFrontCheck = (moveFuncIndex: MoveFuncs, pathLength: number): void => {
        for (let i = -1; i <= 1; i += 2) {
            let lastTileID: number = tileID;
            for (let j = 1; j < pathLength; j++) {
                const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i*j);
                if (nextTileID === undefined) break;

                const [moatID, creekID] = crossedBorders(boardIndex, lastTileID, nextTileID);
                if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false) break;
                if (creekID !== undefined && PieceData[PieceTypes.Queen].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false) break;

                if (reachableTileIDs.indexOf(nextTileID) === -1) reachableTileIDs.push(nextTileID);

                const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex !== undefined) break;

                lastTileID = nextTileID;
            }
        }
    }

    const inPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveIn](boardIndex);
    backFrontCheck(MoveFuncs.moveIn, inPathLength);

    const rightPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveRight](boardIndex);
    backFrontCheck(MoveFuncs.moveRight, rightPathLength);

    const inLeftPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInLeft](boardIndex);
    backFrontCheck(MoveFuncs.moveInLeft, inLeftPathLength);

    const inRightPathLength: number = MovementService.MaxPathLengthFunctions[MoveFuncs.moveInRight](boardIndex);
    backFrontCheck(MoveFuncs.moveInRight, inRightPathLength);

    return reachableTileIDs;
}

MovementService.PossibleTilesFunctions[PieceTypes.King] = (boardIndex: number, tileID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const backFrontCheck = (moveFuncIndex: MoveFuncs): void => {
        for (let i = -1; i <= 1; i += 2) {
            const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i);
            if (nextTileID === undefined || reachableTileIDs.indexOf(nextTileID) !== -1) continue;

            const [moatID, creekID] = crossedBorders(boardIndex, tileID, nextTileID);
            if (moatID !== undefined && Boards.MoatIDsBridged[boardIndex].get(moatID) === false) continue;
            if (creekID !== undefined && PieceData[PieceTypes.King].crossesCreeks === false && Boards.MoatIDsBridged[boardIndex].get(creekID) === false) continue;

            reachableTileIDs.push(nextTileID);
        }
    }

    backFrontCheck(MoveFuncs.moveIn);
    backFrontCheck(MoveFuncs.moveRight);
    backFrontCheck(MoveFuncs.moveInLeft);
    backFrontCheck(MoveFuncs.moveInRight);

    return reachableTileIDs;
}

export default MovementService;