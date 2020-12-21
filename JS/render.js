import Boards from "./board.js";
import { CanvasUpdate, vh, vw } from "./canvas.js";
import MovementService from "./movementService.js";
import Registry from "./registry.js";
import BoardService from "./renderService.js";
const mod = (a, b) => { return (a % b + b) % b; };
const board1 = BoardService.createBoard([0 * vw, 0 * vh], 20 * vh, 50 * vh, ["#F5D293", "#985130"], 20);
console.log(board1, Boards.ColumnCounts[board1], Boards.RowCounts[board1], Boards.PlayerIndices[board1], Boards.TileIndices[board1]);
const render = true;
if (render) {
    let i = 0;
    const renderLoop = setInterval(() => {
        CanvasUpdate(true, "#111122");
        BoardService.renderBoard(board1, Math.floor(i += 0.01) % 20, 10, true);
    }, Registry.renderDelta * 100);
}
console.log(MovementService.getMoatIDs(board1, 0, 1));
const arr1 = [0, 7, 36, 93, 73, 491, 5, 38, 89, 18, 45];
//# sourceMappingURL=render.js.map