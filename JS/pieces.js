import { PieceData } from "./pieceData.js";
class Pieces {
    static createPiece(pieceType, playerIndex) {
        const nextIndex = Pieces.IndexStack.pop() || Pieces.Counter++;
        const pieceData = PieceData[pieceType];
        Pieces.PieceTypes[nextIndex] = pieceType;
        Pieces.PlayerIndices[nextIndex] = playerIndex;
        Pieces.TileIDs[nextIndex] = undefined;
        Pieces.Points[nextIndex] = pieceData.points;
        Pieces.CrossesCreeks[nextIndex] = pieceData.crossesCreeks;
        if (pieceData.storeMoved === true)
            Pieces.HasMoved.set(nextIndex, false);
        if (pieceData.storeCrossed === true)
            Pieces.HasCrossed.set(nextIndex, false);
        return nextIndex;
    }
    static removePiece(pieceIndex) {
        if (pieceIndex < 0 || pieceIndex >= Pieces.Counter)
            return;
        Pieces.IndexStack.push(pieceIndex);
        delete Pieces.PieceTypes[pieceIndex];
        delete Pieces.PlayerIndices[pieceIndex];
        delete Pieces.TileIDs[pieceIndex];
        delete Pieces.Points[pieceIndex];
        delete Pieces.CrossesCreeks[pieceIndex];
        Pieces.HasMoved.delete(pieceIndex);
        Pieces.HasCrossed.delete(pieceIndex);
    }
}
Pieces.PieceTypes = [];
Pieces.PlayerIndices = [];
Pieces.TileIDs = [];
Pieces.Points = [];
Pieces.CrossesCreeks = [];
Pieces.HasMoved = new Map();
Pieces.HasCrossed = new Map();
Pieces.Counter = 0;
Pieces.IndexStack = [];
export default Pieces;
//# sourceMappingURL=pieces.js.map