import Boards from "./board.js";
import { canvas, CanvasUpdate, mousePos, vh, vw } from "./canvas.js";
import MovementService from "./movementService.js";
import { PieceTypes } from "./pieceData.js";
import Registry from "./registry.js";
import { BoardService } from "./renderService.js";
import Tiles from "./tile.js";
const mod = (a, b) => { return (a % b + b) % b; };
const board1 = BoardService.createBoard([0 * vw, 0 * vh], 20 * vh, 50 * vh, ["#F5D293", "#985130", "#3A6327"], 3);
console.log(board1, Boards.ColumnCounts[board1], Boards.RowCounts[board1], Boards.PlayerIndices[board1], Boards.TileIndices[board1]);
Boards.generateDefault(board1);
const tileID = 20;
const playerID = 0;
const hasCrossed = true;
const hasMoved = true;
const type = PieceTypes.King;
const possibleMoves = MovementService.getPossibleMovesFunction(board1, tileID, type, playerID, hasCrossed, hasMoved);
console.log(possibleMoves);
const possibleAttacks = MovementService.getPossibleAttacksFunction(board1, tileID, playerID, type, hasCrossed, hasMoved);
console.log(possibleAttacks);
const possibleTiles = MovementService.getPossibleTilesFunction(board1, tileID, type, hasCrossed, hasMoved);
console.log(possibleTiles);
const render = true;
const tileIndex = Boards.TileIndices[board1][13];
console.log(Tiles.CanAttack[tileIndex]);
class RenderService {
}
let lastLoop = new Date();
let sum = 0;
let amount = 0;
let i = 0;
if (render) {
    const renderLoop = setInterval(() => {
        CanvasUpdate("#111122");
        BoardService.renderBoard(board1, 10, true);
        BoardService.renderSelectedTile(board1, "#FFFF9755");
        let thisLoop = new Date();
        sum += 1000 / (+thisLoop - +lastLoop);
        amount++;
        lastLoop = thisLoop;
    }, 1000 * Registry.renderDelta);
}
canvas.addEventListener('mousedown', (e) => {
    BoardService.selectTileID(board1, mousePos);
});
//# sourceMappingURL=render.js.map