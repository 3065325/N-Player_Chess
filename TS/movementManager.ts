import Tile from "./tile.js";
import Board from "./board";

const mod = (a, b) => { return (a % b + b) % b };
const floor = Math.floor;

class MovementManager {
    public static possibleMoveFunctions: Array<(board: Board, tileIndex: number) => Array<number>> = [];

    public static movePiece(board: Board, oldTileIndex: number, newTileIndex: number): void {
        const oldTile = board.Tiles[oldTileIndex];
        const newTile = board.Tiles[newTileIndex];

        newTile.Occupation = oldTile.Occupation;
        newTile.TeamID = oldTile.TeamID;
        oldTile.Occupation = undefined;
        oldTile.TeamID = undefined;
    }

    public static getPossibleMoves(board: Board, tileIndex: number): Array<number> {
        const tileOccupation: number | undefined = board.Tiles[tileIndex].Occupation;
        if (tileOccupation === undefined) {
            console.log(board, tileIndex, board.Tiles[tileIndex], board.Tiles[tileIndex].Occupation)
            return [];
        }

        return MovementManager.possibleMoveFunctions[tileOccupation](board, tileIndex);
    }

    public static moveRadial(board: Board, tileIndex: number, amount: number): number | undefined {
        const differenceRatio: number = tileIndex/board.ColumnCount - amount;
        const isCrossed = floor(0.5 * Math.sign(differenceRatio));
        const flooredDR = floor(differenceRatio);

        const newTileIndex = board.ColumnCount * (((tileIndex/board.ColumnCount + 0.5*isCrossed) % 1) + isCrossed*(1 + 2*flooredDR) + flooredDR);

        if (newTileIndex < board.ColumnCount*board.RowCount) return newTileIndex;
    }

    public static moveTangential(board: Board, tileIndex: number, amount: number): number {
        return mod(tileIndex + amount, board.ColumnCount) + floor(tileIndex / board.ColumnCount) * board.ColumnCount;
    }

    public static moveDiagonalRight(board: Board, tileIndex: number, amount: number): number {
        const rowCount: number = board.RowCount - 1;
        const tileT: number = tileIndex % board.ColumnCount;
        const tileR: number = floor(tileIndex / board.ColumnCount);
        const deltaRow: number = board.RowCount - (tileR + 1);
        const moveT: number = mod(deltaRow + amount + rowCount, 2*rowCount + 1) - rowCount;
        const moveR: number = Math.abs(moveT);

        return mod(tileT - deltaRow + moveT, board.ColumnCount) + (rowCount - moveR)*board.ColumnCount;
    }

    public static moveDiagonalLeft(board: Board, tileIndex: number, amount: number): number {
        const rowCount: number = board.RowCount - 1;
        const tileT: number = tileIndex % board.ColumnCount;
        const tileR: number = floor(tileIndex / board.ColumnCount);
        const deltaRow: number = board.RowCount - (tileR + 1);
        const moveT: number = mod(deltaRow + amount + rowCount, 2*rowCount + 1) - rowCount;
        const moveR: number = Math.abs(moveT);

        return mod(tileT + deltaRow - moveT, board.ColumnCount) + (rowCount - moveR)*board.ColumnCount;
    }
}

