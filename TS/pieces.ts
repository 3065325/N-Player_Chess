import {dataInterface, PieceData, PieceTypes} from "./pieceData.js";

class Pieces {
    public static PieceTypes: Array<number> = [];
    public static PlayerIndices: Array<number> = [];
    public static Points: Array<number> = [];

    public static CrossesCreeks: Array<boolean> = [];
    public static HasMoved: Map<number, boolean> = new Map();
    public static HasCrossed: Map<number, boolean> = new Map();

    private static Counter: number = 0;
    private static IndexStack: Array<number> = [];

    public static createPiece(pieceType: PieceTypes, playerIndex: number): number {
        const nextIndex: number = Pieces.IndexStack.pop() || Pieces.Counter++;

        const pieceData: dataInterface = PieceData[pieceType];
        Pieces.PieceTypes[nextIndex] = pieceType;
        Pieces.PlayerIndices[nextIndex] = playerIndex;
        Pieces.Points[nextIndex] = pieceData.points;

        Pieces.CrossesCreeks[nextIndex] = pieceData.crossesCreeks;
        if (pieceData.storeMoved === true) Pieces.HasMoved.set(nextIndex, false);
        if (pieceData.storeCrossed === true) Pieces.HasCrossed.set(nextIndex, false);

        return nextIndex;
    }

    public static removePiece(pieceIndex: number): void {
        if (pieceIndex < 0 || pieceIndex >= Pieces.Counter) return;

        Pieces.IndexStack.push(pieceIndex);

        delete Pieces.PieceTypes[pieceIndex];
        delete Pieces.PlayerIndices[pieceIndex];
        delete Pieces.Points[pieceIndex];

        delete Pieces.CrossesCreeks[pieceIndex];
        Pieces.HasMoved.delete(pieceIndex);
        Pieces.HasCrossed.delete(pieceIndex);
    }
}

export default Pieces;