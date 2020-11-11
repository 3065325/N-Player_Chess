import Team from "./team.js";
function mod(a, b) {
    return (a % b + b) % b;
}
class Tile {
    constructor(boardID, teamID, Occupation) {
        this.BoardID = boardID;
        this.TeamID = teamID || undefined;
        this.Occupation = Occupation || undefined;
    }
}
class Board {
    constructor(playerCount, rowCount) {
        this.BoardID = Board.Boards.length;
        this.PlayerCount = playerCount;
        this.RowCount = rowCount;
        this.ColumnCount = this.PlayerCount * 8;
        this.Teams = new Array(this.PlayerCount);
        this.Tiles = new Array(this.RowCount * this.ColumnCount);
        this.initialize();
    }
    initialize() {
        Board.Boards[this.BoardID] = this;
        const colorIncrement = 360 / this.PlayerCount;
        for (let i = 0; i < this.PlayerCount; i++) {
            this.Teams[i] = new Team(this.BoardID, i, `Team ${i + 1}`, `hsl(${i * colorIncrement}, 100%, 50%)`);
        }
        for (let i = 0; i < this.Tiles.length; i++) {
            this.Tiles[i] = new Tile(this.BoardID);
        }
    }
    editTeam(teamID, name, color) {
        const team = this.Teams[teamID];
        team.Name = name;
        team.Color = color;
    }
    movePiece(oldTileIndex, newTileIndex) {
        const oldTile = this.Tiles[oldTileIndex];
        const newTile = this.Tiles[newTileIndex];
        newTile.Occupation = oldTile.Occupation;
        newTile.TeamID = oldTile.TeamID;
        oldTile.Occupation = undefined;
        oldTile.TeamID = undefined;
    }
    setPiece(tileIndex, teamID, pieceID) {
        this.Tiles[tileIndex].Occupation = pieceID;
        this.Tiles[tileIndex].TeamID = teamID;
    }
    getTileID(column, row) {
        return (column % this.ColumnCount) + (row % this.RowCount) * this.ColumnCount;
    }
    getPossiblePawnMoves(tileIndex) {
        const possibleMoves = [];
        const pieceID = this.Tiles[tileIndex].Occupation;
        if (!pieceID)
            return;
        return possibleMoves;
    }
    moveIn(tileIndex, amount) {
        const differenceRatio = tileIndex / this.ColumnCount - amount;
        const isCrossed = Math.floor(0.5 * Math.sign(differenceRatio));
        const flooredDR = Math.floor(differenceRatio);
        const newTileIndex = this.ColumnCount * (((tileIndex / this.ColumnCount + 0.5 * isCrossed) % 1) + isCrossed * (1 + 2 * flooredDR) + flooredDR);
        if (newTileIndex < this.ColumnCount * this.RowCount)
            return newTileIndex;
    }
    moveOut(tileIndex, amount) {
        const newIndex = tileIndex + this.ColumnCount * amount;
        if (this.Tiles[newIndex])
            return newIndex;
        return undefined;
    }
    moveRight(tileIndex, amount) {
        return Math.floor(tileIndex / this.ColumnCount) * this.ColumnCount + (tileIndex + amount) % this.ColumnCount;
    }
    moveLeft(tileIndex, amount) {
        return Math.floor(tileIndex / this.ColumnCount) * this.ColumnCount + (tileIndex - amount) % this.ColumnCount;
    }
    moveDiagonalRightIn(tileIndex, amount) {
        const rowCount = this.RowCount - 1;
        const tileT = tileIndex % this.ColumnCount;
        const tileR = Math.floor(tileIndex / this.ColumnCount);
        const deltaRow = this.RowCount - (tileR + 1);
        const moveT = (deltaRow + amount + rowCount) % (2 * rowCount + 1) - rowCount;
        const moveR = Math.abs(moveT);
        return mod(tileT - moveT + deltaRow, this.ColumnCount) + (rowCount - moveR) * this.ColumnCount;
    }
    moveDiagonalLeftIn(tileIndex, amount) {
        const rowCount = this.RowCount - 1;
        const tileT = tileIndex % this.ColumnCount;
        const tileR = Math.floor(tileIndex / this.ColumnCount);
        const deltaRow = this.RowCount - (tileR + 1);
        const moveT = (deltaRow + amount + rowCount) % (2 * rowCount + 1) - rowCount;
        const moveR = Math.abs(moveT);
        return mod(tileT + moveT - deltaRow, this.ColumnCount) + (rowCount - moveR) * this.ColumnCount;
    }
}
Board.Boards = [];
export default Board;
//# sourceMappingURL=board.js.map