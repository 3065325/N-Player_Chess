import Players from "./player.js";
import Tiles from "./tile.js";
import Pieces from "./pieces.js";
import {PieceData, PieceTypes} from "./pieceData.js";
import MovementService from "./movementService.js";

enum GameState {
    Starting = 0,
    Started,
    Ended
}

class Boards {
    public static PlayerCounts: Array<number> = [];
    public static ColumnCounts: Array<number> = [];
    public static RowCounts: Array<number> = [];
    public static ColumnCountPerPlayers: Array<number> = [];

    public static PlayerIndices: Array<Array<number>> = [];
    public static TileIndices: Array<Array<number>> = [];
    public static MoatIDsBridged: Array<Map<number, boolean>> = [];

    public static GameStates: Array<GameState> = [];
    public static CurrentPlayers: Array<number | undefined> = [];
    public static RemainingPlayers: Array<Array<number>> = [];

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
            tempArray[i] = Players.createPlayer(nextIndex);
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

        Boards.GameStates[nextIndex] = GameState.Started;
        Boards.CurrentPlayers[nextIndex] = 0;
        Boards.RemainingPlayers[nextIndex] = Boards.PlayerIndices[nextIndex];

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

    public static iterateCurrentPlayer(boardIndex: number): void {
        const playerCount: number = Boards.PlayerCounts[boardIndex];
        const currentPlayerID: number | undefined = Boards.CurrentPlayers[boardIndex];
        if (currentPlayerID === undefined) return;

        Boards.CurrentPlayers[boardIndex] = (currentPlayerID + 1) % playerCount;
    }

    public static eliminatePlayer(boardIndex: number, playerID: number): void {
        Boards.RemainingPlayers[boardIndex].splice(playerID, 1);

        const playerIndex: number = Boards.PlayerIndices[boardIndex][playerID];
        Players.IsDead[playerIndex] = true;

        Players.Pieces[playerIndex].forEach((pieceIndex) => {
            const tileID: number | undefined = Pieces.TileIDs[pieceIndex];
            if (tileID === undefined) return;
            
            clearAttackedTiles(boardIndex, tileID);
        });
    }

    public static setPiece(boardIndex: number, tileID: number, playerID: number, pieceType: PieceTypes): number {
        // console.log("Setting Piece at tileID:", tileID);
        const playerIndex: number = Boards.PlayerIndices[boardIndex][playerID];
        const pieceIndex: number = Pieces.createPiece(pieceType, playerIndex);
        Pieces.TileIDs[pieceIndex] = tileID;
        Players.Pieces[playerIndex].push(pieceIndex);

        const tileIndex: number = Boards.TileIndices[boardIndex][tileID];
        Tiles.Occupations[tileIndex] = pieceIndex;

        setAttackedTiles(boardIndex, tileID, playerID, pieceType, false, false);

        // console.log(boardIndex, tileID, playerID, pieceType);
        updateAttackedTiles(boardIndex, tileID);

        return pieceIndex;
    }

    public static movePiece(boardIndex: number, tile0ID: number, tile1ID: number): number | undefined {
        // console.log("Moving from tile0ID:", tile0ID, "to tile1ID:", tile1ID);

        const tile0Index: number = Boards.TileIndices[boardIndex][tile0ID];
        const tile1Index: number = Boards.TileIndices[boardIndex][tile1ID];

        const piece0Index: number | undefined = Tiles.Occupations[tile0Index];
        if (piece0Index === undefined) return;

        const piece1Index: number | undefined = Tiles.Occupations[tile1Index];

        const player0Index: number = Pieces.PlayerIndices[piece0Index];
        if (piece1Index !== undefined && Pieces.PlayerIndices[piece1Index] === player0Index) return undefined;

        const piece0Type: PieceTypes = Pieces.PieceTypes[piece0Index];
        if (PieceData[piece0Type].storeMoved) Pieces.HasMoved.set(piece0Index, true);

        Tiles.Occupations[tile1Index] = piece0Index;

        Boards.removePiece(boardIndex, tile0ID);

        updateAttackedTiles(boardIndex, tile0ID);
        updateAttackedTiles(boardIndex, tile1ID);

        const sectorID: number = MovementService.getSectorID(boardIndex, tile0ID);
        const [tile0Row, _] = MovementService.getTileIDRowColumn(boardIndex, tile0ID);
        if (Boards.PlayerIndices[boardIndex][sectorID] === player0Index && tile0Row === Boards.RowCounts[boardIndex] - 1) {
            updateMoatBridges(boardIndex, sectorID)
        
            for (let i = 0; i < Boards.TileIndices[boardIndex].length; i++) {
                const tileIndex = Boards.TileIndices[boardIndex][i];
                if (Tiles.Occupations[tileIndex] === undefined) continue;

                updateAttackedTiles(boardIndex, i);
            }
        };

        Pieces.TileIDs[piece0Index] = tile1ID;

        if (piece1Index !== undefined) {
            Pieces.TileIDs[piece1Index] = undefined;
            Players.TakenPieces[player0Index].push(piece1Index);
        }

        return piece1Index;
    }

