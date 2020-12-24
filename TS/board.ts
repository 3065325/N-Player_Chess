import Players from "./player.js";
import Tiles from "./tile.js";
import Pieces from "./pieces.js";
import {PieceData, PieceTypes} from "./pieceData.js";
import MovementService from "./movementService.js";

class Boards {
    public static PlayerCounts: Array<number> = [];
    public static ColumnCounts: Array<number> = [];
    public static RowCounts: Array<number> = [];
    public static ColumnCountPerPlayers: Array<number> = [];

    public static PlayerIndices: Array<Array<number>> = [];
    public static TileIndices: Array<Array<number>> = [];
    public static MoatIDsBridged: Array<Map<number, boolean>> = [];

    private static Counter: number = 0;
    private static IndexStack: Array<number> = [];

    public static createBoard(playerCount: number, rowCount?: number, columnsPerPlayer?: number): number {
        rowCount = rowCount || 2*playerCount;
        columnsPerPlayer = columnsPerPlayer || 8;
        const columnCount = columnsPerPlayer*playerCount;

        const nextIndex: number = Boards.IndexStack.pop() || Boards.Counter++;

        Boards.PlayerCounts[nextIndex] = playerCount;
        Boards.ColumnCounts[nextIndex] = columnCount;
        Boards.RowCounts[nextIndex] = rowCount;
        Boards.ColumnCountPerPlayers[nextIndex] = columnsPerPlayer;

        let tempArray: Array<number> = new Array(playerCount);
        for (let i = 0; i < playerCount; i++) {
            tempArray[i] = Players.createPlayer(nextIndex, `Team ${i + 1}`);
        }
        Boards.PlayerIndices[nextIndex] = tempArray;

        tempArray = new Array(columnCount*rowCount);
        for (let i = 0; i < tempArray.length; i++) {
            tempArray[i] = Tiles.createTile(nextIndex);
        }
        Boards.TileIndices[nextIndex] = tempArray;

        let tempMap: Map<number, boolean> = new Map();
        for (let i = 0; i < playerCount; i++) {
            tempMap.set(columnCount*(rowCount - 1) + i*columnsPerPlayer, false);
        }
        Boards.MoatIDsBridged[nextIndex] = tempMap;

        return nextIndex;
    }

    public static removeBoard(boardIndex: number): void {
        if (boardIndex < 1 || boardIndex > Boards.Counter) return;

        Boards.IndexStack.push(boardIndex);

        delete Boards.PlayerCounts[boardIndex];
        delete Boards.ColumnCounts[boardIndex];
        delete Boards.ColumnCountPerPlayers[boardIndex];
        delete Boards.RowCounts[boardIndex];

        delete Boards.PlayerIndices[boardIndex];
        delete Boards.TileIndices[boardIndex];
        delete Boards.MoatIDsBridged[boardIndex];
    }

    public static setPiece(boardIndex: number, tileID: number, playerID: number, pieceType: PieceTypes): number {
        console.log("Setting Piece at tileID:", tileID);
        const playerIndex: number = Boards.PlayerIndices[boardIndex][playerID];
        const pieceIndex: number = Pieces.createPiece(pieceType, playerIndex);
        Players.Pieces[playerIndex].push(pieceIndex);

        const tileIndex: number = Boards.TileIndices[boardIndex][tileID];
        Tiles.Occupations[tileIndex] = pieceIndex;

        setAttackedTiles(boardIndex, tileID, pieceType, false, false);

        updateAttackedTiles(boardIndex, tileID);

        return pieceIndex;
    }

    public static movePiece(boardIndex: number, tile0ID: number, tile1ID: number): [PieceTypes, number] | undefined {
        console.log("Moving from tile0ID:", tile0ID, "to tile1ID:", tile1ID);

        const tile0Index: number = Boards.TileIndices[boardIndex][tile0ID];
        const tile1Index: number = Boards.TileIndices[boardIndex][tile1ID];

        const piece0Index: number | undefined = Tiles.Occupations[tile0Index];
        if (piece0Index === undefined) return;

        //const piece1Index: number | undefined = Tiles.Occupations[tile1Index];

        Tiles.Occupations[tile1Index] = piece0Index;
        Tiles.Occupations[tile0Index] = undefined;

        const piece0Type: PieceTypes = Pieces.PieceTypes[piece0Index];
        const piece0HasCrossed: boolean | undefined = Pieces.HasCrossed.get(piece0Index);
        const piece0HasMoved: boolean | undefined = Pieces.HasMoved.get(piece0Index);

        clearAttackedTiles(boardIndex, tile0ID);
        setAttackedTiles(boardIndex, tile1ID, piece0Type, piece0HasCrossed, piece0HasMoved);

        updateAttackedTiles(boardIndex, tile0ID);
        updateAttackedTiles(boardIndex, tile1ID);

        return
    }
}

function setAttackedTiles(boardIndex: number, tileID: number, pieceType: PieceTypes, hasCrossed?: boolean, hasMoved?: boolean): void {
    const tileIndex: number = Boards.TileIndices[boardIndex][tileID];
    console.log("settingAttackedTiles:", boardIndex, tileID, pieceType, hasCrossed, hasMoved);

    const possibleTileIDs: Array<number> = MovementService.getPossibleTilesFunction(boardIndex, tileID, pieceType, hasCrossed, hasMoved);
    possibleTileIDs.forEach((attackedTileID) => {
        console.log("CanAttackTile:", attackedTileID, "TileAttackedBy:", tileID);
        const attackedTileIndex: number = Boards.TileIndices[boardIndex][attackedTileID];
        Tiles.CanAttack[tileIndex].push(attackedTileID);
        Tiles.AttackedBy[attackedTileIndex].push(tileID);
    });
}

function clearAttackedTiles(boardIndex: number, tileID: number): void {
    const tileIndex: number = Boards.TileIndices[boardIndex][tileID];
    console.log("clearingAttackedTiles:", boardIndex, tileID);

    Tiles.CanAttack[tileIndex].forEach((attackedTileID) => {
        console.log("Clearing Attacked Tile:", attackedTileID);
        const attackedTileIndex: number = Boards.TileIndices[boardIndex][attackedTileID];
        const index: number = Tiles.AttackedBy[attackedTileIndex].indexOf(tileID);
        if (index === -1) return;

        Tiles.AttackedBy[attackedTileIndex].splice(index, 1);
    });

    console.log("Cleared CanAttacked Tiles:", boardIndex, tileID);
    Tiles.CanAttack[tileIndex] = [];
}

function updateAttackedTiles(boardIndex: number, tileID: number): void {
    console.log("Updating AttackedBy and CanAttack arrays at tileID:", tileID);

    const tileIndex: number = Boards.TileIndices[boardIndex][tileID];
    Tiles.AttackedBy[tileIndex].forEach((nextTileID) => {
        const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
        const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
        if (nextPieceIndex === undefined) { console.warn("nextPieceIndex === undefined when looping through AttackedBy array", nextTileID, "From tileID", tileID); return; }

        const nextPieceType: number = Pieces.PieceTypes[nextPieceIndex];
        if (PieceData[nextPieceType].attacksContinuously === false) return;

        const nextPieceHasCrossed: boolean | undefined = Pieces.HasCrossed.get(nextPieceIndex);
        const nextPieceHasMoved: boolean | undefined = Pieces.HasMoved.get(nextPieceIndex);

        clearAttackedTiles(boardIndex, nextTileID);
        setAttackedTiles(boardIndex, nextTileID, nextPieceType, nextPieceHasCrossed, nextPieceHasMoved);
    });
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