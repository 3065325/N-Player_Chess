import Boards from "./board.js";
import Tiles from "./tile.js";
import Pieces from "./pieces.js";
import { PieceTypes } from "./pieceData.js";
import Players from "./player.js";

const mod: (a: number, b: number) => number = (a, b) => { return (a % b + b) % b };
const floor: (x: number) => number = Math.floor;

type MoveFunc = (boardIndex: number, tileID: number, amount: number) => number | undefined;

enum MoveFuncs {
    moveIn = 0,
    moveRight,
    moveInRight,
    moveInLeft
}

class MovementService {
    public static MoveFunctions: Array<MoveFunc> = [];
    public static MaxPathLengthFunctions: Array<(boardIndex: number) => number> = [];
    public static PossibleMovesFunctions: Array<(boardIndex: number, tileID: number, playerID?: number) => Array<number>> = [];

    public static getPossibleMovesFunction(boardIndex: number, tileID: number, playerID?: number, pieceType?: PieceTypes): Array<number> {
        if (pieceType) return this.PossibleMovesFunctions[pieceType](boardIndex, tileID, playerID);

        const tileIndex: number = Boards.TileIndices[boardIndex][tileID];
        const pieceIndex: number | undefined = Tiles.Occupations[tileIndex];
        if (pieceIndex === undefined) return [];

        pieceType = Pieces.PieceTypes[pieceIndex];

        return this.PossibleMovesFunctions[pieceType](boardIndex, tileID, playerID);
    }

    public static getMoatIDs(boardIndex: number, sector1ID: number, sector2ID: number): Array<number> {
        const columnCount: number = Boards.ColumnCounts[boardIndex];
        const rowCount: number = Boards.RowCounts[boardIndex];
        const playerCount: number = Boards.PlayerCounts[boardIndex];
        const maxRowID: number = (rowCount - 1)*columnCount;
        const columnsPerPlayer: number = columnCount / playerCount;
        
        const moatIDs: Array<number> = [];
        for (let i = mod(sector1ID + 1, playerCount); i !== mod(sector2ID + 1, playerCount); i = mod(i + 1, playerCount)) {
            moatIDs.push(maxRowID + i*columnsPerPlayer);
        }

        return moatIDs;
    }

    private static moatCanBridge(boardIndex: number, sectorID: number, fromLeft?: boolean): boolean {
        fromLeft = fromLeft || false;
        
        const rowCount: number = Boards.RowCounts[boardIndex];
        const columnCount: number = Boards.ColumnCounts[boardIndex];
        const columnsPerPlayer: number = columnCount/Boards.PlayerCounts[boardIndex]; //ColumnCount is a multiple of PlayerCount, it will always return an integer
        const playerIndex: number = Boards.PlayerIndices[boardIndex][sectorID];

        const sign: number = 2*+fromLeft - 1;
        const tileID: number = (rowCount - 1)*columnCount + sectorID*columnsPerPlayer + +fromLeft*(columnsPerPlayer - 1);
        for (let i = 1; i < columnsPerPlayer + 1; i++) {
            const nextTileID: number | undefined = MovementService.MoveFunctions[MoveFuncs.moveRight](boardIndex, tileID, sign*i);
            if (nextTileID === undefined) continue;

            const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
            const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
            if (nextPieceIndex === undefined) continue;

            const nextPlayerIndex: number = Pieces.PlayerIndices[nextPieceIndex];
            if (playerIndex === nextPlayerIndex) return false;
        }

        return true;
    }

    // private static isTileBlocked(boardIndex: number, startTileID: number, endTileID: number, playerID: number,): boolean {
    //     const rowCount: number = Boards.RowCounts[boardIndex];
    //     const columnCount: number = Boards.ColumnCounts[boardIndex];
    //     const playerCount: number = Boards.PlayerCounts[boardIndex];
    //     const columnsPerPlayer: number = columnCount / playerCount;

    //     const startTileRow: number = Math.floor(startTileID/columnCount);
    //     const endTileRow: number = Math.floor(endTileID/columnCount);
    //     if (rowCount - 1 === endTileRow && endTileRow === startTileRow) {
    //         const startPlayerSectorID: number = Math.floor((startTileID % columnCount)/playerCount);
    //         const endPlayerSectorID: number = Math.floor((endTileID % columnCount)/playerCount);
    //         if (startPlayerSectorID !== endPlayerSectorID) {
    //             const fromLeft: boolean = (Math.abs(endPlayerSectorID - startPlayerSectorID) > 1 || endPlayerSectorID > startPlayerSectorID);
    //             const 
    //         }
    //     }
    //     //if crosses unbridged moat then true
    //     //if crosses bridged moat and takes piece (or checks king -> work on this one later) then true 
        
    //     //if no piece then false
    //     //if piece has same playerIndex then true

    //     return false;
    // }

    public static moveTileOccupant(boardIndex: number, oldTileID: number, newTileID: number): void {
        const oldTileIndex: number = Boards.TileIndices[boardIndex][oldTileID];
        const newTileIndex: number = Boards.TileIndices[boardIndex][newTileID];

        const pieceIndex: number | undefined = Tiles.Occupations[oldTileIndex];

        Tiles.Occupations[oldTileIndex] = undefined;
        Tiles.Occupations[newTileIndex] = pieceIndex;
    }