MovementManager.possibleMoveFunctions[0/*Pawn*/] = (board: Board, tileIndex: number): Array<number> => {
    const possibleMoves: Array<number> = [];
    const tile: Tile = board.Tiles[tileIndex];

    let potentialTileIndex: number | undefined = tileIndex;
    let potentialTile: Tile = board.Tiles[potentialTileIndex];

    potentialTileIndex = MovementManager.moveDiagonalRight(board, tileIndex, 1);
    potentialTile = board.Tiles[potentialTileIndex];
    if (potentialTile.TeamID !== tile.TeamID && potentialTile.TeamID !== undefined) {
        if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);
    }

    potentialTileIndex = MovementManager.moveDiagonalLeft(board, tileIndex, 1);
    potentialTile = board.Tiles[potentialTileIndex];
    if (potentialTile.TeamID !== tile.TeamID && potentialTile.TeamID !== undefined) {
        if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);
    }

    potentialTileIndex = MovementManager.moveRadial(board, tileIndex, 1);
    if (potentialTileIndex && board.Tiles[potentialTileIndex].TeamID === undefined) {
        if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);

        potentialTileIndex = MovementManager.moveRadial(board, tileIndex, 2);
        if (floor(tileIndex/board.ColumnCount) === board.RowCount - 2 && potentialTileIndex && board.Tiles[potentialTileIndex].TeamID === undefined) {
            if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);
        }
    }

    return possibleMoves;
}

MovementManager.possibleMoveFunctions[1/*Knight*/] = (board: Board, tileIndex: number): Array<number> => {
    const possibleMoves: Array<number> = [];
    const tile: Tile = board.Tiles[tileIndex];

    let potentialTileIndex: number | undefined;
    let potentialTile: Tile;

    for (let i = -1; i < 2; i += 2) {
        console.log(i, ` i tangential -> radial`)
        const flipTileIndex: number | undefined = MovementManager.moveTangential(board, tileIndex, 3*i);

        for (let j = -1; j < 2; j += 2) {
            console.log(j, ` j tangential -> radial`)
            potentialTileIndex = MovementManager.moveRadial(board, flipTileIndex, j);
            if (potentialTileIndex === undefined) continue;

            potentialTile = board.Tiles[potentialTileIndex];
            if (potentialTile.TeamID !== tile.TeamID) {
                if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);
            }
        }
    }

    for (let i = -1; i < 2; i += 2) {
        console.log(i, ` i radial -> tangential`)
        const flipTileIndex: number | undefined = MovementManager.moveRadial(board, tileIndex, 3*i);
        if (flipTileIndex === undefined) {
            console.log(`SKIPPED`, flipTileIndex)
            continue;
        }

        for (let j = -1; j < 2; j += 2) {
            console.log(j, ` j radial -> tangential`)
            potentialTileIndex = MovementManager.moveTangential(board, flipTileIndex, j);

            potentialTile = board.Tiles[potentialTileIndex];
            if (potentialTile.TeamID !== tile.TeamID) {
                if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);
            }
        }
    }

    return possibleMoves;
}

MovementManager.possibleMoveFunctions[2/*Bishop*/] = (board: Board, tileIndex: number): Array<number> => {
    const possibleMoves: Array<number> = [];
    const tile: Tile = board.Tiles[tileIndex];

    const pathLength: number = 2*board.RowCount - 1;

    let potentialTileIndex: number | undefined;
    let potentialTile: Tile;
 
    let reverseOrder: boolean = true;

    for (let i = 1; i < pathLength; i++) {
        potentialTileIndex = MovementManager.moveDiagonalRight(board, tileIndex, i);
        potentialTile = board.Tiles[potentialTileIndex];
        console.log("RightIn", potentialTileIndex);

        if (potentialTile.TeamID === tile.TeamID) break;

        if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);

        if (i === pathLength - 1) reverseOrder = false;

        if (potentialTile.TeamID !== undefined) break;
    }

    if (reverseOrder) {
        for (let i = -1; i > -pathLength; i--) {
            potentialTileIndex = MovementManager.moveDiagonalRight(board, tileIndex, i);
            potentialTile = board.Tiles[potentialTileIndex];
            console.log("RightOut", potentialTileIndex);
    
            if (potentialTile.TeamID === tile.TeamID) break;
    
            if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);
    
            if (potentialTile.TeamID !== undefined) break;
        } 
    }

    reverseOrder = true;

    for (let i = 1; i < pathLength; i++) {
        potentialTileIndex = MovementManager.moveDiagonalLeft(board, tileIndex, i);
        potentialTile = board.Tiles[potentialTileIndex];
        console.log("LeftIn", potentialTileIndex);

        if (potentialTile.TeamID === tile.TeamID) break;

        if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);

        if (i === pathLength - 1) reverseOrder = false;

        if (potentialTile.TeamID !== undefined) break;
    }

    if (reverseOrder) {
        for (let i = -1; i > -pathLength; i--) {
            potentialTileIndex = MovementManager.moveDiagonalLeft(board, tileIndex, i);
            potentialTile = board.Tiles[potentialTileIndex];
            console.log("LeftOut", potentialTileIndex);
    
            if (potentialTile.TeamID === tile.TeamID) break;
    
            if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);
    
            if (potentialTile.TeamID !== undefined) break;
        } 
    }

    return possibleMoves;
}

