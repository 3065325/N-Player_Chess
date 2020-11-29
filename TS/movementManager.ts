const mod = (a, b) => { return (a % b) % b };
const floor = Math.floor;

class MovementManager {
    
}

// import Tile from "./tile.js";
// import Board from "./board";

// const mod = (a, b) => { return (a % b + b) % b };
// const floor = Math.floor;

// class MovementManager {
//     public static possibleMoveFunctions: Array<(board: Board, tileIndex: number, teamID?: number) => Array<number>> = [];

//     public static movePiece(board: Board, oldTileIndex: number, newTileIndex: number): void {
//         const oldTile = board.Tiles[oldTileIndex];
//         const newTile = board.Tiles[newTileIndex];

//         newTile.Occupation = oldTile.Occupation;
//         newTile.TeamID = oldTile.TeamID;
//         oldTile.Occupation = undefined;
//         oldTile.TeamID = undefined;
//     }

//     public static getPossibleMoves(board: Board, tileIndex: number): Array<number> | undefined {
//         const tileOccupation: number | undefined = board.Tiles[tileIndex].Occupation;
//         if (tileOccupation === undefined) {
//             console.log(board, tileIndex, board.Tiles[tileIndex], board.Tiles[tileIndex].Occupation)
//             return;
//         }

//         return MovementManager.possibleMoveFunctions[tileOccupation](board, tileIndex);
//     }

//     public static moveIn(board: Board, tileIndex: number, amount: number): number | undefined {
//         const differenceRatio: number = tileIndex/board.ColumnCount - amount;
//         const isCrossed = floor(0.5 * Math.sign(differenceRatio));
//         const flooredDR = floor(differenceRatio);

//         const newTileIndex = board.ColumnCount * (mod((tileIndex/board.ColumnCount + 0.5*isCrossed), 1) + isCrossed*(1 + 2*flooredDR) + flooredDR);

//         if (newTileIndex < board.ColumnCount*board.RowCount) return newTileIndex;
//     }

//     public static moveRight(board: Board, tileIndex: number, amount: number): number {
//         return mod(tileIndex + amount, board.ColumnCount) + floor(tileIndex / board.ColumnCount) * board.ColumnCount;
//     }

//     public static moveInRight(board: Board, tileIndex: number, amount: number): number {
//         const rowCount: number = board.RowCount - 1;
//         const tileT: number = tileIndex % board.ColumnCount;
//         const tileR: number = floor(tileIndex / board.ColumnCount);
//         const deltaRow: number = board.RowCount - (tileR + 1);
//         const moveT: number = mod(deltaRow + amount + rowCount, 2*rowCount + 1) - rowCount;
//         const moveR: number = Math.abs(moveT);

//         return mod(tileT - deltaRow + moveT, board.ColumnCount) + (rowCount - moveR)*board.ColumnCount;
//     }

//     public static moveInLeft(board: Board, tileIndex: number, amount: number): number {
//         const rowCount: number = board.RowCount - 1;
//         const tileT: number = tileIndex % board.ColumnCount;
//         const tileR: number = floor(tileIndex / board.ColumnCount);
//         const deltaRow: number = board.RowCount - (tileR + 1);
//         const moveT: number = mod(deltaRow + amount + rowCount, 2*rowCount + 1) - rowCount;
//         const moveR: number = Math.abs(moveT);

//         return mod(tileT + deltaRow - moveT, board.ColumnCount) + (rowCount - moveR)*board.ColumnCount;
//     }

//     public static getInUntilStopped(board: Board, tileIndex: number, inward: boolean, outward: boolean): Array<number> {
//         if (!(inward || outward)) return [];

//         const tile: Tile = board.Tiles[tileIndex];
//         const reachableTiles: Array<number> = [];

//         const row: number = Math.floor(tileIndex / board.ColumnCount);
//         let nextTileIndex: number | undefined = tileIndex;
//         let nextTile: Tile = tile;

//         const addInByAmount: Function = (index: number, amount: number, sign: number) => {
//             for (let i = 1; i < amount; i++) {
//                 nextTileIndex = MovementManager.moveIn(board, index, sign * i);
//                 if (nextTileIndex === undefined) break;
//                 console.log(i, nextTileIndex)

//                 nextTile = board.Tiles[nextTileIndex];
//                 if (nextTile.TeamID === tile.TeamID) break;

//                 reachableTiles[reachableTiles.length] = nextTileIndex;
//                 if (nextTile.TeamID !== undefined) break;
//             }
//         }

//         if (inward) addInByAmount(tileIndex, board.RowCount + row, 1);

//         if (outward) addInByAmount(tileIndex, board.RowCount - row, -1);

//         return reachableTiles;
//     }

//     public static getRightUntilStopped(board: Board, tileIndex: number, rightward: boolean, leftward: boolean): Array<number> {
//         console.log(rightward, leftward, !(rightward || leftward))
//         if (!(rightward || leftward)) return [];

