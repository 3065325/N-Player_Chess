
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

// export default Rules;