    // public static moveUntilStopped = (boardIndex: number, tileID: number, playerID: number, moveFuncIndex: MoveFuncs, checkFront: boolean, checkBack: boolean): Array<number> => {        
    //     const reachableTileIDs: Array<number> = [];
    //     const moveFunc: MoveFunc = MovementService.MoveFunctions[moveFuncIndex];
    //     const pathLength: number = MovementService.MaxPathLengthFunctions[moveFuncIndex](boardIndex);

    //     const iterateMovement = (sign: number) => {
    //         for (let i = 0; i < pathLength; i++) {
    //             i += sign;

    //             const nextTileID: number | undefined = moveFunc(boardIndex, tileID, i);
    //             if (nextTileID === undefined || nextTileID === tileID) break;

    //             if (reachableTileIDs.includes(nextTileID)) continue;
    
    //             const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
    //             if (MovementService.isTileBlocked(boardIndex, tileID, nextTileID, playerID)) break;

    //             reachableTileIDs.push(nextTileID);
    //         }
    //     }

    //     if (checkFront) iterateMovement(1);
    //     if (checkBack) iterateMovement(-1);

    //     return reachableTileIDs;
    // }
}

MovementService.MoveFunctions[MoveFuncs.moveIn] = (boardIndex: number, tileID: number, amount: number): number | undefined => {
    const columnCount: number = Boards.ColumnCounts[boardIndex];
    const diffRatio: number = tileID/columnCount - amount;
    const isCrossed: number = floor(0.5*Math.sign(diffRatio));
    const flooredDR: number = floor(diffRatio);

    const newTileID: number = columnCount*(mod(tileID/columnCount + 0.5*isCrossed, 1) + isCrossed*(1 + 2*flooredDR) + flooredDR);

    if (newTileID < Boards.TileIndices[boardIndex].length) return newTileID;
}

MovementService.MoveFunctions[MoveFuncs.moveRight] = (boardIndex: number, tileID: number, amount: number): number => {
    const columnCount: number = Boards.ColumnCounts[boardIndex];

    return mod(tileID + amount, columnCount) + floor(tileID/columnCount)*columnCount;
}

MovementService.MoveFunctions[MoveFuncs.moveInRight] = (boardIndex: number, tileID: number, amount: number): number => {
    const columnCount: number = Boards.ColumnCounts[boardIndex];
    const rowCount: number = Boards.RowCounts[boardIndex];
    const maxRow: number = rowCount - 1;
    const tileT: number = mod(tileID, columnCount);
    const tileR: number = floor(tileID/columnCount);
    const rowDelta: number = rowCount - (tileR + 1);
    const moveT: number = mod(rowDelta + amount + maxRow, 2*maxRow + 1) - maxRow;
    const moveR: number = Math.abs(moveT);

    return mod(tileT - rowDelta + moveT, columnCount) + (maxRow - moveR)*columnCount;
}

MovementService.MoveFunctions[MoveFuncs.moveInLeft] = (boardIndex: number, tileID: number, amount: number): number => {
    const columnCount: number = Boards.ColumnCounts[boardIndex];
    const rowCount: number = Boards.RowCounts[boardIndex];
    const maxRow: number = rowCount - 1;
    const tileT: number = tileID % columnCount;
    const tileR: number = floor(tileID/columnCount);
    const rowDelta: number = rowCount - (tileR + 1);
    const moveT: number = mod(rowDelta + amount + maxRow, 2*maxRow + 1) - maxRow;
    const moveR: number = Math.abs(moveT);

    return mod(tileT + rowDelta - moveT, columnCount) + (maxRow - moveR)*columnCount;
}

MovementService.MaxPathLengthFunctions[MoveFuncs.moveIn] = (boardIndex: number): number => {
    return 2*Boards.RowCounts[boardIndex] - 1;
}

MovementService.MaxPathLengthFunctions[MoveFuncs.moveRight] = (boardIndex: number): number => {
    return Boards.ColumnCounts[boardIndex] - 1;
}

MovementService.MaxPathLengthFunctions[MoveFuncs.moveInRight] = (boardIndex: number): number => {
    return 2*(Boards.RowCounts[boardIndex] - 1);
}

MovementService.MaxPathLengthFunctions[MoveFuncs.moveInLeft] = (boardIndex: number): number => {
    return 2*(Boards.RowCounts[boardIndex] - 1);
}

// MovementService.PossibleMovesFunctions[PieceTypes.Pawn] = (boardIndex: number, tileID: number, playerID?: number): Array<number> {
//     const tileIndex: number = Boards.TileIndices[boardIndex][tileID];
//     const pieceIndex: number | undefined = Tiles.Occupations[tileIndex];
//     let playerIndex: number | undefined; 
//     if (pieceIndex !== undefined) playerIndex = Pieces.PlayerIndices[pieceIndex];
//     if (playerID !== undefined) playerIndex = Boards.PlayerIndices[boardIndex][playerID];
//     if (playerIndex === undefined) return [];

//     let moveTileIndex: number;
//     let movePlayerIndex: number;
//     for (let i = 1; i < 3; i++) {
         
//     }
// }

export default MovementService;