import Boards from "./board.js";
import {PieceNames} from "./pieceData.js";
//import MovementManager from "./movementManager.js";

const board1: number = Boards.createBoard(4);
console.log(board1, Boards.ColumnCounts[board1], Boards.RowCounts[board1], Boards.Players[board1], Boards.Tiles[board1]);

const board2: number = Boards.createBoard(4);
console.log(board2, Boards.ColumnCounts[board2], Boards.RowCounts[board2], Boards.Players[board2], Boards.Tiles[board2]);

const board3: number = Boards.createBoard(4);
console.log(board3, Boards.ColumnCounts[board3], Boards.RowCounts[board3], Boards.Players[board3], Boards.Tiles[board3]);

const board4: number = Boards.createBoard(4);
console.log(board4, Boards.ColumnCounts[board4], Boards.RowCounts[board4], Boards.Players[board4], Boards.Tiles[board4]);

Boards.setPiece(board1, 100, PieceNames.Pawn, 0);
console.log(board1, Boards.ColumnCounts[board1], Boards.RowCounts[board1], Boards.Players[board1], Boards.Tiles[board1]);

//console.log("1", MovementManager.getInRightUntilStopped(board1, a, true, true));