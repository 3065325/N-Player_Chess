import Players from "./player.js";
import Tiles from "./tile.js";
import Pieces from "./pieces.js";
import {PieceNames} from "./pieceData.js";

class Boards {
    public static PlayerCounts: Array<number> = [];
    public static ColumnCounts: Array<number> = [];
    public static RowCounts: Array<number> = [];

    public static Players: Array<Array<number>> = [];
    public static Tiles: Array<Array<number>> = [];

    private static Counter: number = 0;
    private static IndexStack: Array<number> = [];

    public static createBoard(playerCount: number, columnCount?: number, rowCount?: number): number {
        columnCount = columnCount || 8*playerCount;
        rowCount = rowCount || 6;

        const nextIndex: number = Boards.IndexStack.pop() || Boards.Counter++;

        Boards.PlayerCounts[nextIndex] = playerCount;
        Boards.ColumnCounts[nextIndex] = columnCount;
        Boards.RowCounts[nextIndex] = rowCount;

        let tempArray: Array<number> = new Array(playerCount);
        const colorIncrement: number = 360/playerCount;
        for (let i = 0; i < playerCount; i++) {
            tempArray[i] = Players.createPlayer(nextIndex, `Team ${i + 1}`, `hsl(${i*colorIncrement}, 55%, 40%)`);
        }
        Boards.Players[nextIndex] = tempArray;

        tempArray = new Array(columnCount*rowCount);
        for (let i = 0; i < tempArray.length; i++) {
           tempArray[i] = Tiles.createTile(nextIndex);
        }
        Boards.Tiles[nextIndex] = tempArray;

        return nextIndex;
    }

    public static removeBoard(boardIndex: number): void {
        if (boardIndex < 1 || boardIndex > Boards.Counter) return;

        Boards.IndexStack.push(boardIndex);

        delete Boards.PlayerCounts[boardIndex];
        delete Boards.ColumnCounts[boardIndex];
        delete Boards.RowCounts[boardIndex];

        delete Boards.Players[boardIndex];
        delete Boards.Tiles[boardIndex];
    }

    public static setPiece(pieceType: PieceNames, playerID: number, boardIndex: number, tileID: number): number {
        const playerIndex: number = Boards.Players[boardIndex][playerID];
        const pieceIndex: number = Pieces.createPiece(pieceType, playerIndex);
        Players.Pieces[playerIndex].push(pieceIndex);

        const tileIndex: number = Boards.Tiles[boardIndex][tileID];
        Tiles.Occupations[tileIndex] = pieceIndex;

        return pieceIndex;
    }
}

export default Boards;

// class Board {
//     public static Boards: Array<Board> =  [];

//     public BoardID: number;

//     public PlayerCount: number;
//     public RowCount: number
//     public ColumnCount: number;

//     public Teams: Array<Team>;
//     public Tiles: Array<Tile>;

//     constructor(playerCount: number, rowCount: number) {
//         this.BoardID = Board.Boards.length;

//         this.PlayerCount = playerCount;
//         this.RowCount = rowCount;
//         this.ColumnCount = this.PlayerCount * 8;

//         this.Teams = new Array(this.PlayerCount);
//         this.Tiles = new Array(this.RowCount * this.ColumnCount);
        
//         this.initialize();
//     }

//     private initialize(): void {
//         Board.Boards[this.BoardID] = this;

//         const colorIncrement = 360/this.PlayerCount;
//         for (let i = 0; i < this.PlayerCount; i++) {
//             this.Teams[i] = new Team(this.BoardID, i, `Team ${i + 1}`, `hsl(${i * colorIncrement}, 100%, 50%)`);
//         }

//         for (let i = 0; i < this.Tiles.length; i++) {
//             this.Tiles[i] = new Tile(this.BoardID);
//         }
//     }

//     public editTeam(teamID: number, name: string, color: string): void {
//         const team = this.Teams[teamID];
//         team.Name = name;
//         team.Color = color;
//     }

//     public setPiece(pieceType: number, pieceID: number, teamID: number, tileIndex: number): void {
//         const tile: Tile = this.Tiles[tileIndex];
//         tile.Occupation = pieceID;
//         tile.TeamID = teamID;
//     }

//     public removePiece(tileIndex: number): void {
//         const tile: Tile = this.Tiles[tileIndex];
//         tile.Occupation = undefined;
//         tile.TeamID = undefined;
//     }

//     public getTileID(column: number, row: number): number{
//         return (column % this.ColumnCount) + (row % this.RowCount) * this.ColumnCount;
//     }
// }

// export default Board;