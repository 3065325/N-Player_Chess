import Boards from "./board.js";
import {PieceTypes} from "./pieceData.js";
//import MovementManager from "./movementManager.js";

const board1: number = Boards.createBoard(4);
console.log(board1, Boards.ColumnCounts[board1], Boards.RowCounts[board1], Boards.PlayerIndices[board1], Boards.TileIndices[board1]);

const board2: number = Boards.createBoard(4);
console.log(board2, Boards.ColumnCounts[board2], Boards.RowCounts[board2], Boards.PlayerIndices[board2], Boards.TileIndices[board2]);

const board3: number = Boards.createBoard(4);
console.log(board3, Boards.ColumnCounts[board3], Boards.RowCounts[board3], Boards.PlayerIndices[board3], Boards.TileIndices[board3]);

const board4: number = Boards.createBoard(4);
console.log(board4, Boards.ColumnCounts[board4], Boards.RowCounts[board4], Boards.PlayerIndices[board4], Boards.TileIndices[board4]);

Boards.setPiece(board1, 100, PieceTypes.Pawn, 0);
console.log(board1, Boards.ColumnCounts[board1], Boards.RowCounts[board1], Boards.PlayerIndices[board1], Boards.TileIndices[board1]);

//console.log("1", MovementManager.getInRightUntilStopped(board1, a, true, true));