    public static removePiece(boardIndex: number, tileID: number): number | undefined {
        const tileIndex: number = Boards.TileIndices[boardIndex][tileID];

        const pieceIndex: number | undefined = Tiles.Occupations[tileIndex];
        if (pieceIndex === undefined) return undefined;

        Tiles.Occupations[tileIndex] = undefined;

        clearAttackedTiles(boardIndex, tileID);
        updateAttackedTiles(boardIndex, tileID,);

        return pieceIndex;
    }

    public static generateDefault(boardIndex: number): void {
        const playerCount: number = Boards.PlayerCounts[boardIndex];
        const columnsPerPlayer: number = Boards.ColumnCountPerPlayers[boardIndex];
        const columnCount: number = Boards.ColumnCounts[boardIndex];
        const maxRowID: number = (Boards.RowCounts[boardIndex] - 1)*columnCount;
        const secondToMaxRowID: number = (Boards.RowCounts[boardIndex] - 2)*columnCount;

        const pieceOrder1: Array<PieceTypes> = [
            PieceTypes.Pawn, PieceTypes.Pawn, PieceTypes.Pawn, PieceTypes.Pawn, PieceTypes.Pawn, PieceTypes.Pawn, PieceTypes.Pawn, PieceTypes.Pawn
        ];

        const pieceOrder0: Array<PieceTypes> = [
            PieceTypes.Rook, PieceTypes.Knight, PieceTypes.Bishop, PieceTypes.King, PieceTypes.Queen, PieceTypes.Bishop, PieceTypes.Knight, PieceTypes.Rook
        ];

        for (let i = 0; i < playerCount; i++) {
            for (let j = 0; j < columnsPerPlayer; j++) {
                const tileID: number = maxRowID + i*columnsPerPlayer + j;
                console.log(maxRowID, boardIndex, tileID, i, j, pieceOrder0[j]);
                Boards.setPiece(boardIndex, tileID, i, pieceOrder0[j]);
            }

            for (let j = 0; j < columnsPerPlayer; j++) {
                const tileID: number = secondToMaxRowID + i*columnsPerPlayer + j;
                console.log(maxRowID, boardIndex, tileID, i, j, pieceOrder0[j]);
                Boards.setPiece(boardIndex, tileID, i, pieceOrder1[j]);
            }
        }
    }

    public static generateCustom(boardIndex: number, pieceOrder1: Array<PieceTypes>, pieceOrder0: Array<PieceTypes>): void {
        const playerCount: number = Boards.PlayerCounts[boardIndex];
        const columnsPerPlayer: number = Boards.ColumnCountPerPlayers[boardIndex];
        const columnCount: number = Boards.ColumnCounts[boardIndex];
        const maxRowID: number = (Boards.RowCounts[boardIndex] - 1)*columnCount;
        const secondToMaxRowID: number = (Boards.RowCounts[boardIndex] - 2)*columnCount;

        for (let i = 0; i < playerCount; i++) {
            for (let j = 0; j < columnsPerPlayer; j++) {
                const tileID: number = maxRowID + i*columnsPerPlayer + j;
                Boards.setPiece(boardIndex, tileID, i, pieceOrder0[j]);
            }

            for (let j = 0; j < columnsPerPlayer; j++) {
                const tileID: number = secondToMaxRowID + i*columnsPerPlayer + j;
                Boards.setPiece(boardIndex, tileID, i, pieceOrder1[j]);
            }
        }
    }
}

