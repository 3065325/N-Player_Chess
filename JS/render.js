import Board from "./board.js";
const board1 = new Board(1, 6);
console.log(board1);
setTimeout(() => {
    board1.setPiece(10, 0, 0);
    console.log(board1);
    setTimeout(() => {
        board1.movePiece(10, 11);
        console.log(board1);
    }, 5000);
}, 8000);
console.log(27);
const a = 1;
console.log(board1.moveDiagonalLeftIn(27, a));
//# sourceMappingURL=render.js.map