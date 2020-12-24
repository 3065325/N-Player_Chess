import Boards from "./board.js";
import { CanvasUpdate, vh, vw } from "./canvas.js";
import MovementService from "./movementService.js";
import {PieceTypes} from "./pieceData.js";
import Registry from "./registry.js";
import BoardService from "./renderService.js";
const mod: (a: number, b: number) => number = (a, b) => { return (a % b + b) % b };

const board1: number = BoardService.createBoard([0*vw, 0*vh], 20*vh, 50*vh, ["#F5D293", "#985130", "#3A6327"], 2, 4, 4);
console.log(board1, Boards.ColumnCounts[board1], Boards.RowCounts[board1], Boards.PlayerIndices[board1], Boards.TileIndices[board1]);

const tileID: number = 20;
const playerID: number = 0;
const hasCrossed: boolean = true;
const hasMoved: boolean = true;
const type: PieceTypes = PieceTypes.King;

// Boards.setPiece(board1, MovementService.MoveFunctions[2](board1, tileID, 1) || tileID, 1, PieceTypes.Pawn);
Boards.setPiece(board1, 17, 0, PieceTypes.Rook);
Boards.setPiece(board1, 15, 1, PieceTypes.Pawn);
Boards.setPiece(board1, 22, 1, PieceTypes.Pawn);
Boards.movePiece(board1, 22, 14);

const possibleMoves: Array<number> = MovementService.getPossibleMovesFunction(board1, tileID, type, hasCrossed, hasMoved);
console.log(possibleMoves);

const possibleAttacks: Array<number> = MovementService.getPossibleAttacksFunction(board1, tileID, playerID, type, hasCrossed, hasMoved)
console.log(possibleAttacks);

const possibleTiles: Array<number> = MovementService.getPossibleTilesFunction(board1, tileID, type, hasCrossed, hasMoved)
console.log(possibleTiles);

const render: boolean = false//

CanvasUpdate(true, "#111122");
BoardService.renderBoard(board1, 0, 10, true);
BoardService.highlightTiles(board1, possibleMoves, 0, Registry.moveColor);
BoardService.highlightTiles(board1, possibleAttacks, 0, Registry.attackColor);
//BoardService.highlightTiles(board1, possibleTiles, 0, "#FFBE00aa");

let lastLoop = new Date();
let sum: number = 0;
let amount: number = 0;
if (render) {
    let i = 0;
    const renderLoop = setInterval(() => {
        CanvasUpdate(true, "#111122");

        BoardService.renderBoard(board1, 0, 10, true);

        let thisLoop = new Date();
        sum += 1000 / (+thisLoop - +lastLoop);
        amount++;
        console.log("FPS: ", Math.round(sum/amount));
        lastLoop = thisLoop;
    }, 1000*Registry.renderDelta * 10000);
}