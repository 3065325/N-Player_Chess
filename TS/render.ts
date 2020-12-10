import Boards from "./board.js";
import { CanvasUpdate, vh, vw } from "./canvas.js";
import MovementService from "./movementService.js";
import {PieceTypes} from "./pieceData.js";
import Registry from "./registry.js";
import BoardService from "./renderService.js";
const mod: (a: number, b: number) => number = (a, b) => { return (a % b + b) % b };

const board1: number = BoardService.createBoard([-25*vw, 0*vh], 20*vh, 50*vh, ["#F5D293", "#985130"], 6);
console.log(board1, Boards.ColumnCounts[board1], Boards.RowCounts[board1], Boards.PlayerIndices[board1], Boards.TileIndices[board1]);

console.log("AA")

// const board2: number = BoardService.createBoard([25*vw, -25*vh], 6*vh, 20*vh, ["#F5D293", "#985130"], 3);
// console.log(board1, Boards.ColumnCounts[board1], Boards.RowCounts[board1], Boards.PlayerIndices[board1], Boards.TileIndices[board1]);

// const board3: number = BoardService.createBoard([0, 25*vh], 9*vh, 30*vh, ["#F5D293", "#985130"], 5);
// console.log(board3, Boards.ColumnCounts[board3], Boards.RowCounts[board3], Boards.PlayerIndices[board3], Boards.TileIndices[board3]);

// const board4: number = Boards.createBoard(4);
// console.log(board4, Boards.ColumnCounts[board4], Boards.RowCounts[board4], Boards.PlayerIndices[board4], Boards.TileIndices[board4]);

// Boards.setPiece(PieceTypes.Pawn, 0, board1, 100);
// console.log(board1, Boards.ColumnCounts[board1], Boards.RowCounts[board1], Boards.PlayerIndices[board1], Boards.TileIndices[board1]); 

//CanvasUpdate(true, "#111122");

// BoardService.renderBoard(board1, 1, 0, true);
// BoardService.renderBoard(board2, 0, 0, true);
// BoardService.renderBoard(board3, 2, 0, true);


// console.log(MovementService.getMoatIDs(board1, 1, 0));

let i = 0;

const renderLoop = setInterval(() => {
    CanvasUpdate(true, "#111122");

    BoardService.renderBoard(board1, Math.floor(i += Registry.renderDelta) % 6, 10, true);
}, Registry.renderDelta*1000);