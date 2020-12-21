import Boards from "./board.js";
import Tiles from "./tile.js";
import Pieces from "./pieces.js";
import { PieceData, PieceTypes } from "./pieceData.js";
import Players from "./player.js";

const mod: (a: number, b: number) => number = (a, b) => { return (a % b + b) % b };
const floor: (x: number) => number = Math.floor;

function includesUnorderedTuple(array: Array<any>, tuple: Array<any>): boolean {
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
type PossibleMovesFunc = Array<(boardIndex: number, tileID: number, playerID: number, isAttacking: boolean, hasCrossed?: boolean, hasMoved?: boolean) => Array<number>>;
type PossibleAttacksFunc = Array<((boardIndex: number, tileID: number, playerID: number, hasCrossed?: boolean, hasMoved?: boolean) => Array<number>) | undefined>;

class MovementService {
    public static MoveFunctions: Array<MoveFunc> = [];
    public static MaxPathLengthFunctions: Array<(boardIndex: number) => number> = [];
    public static PossibleMovesFunctions: PossibleMovesFunc = [];
    public static PossibleAttacksFunctions: PossibleAttacksFunc = [];

    public static getPossibleMovesFunction(boardIndex: number, tileID: number, playerID: number, pieceType: PieceTypes, isAttacking: boolean, hasCrossed?: boolean, hasMoved?: boolean): Array<number> {
        return MovementService.PossibleMovesFunctions[pieceType](boardIndex, tileID, playerID, isAttacking, hasCrossed, hasMoved);
    }

    public static getPossibleAttacksFunction(boardIndex: number, tileID: number, playerID: number, pieceType: PieceTypes, hasCrossed?: boolean, hasMoved?: boolean): Array<number> {
        const possibleAttacksFunction = MovementService.PossibleAttacksFunctions[pieceType];
        if (possibleAttacksFunction !== undefined) return possibleAttacksFunction(boardIndex, tileID, playerID, hasCrossed, hasMoved);

        return MovementService.PossibleMovesFunctions[pieceType](boardIndex, tileID, playerID, true, hasCrossed, hasMoved);
    }

    public static getMoatIDs(boardIndex: number, sector0ID: number, sector1ID: number): Array<number> {
        const columnCount: number = Boards.ColumnCounts[boardIndex];
        const rowCount: number = Boards.RowCounts[boardIndex];
        const playerCount: number = Boards.PlayerCounts[boardIndex];
        const maxRowID: number = (rowCount - 1)*columnCount;
        const columnsPerPlayer: number = columnCount / playerCount;
        
        const moatIDs: Array<number> = [];
        for (let i = sector0ID; i !== sector1ID; i = mod(i + 1, playerCount)) {
            const index: number = mod(i + 1, playerCount);

            moatIDs.push(maxRowID + index*columnsPerPlayer); 
            moatIDs.push(maxRowID + mod(index*columnsPerPlayer - 1, columnCount));
        }

        return moatIDs;
    }

    private static moatCanBridge(boardIndex: number, sectorID: number, fromLeft?: boolean): boolean {
        fromLeft = fromLeft || false;
        
        const rowCount: number = Boards.RowCounts[boardIndex];
        const columnCount: number = Boards.ColumnCounts[boardIndex];
        const columnsPerPlayer: number = columnCount/Boards.PlayerCounts[boardIndex]; //ColumnCount is a multiple of PlayerCount, it will always return an integer
        const playerIndex: number = Boards.PlayerIndices[boardIndex][sectorID];

        const sign: number = 2*(+fromLeft) - 1;
        const tileID: number = (rowCount - 1)*columnCount + sectorID*columnsPerPlayer + (+fromLeft)*(columnsPerPlayer - 1);
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

////////////////////////////////
////////////////////////////////
//                            //
//       Move Functions       //
//                            //
////////////////////////////////
////////////////////////////////

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

function possibleMovesUntilAmount(boardIndex: number, tileID: number, playerID: number, moveFuncType: MoveFuncs, isAttacking: boolean, amount: number): Array<number> {
    const reachableTileIDs: Array<number> = [];

    const playerIndex: number = Boards.PlayerIndices[boardIndex][playerID];
    const moveFunc: MoveFunc = MovementService.MoveFunctions[moveFuncType];

    const iterationAmount: number = Math.abs(amount);
    const sign: number = Math.sign(amount);

    for (let i = 1; i < iterationAmount; i++) {
        const nextTileID: number | undefined = moveFunc(boardIndex, tileID, sign*i);
        if (nextTileID === undefined) break;

        const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
        const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
        if (nextPieceIndex !== undefined && (Pieces.PlayerIndices[nextPieceIndex] === playerIndex || !isAttacking)) break;

        if (reachableTileIDs.indexOf(nextTileID) === -1) reachableTileIDs.push(nextTileID);
        if (nextPieceIndex !== undefined) break;
    }

    return reachableTileIDs;
}

////////////////////////////////
////////////////////////////////
//                            //
//  Possible Moves Functions  //
//                            //
////////////////////////////////
////////////////////////////////

MovementService.PossibleMovesFunctions[PieceTypes.Pawn] = (boardIndex: number, tileID: number, playerID: number, isAttacking: boolean, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const sign: number = 1 - 2*+(hasCrossed || false);
    let nextTileID: number | undefined = MovementService.MoveFunctions[MoveFuncs.moveIn](boardIndex, tileID, sign*1);
    if (nextTileID === undefined) return reachableTileIDs;

    let nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
    let nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
    if (nextPieceIndex !== undefined) return reachableTileIDs;

    reachableTileIDs.push(nextTileID);
    if (hasMoved) return reachableTileIDs;

    nextTileID = MovementService.MoveFunctions[MoveFuncs.moveIn](boardIndex, tileID, sign*2);
    if (nextTileID === undefined) return reachableTileIDs;

    nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
    nextPieceIndex = Tiles.Occupations[nextTileIndex];
    if (nextPieceIndex !== undefined) return reachableTileIDs;

    reachableTileIDs.push(nextTileID);

    return reachableTileIDs;
}

////////////////////////////////
////////////////////////////////
//                            //
//      Attack Functions      //
//                            //
////////////////////////////////
////////////////////////////////

MovementService.PossibleAttacksFunctions[PieceTypes.Pawn] = (boardIndex: number, tileID: number, playerID: number, hasCrossed?: boolean, hasMoved?: boolean): Array<number> => {
    const reachableTileIDs: Array<number> = [];

    const playerIndex: number = Boards.PlayerIndices[boardIndex][playerID];

    const sign: number = 1 - 2*+(hasCrossed || false);
    let nextTileID: number | undefined = MovementService.MoveFunctions[MoveFuncs.moveInLeft](boardIndex, tileID, sign*1);
    if (nextTileID !== undefined && nextTileID !== tileID) {
        const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
        const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
        if (nextPieceIndex === undefined || Pieces.PlayerIndices[nextPieceIndex] !== playerIndex) reachableTileIDs.push(nextTileID);
    }

    nextTileID = MovementService.MoveFunctions[MoveFuncs.moveInRight](boardIndex, tileID, sign*1);
    if (nextTileID !== undefined && reachableTileIDs.indexOf(nextTileID) === -1) {
        const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
        const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
        if (nextPieceIndex === undefined || Pieces.PlayerIndices[nextPieceIndex] !== playerIndex) reachableTileIDs.push(nextTileID);
    }

    return reachableTileIDs;
}

export default MovementService;