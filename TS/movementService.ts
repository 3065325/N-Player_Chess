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

type MoveFunc = (boardIndex: number, tileID: number, amount: number) => number | undefined;
type PossibleMovesFunc = Array<(boardIndex: number, tileID: number, playerID?: number, hasCrossed?: boolean) => Array<number>>;

enum MoveFuncs {
    moveIn = 0,
    moveRight,
    moveInRight,
    moveInLeft
}

class MovementService {
    public static MoveFunctions: Array<MoveFunc> = [];
    public static MaxPathLengthFunctions: Array<(boardIndex: number) => number> = [];
    public static PossibleMovesFunctions: PossibleMovesFunc = [];
    public static PossibleAttackFunctions: PossibleMovesFunc = [];

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
        for (let i = sector1ID; i !== sector2ID; i = mod(i + 1, playerCount)) {
            moatIDs.push(maxRowID + mod(i + 1, playerCount)*columnsPerPlayer);
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

    public static moveTileOccupant(boardIndex: number, oldTileID: number, newTileID: number): void {
        const oldTileIndex: number = Boards.TileIndices[boardIndex][oldTileID];
        const newTileIndex: number = Boards.TileIndices[boardIndex][newTileID];

        const pieceIndex: number | undefined = Tiles.Occupations[oldTileIndex];

        Tiles.Occupations[oldTileIndex] = undefined;
        Tiles.Occupations[newTileIndex] = pieceIndex;
    }
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

////////////////////////////////
////////////////////////////////
//                            //
//  Possible Moves Functions  //
//                            //
////////////////////////////////
////////////////////////////////

MovementService.PossibleMovesFunctions[PieceTypes.Pawn] = (boardIndex: number, tileID: number, playerID?: number, hasCrossed?: boolean): Array<number> => {
    const tileIndex: number = Boards.TileIndices[boardIndex][tileID];
    const pieceIndex: number | undefined = Tiles.Occupations[tileIndex];

    let playerIndex: number | undefined;
    let hasCrossedBoard: boolean;

    if (pieceIndex !== undefined) {
        playerIndex = Pieces.PlayerIndices[pieceIndex]; 
        hasCrossedBoard = Pieces.HasCrossed[pieceIndex]; 
    }

    if (playerID !== undefined && hasCrossed !== undefined) {
        playerIndex = Boards.PlayerIndices[boardIndex][playerID];
        hasCrossedBoard = hasCrossed; 
    }
    if (playerIndex === undefined) return [];
    

}

////////////////////////////////
////////////////////////////////
//                            //
//      Attack Functions      //
//                            //
////////////////////////////////
////////////////////////////////



export default MovementService;