MovementManager.possibleMoveFunctions[3/*Rook*/] = (board: Board, tileIndex: number): Array<number> => {
    const possibleMoves: Array<number> = [];
    const tile: Tile = board.Tiles[tileIndex];

    const pathLengthTangential: number = board.ColumnCount - 1;
    const pathLengthRadial: number = board.RowCount*2 - 1;

    let potentialTileIndex: number | undefined;
    let potentialTile: Tile;

    let reverseOrder: boolean = true;

    for (let i = 1; i < pathLengthTangential; i++) {
        potentialTileIndex = MovementManager.moveTangential(board, tileIndex, i);
        potentialTile = board.Tiles[potentialTileIndex];
        console.log("Right", potentialTileIndex);

        if (potentialTile.TeamID === tile.TeamID) break;

        if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);

        if (i === pathLengthTangential - 1) reverseOrder = false;

        if (potentialTile.TeamID !== undefined) break;
    }

    if (reverseOrder) {
        for (let i = -1; i > -pathLengthTangential; i--) {
            potentialTileIndex = MovementManager.moveTangential(board, tileIndex, i);
            potentialTile = board.Tiles[potentialTileIndex];
            console.log("Left", potentialTileIndex);
    
            if (potentialTile.TeamID === tile.TeamID) break;
    
            if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);
    
            if (potentialTile.TeamID !== undefined) break;
        } 
    }

    for (let i = 1; i < pathLengthRadial; i++) {
        potentialTileIndex = MovementManager.moveRadial(board, tileIndex, i);
        if (potentialTileIndex === undefined) break;

        potentialTile = board.Tiles[potentialTileIndex];
        console.log("In", potentialTileIndex);

        if (potentialTile.TeamID === tile.TeamID) break;

        if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);

        if (potentialTile.TeamID !== undefined) break;
    }

    for (let i = -1; i > -pathLengthRadial; i--) {
        potentialTileIndex = MovementManager.moveRadial(board, tileIndex, i);
        if (potentialTileIndex === undefined) break;

        potentialTile = board.Tiles[potentialTileIndex];
        console.log("Out", potentialTileIndex);

        if (potentialTile.TeamID === tile.TeamID) break;

        if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);

        if (potentialTile.TeamID !== undefined) break;
    } 

    return possibleMoves;
}

