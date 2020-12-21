import Boards from "./board.js";
import { CanvasUpdate, vh, vw } from "./canvas.js";
import MovementService from "./movementService.js";
import { PieceTypes } from "./pieceData.js";
import Registry from "./registry.js";
import BoardService from "./renderService.js";
const mod = (a, b) => { return (a % b + b) % b; };
const board1 = BoardService.createBoard([0 * vw, 0 * vh], 20 * vh, 50 * vh, ["#F5D293", "#985130"], 2);
console.log(board1, Boards.ColumnCounts[board1], Boards.RowCounts[board1], Boards.PlayerIndices[board1], Boards.TileIndices[board1]);
const tileID = 34;
const playerID = 0;
const hasCrossed = false;
const hasMoved = false;
Boards.setPiece(board1, MovementService.MoveFunctions[3](board1, tileID, 1) || tileID, 1, PieceTypes.Pawn);
console.log(MovementService.getPossibleMovesFunction(board1, tileID, PieceTypes.King, hasCrossed, hasMoved));
console.log(MovementService.getPossibleAttacksFunction(board1, tileID, playerID, PieceTypes.King, hasCrossed, hasMoved));
const render = true;
if (render) {
    let i = 0;
    const renderLoop = setInterval(() => {
        CanvasUpdate(true, "#111122");
        BoardService.renderBoard(board1, 0, 10, true);
    }, Registry.renderDelta * 100);
}
//# sourceMappingURL=render.js.map