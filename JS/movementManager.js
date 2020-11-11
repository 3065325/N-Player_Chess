const mod = (a, b) => { return (a % b + b) % b; };
const floor = Math.floor;
class MovementManager {
    static moveRadial(board, tileIndex, amount) {
        const differenceRatio = tileIndex / board.ColumnCount - amount;
        const isCrossed = floor(0.5 * Math.sign(differenceRatio));
        const flooredDR = floor(differenceRatio);
        const newTileIndex = board.ColumnCount * (((tileIndex / board.ColumnCount + 0.5 * isCrossed) % 1) + isCrossed * (1 + 2 * flooredDR) + flooredDR);
        if (newTileIndex < board.ColumnCount * board.RowCount)
            return newTileIndex;
    }
    static moveTangential(board, tileIndex, amount) {
        return (tileIndex + amount) % board.ColumnCount + floor(tileIndex / board.ColumnCount) * board.ColumnCount;
    }
    static moveDiagonalRight(board, tileIndex, amount) {
        const rowCount = board.RowCount - 1;
        const tileT = tileIndex % board.ColumnCount;
        const tileR = floor(tileIndex / board.ColumnCount);
        const deltaRow = board.RowCount - (tileR + 1);
        const moveT = (deltaRow + amount + rowCount) % (2 * rowCount + 1) - rowCount;
        const moveR = Math.abs(moveT);
        return mod(tileT - deltaRow + moveT, board.ColumnCount) + (rowCount - moveR) * board.ColumnCount;
    }
    static moveDiagonalLeft(board, tileIndex, amount) {
        const rowCount = board.RowCount - 1;
        const tileT = tileIndex % board.ColumnCount;
        const tileR = floor(tileIndex / board.ColumnCount);
        const deltaRow = board.RowCount - (tileR + 1);
        const moveT = (deltaRow + amount + rowCount) % (2 * rowCount + 1) - rowCount;
        const moveR = Math.abs(moveT);
        return mod(tileT + deltaRow - moveT, board.ColumnCount) + (rowCount - moveR) * board.ColumnCount;
    }
}
export default MovementManager;
//# sourceMappingURL=movementManager.js.map