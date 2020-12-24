import Boards from "./board.js";
import { CanvasUpdate, vh, vw } from "./canvas.js";
import MovementService from "./movementService.js";
import { PieceTypes } from "./pieceData.js";
import Registry from "./registry.js";
import BoardService from "./renderService.js";
const mod = (a, b) => { return (a % b + b) % b; };
const board1 = BoardService.createBoard([0 * vw, 0 * vh], 20 * vh, 50 * vh, ["#F5D293", "#985130", "#3A6327"], 2, 4, 4);
console.log(board1, Boards.ColumnCounts[board1], Boards.RowCounts[board1], Boards.PlayerIndices[board1], Boards.TileIndices[board1]);
const tileID = 20;
const playerID = 0;
const hasCrossed = true;
const hasMoved = true;
const type = PieceTypes.King;
Boards.setPiece(board1, 17, 0, PieceTypes.Rook);
Boards.setPiece(board1, 15, 1, PieceTypes.Pawn);
Boards.setPiece(board1, 22, 1, PieceTypes.Pawn);
Boards.movePiece(board1, 22, 14);
const possibleMoves = MovementService.getPossibleMovesFunction(board1, tileID, type, hasCrossed, hasMoved);
console.log(possibleMoves);
const possibleAttacks = MovementService.getPossibleAttacksFunction(board1, tileID, playerID, type, hasCrossed, hasMoved);
console.log(possibleAttacks);
const possibleTiles = MovementService.getPossibleTilesFunction(board1, tileID, type, hasCrossed, hasMoved);
console.log(possibleTiles);
const render = false;
CanvasUpdate(true, "#111122");
BoardService.renderBoard(board1, 0, 10, true);
BoardService.highlightTiles(board1, possibleMoves, 0, Registry.moveColor);
BoardService.highlightTiles(board1, possibleAttacks, 0, Registry.attackColor);
let lastLoop = new Date();
let sum = 0;
let amount = 0;
if (render) {
    let i = 0;
    const renderLoop = setInterval(() => {
        CanvasUpdate(true, "#111122");
        BoardService.renderBoard(board1, 0, 10, true);
        let thisLoop = new Date();
        sum += 1000 / (+thisLoop - +lastLoop);
        amount++;
        console.log("FPS: ", Math.round(sum / amount));
        lastLoop = thisLoop;
    }, 1000 * Registry.renderDelta * 10000);
}
//# sourceMappingURL=render.js.map