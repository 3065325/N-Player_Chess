import Boards from "./board.js";
import Tiles from "./tile.js";
import Pieces from "./pieces.js";
import { PieceData, PieceTypes } from "./pieceData.js";
import Players from "./player.js";

const mod: (a: number, b: number) => number = (a, b) => { return (a % b + b) % b };
const floor: (x: number) => number = Math.floor;

function containsUnorderedTuple(array: Array<any>, tuple: Array<any>): boolean {
    let tupleInstance: Array<any> = tuple;

    for (let i = 0; i < array.length; i++) {
        const index: number = tupleInstance.indexOf(array[i]);
        if (index === -1) { tupleInstance = tuple; continue; }

        tupleInstance.splice(index, 1);
        if (tuple.length === 0) return true;
    }

    return false;
}

function includesTuple(array: Array<any>, tuple: Array<any>): boolean {
    let index = 0;

    const length: number = tuple.length;
    for (let i = 0; i < array.length; i++) {
        if (array[i] !== tuple[index]) { index = 0; continue; }

        if (index === length) return true;
    }

    return false;
}

type MoveFunc = (boardIndex: number, tileID: number, amount: number) => number | undefined;
type PossibleMovesFunc = Array<(boardIndex: number, tileID: number, hasCrossed?: boolean, hasMoved?: boolean) => Array<number>>;
type PossibleAttacksFunc = Array<((boardIndex: number, tileID: number, playerID: number, hasCrossed?: boolean, hasMoved?: boolean) => Array<number>)>;

class MovementService {
    public static MoveFunctions: Array<MoveFunc> = [];
    public static MaxPathLengthFunctions: Array<(boardIndex: number) => number> = [];
    public static PossibleMovesFunctions: PossibleMovesFunc = [];
    public static PossibleAttacksFunctions: PossibleAttacksFunc = [];

    public static getPossibleMovesFunction(boardIndex: number, tileID: number, pieceType: PieceTypes, hasCrossed?: boolean, hasMoved?: boolean): Array<number> {
        return MovementService.PossibleMovesFunctions[pieceType](boardIndex, tileID, hasCrossed, hasMoved);
    }

    public static getPossibleAttacksFunction(boardIndex: number, tileID: number, playerID: number, pieceType: PieceTypes, hasCrossed?: boolean, hasMoved?: boolean): Array<number> {
        const possibleAttacksFunction = MovementService.PossibleAttacksFunctions[pieceType];
        return possibleAttacksFunction(boardIndex, tileID, playerID, hasCrossed, hasMoved);
    }

