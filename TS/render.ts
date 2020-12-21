import Boards from "./board.js";
import { CanvasUpdate, vh, vw } from "./canvas.js";
import MovementService from "./movementService.js";
import {PieceTypes} from "./pieceData.js";
import Registry from "./registry.js";
import BoardService from "./renderService.js";
const mod: (a: number, b: number) => number = (a, b) => { return (a % b + b) % b };

const board1: number = BoardService.createBoard([0*vw, 0*vh], 20*vh, 50*vh, ["#F5D293", "#985130"], 2);
console.log(board1, Boards.ColumnCounts[board1], Boards.RowCounts[board1], Boards.PlayerIndices[board1], Boards.TileIndices[board1]);

console.log(MovementService.getPossibleMovesFunction(board1, 0, 0, PieceTypes.Pawn, false, false, false));

const render: boolean = true//false//
if (render) {
    let i = 0;
    const renderLoop = setInterval(() => {
        CanvasUpdate(true, "#111122");

        BoardService.renderBoard(board1, 0, 10, true);
    }, Registry.renderDelta*100);
}
