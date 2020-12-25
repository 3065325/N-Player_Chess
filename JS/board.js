import Players from "./player.js";
import Tiles from "./tile.js";
import Pieces from "./pieces.js";
import { PieceData, PieceTypes } from "./pieceData.js";
import MovementService from "./movementService.js";
var GameState;
(function (GameState) {
    GameState[GameState["Starting"] = 0] = "Starting";
    GameState[GameState["Started"] = 1] = "Started";
    GameState[GameState["Ended"] = 2] = "Ended";
})(GameState || (GameState = {}));
class Boards {
    static createBoard(playerCount, rowCount, columnsPerPlayer) {
        rowCount = rowCount || 2 * playerCount;
        columnsPerPlayer = columnsPerPlayer || 8;
        const columnCount = columnsPerPlayer * playerCount;
        const nextIndex = Boards.IndexStack.pop() || Boards.Counter++;
        Boards.PlayerCounts[nextIndex] = playerCount;
        Boards.ColumnCounts[nextIndex] = columnCount;
        Boards.RowCounts[nextIndex] = rowCount;
        Boards.ColumnCountPerPlayers[nextIndex] = columnsPerPlayer;
        let tempArray = new Array(playerCount);
        for (let i = 0; i < playerCount; i++) {
            tempArray[i] = Players.createPlayer(nextIndex);
        }
        Boards.PlayerIndices[nextIndex] = tempArray;
        tempArray = new Array(columnCount * rowCount);
        for (let i = 0; i < tempArray.length; i++) {
            tempArray[i] = Tiles.createTile(nextIndex);
        }
        Boards.TileIndices[nextIndex] = tempArray;
        let tempMap = new Map();
        for (let i = 0; i < playerCount; i++) {
            tempMap.set(columnCount * (rowCount - 1) + i * columnsPerPlayer, false);
        }
        Boards.MoatIDsBridged[nextIndex] = tempMap;
        Boards.GameStates[nextIndex] = GameState.Started;
        Boards.CurrentPlayers[nextIndex] = 0;
        Boards.RemainingPlayers[nextIndex] = Boards.PlayerIndices[nextIndex];
        return nextIndex;
    }
    static removeBoard(boardIndex) {
        if (boardIndex < 1 || boardIndex > Boards.Counter)
            return;
        Boards.IndexStack.push(boardIndex);
        delete Boards.PlayerCounts[boardIndex];
        delete Boards.ColumnCounts[boardIndex];
        delete Boards.ColumnCountPerPlayers[boardIndex];
        delete Boards.RowCounts[boardIndex];
        delete Boards.PlayerIndices[boardIndex];
        delete Boards.TileIndices[boardIndex];
        delete Boards.MoatIDsBridged[boardIndex];
    }
    static iterateCurrentPlayer(boardIndex) {
        const playerCount = Boards.PlayerCounts[boardIndex];
        const currentPlayerID = Boards.CurrentPlayers[boardIndex];
        if (currentPlayerID === undefined)
            return;
        Boards.CurrentPlayers[boardIndex] = (currentPlayerID + 1) % playerCount;
    }
    static eliminatePlayer(boardIndex, playerID) {
        Boards.RemainingPlayers[boardIndex].splice(playerID, 1);
        const playerIndex = Boards.PlayerIndices[boardIndex][playerID];
        Players.IsDead[playerIndex] = true;
        Players.Pieces[playerIndex].forEach((pieceIndex) => {
            const tileID = Pieces.TileIDs[pieceIndex];
            if (tileID === undefined)
                return;
            clearAttackedTiles(boardIndex, tileID);
        });
    }
    static setPiece(boardIndex, tileID, playerID, pieceType) {
        const playerIndex = Boards.PlayerIndices[boardIndex][playerID];
        const pieceIndex = Pieces.createPiece(pieceType, playerIndex);
        Pieces.TileIDs[pieceIndex] = tileID;
        Players.Pieces[playerIndex].push(pieceIndex);
        const tileIndex = Boards.TileIndices[boardIndex][tileID];
        Tiles.Occupations[tileIndex] = pieceIndex;
        setAttackedTiles(boardIndex, tileID, playerID, pieceType, false, false);
        updateAttackedTiles(boardIndex, tileID);
        return pieceIndex;
    }
    static movePiece(boardIndex, tile0ID, tile1ID) {
        const tile0Index = Boards.TileIndices[boardIndex][tile0ID];
        const tile1Index = Boards.TileIndices[boardIndex][tile1ID];
        const piece0Index = Tiles.Occupations[tile0Index];
        if (piece0Index === undefined)
            return;
        const piece1Index = Tiles.Occupations[tile1Index];
        const player0Index = Pieces.PlayerIndices[piece0Index];
        if (piece1Index !== undefined && Pieces.PlayerIndices[piece1Index] === player0Index)
            return undefined;
        const piece0Type = Pieces.PieceTypes[piece0Index];
        if (PieceData[piece0Type].storeMoved)
            Pieces.HasMoved.set(piece0Index, true);
        Tiles.Occupations[tile1Index] = piece0Index;
        Boards.removePiece(boardIndex, tile0ID);
        updateAttackedTiles(boardIndex, tile0ID);
        updateAttackedTiles(boardIndex, tile1ID);
        const sectorID = MovementService.getSectorID(boardIndex, tile0ID);
        const [tile0Row, _] = MovementService.getTileIDRowColumn(boardIndex, tile0ID);
        if (Boards.PlayerIndices[boardIndex][sectorID] === player0Index && tile0Row === Boards.RowCounts[boardIndex] - 1) {
            updateMoatBridges(boardIndex, sectorID);
            for (let i = 0; i < Boards.TileIndices[boardIndex].length; i++) {
                const tileIndex = Boards.TileIndices[boardIndex][i];
                if (Tiles.Occupations[tileIndex] === undefined)
                    continue;
                updateAttackedTiles(boardIndex, i);
            }
        }
        ;
        Pieces.TileIDs[piece0Index] = tile1ID;
        if (piece1Index !== undefined) {
            Pieces.TileIDs[piece1Index] = undefined;
            Players.TakenPieces[player0Index].push(piece1Index);
        }
        return piece1Index;
    }
    static removePiece(boardIndex, tileID) {
        const tileIndex = Boards.TileIndices[boardIndex][tileID];
        const pieceIndex = Tiles.Occupations[tileIndex];
        if (pieceIndex === undefined)
            return undefined;
        Tiles.Occupations[tileIndex] = undefined;
        clearAttackedTiles(boardIndex, tileID);
        updateAttackedTiles(boardIndex, tileID);
        return pieceIndex;
    }
    static generateDefault(boardIndex) {
        const playerCount = Boards.PlayerCounts[boardIndex];
        const columnsPerPlayer = Boards.ColumnCountPerPlayers[boardIndex];
        const columnCount = Boards.ColumnCounts[boardIndex];
        const maxRowID = (Boards.RowCounts[boardIndex] - 1) * columnCount;
        const secondToMaxRowID = (Boards.RowCounts[boardIndex] - 2) * columnCount;
        const pieceOrder1 = [
            PieceTypes.Pawn, PieceTypes.Pawn, PieceTypes.Pawn, PieceTypes.Pawn, PieceTypes.Pawn, PieceTypes.Pawn, PieceTypes.Pawn, PieceTypes.Pawn
        ];
        const pieceOrder0 = [
            PieceTypes.Rook, PieceTypes.Knight, PieceTypes.Bishop, PieceTypes.King, PieceTypes.Queen, PieceTypes.Bishop, PieceTypes.Knight, PieceTypes.Rook
        ];
        for (let i = 0; i < playerCount; i++) {
            for (let j = 0; j < columnsPerPlayer; j++) {
                const tileID = maxRowID + i * columnsPerPlayer + j;
                console.log(maxRowID, boardIndex, tileID, i, j, pieceOrder0[j]);
                Boards.setPiece(boardIndex, tileID, i, pieceOrder0[j]);
            }
            for (let j = 0; j < columnsPerPlayer; j++) {
                const tileID = secondToMaxRowID + i * columnsPerPlayer + j;
                console.log(maxRowID, boardIndex, tileID, i, j, pieceOrder0[j]);
                Boards.setPiece(boardIndex, tileID, i, pieceOrder1[j]);
            }
        }
    }
    static generateCustom(boardIndex, pieceOrder1, pieceOrder0) {
        const playerCount = Boards.PlayerCounts[boardIndex];
        const columnsPerPlayer = Boards.ColumnCountPerPlayers[boardIndex];
        const columnCount = Boards.ColumnCounts[boardIndex];
        const maxRowID = (Boards.RowCounts[boardIndex] - 1) * columnCount;
        const secondToMaxRowID = (Boards.RowCounts[boardIndex] - 2) * columnCount;
        for (let i = 0; i < playerCount; i++) {
            for (let j = 0; j < columnsPerPlayer; j++) {
                const tileID = maxRowID + i * columnsPerPlayer + j;
                Boards.setPiece(boardIndex, tileID, i, pieceOrder0[j]);
            }
            for (let j = 0; j < columnsPerPlayer; j++) {
                const tileID = secondToMaxRowID + i * columnsPerPlayer + j;
                Boards.setPiece(boardIndex, tileID, i, pieceOrder1[j]);
            }
        }
    }
}
Boards.PlayerCounts = [];
Boards.ColumnCounts = [];
Boards.RowCounts = [];
Boards.ColumnCountPerPlayers = [];
Boards.PlayerIndices = [];
Boards.TileIndices = [];
Boards.MoatIDsBridged = [];
Boards.GameStates = [];
Boards.CurrentPlayers = [];
Boards.RemainingPlayers = [];
Boards.Counter = 0;
Boards.IndexStack = [];
function setAttackedTiles(boardIndex, tileID, playerIndex, pieceType, hasCrossed, hasMoved) {
    const tileIndex = Boards.TileIndices[boardIndex][tileID];
    const playerCount = Boards.PlayerCounts[boardIndex];
    const possibleTileIDs = MovementService.getPossibleTilesFunction(boardIndex, tileID, pieceType, hasCrossed, hasMoved);
    possibleTileIDs.forEach((attackedTileID) => {
        const attackedTileIndex = Boards.TileIndices[boardIndex][attackedTileID];
        Tiles.CanAttack[tileIndex].push(attackedTileID);
        Tiles.AttackedBy[attackedTileIndex].push(tileID);
        const attackedPieceIndex = Tiles.Occupations[boardIndex];
        if (attackedPieceIndex === undefined)
            return;
        const attackedPieceType = Pieces.PieceTypes[attackedPieceIndex];
        const attackedPlayerIndex = Pieces.PlayerIndices[attackedPieceIndex];
        if (attackedPlayerIndex === playerIndex || attackedPieceType !== PieceTypes.King)
            return;
        const nextPlayerID = (Boards.CurrentPlayers[boardIndex] + 1) % playerCount;
        if (Boards.PlayerIndices[boardIndex][nextPlayerID] !== attackedPlayerIndex)
            Boards.eliminatePlayer(boardIndex, nextPlayerID);
        Players.InCheckBy[attackedPlayerIndex] = tileID;
    });
}
function clearAttackedTiles(boardIndex, tileID) {
    const tileIndex = Boards.TileIndices[boardIndex][tileID];
    Tiles.CanAttack[tileIndex].forEach((attackedTileID) => {
        const attackedTileIndex = Boards.TileIndices[boardIndex][attackedTileID];
        const index = Tiles.AttackedBy[attackedTileIndex].indexOf(tileID);
        if (index === -1)
            return;
        Tiles.AttackedBy[attackedTileIndex].splice(index, 1);
    });
    Tiles.CanAttack[tileIndex] = [];
}
function updateAttackedTiles(boardIndex, tileID) {
    const tileIndex = Boards.TileIndices[boardIndex][tileID];
    Tiles.AttackedBy[tileIndex].forEach((nextTileID) => {
        const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
        const nextPieceIndex = Tiles.Occupations[nextTileIndex];
        if (nextPieceIndex === undefined) {
            console.warn("nextPieceIndex === undefined when looping through AttackedBy array", nextTileID, "From tileID", tileID);
            return;
        }
        const nextPlayerIndex = Pieces.PlayerIndices[nextPieceIndex];
        const nextPieceType = Pieces.PieceTypes[nextPieceIndex];
        if (PieceData[nextPieceType].attacksContinuously === false)
            return;
        const nextPieceHasCrossed = Pieces.HasCrossed.get(nextPieceIndex);
        const nextPieceHasMoved = Pieces.HasMoved.get(nextPieceIndex);
        clearAttackedTiles(boardIndex, nextTileID);
        setAttackedTiles(boardIndex, nextTileID, nextPlayerIndex, nextPieceType, nextPieceHasCrossed, nextPieceHasMoved);
    });
}
function updateMoatBridges(boardIndex, sectorID) {
    const moatsCanBridge = MovementService.moatCanBridge(boardIndex, sectorID);
    if (!moatsCanBridge)
        return;
    const [moat0ID, moat1ID] = MovementService.getMoatIDs(boardIndex, sectorID);
    Boards.MoatIDsBridged[boardIndex].set(moat0ID, true);
    Boards.MoatIDsBridged[boardIndex].set(moat1ID, true);
}
export default Boards;
//# sourceMappingURL=board.js.map