function setAttackedTiles(boardIndex: number, tileID: number, playerIndex: number, pieceType: PieceTypes, hasCrossed?: boolean, hasMoved?: boolean): void {
    const tileIndex: number = Boards.TileIndices[boardIndex][tileID];
    //console.log("settingAttackedTiles:", boardIndex, tileID, pieceType, hasCrossed, hasMoved);

    const playerCount: number = Boards.PlayerCounts[boardIndex];
    // console.log("Set Attacked Tiles", boardIndex, tileID, pieceType, hasCrossed, hasMoved);
    const possibleTileIDs: Array<number> = MovementService.getPossibleTilesFunction(boardIndex, tileID, pieceType, hasCrossed, hasMoved);
    possibleTileIDs.forEach((attackedTileID) => {
        // console.log("CanAttackTile:", attackedTileID, "TileAttackedBy:", tileID);
        const attackedTileIndex: number = Boards.TileIndices[boardIndex][attackedTileID];

        Tiles.CanAttack[tileIndex].push(attackedTileID);
        Tiles.AttackedBy[attackedTileIndex].push(tileID);

        const attackedPieceIndex: number | undefined = Tiles.Occupations[boardIndex];
        if (attackedPieceIndex === undefined) return;

        const attackedPieceType: PieceTypes = Pieces.PieceTypes[attackedPieceIndex];
        const attackedPlayerIndex: number = Pieces.PlayerIndices[attackedPieceIndex];
        if (attackedPlayerIndex === playerIndex || attackedPieceType !== PieceTypes.King) return;

        const nextPlayerID: number = (Boards.CurrentPlayers[boardIndex]! + 1) % playerCount;
        if (Boards.PlayerIndices[boardIndex][nextPlayerID] !== attackedPlayerIndex) Boards.eliminatePlayer(boardIndex, nextPlayerID);

        Players.InCheckBy[attackedPlayerIndex] = tileID;
    });
}

function clearAttackedTiles(boardIndex: number, tileID: number): void {
    const tileIndex: number = Boards.TileIndices[boardIndex][tileID];
    // console.log("clearingAttackedTiles:", boardIndex, tileID);

    Tiles.CanAttack[tileIndex].forEach((attackedTileID) => {
        // console.log("Clearing Attacked Tile:", attackedTileID);
        const attackedTileIndex: number = Boards.TileIndices[boardIndex][attackedTileID];
        const index: number = Tiles.AttackedBy[attackedTileIndex].indexOf(tileID);
        if (index === -1) return;

        Tiles.AttackedBy[attackedTileIndex].splice(index, 1);
    });

    // console.log("Cleared CanAttacked Tiles:", boardIndex, tileID);
    Tiles.CanAttack[tileIndex] = [];
}

function updateAttackedTiles(boardIndex: number, tileID: number): void {
    // console.log("Updating AttackedBy and CanAttack arrays at tileID:", tileID);

    const tileIndex: number = Boards.TileIndices[boardIndex][tileID];
    Tiles.AttackedBy[tileIndex].forEach((nextTileID) => {
        const nextTileIndex: number = Boards.TileIndices[boardIndex][nextTileID];
        const nextPieceIndex: number | undefined = Tiles.Occupations[nextTileIndex];
        if (nextPieceIndex === undefined) { console.warn("nextPieceIndex === undefined when looping through AttackedBy array", nextTileID, "From tileID", tileID); return; }

        const nextPlayerIndex: number = Pieces.PlayerIndices[nextPieceIndex];

        const nextPieceType: PieceTypes = Pieces.PieceTypes[nextPieceIndex];
        if (PieceData[nextPieceType].attacksContinuously === false) return;

        const nextPieceHasCrossed: boolean | undefined = Pieces.HasCrossed.get(nextPieceIndex);
        const nextPieceHasMoved: boolean | undefined = Pieces.HasMoved.get(nextPieceIndex);

        clearAttackedTiles(boardIndex, nextTileID);
        // console.log("Update Attacked Tiles", boardIndex, nextTileID, nextPieceType, nextPieceHasCrossed, nextPieceHasMoved);
        setAttackedTiles(boardIndex, nextTileID, nextPlayerIndex, nextPieceType, nextPieceHasCrossed, nextPieceHasMoved);
    });
}

function updateMoatBridges(boardIndex: number, sectorID: number): void {
    // console.log("UPDATING MOAT BRIDGES AT SECTOR:", sectorID);
    const moatsCanBridge: boolean = MovementService.moatCanBridge(boardIndex, sectorID);
    // console.log("moatsCanBridge:", moatsCanBridge);
    if (!moatsCanBridge) return;

    const [moat0ID, moat1ID] = MovementService.getMoatIDs(boardIndex, sectorID);
    Boards.MoatIDsBridged[boardIndex].set(moat0ID, true);
    Boards.MoatIDsBridged[boardIndex].set(moat1ID, true);
    // console.log(
        // "moat0ID:", moat0ID, Boards.MoatIDsBridged[boardIndex].get(moat0ID),
        // "moat1ID:", moat0ID, Boards.MoatIDsBridged[boardIndex].get(moat1ID)
    // );
}

export default Boards;