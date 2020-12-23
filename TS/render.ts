import Boards from "./board.js";
import { CanvasUpdate, vh, vw } from "./canvas.js";
import MovementService from "./movementService.js";
import {PieceTypes} from "./pieceData.js";
import Registry from "./registry.js";
import BoardService from "./renderService.js";
const mod: (a: number, b: number) => number = (a, b) => { return (a % b + b) % b };

const board1: number = BoardService.createBoard([0*vw, 0*vh], 20*vh, 50*vh, ["#F5D293", "#985130"], 4, 4, 4);
console.log(board1, Boards.ColumnCounts[board1], Boards.RowCounts[board1], Boards.PlayerIndices[board1], Boards.TileIndices[board1]);

const tileID: number = 55;
const playerID: number = 0;
const hasCrossed: boolean = false;
const hasMoved: boolean = false;

//Boards.setPiece(board1, MovementService.MoveFunctions[2](board1, tileID, 1) || tileID, 1, PieceTypes.Pawn);
Boards.setPiece(board1, 38, 1, PieceTypes.Pawn);

console.log(MovementService.getPossibleMovesFunction(board1, tileID, PieceTypes.King, hasCrossed, hasMoved));
console.log(MovementService.getPossibleAttacksFunction(board1, tileID, playerID, PieceTypes.King, hasCrossed, hasMoved));

console.log(MovementService.getMoatIDs(board1, 3, 1));

const render: boolean = true//false//
if (render) {
    let i = 0;
    const renderLoop = setInterval(() => {
        CanvasUpdate(true, "#111122");

        BoardService.renderBoard(board1, 0, 10, true);
    }, Registry.renderDelta*100);
}