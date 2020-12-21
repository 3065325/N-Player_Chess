import Boards from "./board.js";
import { CanvasUpdate, vh, vw } from "./canvas.js";
import MovementService from "./movementService.js";
import {PieceTypes} from "./pieceData.js";
import Registry from "./registry.js";
import BoardService from "./renderService.js";
const mod: (a: number, b: number) => number = (a, b) => { return (a % b + b) % b };

const board1: number = BoardService.createBoard([0*vw, 0*vh], 20*vh, 50*vh, ["#F5D293", "#985130"], 20);
console.log(board1, Boards.ColumnCounts[board1], Boards.RowCounts[board1], Boards.PlayerIndices[board1], Boards.TileIndices[board1]);

// const board4: number = Boards.createBoard(4);
// console.log(board4, Boards.ColumnCounts[board4], Boards.RowCounts[board4], Boards.PlayerIndices[board4], Boards.TileIndices[board4]);

const render: boolean = true//false//

if (render) {
    let i = 0;
    const renderLoop = setInterval(() => {
        CanvasUpdate(true, "#111122");

        BoardService.renderBoard(board1, Math.floor(i += 0.01) % 20, 10, true);
        // BoardService.renderBoard(board2, Math.floor(i += 10*Registry.renderDelta) % 2, 0, true);
        // BoardService.renderBoard(board3, Math.floor(i += 10*Registry.renderDelta) % 20, 10, true);
    }, Registry.renderDelta*100);
}

console.log(MovementService.getMoatIDs(board1, 0, 1));

const arr1: Array<number> = [0, 7, 36, 93, 73, 491, 5, 38, 89, 18, 45];