import Board from "./board";

const mod = (a, b) => { return (a % b + b) % b };


const floor = Math.floor;

class MovementManager {
    public static moveRadial(board: Board, tileIndex: number, amount: number) {
        const differenceRatio: number = tileIndex/board.ColumnCount - amount;
        const isCrossed = floor(0.5 * Math.sign(differenceRatio));
        const flooredDR = floor(differenceRatio);

        const newTileIndex = board.ColumnCount * (((tileIndex/board.ColumnCount + 0.5*isCrossed) % 1) + isCrossed*(1 + 2*flooredDR) + flooredDR);

        if (newTileIndex < board.ColumnCount*board.RowCount) return newTileIndex;
    }

    // Deprecated //

    // public static moveIn(board: Board, tileIndex: number, amount: number): number | undefined {
    //     const board: Board = Board.Boards[boardID];
    //     const differenceRatio: number = tileIndex/board.ColumnCount - amount;
    //     const isCrossed = floor(0.5 * Math.sign(differenceRatio));
    //     const flooredDR = floor(differenceRatio);

    //     const newTileIndex = board.ColumnCount * (((tileIndex/board.ColumnCount + 0.5*isCrossed) % 1) + isCrossed*(1 + 2*flooredDR) + flooredDR);

    //     if (newTileIndex < board.ColumnCount*board.RowCount) return newTileIndex;
    // }

    // public static moveOut(board: Board, tileIndex: number, amount: number): number | undefined {
    //     const board: Board = Board.Boards[boardID];
    //     const newIndex = tileIndex + board.ColumnCount * amount;
    //     if (board.Tiles[newIndex]) return newIndex;
        
    //     return undefined;
    // }

    public static moveTangential(board: Board, tileIndex: number, amount: number) {
        return (tileIndex + amount) % board.ColumnCount + floor(tileIndex / board.ColumnCount) * board.ColumnCount;
    }

    // Deprecated //

    // public static moveRight(board: Board, tileIndex: number, amount: number): number {
    //     const board: Board = Board.Boards[boardID];
    //     return floor(tileIndex / board.ColumnCount) * board.ColumnCount + (tileIndex + amount) % board.ColumnCount;
    // }

    // public static moveLeft(board: Board, tileIndex: number, amount: number): number {
    //     const board: Board = Board.Boards[boardID];
    //     return floor(tileIndex / board.ColumnCount) * board.ColumnCount + (tileIndex - amount) % board.ColumnCount;
    // }

    public static moveDiagonalRight(board: Board, tileIndex: number, amount: number) {
        const rowCount: number = board.RowCount - 1;
        const tileT: number = tileIndex % board.ColumnCount;
        const tileR: number = floor(tileIndex / board.ColumnCount);
        const deltaRow: number = board.RowCount - (tileR + 1);
        const moveT: number = (deltaRow + amount + rowCount) % (2*rowCount + 1) - rowCount;
        const moveR: number = Math.abs(moveT);

        return mod(tileT - deltaRow + moveT, board.ColumnCount) + (rowCount - moveR)*board.ColumnCount;
    }

    public static moveDiagonalLeft(board: Board, tileIndex: number, amount: number) {
        const rowCount: number = board.RowCount - 1;
        const tileT: number = tileIndex % board.ColumnCount;
        const tileR: number = floor(tileIndex / board.ColumnCount);
        const deltaRow: number = board.RowCount - (tileR + 1);
        const moveT: number = (deltaRow + amount + rowCount) % (2*rowCount + 1) - rowCount;
        const moveR: number = Math.abs(moveT);

        return mod(tileT + deltaRow - moveT, board.ColumnCount) + (rowCount - moveR)*board.ColumnCount;
    }
}

export default MovementManager;