import { PieceData } from "./pieceData.js";
class Pieces {
    static createPiece(pieceType, playerIndex) {
        const nextIndex = Pieces.IndexStack.pop() || Pieces.Counter++;
        const pieceData = PieceData[pieceType];
        Pieces.PieceTypes[nextIndex] = pieceType;
        Pieces.PlayerIndices[nextIndex] = playerIndex;
        Pieces.Points[nextIndex] = pieceData.points;
        if (pieceData.trackMoved)
            Pieces.HasMoved[nextIndex] = false;
        if (pieceData.trackCrossed)
            Pieces.HasCrossed[nextIndex] = false;
        return nextIndex;
    }
    static removePiece(pieceIndex) {
        if (pieceIndex < 0 || pieceIndex >= Pieces.Counter)
            return;
        Pieces.IndexStack.push(pieceIndex);
        delete Pieces.PieceTypes[pieceIndex];
        delete Pieces.PlayerIndices[pieceIndex];
        delete Pieces.Points[pieceIndex];
        delete Pieces.HasMoved[pieceIndex];
        delete Pieces.HasCrossed[pieceIndex];
    }
}
Pieces.PieceTypes = [];
Pieces.PlayerIndices = [];
Pieces.Points = [];
Pieces.HasMoved = new Map();
Pieces.HasCrossed = new Map();
Pieces.Counter = 0;
Pieces.IndexStack = [];
export default Pieces;
//# sourceMappingURL=pieces.js.map