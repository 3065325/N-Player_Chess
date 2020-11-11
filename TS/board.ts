import Team from "./team.js";
import Pieces from "./pieces.js";

class Tile {
    public BoardID: number;
    public TeamID: number | undefined;
    public Occupation: number | undefined;

    constructor(boardID: number, teamID?: number, Occupation?: number) {
        this.BoardID = boardID;
        this.TeamID = teamID || undefined;
        this.Occupation = Occupation || undefined;
    }
}

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

    public movePiece(oldTileIndex: number, newTileIndex: number): void {
        const oldTile = this.Tiles[oldTileIndex];
        const newTile = this.Tiles[newTileIndex];

        newTile.Occupation = oldTile.Occupation;
        newTile.TeamID = oldTile.TeamID;
        oldTile.Occupation = undefined;
        oldTile.TeamID = undefined;
    }

    public setPiece(tileIndex: number, teamID: number, pieceID: number): void {
        this.Tiles[tileIndex].Occupation = pieceID;
        this.Tiles[tileIndex].TeamID = teamID;
    }

    public getTileID(column: number, row: number): number{
        return (column % this.ColumnCount) + (row % this.RowCount) * this.ColumnCount;
    }

    public getPossiblePawnMoves(tileIndex: number): Array<number> | undefined {
        const possibleMoves: Array<number> = [];
        const pieceID: number | undefined = this.Tiles[tileIndex].Occupation;
        if (!pieceID) return;

        return possibleMoves;
    }
}

export default Board;