    public static getMoatIDs(boardIndex: number, sector0ID: number, sector1ID: number): Array<[number | undefined, number | undefined]> {
        const columnCount: number = Boards.ColumnCounts[boardIndex];
        const rowCount: number = Boards.RowCounts[boardIndex];
        const playerCount: number = Boards.PlayerCounts[boardIndex];
        const maxRowID: number = (rowCount - 1) * columnCount;
        const columnsPerPlayer: number = columnCount / playerCount;

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

        const rowCount: number = Boards.RowCounts[boardIndex];
        const columnCount: number = Boards.ColumnCounts[boardIndex];
        const columnsPerPlayer: number = columnCount / Boards.PlayerCounts[boardIndex]; //ColumnCount is a multiple of PlayerCount, it will always return an integer
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

    const newTileID: number = columnCount * (mod(tileID / columnCount + 0.5 * isCrossed, 1) + isCrossed * (1 + 2 * flooredDR) + flooredDR);

    if (newTileID < Boards.TileIndices[boardIndex].length) return newTileID;
}

MovementService.MoveFunctions[MoveFuncs.moveRight] = (boardIndex: number, tileID: number, amount: number): number => {
    const columnCount: number = Boards.ColumnCounts[boardIndex];

    return mod(tileID + amount, columnCount) + floor(tileID / columnCount) * columnCount;
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

    return mod(tileT - rowDelta + moveT, columnCount) + (maxRow - moveR) * columnCount;
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

    return mod(tileT + rowDelta - moveT, columnCount) + (maxRow - moveR) * columnCount;
}

////////////////////////////////
////////////////////////////////
//                            //
//  Possible Moves Functions  //
//                            //
////////////////////////////////
////////////////////////////////

function getMoatID(boardIndex: number, tileID: number, getRight?: boolean): number {
    if (getRight === undefined) getRight = false;

    const rowCount: number = Boards.RowCounts[boardIndex];
    const columnCount: number = Boards.ColumnCounts[boardIndex];
    const columnsPerPlayer: number = columnCount / Boards.PlayerCounts[boardIndex];

    return (rowCount - 1)*columnCount + floor(mod(tileID, columnCount)/columnsPerPlayer)*columnsPerPlayer + (columnsPerPlayer - 1)*(+getRight);
}

function getMoatIDTuple(boardIndex: number, moatID: number, toRight?: boolean): [number | undefined, number | undefined] {
    if (toRight === undefined) toRight = false;

    return [MovementService.MoveFunctions[MoveFuncs.moveRight](boardIndex, moatID, -1*(+!toRight)), MovementService.MoveFunctions[MoveFuncs.moveRight](boardIndex, moatID, 1*(+toRight))];
}

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

MovementService.PossibleMovesFunctions[PieceTypes.Rook] = (boardIndex: number, tileID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const backFrontCheck = (moveFuncIndex: MoveFuncs, pathLength: number) => {
        for (let i = -1; i <= 1; i += 2) {
            const isFront: boolean = i > 0;
            const moatID: number = getMoatID(boardIndex, tileID, isFront);

            let lastTileID: number = tileID;
            for (let j = 1; j < pathLength; j++) {
                const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i*j);
                if (nextTileID === undefined || reachableTileIDs.indexOf(nextTileID) !== -1) continue;

                const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex !== undefined) break;

                const moatIDTuple: [number | undefined, number | undefined] = getMoatIDTuple(boardIndex, moatID, isFront);
                if (containsUnorderedTuple([lastTileID, nextTileID], moatIDTuple) && Boards.MoatIDsBridged[boardIndex].get(moatID + (+isFront)) === false) break;

                reachableTileIDs.push(nextTileID);
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

MovementService.PossibleMovesFunctions[PieceTypes.King] = (boardIndex: number, tileID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const backFrontCheck = (moveFuncIndex: MoveFuncs) => {
        for (let i = -1; i <= 1; i += 2) {
            const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i);
            if (nextTileID === undefined || reachableTileIDs.indexOf(nextTileID) !== -1) continue;

            const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
            const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
            if (nextPieceIndex !== undefined) break;

            const isFront: boolean = i > 0;
            const moatID: number = getMoatID(boardIndex, tileID, isFront);

            const moatIDTuple: [number | undefined, number | undefined] = getMoatIDTuple(boardIndex, moatID, isFront);
            if (containsUnorderedTuple([tileID, nextTileID], moatIDTuple) && Boards.MoatIDsBridged[boardIndex].get(moatID + (+isFront)) === false) break;

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

function crossesCreek(boardIndex: number, tile0ID: number, tile1ID: number): boolean {
    const columnCount: number = Boards.ColumnCounts[boardIndex];
    const rowCount: number = Boards.RowCounts[boardIndex];
    
    const row0: number = floor(tile0ID / columnCount);
    const row1: number = floor(tile1ID / columnCount);
}

MovementService.PossibleAttacksFunctions[PieceTypes.Pawn] = (boardIndex: number, tileID: number, playerID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const playerIndex: number = Boards.PlayerIndices[boardIndex][playerID];
    const sign: number = 1 - 2 * +(hasCrossed || false);

    const frontCheck = (moveFuncIndex: MoveFuncs) => {
        const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, sign);
        if (nextTileID === undefined || nextTileID === tileID) return;

        const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
        const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
        if (nextPieceIndex === undefined || Pieces.PlayerIndices[nextPieceIndex] === playerIndex) return;



        reachableTileIDs.push(nextTileID);
    }

    frontCheck(MoveFuncs.moveInLeft);
    frontCheck(MoveFuncs.moveInRight);

    return reachableTileIDs;
}

MovementService.PossibleAttacksFunctions[PieceTypes.Rook] = (boardIndex: number, tileID: number, playerID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const playerIndex: number = Boards.PlayerIndices[boardIndex][playerID];

    const backFrontCheck = (moveFuncIndex: MoveFuncs, pathLength: number) => {
        for (let i = -1; i <= 1; i += 2) {
            for (let j = 1; j < pathLength; j++) {
                const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i*j);
                if (nextTileID === undefined || reachableTileIDs.indexOf(nextTileID) !== -1) continue;

                const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
                const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
                if (nextPieceIndex === undefined) continue;

                if (Pieces.PlayerIndices[nextPieceIndex] === playerIndex) break;

                reachableTileIDs.push(nextTileID);
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

MovementService.PossibleAttacksFunctions[PieceTypes.King] = (boardIndex: number, tileID: number, playerID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const playerIndex: number = Boards.PlayerIndices[boardIndex][playerID];

    const backFrontCheck = (moveFuncIndex: MoveFuncs) => {
        for (let i = -1; i <= 1; i += 2) {
            const nextTileID: number | undefined = MovementService.MoveFunctions[moveFuncIndex](boardIndex, tileID, i);
            if (nextTileID === undefined || reachableTileIDs.indexOf(nextTileID) !== -1) continue;

            const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
            const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
            if (nextPieceIndex === undefined || Pieces.PlayerIndices[nextPieceIndex] === playerIndex) continue;

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