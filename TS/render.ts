import Boards from "./board.js";
import InteractionService from "./interactionService.js";
import { canvas, CanvasUpdate, mousePos, vh, vw } from "./canvas.js";
import MovementService from "./movementService.js";
import {PieceTypes} from "./pieceData.js";
import Registry from "./registry.js";
import { BoardService, PieceService } from "./renderService.js";
import Tiles from "./tile.js";

type Vector2D = [number, number];

const mod: (a: number, b: number) => number = (a, b) => { return (a % b + b) % b };

const board1: number = BoardService.createBoard([0*vw, 0*vh], 20*vh, 50*vh, ["#F5D293", "#985130", "#3A6327"], 3);
console.log(board1, Boards.ColumnCounts[board1], Boards.RowCounts[board1], Boards.PlayerIndices[board1], Boards.TileIndices[board1]);

Boards.generateDefault(board1);

const tileID: number = 20;
const playerID: number = 0;
const hasCrossed: boolean = true;
const hasMoved: boolean = true;
const type: PieceTypes = PieceTypes.King;

const possibleMoves: Array<number> = MovementService.getPossibleMovesFunction(board1, tileID, type, playerID, hasCrossed, hasMoved);
console.log(possibleMoves);

const possibleAttacks: Array<number> = MovementService.getPossibleAttacksFunction(board1, tileID, playerID, type, hasCrossed, hasMoved)
console.log(possibleAttacks);

const possibleTiles: Array<number> = MovementService.getPossibleTilesFunction(board1, tileID, type, hasCrossed, hasMoved)
console.log(possibleTiles);

const render: boolean = true

// CanvasUpdate("#111122");
// BoardService.renderBoard(board1, 0, 10, true);
// BoardService.highlightTiles(board1, possibleMoves, 0, Registry.moveColor);
// BoardService.highlightTiles(board1, possibleAttacks, 0, Registry.attackColor);
// BoardService.highlightTiles(board1, possibleTiles, 0, "#FFBE00aa");


const tileIndex: number = Boards.TileIndices[board1][13];
console.log(Tiles.CanAttack[tileIndex])
//BoardService.highlightTiles(board1, Tiles.CanAttack[tileIndex], 0, "#FFBE00aa");

// CanvasUpdate("#111122");
// BoardService.renderBoard(board1, playerID, 10, true);

class RenderService {

}

let lastLoop = new Date();
let sum: number = 0;
let amount: number = 0;
let i = 0;
if (render) {
    const renderLoop = setInterval(() => {
        CanvasUpdate("#111122");

        BoardService.renderBoard(board1, 10, true);
        BoardService.renderSelectedTile(board1, "#FFFF9755");

        let thisLoop = new Date();
        sum += 1000 / (+thisLoop - +lastLoop);
        amount++;
        // console.log("FPS: ", Math.round(sum/amount));
        lastLoop = thisLoop;
    }, 1000*Registry.renderDelta);
}

canvas.addEventListener('mousedown', (e) => {
    BoardService.selectTileID(board1, mousePos);
});
