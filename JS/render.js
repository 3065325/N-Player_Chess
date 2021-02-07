import Boards from "./board.js";
import { canvas, CanvasUpdate, mousePos, vh, vw } from "./canvas.js";
import { PieceTypes } from "./pieceData.js";
import Registry from "./registry.js";
import { BoardService } from "./renderService.js";
const mod = (a, b) => { return (a % b + b) % b; };
const boards = [];
boards.push(BoardService.createBoard([0 * vw, 0 * vh], 20 * vh, 50 * vh, ["#F5D293", "#985130", "#3A6327"], +(prompt("How many players on board 1?") || 5)));
boards.push(BoardService.createBoard([37 * vw, 25 * vh], 10 * vh, 25 * vh, ["#F5D293", "#985130", "#3A6327"], +(prompt("How many players on board 2?") || 2)));
boards.push(BoardService.createBoard([-37 * vw, 25 * vh], 7 * vh, 25 * vh, ["#F5D293", "#985130", "#3A6327"], +(prompt("How many players on board 3?") || 4), 8));
boards.push(BoardService.createBoard([37 * vw, -25 * vh], 13 * vh, 25 * vh, ["#484848", "#0B0B0B", "#FFFFFF"], +(prompt("How many players on board 4?") || 3), 4));
boards.push(BoardService.createBoard([-37 * vw, -25 * vh], 6 * vh, 25 * vh, ["#F5D293", "#985130", "#3A6327"], +(prompt("How many players on board 5?") || 3), 5, 4));
for (let i = 0; i < boards.length; i++)
    Boards.generateDefault(boards[i]);
const tileID = 20;
const playerID = 0;
const hasCrossed = true;
const hasMoved = true;
const type = PieceTypes.King;
const render = true;
let lastLoop = new Date();
let sum = 0;
let amount = 0;
let i = 0;
if (render) {
    const renderLoop = setInterval(() => {
        CanvasUpdate("#111122");
        for (let i = 0; i < boards.length; i++) {
            BoardService.renderBoard(boards[i], 0, true);
            BoardService.renderSelectedTile(boards[i], "#FFFF9755");
        }
        let thisLoop = new Date();
        sum += 1000 / (+thisLoop - +lastLoop);
        amount++;
        lastLoop = thisLoop;
    }, 1000 * Registry.renderDelta);
}
canvas.addEventListener('mousedown', (e) => {
    for (let i = 0; i < boards.length; i++) {
        BoardService.selectTileID(boards[i], mousePos);
    }
});
//# sourceMappingURL=render.js.map