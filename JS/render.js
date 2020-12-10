import Boards from "./board.js";
import { CanvasUpdate, vh, vw } from "./canvas.js";
import Registry from "./registry.js";
import BoardService from "./renderService.js";
const mod = (a, b) => { return (a % b + b) % b; };
const board1 = BoardService.createBoard([-25 * vw, 0 * vh], 20 * vh, 50 * vh, ["#F5D293", "#985130"], 6);
console.log(board1, Boards.ColumnCounts[board1], Boards.RowCounts[board1], Boards.PlayerIndices[board1], Boards.TileIndices[board1]);
console.log("AA");
let i = 0;
const renderLoop = setInterval(() => {
    CanvasUpdate(true, "#111122");
    BoardService.renderBoard(board1, Math.floor(i += Registry.renderDelta) % 6, 10, true);
}, Registry.renderDelta * 1000);
//# sourceMappingURL=render.js.map