//         const tile: Tile = board.Tiles[tileIndex];
//         const reachableTiles: Array<number> = [];

//         let nextTileIndex: number = tileIndex;
//         let nextTile: Tile = tile;

//         const addRightByAmount: Function = (index: number, amount: number, sign: number) => {
//             for (let i = 1; i < amount; i++) {
//                 nextTileIndex = MovementManager.moveRight(board, index, sign * i);
//                 console.log(i, sign, nextTileIndex)

//                 nextTile = board.Tiles[nextTileIndex];
//                 console.log(nextTile)
//                 if (nextTile.TeamID === tile.TeamID) break;

//                 reachableTiles[reachableTiles.length] = nextTileIndex;
//                 console.log(reachableTiles)
//                 if (nextTile.TeamID !== undefined) break;
//             }
//         }

//         if (rightward) addRightByAmount(tileIndex, board.ColumnCount, 1);

//         if (reachableTiles.length !== board.ColumnCount - 1 &&
//             leftward) addRightByAmount(tileIndex, board.ColumnCount, -1);

//         return reachableTiles;
//     }

//     public static getInRightUntilStopped(board: Board, tileIndex: number, inrightward: boolean, outleftward: boolean): Array<number> {
//         if (!(inrightward || outleftward)) return [];

//         const tile: Tile = board.Tiles[tileIndex];
//         const reachableTiles: Array<number> = [];

//         let nextTileIndex: number = tileIndex;
//         let nextTile: Tile = tile;

//         const addInRightByAmount: Function = (index: number, amount: number, sign: number) => {
//             for (let i = 1; i < amount; i++) {
//                 nextTileIndex = MovementManager.moveInRight(board, index, sign * i);

//                 nextTile = board.Tiles[nextTileIndex];
//                 if (nextTile.TeamID === tile.TeamID) break;

//                 if (!reachableTiles.includes(nextTileIndex)) reachableTiles[reachableTiles.length] = nextTileIndex;

//                 if (nextTile.TeamID !== undefined) break;
//             }
//         }

//         if (inrightward) addInRightByAmount(tileIndex, 2*board.RowCount - 2, 1);

//         console.log(reachableTiles.length)
//         if (reachableTiles.length !== 2*board.RowCount - 3 &&
//             outleftward) addInRightByAmount(tileIndex, 2*board.RowCount - 1, -1);

//         return reachableTiles;
//     }

//     public static getInLeftUntilStopped(board: Board, tileIndex: number, inleftward: boolean, outrightward: boolean): Array<number> {
//         if (!(inleftward || outrightward)) return [];

//         const tile: Tile = board.Tiles[tileIndex];
//         const reachableTiles: Array<number> = [];

//         let nextTileIndex: number = tileIndex;
//         let nextTile: Tile = tile;

//         const addInLeftByAmount: Function = (index: number, amount: number, sign: number) => {
//             for (let i = 1; i < amount; i++) {
//                 nextTileIndex = MovementManager.moveInLeft(board, index, sign * i);
//                 console.log(i, nextTileIndex)

//                 nextTile = board.Tiles[nextTileIndex];
//                 if (nextTile.TeamID === tile.TeamID) break;

//                 if (!reachableTiles.includes(nextTileIndex)) reachableTiles[reachableTiles.length] = nextTileIndex;

//                 if (nextTile.TeamID !== undefined) break;
//             }
//         }

//         if (inleftward) addInLeftByAmount(tileIndex, 2*board.RowCount - 2, 1);

//         if (reachableTiles.length !== 2*board.RowCount - 3 &&
//             outrightward) addInLeftByAmount(tileIndex, 2*board.RowCount - 2, -1);

//         return reachableTiles;
//     }
// }

// MovementManager.possibleMoveFunctions[0/*Pawn*/] = (board: Board, tileIndex: number, teamID?: number): Array<number> => {
//     const tile: Tile = board.Tiles[tileIndex];
//     const reachableTiles: Array<number> = [];

//     let nextTileIndex: number = tileIndex;
//     let nextTile: Tile = tile;

//     const row: number = Math.floor(tileIndex / board.ColumnCount);
    
//     nextTileIndex = MovementManager.mo
// }

// MovementManager.possibleMoveFunctions[1/*Knight*/] = (board: Board, tileIndex: number, teamID?: number): Array<number> => {

// }

// MovementManager.possibleMoveFunctions[2/*Bishop*/] = (board: Board, tileIndex: number, teamID?: number): Array<number> => {

// }

// MovementManager.possibleMoveFunctions[3/*Rook*/] = (board: Board, tileIndex: number, teamID?: number): Array<number> => {

// }

// MovementManager.possibleMoveFunctions[4/*Queen*/] = (board: Board, tileIndex: number, teamID?: number): Array<number> => {

// }

// MovementManager.possibleMoveFunctions[5/*King*/] = (board: Board, tileIndex: number, teamID?: number): Array<number> => {

// }

// export default MovementManager;