MovementManager.possibleMoveFunctions[4/*Queen*/] = (board: Board, tileIndex: number): Array<number> => {
    const possibleMoves: Array<number> = [];
    const tile: Tile = board.Tiles[tileIndex];

    const pathLengthDiagonal: number = 2*board.RowCount - 1;
    const pathLengthTangential: number = board.ColumnCount - 1;
    const pathLengthRadial: number = board.RowCount*2 - 1;

    let potentialTileIndex: number | undefined;
    let potentialTile: Tile;

    let reverseOrder: boolean = true;

    for (let i = 1; i < pathLengthDiagonal; i++) {
        potentialTileIndex = MovementManager.moveDiagonalRight(board, tileIndex, i);
        potentialTile = board.Tiles[potentialTileIndex];
        console.log("RightIn", potentialTileIndex);

        if (potentialTile.TeamID === tile.TeamID) break;

        if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);

        if (i === pathLengthDiagonal - 1) reverseOrder = false;

        if (potentialTile.TeamID !== undefined) break;
    }

    if (reverseOrder) {
        for (let i = -1; i > -pathLengthDiagonal; i--) {
            potentialTileIndex = MovementManager.moveDiagonalRight(board, tileIndex, i);
            potentialTile = board.Tiles[potentialTileIndex];
            console.log("RightOut", potentialTileIndex);
    
            if (potentialTile.TeamID === tile.TeamID) break;
    
            if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);
    
            if (potentialTile.TeamID !== undefined) break;
        } 
    }

    reverseOrder = true;

    for (let i = 1; i < pathLengthDiagonal; i++) {
        potentialTileIndex = MovementManager.moveDiagonalLeft(board, tileIndex, i);
        potentialTile = board.Tiles[potentialTileIndex];
        console.log("LeftIn", potentialTileIndex);

        if (potentialTile.TeamID === tile.TeamID) break;

        if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);

        if (i === pathLengthDiagonal - 1) reverseOrder = false;

        if (potentialTile.TeamID !== undefined) break;
    }

    if (reverseOrder) {
        for (let i = -1; i > -pathLengthDiagonal; i--) {
            potentialTileIndex = MovementManager.moveDiagonalLeft(board, tileIndex, i);
            potentialTile = board.Tiles[potentialTileIndex];
            console.log("LeftOut", potentialTileIndex);
    
            if (potentialTile.TeamID === tile.TeamID) break;
    
            if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);
    
            if (potentialTile.TeamID !== undefined) break;
        } 
    }

    reverseOrder = true;

    for (let i = 1; i < pathLengthTangential; i++) {
        potentialTileIndex = MovementManager.moveTangential(board, tileIndex, i);
        potentialTile = board.Tiles[potentialTileIndex];
        console.log("Right", potentialTileIndex);

        if (potentialTile.TeamID === tile.TeamID) break;

        if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);

        if (i === pathLengthTangential - 1) reverseOrder = false;

        if (potentialTile.TeamID !== undefined) break;
    }

    if (reverseOrder) {
        for (let i = -1; i > -pathLengthTangential; i--) {
            potentialTileIndex = MovementManager.moveTangential(board, tileIndex, i);
            potentialTile = board.Tiles[potentialTileIndex];
            console.log("Left", potentialTileIndex);
    
            if (potentialTile.TeamID === tile.TeamID) break;
    
            if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);
    
            if (potentialTile.TeamID !== undefined) break;
        } 
    }

    for (let i = 1; i < pathLengthRadial; i++) {
        potentialTileIndex = MovementManager.moveRadial(board, tileIndex, i);
        if (potentialTileIndex === undefined) break;

        potentialTile = board.Tiles[potentialTileIndex];
        console.log("In", potentialTileIndex);

        if (potentialTile.TeamID === tile.TeamID) break;

        if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);

        if (potentialTile.TeamID !== undefined) break;
    }

    for (let i = -1; i > -pathLengthRadial; i--) {
        potentialTileIndex = MovementManager.moveRadial(board, tileIndex, i);
        if (potentialTileIndex === undefined) break;

        potentialTile = board.Tiles[potentialTileIndex];
        console.log("Out", potentialTileIndex);

        if (potentialTile.TeamID === tile.TeamID) break;

        if (!possibleMoves.includes(potentialTileIndex)) possibleMoves.push(potentialTileIndex);

        if (potentialTile.TeamID !== undefined) break;
    }

    return possibleMoves;
}

MovementManager.possibleMoveFunctions[5/*King*/] = (board: Board, tileIndex: number): Array<number> => {
    const possibleMoves: Array<number> = [];
    const tile: Tile = board.Tiles[tileIndex];

    let potentialTileIndex: number | undefined;
    let potentialTile: Tile;

    for (let i = -1; i < 3; i += 2) {

    }

    return possibleMoves;
}

export default MovementManager;