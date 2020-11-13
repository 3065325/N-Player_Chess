import Team from "./team.js";
import Tile from "./tile.js";
import Pieces from "./pieces.js";

class Board {
    public static Boards: Array<Board> =  [];

    public BoardID: number;

    public PlayerCount: number;
    public RowCount: number
    public ColumnCount: number;

    public Teams: Array<Team>;
    public Tiles: Array<Tile>;

    constructor(playerCount: number, rowCount: number) {
        this.BoardID = Board.Boards.length;

        this.PlayerCount = playerCount;
        this.RowCount = rowCount;
        this.ColumnCount = this.PlayerCount * 8;

        this.Teams = new Array(this.PlayerCount);
        this.Tiles = new Array(this.RowCount * this.ColumnCount);
        
        this.initialize();
    }

    private initialize(): void {
        Board.Boards[this.BoardID] = this;

        const colorIncrement = 360/this.PlayerCount;
        for (let i = 0; i < this.PlayerCount; i++) {
            this.Teams[i] = new Team(this.BoardID, i, `Team ${i + 1}`, `hsl(${i * colorIncrement}, 100%, 50%)`);
        }

        for (let i = 0; i < this.Tiles.length; i++) {
            this.Tiles[i] = new Tile(this.BoardID);
        }
    }

    public editTeam(teamID: number, name: string, color: string): void {
        const team = this.Teams[teamID];
        team.Name = name;
        team.Color = color;
    }

    public setPiece(tileIndex: number, teamID: number, pieceID: number): void {
        const tile: Tile = this.Tiles[tileIndex];
        tile.Occupation = pieceID;
        tile.TeamID = teamID;
        console.log(tileIndex, teamID, pieceID);
    }

    public removePiece(tileIndex: number, teamID: number): void {
        const tile: Tile = this.Tiles[tileIndex];
        tile.Occupation = undefined;
        tile.TeamID = undefined;
        console.log(tileIndex, teamID);
    }

    public getTileID(column: number, row: number): number{
        return (column % this.ColumnCount) + (row % this.RowCount) * this.ColumnCount;
    }
}

export default Board;