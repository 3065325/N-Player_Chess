import Players from "./player.js";
import Tiles from "./tile.js";
import Pieces from "./pieces.js";
import { PieceData } from "./pieceData.js";
import MovementService from "./movementService.js";
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
            tempArray[i] = Players.createPlayer(nextIndex, `Team ${i + 1}`);
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
    static setPiece(boardIndex, tileID, playerID, pieceType) {
        console.log("Setting Piece at tileID:", tileID);
        const playerIndex = Boards.PlayerIndices[boardIndex][playerID];
        const pieceIndex = Pieces.createPiece(pieceType, playerIndex);
        Players.Pieces[playerIndex].push(pieceIndex);
        const tileIndex = Boards.TileIndices[boardIndex][tileID];
        Tiles.Occupations[tileIndex] = pieceIndex;
        setAttackedTiles(boardIndex, tileID, pieceType, false, false);
        updateAttackedTiles(boardIndex, tileID);
        return pieceIndex;
    }
    static movePiece(boardIndex, tile0ID, tile1ID) {
        console.log("Moving from tile0ID:", tile0ID, "to tile1ID:", tile1ID);
        const tile0Index = Boards.TileIndices[boardIndex][tile0ID];
        const tile1Index = Boards.TileIndices[boardIndex][tile1ID];
        const piece0Index = Tiles.Occupations[tile0Index];
        if (piece0Index === undefined)
            return;
        Tiles.Occupations[tile1Index] = piece0Index;
        Tiles.Occupations[tile0Index] = undefined;
        const piece0Type = Pieces.PieceTypes[piece0Index];
        const piece0HasCrossed = Pieces.HasCrossed.get(piece0Index);
        const piece0HasMoved = Pieces.HasMoved.get(piece0Index);
        clearAttackedTiles(boardIndex, tile0ID);
        setAttackedTiles(boardIndex, tile1ID, piece0Type, piece0HasCrossed, piece0HasMoved);
        updateAttackedTiles(boardIndex, tile0ID);
        updateAttackedTiles(boardIndex, tile1ID);
        return;
    }
}
Boards.PlayerCounts = [];
Boards.ColumnCounts = [];
Boards.RowCounts = [];
Boards.ColumnCountPerPlayers = [];
Boards.PlayerIndices = [];
Boards.TileIndices = [];
Boards.MoatIDsBridged = [];
Boards.Counter = 0;
Boards.IndexStack = [];
function setAttackedTiles(boardIndex, tileID, pieceType, hasCrossed, hasMoved) {
    const tileIndex = Boards.TileIndices[boardIndex][tileID];
    console.log("settingAttackedTiles:", boardIndex, tileID, pieceType, hasCrossed, hasMoved);
    const possibleTileIDs = MovementService.getPossibleTilesFunction(boardIndex, tileID, pieceType, hasCrossed, hasMoved);
    possibleTileIDs.forEach((attackedTileID) => {
        console.log("CanAttackTile:", attackedTileID, "TileAttackedBy:", tileID);
        const attackedTileIndex = Boards.TileIndices[boardIndex][attackedTileID];
        Tiles.CanAttack[tileIndex].push(attackedTileID);
        Tiles.AttackedBy[attackedTileIndex].push(tileID);
    });
}
function clearAttackedTiles(boardIndex, tileID) {
    const tileIndex = Boards.TileIndices[boardIndex][tileID];
    console.log("clearingAttackedTiles:", boardIndex, tileID);
    Tiles.CanAttack[tileIndex].forEach((attackedTileID) => {
        console.log("Clearing Attacked Tile:", attackedTileID);
        const attackedTileIndex = Boards.TileIndices[boardIndex][attackedTileID];
        const index = Tiles.AttackedBy[attackedTileIndex].indexOf(tileID);
        if (index === -1)
            return;
        Tiles.AttackedBy[attackedTileIndex].splice(index, 1);
    });
    console.log("Cleared CanAttacked Tiles:", boardIndex, tileID);
    Tiles.CanAttack[tileIndex] = [];
}
function updateAttackedTiles(boardIndex, tileID) {
    console.log("Updating AttackedBy and CanAttack arrays at tileID:", tileID);
    const tileIndex = Boards.TileIndices[boardIndex][tileID];
    Tiles.AttackedBy[tileIndex].forEach((nextTileID) => {
        const nextTileIndex = Boards.TileIndices[boardIndex][nextTileID];
        const nextPieceIndex = Tiles.Occupations[nextTileIndex];
        if (nextPieceIndex === undefined) {
            console.warn("nextPieceIndex === undefined when looping through AttackedBy array", nextTileID, "From tileID", tileID);
            return;
        }
        const nextPieceType = Pieces.PieceTypes[nextPieceIndex];
        if (PieceData[nextPieceType].attacksContinuously === false)
            return;
        const nextPieceHasCrossed = Pieces.HasCrossed.get(nextPieceIndex);
        const nextPieceHasMoved = Pieces.HasMoved.get(nextPieceIndex);
        clearAttackedTiles(boardIndex, nextTileID);
        setAttackedTiles(boardIndex, nextTileID, nextPieceType, nextPieceHasCrossed, nextPieceHasMoved);
    });
}
export default Boards;
//# sourceMappingURL=board.js.map