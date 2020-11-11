import Board from "./board.js";
import MovementManager from "./movementManager.js";

const board1 = new Board(1, 6);
console.log(board1);

console.log(22);
const a: number = 10;
console.log(MovementManager.moveDiagonalRight(board1, 22, a));
// console.log(board1.moveDiagonalRightIn(27, a));