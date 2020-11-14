import Team from "./team.js";
import Tile from "./tile.js";
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
    setPiece(tileIndex, teamID, pieceID) {
        const tile = this.Tiles[tileIndex];
        tile.Occupation = pieceID;
        tile.TeamID = teamID;
    }
    removePiece(tileIndex, teamID) {
        const tile = this.Tiles[tileIndex];
        tile.Occupation = undefined;
        tile.TeamID = undefined;
        console.log(tileIndex, teamID);
    }
    getTileID(column, row) {
        return (column % this.ColumnCount) + (row % this.RowCount) * this.ColumnCount;
    }
}
Board.Boards = [];
export default Board;
//# sourceMappingURL=board.js.map